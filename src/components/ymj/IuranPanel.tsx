"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Wallet, Loader2, AlertCircle, FileText, ExternalLink, Upload, Link as LinkIcon,
  CheckCircle2, XCircle, Clock,
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

interface DuesItem {
  id: string
  title: string
  description: string
  minAmount: number
  active: boolean
  createdAt: string
  paymentCount: number
}

interface PaymentItem {
  id: string
  amountPaid: number
  proofUrl: string
  proofType: string
  status: string
  adminNote?: string | null
  paidAt: string
  verifiedAt?: string | null
  dues: { id: string; title: string; description: string; minAmount: number; active: boolean }
}

const PAYMENT_STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  PENDING: { label: "pending", cls: "border-amber-500/40 text-amber-700 bg-amber-50", icon: <Clock className="h-3 w-3" /> },
  VERIFIED: { label: "verified", cls: "border-emerald-500/40 text-emerald-700 bg-emerald-50", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: "rejected", cls: "border-red-500/40 text-red-700 bg-red-50", icon: <XCircle className="h-3 w-3" /> },
}

export function IuranPanel({ user }: { user: UserProfile }) {
  const { lang } = useAppStore()
  const [dues, setDues] = useState<DuesItem[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payForDues, setPayForDues] = useState<DuesItem | null>(null)
  const [amount, setAmount] = useState("")
  const [proofUrl, setProofUrl] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, pRes] = await Promise.all([
        fetch("/api/dues", { cache: "no-store" }),
        fetch("/api/dues/me", { cache: "no-store" }),
      ])
      if (!dRes.ok || !pRes.ok) throw new Error("Failed to load")
      const dData = await dRes.json()
      const pData = await pRes.json()
      setDues(dData.items || [])
      setPayments(pData.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const myPaymentFor = (duesId: string) => payments.find((p) => p.dues.id === duesId)

  const submitPayment = async () => {
    if (!payForDues) return
    if (!amount || Number(amount) <= 0) {
      setSubmitError(lang === "id" ? "Jumlah dibayar harus diisi" : "Amount paid is required")
      return
    }
    if (!proofFile && !proofUrl) {
      setSubmitError(lang === "id" ? "Upload bukti ATAU paste URL gambar" : "Either upload proof file OR paste image URL")
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      let res: Response
      if (proofFile) {
        const fd = new FormData()
        fd.append("amountPaid", String(amount))
        fd.append("proofFile", proofFile)
        res = await fetch(`/api/dues/${payForDues.id}/pay`, { method: "POST", body: fd })
      } else {
        res = await fetch(`/api/dues/${payForDues.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountPaid: Number(amount), proofUrl }),
        })
      }
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data?.error || "Failed to submit payment")
        return
      }
      // Reset
      setPayForDues(null)
      setAmount("")
      setProofUrl("")
      setProofFile(null)
      if (fileRef.current) fileRef.current.value = ""
      await load()
    } catch {
      setSubmitError("Network error")
    } finally {
      setSubmitting(false)
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

  const activeDues = dues.filter((d) => d.active)

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.dues")}
        title={t(lang, "dashboard.dues")}
        description={lang === "id"
          ? "Iuran untuk pembelian komunitas (baju konser, alat, dll.). Upload bukti pembayaran di akun Anda — tidak bisa diedit setelah dikirim."
          : "Dues for community purchases (concert clothes, equipment, etc.). Upload payment proof in your account — cannot be edited after submission."}
      />

      {/* Active dues campaigns */}
      <h3 className="text-lg font-semibold text-navy-900 mt-6 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
        {lang === "id" ? "Iuran Aktif" : "Active Dues"}
      </h3>
      {activeDues.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{lang === "id" ? "Belum ada iuran aktif." : "No active dues campaigns."}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeDues.map((d) => {
            const myPay = myPaymentFor(d.id)
            return (
              <Card key={d.id} className="border-gold-500/20 bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-navy-900 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
                      {d.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <span className="text-navy-900 font-medium">
                        {lang === "id" ? "Minimal:" : "Minimum:"} <strong>Rp {d.minAmount.toLocaleString("id-ID")}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {myPay ? (
                      <div className="text-center space-y-2">
                        <Badge variant="outline" className={cn("text-xs", PAYMENT_STATUS_META[myPay.status]?.cls)}>
                          {PAYMENT_STATUS_META[myPay.status]?.icon}
                          <span className="ml-1">{t(lang, `dashboard.${PAYMENT_STATUS_META[myPay.status]?.label}`)}</span>
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Rp {myPay.amountPaid.toLocaleString("id-ID")}
                        </p>
                        {myPay.adminNote && (
                          <p className="text-xs text-red-600 italic">{myPay.adminNote}</p>
                        )}
                      </div>
                    ) : (
                      <Button
                        className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
                        onClick={() => { setPayForDues(d); setAmount(String(d.minAmount)); setSubmitError(null) }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        {t(lang, "dashboard.payNow")}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment history */}
      <h3 className="text-lg font-semibold text-navy-900 mt-10 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
        {t(lang, "dashboard.yourPayments")}
      </h3>
      {payments.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t(lang, "dashboard.noPayments")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const meta = PAYMENT_STATUS_META[p.status] || PAYMENT_STATUS_META.PENDING
            return (
              <Card key={p.id} className="border-border bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900">{p.dues.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Rp {p.amountPaid.toLocaleString("id-ID")} · {new Date(p.paidAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {p.adminNote && (
                      <p className="text-xs text-red-600 italic mt-1">
                        {t(lang, "dashboard.adminNote")}: {p.adminNote}
                      </p>
                    )}
                    <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:text-gold-700 inline-flex items-center gap-1 mt-2">
                      <ExternalLink className="h-3 w-3" />
                      {t(lang, "dashboard.viewProof")}
                    </a>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", meta.cls)}>
                    {meta.icon}
                    <span className="ml-1">{t(lang, `dashboard.${meta.label}`)}</span>
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment submission modal */}
      {payForDues && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/80 backdrop-blur-sm p-4" onClick={() => !submitting && setPayForDues(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-navy-900 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
                {t(lang, "dashboard.uploadProof")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{payForDues.title}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.amountPaid")}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={payForDues.minAmount}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "id" ? "Minimal" : "Minimum"}: Rp {payForDues.minAmount.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.proofFile")}</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => { setProofFile(e.target.files?.[0] || null); setProofUrl("") }}
                  className="mt-1 block w-full text-sm text-navy-900 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500 file:text-navy-950 file:font-medium file:cursor-pointer hover:file:bg-gold-400"
                />
                {proofFile && <p className="text-xs text-navy-700 mt-1">{proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)</p>}
              </div>

              <div className="text-center text-xs text-muted-foreground">— {lang === "id" ? "ATAU" : "OR"} —</div>

              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.proofUrl")}</Label>
                <Input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => { setProofUrl(e.target.value); if (e.target.value && proofFile) { setProofFile(null); if (fileRef.current) fileRef.current.value = "" } }}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              {submitError && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </div>
              )}

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                ⚠️ {lang === "id"
                  ? "Pembayaran tidak bisa diedit/dihapus setelah dikirim. Hanya admin yang bisa verifikasi atau hapus."
                  : "Payment cannot be edited/deleted after submission. Only admin can verify or delete it."}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400"
                  disabled={submitting}
                  onClick={submitPayment}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {t(lang, "dashboard.submitPayment")}
                </Button>
                <Button variant="outline" onClick={() => !submitting && setPayForDues(null)} disabled={submitting}>
                  {t(lang, "common.cancel")}
                </Button>
              </div>
            </div>
          </div>
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
