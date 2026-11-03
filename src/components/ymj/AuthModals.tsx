"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Loader2, Mail, Lock, User, Phone, MapPin, Music, Calendar, Clock,
  Chrome, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Upload, ImageIcon,
} from "lucide-react"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { INSTRUMENTS, CATEGORIES } from "@/lib/instruments"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"

// Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  whatsapp: z.string().min(8, "WhatsApp number is required"),
  ageCategory: z.enum(["JUNIOR", "COMMUNITY"]),
  age: z.coerce.number().int().min(8, "Age must be at least 8").max(80, "Age too high"),
  instrument: z.string().min(1, "Choose an instrument"),
  experienceYears: z.coerce.number().min(0, "Cannot be negative").max(60, "Too high"),
  address: z.string().min(5, "Address is required"),
})

type RegisterValues = z.infer<typeof registerSchema>

export function AuthModals() {
  const { authModal, closeAuth, openAuth, setUser, lang } = useAppStore()
  const { toast } = useToast()

  return (
    <>
      <LoginModal
        open={authModal === "LOGIN"}
        onClose={closeAuth}
        onSwitchToRegister={() => openAuth("REGISTER")}
        onSuccess={(u) => {
          setUser(u)
          closeAuth()
          toast({ title: `${t(lang, "dashboard.welcome")}, ${u.name.split(" ")[0]}!`, description: "✅" })
        }}
      />
      <RegisterModal
        open={authModal === "REGISTER"}
        onClose={closeAuth}
        onSwitchToLogin={() => openAuth("LOGIN")}
        onSuccess={(u, webhookInfo) => {
          setUser(u)
          closeAuth()
          toast({
            title: `${t(lang, "dashboard.welcome")}, ${u.name.split(" ")[0]}! 🎻`,
            description: webhookInfo?.ok
              ? (lang === "zh" ? "注册完成。您的数据已转发到电子表格。" : lang === "id" ? "Pendaftaran selesai. Data diteruskan ke spreadsheet." : "Registration complete. Your data has been forwarded to our spreadsheet.")
              : (lang === "zh" ? "注册完成。" : lang === "id" ? "Pendaftaran selesai." : "Registration complete."),
          })
        }}
      />
      <GoogleModal
        open={authModal === "GOOGLE"}
        onClose={closeAuth}
        onSwitchToRegister={() => openAuth("REGISTER")}
        onSuccess={(u) => {
          setUser(u)
          closeAuth()
          toast({
            title: `${t(lang, "dashboard.welcome")}, ${u.name.split(" ")[0]}! 🎻`,
            description: lang === "zh" ? "使用Google登录。" : lang === "id" ? "Masuk dengan Google." : "Signed in with Google.",
          })
        }}
      />
    </>
  )
}

// ---------------------------------------------------------------
// Login Modal
// ---------------------------------------------------------------
function LoginModal({
  open, onClose, onSwitchToRegister, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onSuccess: (u: NonNullable<ReturnType<typeof useAppStore.getState>["user"]>) => void
}) {
  const { toast: _t } = useToast()
  const { lang } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "").trim()
    const password = String(fd.get("password") || "")
    if (!email || !password) {
      setError(t(lang, "auth.missingFields") + " email, password")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Login failed")
        return
      }
      onSuccess(data.user)
    } catch {
      setError(lang === "zh" ? "网络错误。请重试。" : lang === "id" ? "Network error. Coba lagi." : "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-gold-400">
            <Music className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "auth.welcomeBack")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(lang, "auth.loginSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-navy-900 text-sm font-medium">{t(lang, "auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="login-email" name="email" type="email" required placeholder="you@example.com" className="pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password" className="text-navy-900 text-sm font-medium">{t(lang, "auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="login-password" name="password" type="password" required placeholder="••••••••" className="pl-9" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t(lang, "auth.signIn")}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <button type="button" onClick={onSwitchToRegister} className="text-navy-700 hover:text-gold-600 font-medium underline-offset-4 hover:underline">
              {t(lang, "auth.newHere")}
            </button>
          </div>
        </form>

        <DemoAccountsDivider />
        <DemoAccountsHelp />
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------
// Register Modal
// ---------------------------------------------------------------
function RegisterModal({
  open, onClose, onSwitchToLogin, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onSuccess: (
    u: NonNullable<ReturnType<typeof useAppStore.getState>["user"]>,
    webhookInfo?: { ok: boolean; status?: number; error?: string }
  ) => void
}) {
  const { lang } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", email: "", password: "",
      whatsapp: "", ageCategory: "COMMUNITY",
      age: 18, instrument: "", experienceYears: 2, address: "",
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form
  const ageCategory = watch("ageCategory")
  const instrument = watch("instrument")

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setUploadedPhotoUrl(null)
    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload immediately
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const res = await fetch("/api/upload/member-photo", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      setUploadedPhotoUrl(data.url)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Photo upload failed")
      setPhotoFile(null)
      setPhotoPreview(null)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    // Photo is now OPTIONAL — registration proceeds even without a photo.
    // If no photo is uploaded, an initials-based avatar + name tag will be used.
    setLoading(true)
    try {
      const payload: Record<string, unknown> = { ...values }
      if (uploadedPhotoUrl) {
        payload.photoUrl = uploadedPhotoUrl
      }
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data?.error || "Registration failed")
        return
      }
      onSuccess(data.user, data.webhook)
    } catch {
      setServerError(lang === "zh" ? "网络错误。" : lang === "id" ? "Network error." : "Network error.")
    } finally {
      setLoading(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[92vh] overflow-y-auto scroll-thin">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-gold-400">
            <Music className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "auth.becomeFounding")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(lang, "auth.registerSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-navy-50">
            <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-navy-900">
              {t(lang, "auth.emailSignup")}
            </TabsTrigger>
            <TabsTrigger
              value="google"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-900"
              onClick={() => useAppStore.getState().openAuth("GOOGLE")}
            >
              {t(lang, "auth.continueGoogle")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t(lang, "auth.fullName")} error={errors.name?.message} icon={<User className="h-4 w-4" />}>
                  <Input placeholder="e.g. Andi Pratama" {...register("name")} />
                </Field>
                <Field label={t(lang, "auth.email")} error={errors.email?.message} icon={<Mail className="h-4 w-4" />}>
                  <Input type="email" placeholder="you@example.com" {...register("email")} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t(lang, "auth.password")} error={errors.password?.message} icon={<Lock className="h-4 w-4" />}>
                  <Input type="password" placeholder="min. 6 characters" {...register("password")} />
                </Field>
                <Field label={t(lang, "auth.whatsappNumber")} error={errors.whatsapp?.message} icon={<Phone className="h-4 w-4" />}>
                  <Input placeholder="0811 9892 413" {...register("whatsapp")} />
                </Field>
              </div>

              {/* Photo upload — OPTIONAL */}
              <div className="space-y-1.5">
                <Label className="text-navy-900 text-sm font-medium">
                  {t(lang, "auth.photoUpload")}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({lang === "zh" ? "可选" : lang === "id" ? "opsional" : "optional"})
                  </span>
                </Label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0 grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-gold-500/40 bg-gold-50 overflow-hidden">
                    {photoPreview ? (
                      
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gold-500/50" />
                    )}
                  </div>
                  {/* Upload button */}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="border-gold-500/40 text-navy-800 hover:bg-gold-50"
                    >
                      {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      {t(lang, "auth.chooseFile")}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {photoFile ? (
                        <span className="text-navy-700">
                          {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                          {uploadedPhotoUrl && <span className="text-emerald-600 ml-1">✓</span>}
                        </span>
                      ) : (
                        t(lang, "auth.noFileSelected")
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh"
                        ? "不传照片将使用姓名首字母作为头像。"
                        : lang === "id"
                          ? "Tanpa foto, avatar inisial nama akan dipakai otomatis."
                          : "Without a photo, an initials avatar will be used automatically."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-navy-900 text-sm font-medium">
                  {t(lang, "auth.category")} <span className="text-muted-foreground">{t(lang, "auth.categoryHint")}</span>
                </Label>
                <RadioGroup
                  value={ageCategory}
                  onValueChange={(v) => setValue("ageCategory", v as "JUNIOR" | "COMMUNITY", { shouldValidate: true })}
                  className="grid sm:grid-cols-2 gap-3 mt-2"
                >
                  {CATEGORIES.map((c) => (
                    <label
                      key={c.key}
                      htmlFor={`cat-${c.key}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors",
                        ageCategory === c.key
                          ? "border-gold-500 bg-gold-50"
                          : "border-border hover:border-gold-500/40 bg-white"
                      )}
                    >
                      <RadioGroupItem value={c.key} id={`cat-${c.key}`} className="mt-1" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-navy-900">
                          {c.key === "JUNIOR" ? t(lang, "categories.junior") : t(lang, "categories.community")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.key === "JUNIOR" ? t(lang, "categories.juniorAge") : t(lang, "categories.communityAge")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.key === "JUNIOR" ? t(lang, "categories.juniorReq") : t(lang, "categories.communityReq")}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.ageCategory?.message && (
                  <p className="text-xs text-red-600 mt-1">{errors.ageCategory.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={t(lang, "auth.age")} error={errors.age?.message} icon={<Calendar className="h-4 w-4" />}>
                  <Input type="number" min={ageCategory === "JUNIOR" ? 8 : 13} max={ageCategory === "JUNIOR" ? 16 : 80} {...register("age")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={t(lang, "auth.instrumentChosen")} error={errors.instrument?.message} icon={<Music className="h-4 w-4" />}>
                    <Select value={instrument} onValueChange={(v) => setValue("instrument", v, { shouldValidate: true })}>
                      <SelectTrigger><SelectValue placeholder={t(lang, "auth.selectInstrument")} /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {(["STRINGS", "WOODWINDS", "BRASS", "PERCUSSION"] as const).map((section) => (
                          <div key={section}>
                            <p className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-gold-600">
                              {t(lang, `sections.${section.toLowerCase()}`)}
                            </p>
                            {INSTRUMENTS.filter((i) => i.section === section).map((i) => (
                              <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <Field label={t(lang, "auth.experience")} error={errors.experienceYears?.message} icon={<Clock className="h-4 w-4" />}>
                <Input type="number" min={0} max={60} step={0.5} {...register("experienceYears")} />
              </Field>

              <Field label={t(lang, "auth.address")} error={errors.address?.message} icon={<MapPin className="h-4 w-4" />}>
                <Textarea rows={2} placeholder="e.g. BSD City, Tangerang, Banten" {...register("address")} />
              </Field>

              {serverError && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="rounded-md bg-navy-50 border border-navy-200 px-3 py-2 text-xs text-navy-700">
                {t(lang, "auth.dataPrivacyNote")}
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold h-12">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    {t(lang, "auth.completeRegistration")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <button type="button" onClick={onSwitchToLogin} className="text-navy-700 hover:text-gold-600 font-medium underline-offset-4 hover:underline">
                  {t(lang, "auth.alreadyMember")}
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------
// Google Sign-up Modal (simulated OAuth)
// ---------------------------------------------------------------
function GoogleModal({
  open, onClose, onSwitchToRegister, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onSuccess: (u: NonNullable<ReturnType<typeof useAppStore.getState>["user"]>) => void
}) {
  const { lang } = useAppStore()
  const [step, setStep] = useState<"choose" | "complete">("choose")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState({ email: "", name: "" })

  const chooseAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "").trim()
    const name = String(fd.get("name") || "").trim()
    if (!email || !name) {
      setError(t(lang, "auth.missingFields") + " email, name")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t(lang, "auth.invalidEmail"))
      return
    }
    setProfile({ email, name })
    setStep("complete")
  }

  const completeProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      email: profile.email,
      name: profile.name,
      whatsapp: String(fd.get("whatsapp") || "").trim(),
      ageCategory: String(fd.get("ageCategory") || "") as "JUNIOR" | "COMMUNITY",
      age: Number(fd.get("age") || 0),
      instrument: String(fd.get("instrument") || ""),
      experienceYears: Number(fd.get("experienceYears") || 0),
      address: String(fd.get("address") || "").trim(),
      photoUrl: String(fd.get("photoUrl") || ""),
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Google sign-up failed")
        return
      }
      onSuccess(data.user)
      setStep("choose")
      setProfile({ email: "", name: "" })
    } catch {
      setError(lang === "zh" ? "网络错误。" : lang === "id" ? "Network error." : "Network error.")
    } finally {
      setLoading(false)
    }
  }

  const onCloseInner = () => {
    setStep("choose")
    setProfile({ email: "", name: "" })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCloseInner()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-white border border-gray-200 shadow-sm">
            <Chrome className="h-6 w-6 text-[#4285F4]" />
          </div>
          <DialogTitle className="text-center text-xl text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
            {step === "choose" ? t(lang, "auth.signInWithGoogle") : t(lang, "auth.completeProfile")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "choose" ? t(lang, "auth.googleStep1") : t(lang, "auth.googleStep2")}
          </DialogDescription>
        </DialogHeader>

        {step === "choose" ? (
          <form onSubmit={chooseAccount} className="space-y-4">
            <Field label={t(lang, "auth.googleEmail")} icon={<Mail className="h-4 w-4" />}>
              <Input name="email" type="email" placeholder="your.name@gmail.com" defaultValue="demo.founder@gmail.com" />
            </Field>
            <Field label={t(lang, "auth.googleName")} icon={<User className="h-4 w-4" />}>
              <Input name="name" placeholder="e.g. Demo Founder" defaultValue="Demo Founder" />
            </Field>
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 h-11">
              {t(lang, "auth.continue")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button type="button" onClick={onSwitchToRegister} className="block mx-auto text-xs text-muted-foreground hover:text-navy-700 underline-offset-4 hover:underline">
              {t(lang, "auth.useEmailInstead")}
            </button>
          </form>
        ) : (
          <form onSubmit={completeProfile} className="space-y-4">
            <div className="rounded-md bg-navy-50 border border-navy-200 px-3 py-2 text-xs">
              <p className="text-navy-700">
                {t(lang, "auth.signedInAs")} <strong className="text-navy-900">{profile.name}</strong> &lt;{profile.email}&gt;
              </p>
            </div>

            <Field label={t(lang, "auth.whatsappNumber")} icon={<Phone className="h-4 w-4" />}>
              <Input name="whatsapp" placeholder="0811 9892 413" required defaultValue="0812 3456 7890" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t(lang, "auth.category")}>
                <Select name="ageCategory" defaultValue="COMMUNITY">
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">{t(lang, "categories.junior")}</SelectItem>
                    <SelectItem value="COMMUNITY">{t(lang, "categories.community")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t(lang, "auth.age")}>
                <Input name="age" type="number" min={8} max={80} defaultValue={22} required />
              </Field>
            </div>

            <Field label={t(lang, "auth.instrumentChosen")} icon={<Music className="h-4 w-4" />}>
              <Select name="instrument" defaultValue="Violin">
                <SelectTrigger><SelectValue placeholder={t(lang, "auth.selectInstrument")} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {(["STRINGS", "WOODWINDS", "BRASS", "PERCUSSION"] as const).map((section) => (
                    <div key={section}>
                      <p className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-gold-600">
                        {t(lang, `sections.${section.toLowerCase()}`)}
                      </p>
                      {INSTRUMENTS.filter((i) => i.section === section).map((i) => (
                        <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t(lang, "auth.experience")}>
              <Input name="experienceYears" type="number" min={0} max={60} step={0.5} defaultValue={3} required />
            </Field>

            <Field label={t(lang, "auth.address")} icon={<MapPin className="h-4 w-4" />}>
              <Input name="address" placeholder="BSD City, Tangerang" required defaultValue="BSD City, Tangerang" />
            </Field>

            {/* Photo URL (since Google OAuth would normally return a profile photo) */}
            <Field label={t(lang, "auth.photoUpload")}>
              <Input name="photoUrl" placeholder="https://lh3.googleusercontent.com/..." defaultValue="https://api.dicebear.com/7.x/initials/svg?seed=DF" required />
              <p className="text-xs text-muted-foreground mt-1">{t(lang, "auth.photoHint")}</p>
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("choose")} className="h-11">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t(lang, "auth.back")}
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400 h-11">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t(lang, "auth.finishRegistration")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------
function Field({
  label, error, icon, children,
}: { label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-navy-900 text-sm font-medium">{label}</Label>
      {icon ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
            {icon}
          </span>
          <div className="[&_input]:pl-9 [&_textarea]:pl-9 [&_[role=combobox]]:pl-9 [&_button]:pl-9">
            {children}
          </div>
        </div>
      ) : children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function DemoAccountsDivider() {
  const { lang } = useAppStore()
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-xs text-muted-foreground">{t(lang, "auth.demoAccounts")}</span>
      </div>
    </div>
  )
}

function DemoAccountsHelp() {
  const { lang } = useAppStore()
  return (
    <div className="rounded-md bg-navy-50 border border-navy-100 px-3 py-2 text-xs text-navy-700 space-y-1">
      <p className="flex items-center gap-1.5 font-semibold text-navy-900">
        <CheckCircle2 className="h-3.5 w-3.5 text-gold-500" />
        {t(lang, "auth.tryDemo")}
      </p>
      <p>Admin: <code className="text-navy-900">admin@ymj-stage.org</code> / <code className="text-navy-900">admin123</code></p>
      <p>Member: <code className="text-navy-900">member@ymj-stage.org</code> / <code className="text-navy-900">member123</code></p>
    </div>
  )
}
