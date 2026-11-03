"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Music2, FileMusic, MessageCircle, CalendarDays, User as UserIcon,
  Settings, Users, Download, ExternalLink, Search, Loader2,
  BadgeCheck, Clock, MapPin, Target, Phone, Mail, ShieldCheck,
  AlertCircle, Sparkles, FileText, CheckCircle2, Upload, Video,
  Trash2, ChevronDown, ChevronUp, ImageIcon, Award, Crown, X,
  CalendarCheck, Wallet, History as HistoryIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAppStore, type UserProfile } from "@/lib/store"
import { INSTRUMENTS } from "@/lib/instruments"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AbsensiPanel } from "./AbsensiPanel"
import { IuranPanel } from "./IuranPanel"
import { HistoryPanel } from "./HistoryPanel"
import { NameTag } from "./NameTag"
import { CalendarView } from "./CalendarView"

// ---------- Resource types ----------
interface SheetMusicItem {
  id: string; title: string; composer: string; instrument: string
  section: string; category: string; fileUrl: string; fileType: string
  difficulty: string; description?: string | null
}
interface AnnouncementItem {
  id: string; title: string; content: string
  eventDate: string; type: string; createdAt: string
}
interface WhatsAppGroupItem {
  id: string; name: string; section: string
  description?: string | null; link: string
}
interface RegistrationRow {
  id: string; name: string; email: string; whatsapp: string
  ageCategory: string; age: number; instrument: string
  instrumentSection: string; experienceYears: number; address: string
  role: string; status: string; provider: string
  emailVerified: boolean; photoUrl?: string | null
  createdAt: string
}
interface VideoItem {
  id: string; title: string; description?: string | null
  videoType: string; videoUrl: string; thumbnailUrl?: string | null
  eventDate: string
}

const SECTION_LABEL_KEY: Record<string, string> = {
  STRINGS: "sections.strings",
  WOODWINDS: "sections.woodwinds",
  BRASS: "sections.brass",
  PERCUSSION: "sections.percussion",
  GENERAL: "", JUNIOR: "", COMMUNITY: "", ALL: "",
}

const TYPE_META: Record<string, { label: string; cls: string }> = {
  PRACTICE: { label: "Practice", cls: "border-blue-400/40 text-blue-700 bg-blue-50" },
  CONCERT: { label: "Concert", cls: "border-gold-500/40 text-gold-700 bg-gold-50" },
  AUDITION: { label: "Audition", cls: "border-purple-400/40 text-purple-700 bg-purple-50" },
  GENERAL: { label: "General", cls: "border-navy-400/40 text-navy-700 bg-navy-50" },
}

export function MemberDashboard() {
  const { user, lang } = useAppStore()
  const [tab, setTab] = useState("library")

  if (!user) return null

  // localized section label
  const sectionLabel = (s: string) => {
    const key = SECTION_LABEL_KEY[s]
    return key ? t(lang, key) : s
  }

  return (
    <main className="bg-paper min-h-[calc(100vh-4rem)]">
      {/* Hero strip */}
      <div className="bg-hero-orchestra relative overflow-hidden">
        <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
        <div className="container relative mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoUrl ? (
                 
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-full border-2 border-gold-500 object-cover"
                />
              ) : (
                <Avatar className="h-16 w-16 border-2 border-gold-500">
                  <AvatarFallback className="bg-navy-900 text-gold-400 text-xl font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
                    {user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-1">
                  {t(lang, "dashboard.title")}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display), serif" }}>
                  {t(lang, "dashboard.welcome")}, {user.name.split(" ")[0]}
                </h1>
                <p className="text-navy-100 mt-1 text-sm">
                  {user.instrument} · {sectionLabel(user.instrumentSection)} ·{" "}
                  {user.ageCategory === "JUNIOR" ? t(lang, "categories.junior") : t(lang, "categories.community")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={user.status} />
              {user.role === "ADMIN" && (
                <Badge className="border-gold-500/40 text-gold-400 bg-gold-500/10">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {t(lang, "dashboard.admin")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 gap-1 bg-white border border-border h-auto p-1">
            <TabTrigger value="library" icon={<FileMusic className="h-4 w-4" />} label={t(lang, "dashboard.sheetMusic")} />
            <TabTrigger value="whatsapp" icon={<MessageCircle className="h-4 w-4" />} label={t(lang, "dashboard.whatsapp")} />
            <TabTrigger value="announcements" icon={<CalendarDays className="h-4 w-4" />} label={t(lang, "dashboard.schedule")} />
            <TabTrigger value="attendance" icon={<CalendarCheck className="h-4 w-4" />} label={t(lang, "dashboard.attendance")} />
            <TabTrigger value="dues" icon={<Wallet className="h-4 w-4" />} label={t(lang, "dashboard.dues")} />
            <TabTrigger value="history" icon={<HistoryIcon className="h-4 w-4" />} label={t(lang, "dashboard.history")} />
            <TabTrigger value="profile" icon={<UserIcon className="h-4 w-4" />} label={t(lang, "dashboard.profile")} />
            {user.role === "ADMIN" && (
              <TabTrigger value="admin" icon={<Settings className="h-4 w-4" />} label={t(lang, "dashboard.adminTab")} />
            )}
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <SheetMusicLibrary user={user} />
          </TabsContent>
          <TabsContent value="whatsapp" className="mt-6">
            <WhatsAppGroups user={user} />
          </TabsContent>
          <TabsContent value="announcements" className="mt-6">
            <AnnouncementBoard />
          </TabsContent>
          <TabsContent value="attendance" className="mt-6">
            <AbsensiPanel user={user} />
          </TabsContent>
          <TabsContent value="dues" className="mt-6">
            <IuranPanel user={user} />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <HistoryPanel />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <ProfilePanel user={user} />
          </TabsContent>
          {user.role === "ADMIN" && (
            <TabsContent value="admin" className="mt-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </main>
  )
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-medium data-[state=active]:bg-navy-900 data-[state=active]:text-gold-400 rounded-md transition-colors"
    >
      {icon}
      {label}
    </TabsTrigger>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { lang } = useAppStore()
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    VERIFIED: {
      label: t(lang, "dashboard.verified"),
      cls: "border-emerald-500/40 text-emerald-700 bg-emerald-50",
      icon: <BadgeCheck className="h-3 w-3 mr-1" />,
    },
    PENDING: {
      label: t(lang, "dashboard.pending"),
      cls: "border-amber-500/40 text-amber-700 bg-amber-50",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    REJECTED: {
      label: t(lang, "dashboard.rejected"),
      cls: "border-red-500/40 text-red-700 bg-red-50",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
  }
  const m = map[status] || map.PENDING
  return (
    <Badge variant="outline" className={m.cls}>
      {m.icon}
      {m.label}
    </Badge>
  )
}

// ---------------------------------------------------------------
// Sheet Music Library
// ---------------------------------------------------------------
function SheetMusicLibrary({ user }: { user: UserProfile }) {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<SheetMusicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [scope, setScope] = useState<"my" | "all">("my")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (scope === "my") {
        params.set("section", user.instrumentSection)
        params.set("category", user.ageCategory)
        params.set("instrument", user.instrument)
      }
      if (search.trim()) params.set("q", search.trim())
      const res = await fetch(`/api/sheet-music?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error || "Failed to load sheet music")
      }
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [scope, search, user])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.partiturMusik")}
        title={t(lang, "dashboard.sheetMusicLibrary")}
        description={t(lang, "dashboard.sheetMusicDesc")}
      />

      <Card className="border-gold-500/20 bg-white p-4 md:p-5 mt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, "dashboard.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md bg-navy-50 p-1 self-start md:self-auto">
            <button
              onClick={() => setScope("my")}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                scope === "my" ? "bg-navy-900 text-gold-400" : "text-navy-700 hover:bg-navy-100"
              )}
            >
              {t(lang, "dashboard.forMyInstrument")}
            </button>
            <button
              onClick={() => setScope("all")}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                scope === "all" ? "bg-navy-900 text-gold-400" : "text-navy-700 hover:bg-navy-100"
              )}
            >
              {t(lang, "dashboard.all")}
            </button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">{t(lang, "dashboard.loadingSheets")}</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2 mt-4">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center mt-4 text-muted-foreground">
          <FileMusic className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t(lang, "dashboard.noSheets")}</p>
          <p className="text-xs mt-1">{t(lang, "dashboard.noSheetsHint")}</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {items.map((s) => (
            <SheetMusicCard
              key={s.id}
              item={s}
              onDownload={() => {
                toast({ title: lang === "zh" ? "打开乐谱" : lang === "id" ? "Membuka partitur" : "Opening sheet music", description: `${s.title} · ${s.composer}` })
                window.open(s.fileUrl, "_blank", "noopener,noreferrer")
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SheetMusicCard({ item, onDownload }: { item: SheetMusicItem; onDownload: () => void }) {
  const { lang } = useAppStore()
  const diffColor: Record<string, string> = {
    BEGINNER: "border-emerald-400/40 text-emerald-700 bg-emerald-50",
    INTERMEDIATE: "border-amber-400/40 text-amber-700 bg-amber-50",
    ADVANCED: "border-red-400/40 text-red-700 bg-red-50",
  }
  const sectionLabelKey = SECTION_LABEL_KEY[item.section]
  const sectionLabel = sectionLabelKey ? t(lang, sectionLabelKey) : item.section
  return (
    <Card className="flex flex-col border-gold-500/20 bg-white hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-gold-400 flex-shrink-0">
          <FileMusic className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-navy-300 text-navy-700 bg-navy-50">
            {sectionLabel}
          </Badge>
          {item.difficulty && (
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", diffColor[item.difficulty] || diffColor.INTERMEDIATE)}>
              {item.difficulty}
            </Badge>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-navy-900 leading-tight mb-1" style={{ fontFamily: "var(--font-display), serif" }}>
        {item.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        by {item.composer} · {item.instrument === "ALL" ? (lang === "zh" ? "所有乐器" : lang === "id" ? "Semua instrumen" : "All instruments") : item.instrument}
      </p>

      {item.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {item.fileType}
        </span>
        <Button size="sm" variant="outline"
          className="border-gold-500/40 text-navy-800 hover:bg-gold-50 hover:text-navy-900"
          onClick={onDownload}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {t(lang, "dashboard.viewDownload")}
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------
// WhatsApp Groups
// ---------------------------------------------------------------
function WhatsAppGroups({ user }: { user: UserProfile }) {
  const { lang } = useAppStore()
  const [items, setItems] = useState<WhatsAppGroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ section: user.instrumentSection, category: user.ageCategory })
        const res = await fetch(`/api/whatsapp-groups?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load groups")
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.whatsapp")}
        title={t(lang, "dashboard.whatsappAccess")}
        description={t(lang, "dashboard.whatsappDesc")}
      />

      {loading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">{t(lang, "dashboard.loadingGroups")}</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2 mt-4">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {items.map((g) => {
            const isGeneral = g.section === "GENERAL"
            const isMySection = g.section === user.instrumentSection
            const isMyCategory = g.section === user.ageCategory
            const highlight = isGeneral || isMySection || isMyCategory
            return (
              <Card key={g.id} className={cn("p-5 border bg-white flex flex-col", highlight ? "border-gold-500/40 shadow-sm" : "border-border")}>
                <div className="flex items-start justify-between mb-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#25D366]/15 text-[#128C7E]">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-navy-300 text-navy-700 bg-navy-50">
                    {SECTION_LABEL_KEY[g.section] ? t(lang, SECTION_LABEL_KEY[g.section]) : g.section}
                  </Badge>
                </div>
                <h3 className="font-semibold text-navy-900 mb-1 leading-tight" style={{ fontFamily: "var(--font-display), serif" }}>
                  {g.name}
                </h3>
                {g.description && <p className="text-xs text-muted-foreground mb-4">{g.description}</p>}
                <Button
                  size="sm"
                  className="mt-auto bg-[#25D366] hover:bg-[#1ebe5b] text-white"
                  onClick={() => window.open(g.link, "_blank", "noopener,noreferrer")}
                >
                  {t(lang, "dashboard.joinGroup")}
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------
// Announcement & Schedule Board
// ---------------------------------------------------------------
function AnnouncementBoard() {
  const { lang } = useAppStore()
  const [items, setItems] = useState<AnnouncementItem[]>([])
  const [rehearsals, setRehearsals] = useState<{ id: string; title: string; date: string; location: string; notes?: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [aRes, rRes] = await Promise.all([
          fetch("/api/announcements", { cache: "no-store" }),
          fetch("/api/rehearsals", { cache: "no-store" }),
        ])
        if (!aRes.ok) throw new Error("Failed to load announcements")
        const aData = await aRes.json()
        setItems(aData.items || [])
        // Rehearsals are optional — don't fail if this errors
        if (rRes.ok) {
          const rData = await rRes.json()
          setRehearsals(rData.items || [])
        }
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

  const locale = lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US"

  // Combine announcements + rehearsals into calendar events
  const calendarEvents = [
    ...items.map((a) => ({
      id: a.id,
      title: a.title,
      date: a.eventDate,
      type: a.type,
      description: a.content,
    })),
    ...rehearsals.map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      type: "REHEARSAL",
      location: r.location,
      description: r.notes || undefined,
    })),
  ]

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.announcementsSchedule")}
        title={t(lang, "dashboard.practiceConcertRoadmap")}
        description={t(lang, "dashboard.announcementsDesc")}
      />

      {/* Monthly Calendar View */}
      <div className="mt-6">
        <CalendarView events={calendarEvents} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card className="border-gold-500/40 bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
          <div className="flex items-center gap-2 text-gold-400 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wider font-semibold">{t(lang, "dashboard.weeklyPractice")}</span>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "schedule.dayValue")} · 14.00 – 17.00 WIB
          </p>
          <p className="text-sm text-navy-100">
            {lang === "zh" ? "雅加达音乐学院BSD校区。提前15分钟到场调音。" : lang === "id" ? "Yayasan Musik Jakarta Campus, BSD. Hadir 15 menit lebih awal untuk tuning." : "Yayasan Musik Jakarta Campus, BSD. Arrive 15 minutes early for tuning."}
          </p>
        </Card>

        <Card className="border-gold-500/40 bg-gradient-to-br from-gold-500 to-gold-700 p-6 text-navy-950">
          <div className="flex items-center gap-2 text-navy-900 mb-2">
            <Target className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wider font-semibold">{t(lang, "dashboard.targetConcert")}</span>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "concert.dateValue")}
          </p>
          <p className="text-sm text-navy-900/80">
            {lang === "zh" ? "YMJ BSD礼堂首演。需至少80%出勤率方可演出。" : lang === "id" ? "Konser perdana di Auditorium YMJ BSD. Min. 80% kehadiran untuk tampil." : "Inaugural concert at YMJ BSD Auditorium. Min. 80% attendance required to perform."}
          </p>
        </Card>
      </div>

      <h3 className="text-lg font-semibold text-navy-900 mt-10 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
        {t(lang, "dashboard.latestAnnouncements")}
      </h3>
      <div className="space-y-3">
        {items.map((a) => {
          const meta = TYPE_META[a.type] || TYPE_META.GENERAL
          const d = new Date(a.eventDate)
          const dateStr = d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
          const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
          return (
            <Card key={a.id} className="border-border bg-white p-5 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-shrink-0 grid place-items-center rounded-lg bg-navy-50 border border-navy-100 px-3 py-2 text-center min-w-[88px]">
                <p className="text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
                  {d.toLocaleString(locale, { month: "short" })}
                </p>
                <p className="text-2xl font-bold text-navy-900 leading-none" style={{ fontFamily: "var(--font-display), serif" }}>
                  {d.getDate()}
                </p>
                <p className="text-[10px] text-muted-foreground">{d.getFullYear()}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h4 className="font-semibold text-navy-900 leading-tight" style={{ fontFamily: "var(--font-display), serif" }}>
                    {a.title}
                  </h4>
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", meta.cls)}>
                    {meta.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{a.content}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  {dateStr} · {timeStr} WIB
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Profile Panel — now shows photo + name tag
// ---------------------------------------------------------------
function ProfilePanel({ user }: { user: UserProfile }) {
  const { lang } = useAppStore()
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.memberProfile")}
        title={t(lang, "dashboard.yourAccount")}
        description={t(lang, "dashboard.profileDesc")}
      />

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {/* Profile card */}
        <Card className="md:col-span-1 border-gold-500/20 bg-white p-6 text-center">
          {user.photoUrl ? (
             
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-24 w-24 rounded-full mx-auto mb-3 border-4 border-gold-500/30 object-cover"
            />
          ) : (
            <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-gold-500/30">
              <AvatarFallback className="bg-navy-900 text-gold-400 text-2xl font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <h3 className="font-semibold text-navy-900 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
            {user.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">{user.email}</p>
          <StatusBadge status={user.status} />
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t(lang, "dashboard.memberSince")}</p>
            <p className="text-sm font-medium text-navy-900">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString(lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })
                : "—"}
            </p>
          </div>
        </Card>

        {/* Registration details */}
        <Card className="md:col-span-2 border-gold-500/20 bg-white p-6">
          <h3 className="font-semibold text-navy-900 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "dashboard.registrationDetails")}
          </h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileRow icon={<UserIcon className="h-4 w-4" />} label={t(lang, "dashboard.fullName")} value={user.name} />
            <ProfileRow icon={<Mail className="h-4 w-4" />} label={t(lang, "auth.email")} value={user.email} />
            <ProfileRow icon={<Phone className="h-4 w-4" />} label={t(lang, "auth.whatsappNumber")} value={user.whatsapp} />
            <ProfileRow icon={<Music2 className="h-4 w-4" />} label={t(lang, "auth.instrumentChosen")} value={user.instrument} />
            <ProfileRow icon={<Users className="h-4 w-4" />} label={t(lang, "dashboard.section")} value={SECTION_LABEL_KEY[user.instrumentSection] ? t(lang, SECTION_LABEL_KEY[user.instrumentSection]) : user.instrumentSection} />
            <ProfileRow icon={<Sparkles className="h-4 w-4" />} label={t(lang, "auth.category")} value={user.ageCategory === "JUNIOR" ? t(lang, "categories.junior") : t(lang, "categories.community")} />
            <ProfileRow icon={<UserIcon className="h-4 w-4" />} label={t(lang, "auth.age")} value={String(user.age)} />
            <ProfileRow icon={<Clock className="h-4 w-4" />} label={t(lang, "dashboard.experienceYears")} value={`${user.experienceYears} ${t(lang, "dashboard.experienceValue")}`} />
            <ProfileRow icon={<MapPin className="h-4 w-4" />} label={t(lang, "auth.address")} value={user.address} className="sm:col-span-2" />
            <ProfileRow icon={<ShieldCheck className="h-4 w-4" />} label={t(lang, "dashboard.signInMethod")} value={user.provider === "GOOGLE" ? "Google" : (lang === "zh" ? "邮箱和密码" : lang === "id" ? "Email & password" : "Email & password")} />
            <ProfileRow icon={<BadgeCheck className="h-4 w-4" />} label={t(lang, "dashboard.emailVerified")} value={user.emailVerified ? t(lang, "dashboard.yes") : t(lang, "dashboard.pending_status")} />
          </dl>
        </Card>

        {/* Name tag — client-side generated, always shown */}
        <NameTag user={user} />
      </div>
    </section>
  )
}

function ProfileRow({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-medium">
        <span className="text-gold-600">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm text-navy-900 font-medium">{value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------
// Admin Panel
// ---------------------------------------------------------------
function AdminPanel() {
  const { lang } = useAppStore()
  const [section, setSection] = useState<"regs" | "rehearsals" | "dues" | "payments" | "sheets" | "videos" | "webhook">("regs")

  return (
    <section>
      <SectionHeading
        eyebrow={t(lang, "dashboard.adminTab")}
        title={t(lang, "dashboard.adminPanel")}
        description={t(lang, "dashboard.adminDesc")}
      />

      {/* Section switcher */}
      <div className="flex flex-wrap gap-2 mt-6">
        <AdminSectionBtn active={section === "regs"} onClick={() => setSection("regs")} icon={<Users className="h-4 w-4" />} label={t(lang, "dashboard.allRegistrations")} />
        <AdminSectionBtn active={section === "rehearsals"} onClick={() => setSection("rehearsals")} icon={<CalendarCheck className="h-4 w-4" />} label={t(lang, "dashboard.rehearsalManager")} />
        <AdminSectionBtn active={section === "dues"} onClick={() => setSection("dues")} icon={<Wallet className="h-4 w-4" />} label={t(lang, "dashboard.duesManager")} />
        <AdminSectionBtn active={section === "payments"} onClick={() => setSection("payments")} icon={<Wallet className="h-4 w-4" />} label={lang === "id" ? "Verifikasi Pembayaran" : "Payment Verification"} />
        <AdminSectionBtn active={section === "sheets"} onClick={() => setSection("sheets")} icon={<FileMusic className="h-4 w-4" />} label={t(lang, "dashboard.sheetMusicManager")} />
        <AdminSectionBtn active={section === "videos"} onClick={() => setSection("videos")} icon={<Video className="h-4 w-4" />} label={t(lang, "dashboard.videoManager")} />
        <AdminSectionBtn active={section === "webhook"} onClick={() => setSection("webhook")} icon={<Settings className="h-4 w-4" />} label={t(lang, "dashboard.googleSheetWebhook")} />
      </div>

      <div className="mt-6">
        {section === "regs" && <RegistrationsManager />}
        {section === "rehearsals" && <RehearsalManager />}
        {section === "dues" && <DuesManager />}
        {section === "payments" && <DuesPaymentsManager />}
        {section === "sheets" && <SheetMusicManager />}
        {section === "videos" && <VideoManager />}
        {section === "webhook" && <WebhookManager />}
      </div>
    </section>
  )
}

function AdminSectionBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
        active
          ? "bg-navy-900 text-gold-400 border-navy-900"
          : "bg-white text-navy-700 border-border hover:bg-navy-50"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ---------- Rehearsal manager (admin) ----------
interface RehearsalItem {
  id: string; title: string; date: string; location: string;
  notes?: string | null; attendanceOpen: boolean; attendanceCount: number;
}

function RehearsalManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<RehearsalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/rehearsals", { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !location) {
      toast({ title: lang === "id" ? "Lengkapi semua field" : "Fill all fields", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/rehearsals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, location, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      toast({ title: lang === "id" ? "Sesi latihan dibuat" : "Rehearsal created" })
      setTitle(""); setDate(""); setLocation(""); setNotes("")
      setShowForm(false)
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAttendance = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/rehearsals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceOpen: !current }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: !current ? (lang === "id" ? "Absensi dibuka" : "Attendance opened") : (lang === "id" ? "Absensi ditutup" : "Attendance closed") })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  const del = async (id: string) => {
    if (!confirm(lang === "id" ? "Hapus sesi ini? Semua absensi terkait juga akan dihapus." : "Delete this rehearsal? All related attendance will be deleted.")) return
    try {
      const res = await fetch(`/api/rehearsals/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast({ title: lang === "id" ? "Dihapus" : "Deleted" })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
          {t(lang, "dashboard.rehearsalManager")}
        </h3>
        <Button onClick={() => setShowForm((s) => !s)} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
          <CalendarCheck className="h-4 w-4 mr-2" />
          {t(lang, "dashboard.newRehearsal")}
        </Button>
      </div>

      {showForm && (
        <Card className="border-gold-500/30 bg-white p-5">
          <form onSubmit={create} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.rehearsalTitle")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" placeholder="Latihan Rutin Sabtu" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.rehearsalDate")}</Label>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.rehearsalLocation")}</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1" placeholder="YMJ Campus BSD" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.rehearsalNotes")}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                {t(lang, "dashboard.createRehearsal")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t(lang, "common.cancel")}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t(lang, "common.loading")}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {lang === "id" ? "Belum ada sesi latihan." : "No rehearsal sessions yet."}
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <Card key={r.id} className="border-border bg-white p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>{r.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase",
                      r.attendanceOpen ? "border-emerald-500/40 text-emerald-700 bg-emerald-50" : "border-gray-400/40 text-gray-700 bg-gray-50"
                    )}>
                      {r.attendanceOpen ? t(lang, "dashboard.attendanceOpen") : t(lang, "dashboard.attendanceClosed")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {r.attendanceCount} {lang === "id" ? "absen" : "marked"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {r.location}
                  </p>
                  {r.notes && <p className="text-xs text-muted-foreground italic mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className={r.attendanceOpen ? "border-red-400/40 text-red-700 hover:bg-red-50" : "border-emerald-400/40 text-emerald-700 hover:bg-emerald-50"}
                    onClick={() => toggleAttendance(r.id, r.attendanceOpen)}
                  >
                    {r.attendanceOpen ? t(lang, "dashboard.closeAttendance") : t(lang, "dashboard.openAttendance")}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => del(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Dues manager (admin) ----------
interface DuesItem {
  id: string; title: string; description: string; minAmount: number;
  active: boolean; createdAt: string; paymentCount: number;
}

function DuesManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<DuesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dues", { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !minAmount) {
      toast({ title: lang === "id" ? "Lengkapi semua field" : "Fill all fields", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, minAmount: Number(minAmount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      toast({ title: lang === "id" ? "Iuran dibuat" : "Dues campaign created" })
      setTitle(""); setDescription(""); setMinAmount("")
      setShowForm(false)
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/dues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: !current ? (lang === "id" ? "Dibuka kembali" : "Reopened") : (lang === "id" ? "Ditutup" : "Closed") })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
          {t(lang, "dashboard.duesManager")}
        </h3>
        <Button onClick={() => setShowForm((s) => !s)} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
          <Wallet className="h-4 w-4 mr-2" />
          {t(lang, "dashboard.newDues")}
        </Button>
      </div>

      {showForm && (
        <Card className="border-gold-500/30 bg-white p-5">
          <form onSubmit={create} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.duesTitle")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" placeholder={lang === "id" ? "Iuran Baju Konser Feb 2027" : "Concert Uniform Feb 2027"} />
            </div>
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.duesDescription")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} className="mt-1" placeholder={lang === "id" ? "Iuran untuk pembelian seragam/baju konser..." : "Dues for concert uniform purchase..."} />
            </div>
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.minAmount")}</Label>
              <Input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} required className="mt-1" placeholder="250000" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                {t(lang, "dashboard.createDues")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t(lang, "common.cancel")}</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t(lang, "common.loading")}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {lang === "id" ? "Belum ada kampanye iuran." : "No dues campaigns yet."}
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((d) => (
            <Card key={d.id} className="border-border bg-white p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>{d.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase",
                      d.active ? "border-emerald-500/40 text-emerald-700 bg-emerald-50" : "border-gray-400/40 text-gray-700 bg-gray-50"
                    )}>
                      {d.active ? t(lang, "dashboard.active") : t(lang, "dashboard.closed")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {d.paymentCount} {lang === "id" ? "pembayaran" : "payments"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.description}</p>
                  <p className="text-sm text-navy-900 font-medium mt-1">
                    {lang === "id" ? "Minimal" : "Min"}: Rp {d.minAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={d.active ? "border-red-400/40 text-red-700 hover:bg-red-50" : "border-emerald-400/40 text-emerald-700 hover:bg-emerald-50"}
                  onClick={() => toggleActive(d.id, d.active)}
                >
                  {d.active ? t(lang, "dashboard.closeDues") : t(lang, "dashboard.reopenDues")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Dues Payments Verification (admin) ----------
interface PaymentRow {
  id: string; amountPaid: number; proofUrl: string; proofType: string;
  status: string; adminNote?: string | null; paidAt: string; verifiedAt?: string | null;
  user: { id: string; name: string; email: string; instrument: string; instrumentSection: string };
  dues: { id: string; title: string; minAmount: number };
}

function DuesPaymentsManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("PENDING")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === "ALL" ? "/api/admin/dues-payments" : `/api/admin/dues-payments?status=${filter}`
      const res = await fetch(url, { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const verify = async (id: string, status: "VERIFIED" | "REJECTED") => {
    let adminNote = ""
    if (status === "REJECTED") {
      adminNote = prompt(lang === "id" ? "Alasan penolakan:" : "Rejection reason:") || ""
      if (!adminNote) return
    }
    try {
      const res = await fetch(`/api/admin/dues-payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: status === "VERIFIED" ? (lang === "id" ? "Pembayaran terverifikasi" : "Payment verified") : (lang === "id" ? "Pembayaran ditolak" : "Payment rejected") })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  const del = async (id: string) => {
    if (!confirm(lang === "id" ? "Hapus pembayaran ini?" : "Delete this payment?")) return
    try {
      const res = await fetch(`/api/admin/dues-payments/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast({ title: lang === "id" ? "Dihapus" : "Deleted" })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  const statusMeta: Record<string, { label: string; cls: string }> = {
    PENDING: { label: t(lang, "dashboard.pending"), cls: "border-amber-500/40 text-amber-700 bg-amber-50" },
    VERIFIED: { label: t(lang, "dashboard.verified"), cls: "border-emerald-500/40 text-emerald-700 bg-emerald-50" },
    REJECTED: { label: t(lang, "dashboard.rejected"), cls: "border-red-500/40 text-red-700 bg-red-50" },
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
        {lang === "id" ? "Verifikasi Pembayaran Iuran" : "Dues Payment Verification"}
      </h3>

      {/* Filter */}
      <div className="flex gap-1 bg-navy-50 p-1 rounded-md w-fit">
        {(["PENDING", "VERIFIED", "REJECTED", "ALL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn("px-3 py-1.5 rounded text-xs font-medium",
              filter === s ? "bg-navy-900 text-gold-400" : "text-navy-700"
            )}
          >
            {s === "ALL" ? (lang === "id" ? "Semua" : "All") : statusMeta[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t(lang, "common.loading")}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {lang === "id" ? "Belum ada pembayaran." : "No payments yet."}
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p.id} className="border-border bg-white p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Proof thumbnail */}
                <a href={p.proofUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                  { }
                  <img
                    src={p.proofUrl}
                    alt="Payment proof"
                    className="w-24 h-24 object-cover rounded-md border border-border hover:opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                </a>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-navy-900">{p.user.name}</p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", statusMeta[p.status].cls)}>
                      {statusMeta[p.status].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.dues.title} · {p.user.instrument}</p>
                  <p className="text-sm text-navy-900 font-medium mt-1">
                    Rp {p.amountPaid.toLocaleString("id-ID")}
                    {p.amountPaid < p.dues.minAmount && (
                      <span className="text-xs text-red-600 ml-2">
                        ({lang === "id" ? "di bawah min" : "below min"} Rp {p.dues.minAmount.toLocaleString("id-ID")})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(p.paidAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {p.adminNote && (
                    <p className="text-xs text-red-600 italic mt-1">{t(lang, "dashboard.adminNote")}: {p.adminNote}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {p.status === "PENDING" && (
                    <>
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => verify(p.id, "VERIFIED")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {lang === "id" ? "Verifikasi" : "Verify"}
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-400/40 text-red-700 hover:bg-red-50" onClick={() => verify(p.id, "REJECTED")}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        {lang === "id" ? "Tolak" : "Reject"}
                      </Button>
                    </>
                  )}
                  <a href={p.proofUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost" className="w-full">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      {t(lang, "dashboard.viewProof")}
                    </Button>
                  </a>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => del(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Webhook manager ----------
function WebhookManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [webhookUrl, setWebhookUrl] = useState("")
  const [loadingWebhook, setLoadingWebhook] = useState(true)
  const [savingWebhook, setSavingWebhook] = useState(false)

  const load = useCallback(async () => {
    setLoadingWebhook(true)
    try {
      const res = await fetch("/api/admin/webhook", { cache: "no-store" })
      const data = await res.json()
      setWebhookUrl(data.webhookUrl || "")
    } catch {
      // ignore
    } finally {
      setLoadingWebhook(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSavingWebhook(true)
    try {
      const res = await fetch("/api/admin/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error || "Failed to save")
      }
      toast({ title: lang === "zh" ? "Webhook URL 已保存" : lang === "id" ? "URL Webhook disimpan" : "Webhook URL saved", description: lang === "zh" ? "新注册将转发到您的Google表格。" : lang === "id" ? "Registrasi baru akan diteruskan ke Google Sheet Anda." : "New registrations will be forwarded to your Google Sheet." })
    } catch (e) {
      toast({ title: lang === "zh" ? "保存失败" : lang === "id" ? "Gagal simpan" : "Save failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" })
    } finally {
      setSavingWebhook(false)
    }
  }

  return (
    <Card className="border-gold-500/20 bg-white p-6">
      <Label className="text-navy-900 text-sm font-medium">{t(lang, "dashboard.webhookUrlLabel")}</Label>
      <Textarea value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} disabled={loadingWebhook}
        placeholder="https://script.google.com/macros/s/AKfy.../exec" rows={3} className="mt-1.5 font-mono text-xs" />
      <p className="text-xs text-muted-foreground mt-2">{t(lang, "dashboard.webhookHint")}</p>
      <Button onClick={save} disabled={savingWebhook || loadingWebhook} className="mt-4 bg-navy-900 hover:bg-navy-800 text-white">
        {savingWebhook ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
        {t(lang, "dashboard.saveWebhook")}
      </Button>
      <div className="mt-4 rounded-md bg-navy-50 border border-navy-100 p-3 text-xs text-navy-700">
        <p className="font-semibold mb-1 text-navy-900">{t(lang, "dashboard.samplePayload")}</p>
        <pre className="font-mono text-[10px] overflow-x-auto scroll-thin">{`{
  "timestamp": "2026-11-01T12:00:00.000Z",
  "name": "Andi Pratama",
  "email": "andi@example.com",
  "whatsapp": "0811 9892 413",
  "ageCategory": "COMMUNITY",
  "age": 22,
  "instrument": "Violin",
  "instrumentSection": "STRINGS",
  "experienceYears": 5,
  "address": "BSD City, Tangerang",
  "provider": "EMAIL",
  "status": "VERIFIED"
}`}</pre>
      </div>
    </Card>
  )
}

// ---------- Registrations manager (with promote/demote) ----------
function RegistrationsManager() {
  const { toast } = useToast()
  const { lang, user: currentUser } = useAppStore()
  const [regs, setRegs] = useState<RegistrationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; newRole: "ADMIN" | "MEMBER" } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/registrations", { cache: "no-store" })
      const data = await res.json()
      setRegs(data.users || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const doRoleChange = async () => {
    if (!confirmAction) return
    try {
      const res = await fetch(`/api/admin/users/${confirmAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: confirmAction.newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      toast({
        title: confirmAction.newRole === "ADMIN" ? (lang === "zh" ? "已提升为管理员" : lang === "id" ? "Dipromote jadi Admin" : "Promoted to Admin") : (lang === "zh" ? "已降级为会员" : lang === "id" ? "Diturunkan jadi Member" : "Demoted to Member"),
        description: `${confirmAction.name}`,
      })
      setConfirmAction(null)
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
      setConfirmAction(null)
    }
  }

  // Stats
  const stats = {
    total: regs.length,
    verified: regs.filter((r) => r.status === "VERIFIED").length,
    pending: regs.filter((r) => r.status === "PENDING").length,
    junior: regs.filter((r) => r.ageCategory === "JUNIOR").length,
    community: regs.filter((r) => r.ageCategory === "COMMUNITY").length,
    admins: regs.filter((r) => r.role === "ADMIN").length,
  }

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <StatCard label={t(lang, "dashboard.total")} value={stats.total} />
        <StatCard label={t(lang, "dashboard.verified")} value={stats.verified} />
        <StatCard label={t(lang, "dashboard.admin")} value={stats.admins} />
        <StatCard label={t(lang, "categories.junior")} value={stats.junior} />
        <StatCard label={t(lang, "categories.community")} value={stats.community} />
        <StatCard label={t(lang, "dashboard.pending")} value={stats.pending} />
      </div>

      {/* Section counts */}
      <div className="grid grid-cols-4 gap-2">
        {(["STRINGS", "WOODWINDS", "BRASS", "PERCUSSION"] as const).map((sec) => (
          <div key={sec} className="rounded-md bg-navy-50 p-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{SECTION_LABEL_KEY[sec] ? t(lang, SECTION_LABEL_KEY[sec]) : sec}</p>
            <p className="text-lg font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
              {regs.filter((r) => r.instrumentSection === sec).length}
            </p>
          </div>
        ))}
      </div>

      <Card className="border-gold-500/20 bg-white p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
            {t(lang, "dashboard.allRegistrations")}
          </h3>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t(lang, "dashboard.refresh")}
          </Button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            {t(lang, "common.loading")}
          </div>
        ) : regs.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No registrations yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {regs.map((r) => {
              const expanded = expandedId === r.id
              const isSelf = currentUser?.id === r.id
              return (
                <div key={r.id} className="p-4 hover:bg-navy-50/30">
                  <div className="flex items-center gap-3">
                    {/* Photo or initials */}
                    {r.photoUrl ? (
                       
                      <img src={r.photoUrl} alt={r.name} className="h-10 w-10 rounded-full object-cover border border-gold-500/30" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-navy-900 text-gold-400 grid place-items-center text-sm font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
                        {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy-900 truncate">{r.name}</p>
                        {r.role === "ADMIN" && (
                          <Badge variant="outline" className="border-gold-500/40 text-gold-700 bg-gold-50 text-[10px] uppercase">
                            <Crown className="h-3 w-3 mr-0.5" />
                            {t(lang, "dashboard.admin")}
                          </Badge>
                        )}
                        {isSelf && (
                          <Badge variant="outline" className="border-blue-400/40 text-blue-700 bg-blue-50 text-[10px]">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.email} · {r.instrument} · {SECTION_LABEL_KEY[r.instrumentSection] ? t(lang, SECTION_LABEL_KEY[r.instrumentSection]) : r.instrumentSection}
                      </p>
                    </div>

                    {/* Role actions */}
                    <div className="flex items-center gap-2">
                      {r.role === "MEMBER" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gold-500/40 text-gold-700 hover:bg-gold-50"
                          onClick={() => setConfirmAction({ id: r.id, name: r.name, newRole: "ADMIN" })}
                        >
                          <Crown className="h-3.5 w-3.5 mr-1" />
                          {t(lang, "dashboard.promoteToAdmin")}
                        </Button>
                      ) : (
                        !isSelf && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400/40 text-red-700 hover:bg-red-50"
                            onClick={() => setConfirmAction({ id: r.id, name: r.name, newRole: "MEMBER" })}
                          >
                            <UserIcon className="h-3.5 w-3.5 mr-1" />
                            {t(lang, "dashboard.demoteToMember")}
                          </Button>
                        )
                      )}
                      <button
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-navy-700 hover:bg-navy-100"
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-border grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <DetailRow label={t(lang, "auth.whatsappNumber")} value={r.whatsapp} />
                      <DetailRow label={t(lang, "auth.age")} value={`${r.age} (${r.ageCategory === "JUNIOR" ? t(lang, "categories.junior") : t(lang, "categories.community")})`} />
                      <DetailRow label={t(lang, "dashboard.experienceYears")} value={`${r.experienceYears} ${t(lang, "dashboard.experienceValue")}`} />
                      <DetailRow label={t(lang, "dashboard.signInMethod")} value={r.provider === "GOOGLE" ? "Google" : "Email"} />
                      <DetailRow label={t(lang, "auth.address")} value={r.address} className="sm:col-span-2" />
                      <DetailRow label={t(lang, "dashboard.memberSince")} value={new Date(r.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US")} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.newRole === "ADMIN" ? t(lang, "dashboard.promoteToAdmin") : t(lang, "dashboard.demoteToMember")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newRole === "ADMIN" ? t(lang, "dashboard.confirmPromote") : t(lang, "dashboard.confirmDemote")}
              <br />
              <strong>{confirmAction?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(lang, "common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={doRoleChange} className={confirmAction?.newRole === "ADMIN" ? "bg-gold-500 text-navy-950 hover:bg-gold-400" : "bg-red-600 text-white hover:bg-red-700"}>
              {t(lang, "common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function DetailRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("", className)}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}:</span>{" "}
      <span className="text-navy-900">{value}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-gradient-to-br from-navy-50 to-white p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="text-xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>{value}</p>
    </div>
  )
}

// ---------- Sheet Music upload manager ----------
function SheetMusicManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<SheetMusicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // form state
  const [title, setTitle] = useState("")
  const [composer, setComposer] = useState("")
  const [instrument, setInstrument] = useState("")
  const [section, setSection] = useState("ALL")
  const [category, setCategory] = useState("ALL")
  const [difficulty, setDifficulty] = useState("INTERMEDIATE")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sheet-music", { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setTitle(""); setComposer(""); setInstrument("")
    setSection("ALL"); setCategory("ALL"); setDifficulty("INTERMEDIATE")
    setDescription(""); setFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const upload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !composer || !instrument || !file) {
      toast({ title: lang === "zh" ? "请填写所有字段" : lang === "id" ? "Lengkapi semua field" : "Please fill all fields", variant: "destructive" })
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("title", title)
      fd.append("composer", composer)
      fd.append("instrument", instrument)
      fd.append("section", section)
      fd.append("category", category)
      fd.append("difficulty", difficulty)
      fd.append("description", description)
      fd.append("file", file)
      const res = await fetch("/api/admin/sheet-music-upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      toast({ title: lang === "zh" ? "乐谱已上传" : lang === "id" ? "Partitur diupload" : "Sheet music uploaded", description: title })
      resetForm()
      setShowForm(false)
      load()
    } catch (e) {
      toast({ title: lang === "zh" ? "上传失败" : lang === "id" ? "Upload gagal" : "Upload failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
          {t(lang, "dashboard.sheetMusicManager")}
        </h3>
        <Button onClick={() => setShowForm((s) => !s)} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
          <Upload className="h-4 w-4 mr-2" />
          {t(lang, "dashboard.uploadNewSheet")}
        </Button>
      </div>

      {showForm && (
        <Card className="border-gold-500/30 bg-white p-5">
          <form onSubmit={upload} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.sheetTitle")}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.composer")}</Label>
                <Input value={composer} onChange={(e) => setComposer(e.target.value)} required className="mt-1" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "auth.instrumentChosen")}</Label>
                <Select value={instrument} onValueChange={setInstrument}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={t(lang, "auth.selectInstrument")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Instruments</SelectItem>
                    {INSTRUMENTS.map((i) => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.section")}</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sections</SelectItem>
                    <SelectItem value="STRINGS">{t(lang, "sections.strings")}</SelectItem>
                    <SelectItem value="WOODWINDS">{t(lang, "sections.woodwinds")}</SelectItem>
                    <SelectItem value="BRASS">{t(lang, "sections.brass")}</SelectItem>
                    <SelectItem value="PERCUSSION">{t(lang, "sections.percussion")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">{t(lang, "auth.category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="JUNIOR">{t(lang, "categories.junior")}</SelectItem>
                    <SelectItem value="COMMUNITY">{t(lang, "categories.community")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.difficulty")}</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">PDF File</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-navy-900 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500 file:text-navy-950 file:font-medium file:cursor-pointer hover:file:bg-gold-400"
                  required
                />
                {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {t(lang, "dashboard.uploadSheet")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                {t(lang, "common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Existing sheet music list */}
      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t(lang, "common.loading")}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((s) => (
            <Card key={s.id} className="border-gold-500/20 bg-white p-4 flex flex-col">
              <div className="flex items-start gap-2 mb-2">
                <FileMusic className="h-5 w-5 text-navy-900 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 text-sm truncate" style={{ fontFamily: "var(--font-display), serif" }}>{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.composer} · {s.instrument}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                <Badge variant="outline" className="text-[9px] uppercase">{SECTION_LABEL_KEY[s.section] ? t(lang, SECTION_LABEL_KEY[s.section]) : s.section}</Badge>
                <Badge variant="outline" className="text-[9px] uppercase">{s.difficulty}</Badge>
                <Badge variant="outline" className="text-[9px] uppercase">{s.fileType}</Badge>
              </div>
              <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:text-gold-700 inline-flex items-center gap-1 mt-auto">
                <ExternalLink className="h-3 w-3" />
                {t(lang, "dashboard.viewDownload")}
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Video manager ----------
function VideoManager() {
  const { toast } = useToast()
  const { lang } = useAppStore()
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<"file" | "link">("link")
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/videos", { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setTitle(""); setDescription(""); setEventDate("")
    setVideoUrl(""); setFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast({ title: lang === "zh" ? "请输入标题" : lang === "id" ? "Masukkan judul" : "Enter title", variant: "destructive" })
      return
    }
    setUploading(true)
    try {
      let res: Response
      if (mode === "file") {
        if (!file) {
          toast({ title: lang === "zh" ? "请选择视频文件" : lang === "id" ? "Pilih file video" : "Select video file", variant: "destructive" })
          setUploading(false)
          return
        }
        const fd = new FormData()
        fd.append("title", title)
        fd.append("description", description)
        fd.append("eventDate", eventDate)
        fd.append("file", file)
        res = await fetch("/api/admin/video-upload", { method: "POST", body: fd })
      } else {
        if (!videoUrl) {
          toast({ title: lang === "zh" ? "请输入视频URL" : lang === "id" ? "Masukkan URL video" : "Enter video URL", variant: "destructive" })
          setUploading(false)
          return
        }
        res = await fetch("/api/admin/video-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, eventDate, videoUrl }),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      toast({ title: lang === "zh" ? "视频已添加" : lang === "id" ? "Video ditambahkan" : "Video added", description: title })
      resetForm()
      setShowForm(false)
      load()
    } catch (e) {
      toast({ title: lang === "zh" ? "失败" : lang === "id" ? "Gagal" : "Failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm(lang === "zh" ? "确定删除?" : lang === "id" ? "Yakin hapus?" : "Delete this video?")) return
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error || "Failed")
      }
      toast({ title: lang === "zh" ? "已删除" : lang === "id" ? "Dihapus" : "Deleted" })
      load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
          {t(lang, "dashboard.videoManager")}
        </h3>
        <Button onClick={() => setShowForm((s) => !s)} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
          <Video className="h-4 w-4 mr-2" />
          {t(lang, "dashboard.uploadNewVideo")}
        </Button>
      </div>

      {showForm && (
        <Card className="border-gold-500/30 bg-white p-5">
          {/* Mode tabs */}
          <div className="flex gap-1 mb-4 bg-navy-50 p-1 rounded-md w-fit">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={cn("px-3 py-1.5 rounded text-sm font-medium", mode === "link" ? "bg-navy-900 text-gold-400" : "text-navy-700")}
            >
              {t(lang, "dashboard.pasteLink")}
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={cn("px-3 py-1.5 rounded text-sm font-medium", mode === "file" ? "bg-navy-900 text-gold-400" : "text-navy-700")}
            >
              {t(lang, "dashboard.uploadFile")}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.videoTitle")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
            </div>

            <div>
              <Label className="text-sm font-medium">{t(lang, "dashboard.description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t(lang, "dashboard.eventDate")}</Label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1" />
              </div>
              {mode === "link" ? (
                <div>
                  <Label className="text-sm font-medium">{t(lang, "dashboard.videoLink")}</Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-1" />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium">Video File (MP4/WebM)</Label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-sm text-navy-900 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500 file:text-navy-950 file:font-medium file:cursor-pointer hover:file:bg-gold-400"
                  />
                  {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="bg-gold-500 text-navy-950 hover:bg-gold-400">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Video className="h-4 w-4 mr-1" />}
                {t(lang, "dashboard.addVideo")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                {t(lang, "common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          {t(lang, "common.loading")}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center text-muted-foreground">
          <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {t(lang, "dashboard.noVideos")}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((v) => (
            <Card key={v.id} className="border-gold-500/20 bg-white p-3 flex flex-col">
              <div className="aspect-video bg-navy-900 rounded mb-2 overflow-hidden relative">
                {v.thumbnailUrl ? (
                   
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Video className="h-8 w-8 text-gold-500/50" />
                  </div>
                )}
                <Badge variant="outline" className="absolute top-1 right-1 bg-navy-950/70 border-gold-500/40 text-gold-400 text-[9px] uppercase">
                  {v.videoType === "YOUTUBE" ? "YT" : v.videoType === "VIMEO" ? "Vimeo" : "File"}
                </Badge>
              </div>
              <p className="font-medium text-navy-900 text-sm truncate" style={{ fontFamily: "var(--font-display), serif" }}>{v.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(v.eventDate).toLocaleDateString()}</p>
              <div className="flex gap-1 mt-2">
                <a href={v.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:text-gold-700 inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
                <button onClick={() => del(v.id)} className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 ml-auto">
                  <Trash2 className="h-3 w-3" /> {t(lang, "dashboard.deleteVideo")}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// Section heading helper
// ---------------------------------------------------------------
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
