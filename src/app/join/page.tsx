"use client"

import { Music2, Wind, AudioLines, Drum, ArrowRight, ChevronRight } from "lucide-react"
import { PageShell } from "@/components/ymj/PageShell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SECTIONS } from "@/lib/instruments"
import { useAppStore } from "@/lib/store"

function SectionIcon({ section }: { section: string }) {
  const cls = "h-6 w-6"
  switch (section) {
    case "STRINGS": return <Music2 className={cls} />
    case "WOODWINDS": return <Wind className={cls} />
    case "BRASS": return <AudioLines className={cls} />
    case "PERCUSSION": return <Drum className={cls} />
    default: return <Music2 className={cls} />
  }
}

export default function JoinPage() {
  const { openAuth } = useAppStore()
  return (
    <PageShell>
      <main className="bg-paper">
        <section className="bg-hero-orchestra relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-3">Join Us</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Open Recruitment
            </h1>
            <p className="text-navy-100 text-lg max-w-2xl mx-auto mb-6">
              Become a Founding Member of YMJ BSD Community Orchestra.
            </p>
            <Button
              size="lg"
              className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold text-base px-8 h-12 shadow-xl shadow-gold-500/25"
              onClick={() => openAuth("REGISTER")}
            >
              Become a Founding Member
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Sections Available */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-600 font-semibold mb-2">Sections Available</p>
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                Openings Across Four Instrument Families
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SECTIONS.map((s) => (
                <Card key={s.key} className="border-gold-500/20 bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-900 text-gold-400">
                      <SectionIcon section={s.key} />
                    </span>
                    <Badge variant="outline" className="border-gold-500/40 text-gold-600 text-[10px] uppercase tracking-wider">
                      {s.instruments.length} openings
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
                    {s.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{s.blurb}</p>
                  <ul className="space-y-1.5">
                    {s.instruments.map((i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-navy-700">
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

        {/* CTA */}
        <section className="bg-navy-900 py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Ready to Join?
            </h2>
            <p className="text-navy-100 mb-6">
              Register today, complete your profile, and access the member dashboard with sheet music, WhatsApp groups, and rehearsal announcements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold" onClick={() => openAuth("REGISTER")}>
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10" onClick={() => openAuth("LOGIN")}>
                Member Login <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
