"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Calendar as CalendarIcon, MapPin, Loader2, AlertCircle, CheckCircle2,
  X, Clock, FileText, Users, ChevronDown, ChevronUp, Music2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore, type UserProfile } from "@/lib/store"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface RehearsalItem {
  id: string
  title: string
  date: string
  location: string
  notes?: string | null
  attendanceOpen: boolean
  attendanceCount: number
}

interface AttendanceItem {
  id: string
  status: string
  reason?: string | null
  markedAt: string
  rehearsal: { id: string; title: string; date: string; location: string }
}

const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
  PRESENT: { label: "present", cls: "border-emerald-500/40 text-emerald-700 bg-emerald-50", icon: "✅" },
  ABSENT: { label: "absent", cls: "border-red-500/40 text-red-700 bg-red-50", icon: "❌" },
  LATE: { label: "late", cls: "border-amber-500/40 text-amber-700 bg-amber-50", icon: "⏰" },
  EXCUSED: { label: "excused", cls: "border-blue-500/40 text-blue-700 bg-blue-50", icon: "📝" },
}

export function AbsensiPanel({ user }: { user: UserProfile }) {
  const { lang } = useAppStore()
  const [rehearsals, setRehearsals] = useState<RehearsalItem[]>([])
  const [myAttendance, setMyAttendance] = useState<AttendanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionRehearsalId, setActionRehearsalId] = useState<string | null>(null)
  const [showReasonFor, setShowReasonFor] = useState<string | null>(null)
  const [reasonText, setReasonText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rRes, aRes] = await Promise.all([
        fetch("/api/rehearsals", { cache: "no-store" }),
        fetch("/api/attendance/me", { cache: "no-store" }),
      ])
      if (!rRes.ok || !aRes.ok) throw new Error("Failed to load")
      const rData = await rRes.json()
      const aData = await aRes.json()
      setRehearsals(rData.items || [])
      setMyAttendance(aData.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const myAttendanceMap = new Map(myAttendance.map((a) => [a.rehearsal.id, a]))

  const submitAttendance = async (rehearsalId: string, status: string, reason?: string) => {
    setSubmitting(true)
    setActionRehearsalId(rehearsalId)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rehearsalId, status, reason }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error || "Failed to mark attendance")
        return
      }
      // Refresh
      await load()
      setShowReasonFor(null)
      setReasonText("")
    } catch {
      alert("Network error")
    } finally {
      setSubmitting(false)
      setActionRehearsalId(null)
    }
  }

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

  const upcomingRehearsals = rehearsals.filter((r) => new Date(r.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const visibleRehearsals = expandedHistory ? rehearsals : upcomingRehearsals.slice(0, 5)

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.attendance")}
        title={t(lang, "dashboard.rehearsals")}
        description={lang === "id"
          ? "Absensi hanya bisa dilakukan saat admin membuka akses. Setelah absen, tidak bisa diubah."
          : "Attendance can only be marked when admin opens access. Once marked, it cannot be changed."}
      />

      {/* Rehearsal list */}
      <div className="mt-6 space-y-3">
        {visibleRehearsals.length === 0 ? (
          <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{lang === "id" ? "Belum ada sesi latihan." : "No rehearsal sessions yet."}</p>
          </Card>
        ) : (
          visibleRehearsals.map((r) => {
            const myAtt = myAttendanceMap.get(r.id)
            const isOpen = r.attendanceOpen
            return (
              <Card key={r.id} className={cn("border bg-white p-5", isOpen ? "border-gold-500/40" : "border-border")}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 grid place-items-center rounded-lg bg-navy-50 border border-navy-100 px-3 py-2 text-center min-w-[88px]">
                    <p className="text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
                      {new Date(r.date).toLocaleString(lang === "id" ? "id-ID" : "en-US", { month: "short" })}
                    </p>
                    <p className="text-2xl font-bold text-navy-900 leading-none" style={{ fontFamily: "var(--font-display), serif" }}>
                      {new Date(r.date).getDate()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(r.date).getFullYear()}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-navy-900 leading-tight" style={{ fontFamily: "var(--font-display), serif" }}>
                        {r.title}
                      </h4>
                      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
                        isOpen ? "border-emerald-500/40 text-emerald-700 bg-emerald-50" : "border-gray-400/40 text-gray-700 bg-gray-50"
                      )}>
                        {isOpen ? t(lang, "dashboard.attendanceOpen") : t(lang, "dashboard.attendanceClosed")}
                      </Badge>
                      {myAtt && (
                        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", STATUS_META[myAtt.status]?.cls)}>
                          {STATUS_META[myAtt.status]?.icon} {t(lang, `dashboard.${STATUS_META[myAtt.status]?.label}`)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                      <Clock className="h-3 w-3" />
                      {new Date(r.date).toLocaleString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {r.location}
                    </p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-2 italic">{r.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {myAtt ? (
                      <div className="text-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-medium text-emerald-700">{t(lang, "dashboard.alreadyMarked")}</p>
                      </div>
                    ) : isOpen ? (
                      showReasonFor === r.id ? (
                        <div className="space-y-2 w-64">
                          <Label className="text-xs font-medium">{t(lang, "dashboard.reasonLabel")}</Label>
                          <Textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            placeholder={t(lang, "dashboard.reasonPlaceholder")}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={submitting && actionRehearsalId === r.id}
                              onClick={() => submitAttendance(r.id, "EXCUSED", reasonText)}
                            >
                              {submitting && actionRehearsalId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t(lang, "dashboard.submitPayment")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setShowReasonFor(null); setReasonText("") }}>
                              {t(lang, "common.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={submitting}
                              onClick={() => submitAttendance(r.id, "PRESENT")}>
                              {submitting && actionRehearsalId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : `✅ ${t(lang, "dashboard.present")}`}
                            </Button>
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={submitting}
                              onClick={() => submitAttendance(r.id, "LATE")}>
                              ⏰
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="border-red-400/40 text-red-700 hover:bg-red-50" disabled={submitting}
                              onClick={() => submitAttendance(r.id, "ABSENT")}>
                              ❌ {t(lang, "dashboard.absent")}
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-400/40 text-blue-700 hover:bg-blue-50" disabled={submitting}
                              onClick={() => setShowReasonFor(r.id)}>
                              📝
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground italic max-w-[180px]">
                        {t(lang, "dashboard.attendanceClosedMsg")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {rehearsals.length > 5 && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setExpandedHistory((v) => !v)}>
          {expandedHistory ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {expandedHistory ? (lang === "id" ? "Tampilkan lebih sedikit" : "Show less") : (lang === "id" ? "Tampilkan semua" : "Show all")}
        </Button>
      )}

      {/* My attendance history */}
      <h3 className="text-lg font-semibold text-navy-900 mt-10 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
        {t(lang, "dashboard.yourAttendance")}
      </h3>
      {myAttendance.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t(lang, "dashboard.noAttendance")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {myAttendance.map((a) => {
            const meta = STATUS_META[a.status] || STATUS_META.PRESENT
            return (
              <Card key={a.id} className="border-border bg-white p-4 flex items-center gap-3">
                <div className="flex-shrink-0 text-2xl">{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 truncate">{a.rehearsal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.rehearsal.date).toLocaleString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                    {a.reason && ` · ${a.reason}`}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", meta.cls)}>
                  {t(lang, `dashboard.${meta.label}`)}
                </Badge>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] font-semibold text-gold-600">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
        {title}
      </h2>
      {description && <p className="text-sm md:text-base text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  )
}
