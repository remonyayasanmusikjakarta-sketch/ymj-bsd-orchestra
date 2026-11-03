"use client"

import { useEffect, useState } from "react"
import {
  History as HistoryIcon, Loader2, AlertCircle, FileText,
  UserPlus, Shield, Calendar, Wallet,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  eventType: string
  title: string
  description: string
  metadata?: string | null
  createdAt: string
}

const EVENT_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  JOINED: { label: "eventTypeJoined", cls: "border-emerald-500/40 text-emerald-700 bg-emerald-50", icon: <UserPlus className="h-4 w-4" /> },
  STATUS_CHANGE: { label: "eventTypeStatusChange", cls: "border-blue-500/40 text-blue-700 bg-blue-50", icon: <Shield className="h-4 w-4" /> },
  ROLE_CHANGE: { label: "eventTypeRoleChange", cls: "border-purple-500/40 text-purple-700 bg-purple-50", icon: <Shield className="h-4 w-4" /> },
  ATTENDANCE: { label: "eventTypeAttendance", cls: "border-amber-500/40 text-amber-700 bg-amber-50", icon: <Calendar className="h-4 w-4" /> },
  PAYMENT: { label: "eventTypePayment", cls: "border-gold-500/40 text-gold-700 bg-gold-50", icon: <Wallet className="h-4 w-4" /> },
}

export function HistoryPanel() {
  const { lang } = useAppStore()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/me/history", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load history")
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="grid place-items-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        <p className="text-sm">{t(lang, "common.loading")}</p>
      </div>
    )
  }
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </Card>
    )
  }

  return (
    <section>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-gold-600">
          {t(lang, "dashboard.history")}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
          {t(lang, "dashboard.membershipHistory")}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          {lang === "id"
            ? "Riwayat lengkap keanggotaan Anda: tanggal bergabung, perubahan status/role, absensi latihan, dan pembayaran iuran."
            : "Your complete membership history: join date, status/role changes, rehearsal attendance, and dues payments."}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center text-muted-foreground mt-6">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>{t(lang, "dashboard.noHistory")}</p>
        </Card>
      ) : (
        <div className="mt-6 relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gold-500/30" />

          <div className="space-y-4">
            {items.map((h) => {
              const meta = EVENT_META[h.eventType] || EVENT_META.JOINED
              return (
                <div key={h.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 z-10 grid place-items-center h-10 w-10 rounded-full bg-navy-900 text-gold-400 border-2 border-gold-500/40">
                    {meta.icon}
                  </div>
                  {/* Content */}
                  <Card className="flex-1 border-border bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                        {h.title}
                      </h4>
                      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", meta.cls)}>
                        {t(lang, `dashboard.${meta.label}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(h.createdAt).toLocaleString(lang === "id" ? "id-ID" : "en-US", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })} WIB
                    </p>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
