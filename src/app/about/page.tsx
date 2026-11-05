"use client"

import { Music2, Target, Award, BookOpen, Quote } from "lucide-react"
import { PageShell } from "@/components/ymj/PageShell"
import { Card } from "@/components/ui/card"
import { FOUNDER, FOUNDER_MESSAGE, FOUNDER_QUOTE, MUSIC_DIRECTORS } from "@/lib/leadership"
import { UserCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <PageShell>
      <main className="bg-paper">
        {/* Hero */}
        <section className="bg-hero-orchestra relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-3">About Us</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Our Story
            </h1>
            <p className="text-navy-100 text-lg max-w-2xl mx-auto">
              YMJ BSD Community Orchestra — extending the legacy of Yayasan Musik Jakarta to the BSD community.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
                  A Legacy of Music Education
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Yayasan Musik Jakarta (YMJ) was founded in 1983 by Dr. Kuei Pin Yeo, Indonesia&apos;s first Doctor of Music in piano performance, upon her return from studies in the United States. What began as a music school has grown into a comprehensive institution encompassing early childhood music education, secondary school, and a tertiary-level conservatory.
                  </p>
                  <p>
                    The YMJ BSD Community Orchestra is the newest extension of this legacy — bringing orchestral music education and performance opportunities to the BSD, Tangerang community. Open to musicians of all ages and levels, from ages 8 to adult, the orchestra welcomes everyone who wishes to experience the joy of making music together.
                  </p>
                  <p>
                    With weekly Saturday rehearsals and a target inaugural concert in February 2027, the orchestra is currently in its founding phase — recruiting founding members across all instrument sections.
                  </p>
                </div>
              </div>
              <div className="grid place-items-center">
                { }
                <img
                  src="/uploads/leadership/ymj-logo.jpg"
                  alt="YMJ Logo"
                  className="h-48 w-48 rounded-full border-4 border-gold-500/40 shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-navy-900 py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-2">Mission & Vision</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display), serif" }}>
                Our Purpose
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-navy-800/60 border-gold-500/30 p-8 text-center">
                <Target className="h-10 w-10 text-gold-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display), serif" }}>Our Vision</h3>
                <p className="text-navy-100 text-sm leading-relaxed">
                  To continue to enhance the quality of human life through music education and performance — making orchestral music accessible to everyone in the BSD community and beyond.
                </p>
              </Card>
              <Card className="bg-navy-800/60 border-gold-500/30 p-8 text-center">
                <Music2 className="h-10 w-10 text-gold-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display), serif" }}>Our Mission</h3>
                <p className="text-navy-100 text-sm leading-relaxed">
                  To provide a welcoming space where musicians of all ages and levels can grow, rehearse, and perform together — building community through the universal language of music.
                </p>
              </Card>
            </div>
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="border-l-4 border-gold-500 pl-6 py-4 bg-navy-800/40 rounded-r-lg">
                <Quote className="h-6 w-6 text-gold-500 mb-2" />
                <p className="text-lg text-white font-medium italic" style={{ fontFamily: "var(--font-display), serif" }}>
                  &ldquo;Music brings people together — in harmony, we find unity.&rdquo;
                </p>
                <p className="text-sm text-gold-400 mt-2">— Dr. Kuei Pin Yeo, Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* Music Directors */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-600 font-semibold mb-2">Leadership</p>
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                Music Director Team
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {MUSIC_DIRECTORS.map((leader, idx) => (
                <Card key={leader.name} className="border-gold-500/20 bg-white p-6 text-center">
                  <div className="relative mx-auto mb-4 w-fit">
                    { }
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className={`rounded-full object-cover mx-auto ${idx === 0 ? "h-32 w-32 border-4 border-gold-500" : "h-28 w-28 border-4 border-gold-500/40"}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = "grid"
                      }}
                    />
                    <div className={`hidden rounded-full bg-navy-900 mx-auto place-items-center text-gold-400 ${idx === 0 ? "h-32 w-32 border-4 border-gold-500" : "h-28 w-28 border-4 border-gold-500/40"}`}>
                      <UserCircle className={idx === 0 ? "h-16 w-16" : "h-14 w-14"} />
                    </div>
                  </div>
                  <h4 className="font-semibold text-navy-900 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
                    {leader.name}
                  </h4>
                  <p className="text-xs uppercase tracking-wider text-gold-600 font-semibold mt-1 mb-3">
                    {leader.roleEn}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {leader.bioEn}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
