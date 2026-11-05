"use client"

import { Calendar, Clock, MapPin, Target, GraduationCap, Users, Music2 } from "lucide-react"
import { PageShell } from "@/components/ymj/PageShell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProgramsPage() {
  return (
    <PageShell>
      <main className="bg-paper">
        <section className="bg-hero-orchestra relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-3">Programs</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Two Ensembles, One Family
            </h1>
            <p className="text-navy-100 text-lg max-w-2xl mx-auto">
              Programs designed for every age and level of experience.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-8">
            {/* Junior Orchestra */}
            <Card className="border-gold-500/30 bg-white overflow-hidden">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="bg-navy-900 p-8 grid place-items-center">
                  <div className="text-center">
                    <GraduationCap className="h-16 w-16 text-gold-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display), serif" }}>Junior Orchestra</h2>
                    <p className="text-gold-400 text-sm mt-1">Ages 8–16</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <h3 className="text-lg font-semibold text-navy-900 mb-3" style={{ fontFamily: "var(--font-display), serif" }}>
                    For Young Musicians
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Designed for children and early teens who are new to ensemble playing. Guided by experienced tutors, the Junior Orchestra focuses on the basics of playing together — listening, following a conductor, and blending sound with other instruments.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-navy-900">
                      <Users className="h-4 w-4 text-gold-600" /> Ages 8–16
                    </span>
                    <span className="flex items-center gap-1.5 text-navy-900">
                      <Music2 className="h-4 w-4 text-gold-600" /> Min. 1 year of instrument study
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Orchestra */}
            <Card className="border-gold-500/30 bg-white overflow-hidden">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="bg-gold-500 p-8 grid place-items-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-navy-950 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-navy-950" style={{ fontFamily: "var(--font-display), serif" }}>Community Orchestra</h2>
                    <p className="text-navy-800 text-sm mt-1">Teens & Adults</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <h3 className="text-lg font-semibold text-navy-900 mb-3" style={{ fontFamily: "var(--font-display), serif" }}>
                    For Teens & Adults
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    For teenagers and adults — including those returning to music after a long break. The Community Orchestra plays full orchestral repertoire, with weekly rehearsals and preparation toward the inaugural concert in February 2027.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-navy-900">
                      <Users className="h-4 w-4 text-gold-600" /> Teens & Adults (13+)
                    </span>
                    <span className="flex items-center gap-1.5 text-navy-900">
                      <Music2 className="h-4 w-4 text-gold-600" /> Min. 2 years of instrument study
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-navy-900 py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-2">Rehearsal Schedule</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display), serif" }}>
                Every Saturday · 14.00 – 17.00 WIB
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Card className="bg-navy-800/60 border-gold-500/30 p-6 text-center">
                <Calendar className="h-8 w-8 text-gold-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display), serif" }}>Saturday</p>
                <p className="text-navy-200 text-xs mt-1">Every week</p>
              </Card>
              <Card className="bg-navy-800/60 border-gold-500/30 p-6 text-center">
                <Clock className="h-8 w-8 text-gold-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display), serif" }}>14.00 – 17.00</p>
                <p className="text-navy-200 text-xs mt-1">WIB (Jakarta time)</p>
              </Card>
              <Card className="bg-navy-800/60 border-gold-500/30 p-6 text-center">
                <MapPin className="h-8 w-8 text-gold-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display), serif" }}>YMJ Campus BSD</p>
                <p className="text-navy-200 text-xs mt-1">Tangerang, Indonesia</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Target Concert */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <Target className="h-12 w-12 text-gold-500 mx-auto mb-4" />
            <p className="text-xs uppercase tracking-[0.22em] text-gold-600 font-semibold mb-2">Target Concert</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              February 2027
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              All our rehearsals lead to one moment — the inaugural performance of YMJ BSD Community Orchestra at the Yayasan Musik Jakarta BSD auditorium.
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
