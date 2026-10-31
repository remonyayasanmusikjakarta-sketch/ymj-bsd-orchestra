"use client"

import { useEffect, useState } from "react"
import {
  Music2, Music, Calendar, MapPin, Clock, Target, Phone, Mail, ChevronRight,
  Wind, AudioLines, Drum, Users, GraduationCap, ArrowRight, Sparkles,
  Play, Video, ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SECTIONS, CATEGORIES } from "@/lib/instruments"
import { useAppStore } from "@/lib/store"
import { t } from "@/lib/i18n"
import { Gallery } from "./Gallery"

function SectionIcon({ section }: { section: string }) {
  const cls = "h-6 w-6"
  switch (section) {
    case "STRINGS": return <Music className={cls} />
    case "WOODWINDS": return <Wind className={cls} />
    case "BRASS": return <AudioLines className={cls} />
    case "PERCUSSION": return <Drum className={cls} />
    default: return <Music2 className={cls} />
  }
}

export function Landing() {
  const { openAuth, scrollTo, clearScroll, lang } = useAppStore()

  useEffect(() => {
    if (!scrollTo) return
    const el = document.getElementById(scrollTo)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    clearScroll()
  }, [scrollTo, clearScroll])

  return (
    <main>
      <Hero />
      <About />
      <SectionsAvailable />
      <Categories />
      <Schedule />
      <TargetConcert />
      <Gallery />
      <Contact />
      <FinalCTA onRegister={() => openAuth("REGISTER")} />
    </main>
  )
}

// ---------------------------------------------------------------
// Hero
// ---------------------------------------------------------------
function Hero() {
  const { openAuth, lang } = useAppStore()
  return (
    <section className="relative bg-hero-orchestra overflow-hidden">
      <div className="absolute inset-0 bg-staff-lines opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        {[
          { n: "♪", top: "12%", left: "8%", size: "text-3xl", op: "opacity-20" },
          { n: "♫", top: "30%", left: "85%", size: "text-4xl", op: "opacity-25" },
          { n: "𝄞", top: "65%", left: "12%", size: "text-5xl", op: "opacity-15" },
          { n: "♩", top: "78%", left: "78%", size: "text-3xl", op: "opacity-20" },
          { n: "♬", top: "20%", left: "55%", size: "text-2xl", op: "opacity-15" },
        ].map((d, i) => (
          <span
            key={i}
            className={`absolute ${d.size} ${d.op} text-gold-400 select-none`}
            style={{ top: d.top, left: d.left }}
          >
            {d.n}
          </span>
        ))}
      </div>

      <div className="container relative mx-auto px-4 md:px-6 py-20 md:py-32 lg:py-40 max-w-6xl">
        <div className="text-center space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold">
              {t(lang, "hero.badge")}
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-shadow-navy"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {t(lang, "hero.title1")}
            <br />
            <span className="text-gold-400">{t(lang, "hero.title2")}</span>
          </h1>

          <p className="text-lg md:text-xl text-navy-100 max-w-2xl mx-auto leading-relaxed">
            {t(lang, "hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 rounded-md border border-gold-500/30 bg-navy-950/40 px-3 py-1.5 text-xs text-navy-100">
              <Calendar className="h-3.5 w-3.5 text-gold-400" />
              {t(lang, "hero.everySaturday")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-gold-500/30 bg-navy-950/40 px-3 py-1.5 text-xs text-navy-100">
              <Clock className="h-3.5 w-3.5 text-gold-400" />
              {t(lang, "hero.timeWIB")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-gold-500/30 bg-navy-950/40 px-3 py-1.5 text-xs text-navy-100">
              <MapPin className="h-3.5 w-3.5 text-gold-400" />
              {t(lang, "hero.venue")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-gold-500/30 bg-navy-950/40 px-3 py-1.5 text-xs text-navy-100">
              <Target className="h-3.5 w-3.5 text-gold-400" />
              {t(lang, "hero.targetConcert")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <Button
              size="lg"
              className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold text-base px-8 h-12 shadow-xl shadow-gold-500/25"
              onClick={() => openAuth("REGISTER")}
            >
              {t(lang, "hero.ctaRegister")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 hover:text-gold-300 h-12 px-6"
              onClick={() => useAppStore.getState().triggerScroll("about")}
            >
              {t(lang, "hero.ctaLearnMore")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-navy-300 pt-4 max-w-md mx-auto">
            {t(lang, "hero.subtitle2")}
          </p>
        </div>
      </div>

      <div className="gold-divider" />
    </section>
  )
}

// ---------------------------------------------------------------
// About
// ---------------------------------------------------------------
function About() {
  const { lang } = useAppStore()
  return (
    <section id="about" className="section-fade bg-paper py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          eyebrow={t(lang, "about.eyebrow")}
          title={t(lang, "about.title")}
          subtitle={t(lang, "about.subtitle")}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-gold-500/20 bg-white shadow-sm p-6">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-navy-900 text-gold-400 mb-4">
              <Music2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-navy-900 text-lg mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
              {t(lang, "about.foundingTitle")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(lang, "about.foundingBody")}
            </p>
          </Card>

          <Card className="border-gold-500/20 bg-white shadow-sm p-6">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-navy-900 text-gold-400 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-navy-900 text-lg mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
              {t(lang, "about.ensemblesTitle")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(lang, "about.ensemblesBody")}
            </p>
          </Card>

          <Card className="border-gold-500/20 bg-white shadow-sm p-6">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-navy-900 text-gold-400 mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-navy-900 text-lg mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
              {t(lang, "about.concertTitle")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(lang, "about.concertBody")}
            </p>
          </Card>
        </div>

        <div className="mt-12 max-w-3xl mx-auto text-center">
          <p className="text-base text-muted-foreground leading-relaxed">
            {t(lang, "about.bodyPara")}
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Sections Available
// ---------------------------------------------------------------
function SectionsAvailable() {
  const { lang } = useAppStore()
  const sectionLabels: Record<string, string> = {
    STRINGS: t(lang, "sections.strings"),
    WOODWINDS: t(lang, "sections.woodwinds"),
    BRASS: t(lang, "sections.brass"),
    PERCUSSION: t(lang, "sections.percussion"),
  }
  const sectionBlurbs: Record<string, string> = {
    STRINGS: t(lang, "sections.stringsBlurb"),
    WOODWINDS: t(lang, "sections.woodwindsBlurb"),
    BRASS: t(lang, "sections.brassBlurb"),
    PERCUSSION: t(lang, "sections.percussionBlurb"),
  }
  return (
    <section id="sections" className="section-fade bg-navy-900 py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
      <div className="container relative mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          dark
          eyebrow={t(lang, "sections.eyebrow")}
          title={t(lang, "sections.title")}
          subtitle={t(lang, "sections.subtitle")}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {SECTIONS.map((s) => (
            <Card
              key={s.key}
              className="bg-navy-800/60 border-gold-500/30 text-navy-100 p-6 hover:bg-navy-800 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25 transition-colors">
                  <SectionIcon section={s.key} />
                </span>
                <Badge
                  variant="outline"
                  className="border-gold-500/40 text-gold-400 text-[10px] uppercase tracking-wider"
                >
                  {s.instruments.length} {t(lang, "sections.openings")}
                </Badge>
              </div>
              <h3
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {sectionLabels[s.key]}
              </h3>
              <p className="text-sm text-navy-200 mb-4 leading-relaxed">{sectionBlurbs[s.key]}</p>
              <ul className="space-y-1.5">
                {s.instruments.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-navy-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------
function Categories() {
  const { lang } = useAppStore()
  return (
    <section id="categories" className="section-fade bg-paper py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          eyebrow={t(lang, "categories.eyebrow")}
          title={t(lang, "categories.title")}
          subtitle={t(lang, "categories.subtitle")}
        />

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {CATEGORIES.map((c) => (
            <Card
              key={c.key}
              className="relative overflow-hidden border-2 border-gold-500/20 bg-white shadow-sm hover:shadow-md transition-shadow p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-400 text-2xl">
                    {c.key === "JUNIOR" ? <GraduationCap className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                  </span>
                  <div>
                    <h3
                      className="text-2xl font-semibold text-navy-900"
                      style={{ fontFamily: "var(--font-display), serif" }}
                    >
                      {c.key === "JUNIOR" ? t(lang, "categories.junior") : t(lang, "categories.community")}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.18em] text-gold-600">
                      {c.key === "JUNIOR" ? t(lang, "categories.juniorAge") : t(lang, "categories.communityAge")}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {c.key === "JUNIOR" ? t(lang, "categories.juniorBody") : t(lang, "categories.communityBody")}
                </p>
                <div className="flex items-center gap-2 rounded-md bg-navy-50 px-3 py-2">
                  <span className="text-xs uppercase tracking-wider text-navy-700 font-semibold">
                    {t(lang, "categories.requirement")}
                  </span>
                  <span className="text-sm text-navy-900">
                    {c.key === "JUNIOR" ? t(lang, "categories.juniorReq") : t(lang, "categories.communityReq")}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------
function Schedule() {
  const { lang } = useAppStore()
  return (
    <section id="schedule" className="section-fade bg-navy-950 py-20 md:py-28 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          dark
          eyebrow={t(lang, "schedule.eyebrow")}
          title={t(lang, "schedule.title")}
          subtitle={t(lang, "schedule.subtitle")}
        />

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-navy-900/70 border-gold-500/30 p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold-400">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">{t(lang, "schedule.day")}</span>
                </div>
                <p className="text-3xl text-white font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
                  {t(lang, "schedule.dayValue")}
                </p>
                <p className="text-sm text-navy-200">{t(lang, "schedule.dayNote")}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold-400">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">{t(lang, "schedule.time")}</span>
                </div>
                <p className="text-3xl text-white font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
                  14.00 – 17.00
                </p>
                <p className="text-sm text-navy-200">WIB (Jakarta time)</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold-400">
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">{t(lang, "schedule.venue")}</span>
                </div>
                <p className="text-2xl text-white font-bold leading-tight" style={{ fontFamily: "var(--font-display), serif" }}>
                  {t(lang, "schedule.venueValue")}
                </p>
                <p className="text-sm text-navy-200">{t(lang, "schedule.venueNote")}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gold-500/20">
              <p className="text-sm text-navy-100 leading-relaxed">
                <strong className="text-gold-400">{t(lang, "schedule.rulesTitle")}</strong>
                {t(lang, "schedule.rulesBody")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Target Concert
// ---------------------------------------------------------------
function TargetConcert() {
  const { lang } = useAppStore()
  return (
    <section id="concert" className="section-fade bg-paper py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          eyebrow={t(lang, "concert.eyebrow")}
          title={t(lang, "concert.title")}
          subtitle={t(lang, "concert.subtitle")}
        />

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="overflow-hidden border-gold-500/30 shadow-lg">
            <div className="bg-hero-orchestra p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 mb-4">
                <Sparkles className="h-4 w-4 text-gold-400" />
                <span className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold">
                  {t(lang, "concert.saveTheDate")}
                </span>
              </div>
              <p
                className="text-5xl md:text-7xl font-bold text-gold-400 mb-2"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {t(lang, "concert.dateValue")}
              </p>
              <p className="text-navy-100 text-sm uppercase tracking-[0.18em]">
                {t(lang, "concert.venue")}
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                  ~14
                </p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t(lang, "concert.monthsToConcert")}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                  60+
                </p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t(lang, "concert.rehearsals")}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold-500" style={{ fontFamily: "var(--font-display), serif" }}>
                  1
                </p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t(lang, "concert.foundingCohort")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Contact
// ---------------------------------------------------------------
function Contact() {
  const { lang } = useAppStore()
  return (
    <section id="contact" className="section-fade bg-navy-900 py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
      <div className="container relative mx-auto px-4 md:px-6 max-w-6xl">
        <SectionHeader
          dark
          eyebrow={t(lang, "contact.eyebrow")}
          title={t(lang, "contact.title")}
          subtitle={t(lang, "contact.subtitle")}
        />

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          <a href="https://wa.me/628119892413" target="_blank" rel="noreferrer" className="group">
            <Card className="bg-navy-800/60 border-gold-500/30 p-8 h-full hover:bg-navy-800 transition-colors hover:border-gold-500/50">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25 transition-colors">
                  <Phone className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold-400 font-semibold mb-1">
                    {t(lang, "contact.whatsapp")}
                  </p>
                  <p className="text-2xl text-white font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
                    0811 9892 413
                  </p>
                  <p className="text-sm text-navy-200 mt-2">{t(lang, "contact.whatsappNote")}</p>
                </div>
              </div>
            </Card>
          </a>

          <a href="https://bsd.orchestra.ymj-stage.org" target="_blank" rel="noreferrer" className="group">
            <Card className="bg-navy-800/60 border-gold-500/30 p-8 h-full hover:bg-navy-800 transition-colors hover:border-gold-500/50">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25 transition-colors">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold-400 font-semibold mb-1">
                    {t(lang, "contact.website")}
                  </p>
                  <p className="text-xl text-white font-semibold break-all" style={{ fontFamily: "var(--font-display), serif" }}>
                    bsd.orchestra.ymj-stage.org
                  </p>
                  <p className="text-sm text-navy-200 mt-2">{t(lang, "contact.websiteNote")}</p>
                </div>
              </div>
            </Card>
          </a>
        </div>

        {/* Privacy note */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3 rounded-lg border border-gold-500/30 bg-navy-950/40 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-navy-100 leading-relaxed">{t(lang, "contact.privacyNote")}</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button
            size="lg"
            className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold text-base px-8 h-12 shadow-xl shadow-gold-500/25"
            onClick={() => useAppStore.getState().openAuth("REGISTER")}
          >
            {t(lang, "nav.registerNow")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------
function FinalCTA({ onRegister }: { onRegister: () => void }) {
  const { lang } = useAppStore()
  return (
    <section className="bg-paper py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Card className="border-2 border-gold-500/30 bg-gradient-to-br from-navy-900 to-navy-950 text-center p-10 md:p-14 shadow-xl">
          <p
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {t(lang, "finalCta.title")}
          </p>
          <p className="text-navy-100 max-w-2xl mx-auto mb-6">{t(lang, "finalCta.body")}</p>
          <Button
            size="lg"
            className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold text-base px-8 h-12"
            onClick={onRegister}
          >
            {t(lang, "finalCta.button")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------
function SectionHeader({
  eyebrow, title, subtitle, dark = false,
}: { eyebrow: string; title: string; subtitle?: string; dark?: boolean }) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-3">
      <p className={`text-xs uppercase tracking-[0.22em] font-semibold ${dark ? "text-gold-400" : "text-gold-600"}`}>
        {eyebrow}
      </p>
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${dark ? "text-white" : "text-navy-900"}`}
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base md:text-lg leading-relaxed ${dark ? "text-navy-200" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
      <div className="flex items-center justify-center pt-2">
        <span className="block h-0.5 w-16 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      </div>
    </div>
  )
}
