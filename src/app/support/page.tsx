"use client"

import { Heart, Gift, Users, Phone, Mail } from "lucide-react"
import { PageShell } from "@/components/ymj/PageShell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SupportPage() {
  return (
    <PageShell>
      <main className="bg-paper">
        <section className="bg-hero-orchestra relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-3">Support</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Support the Orchestra
            </h1>
            <p className="text-navy-100 text-lg max-w-2xl mx-auto">
              Your support helps us bring orchestral music to the BSD community.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-8">
            {/* Donate */}
            <Card className="border-gold-500/30 bg-white p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-500/15 text-gold-600 flex-shrink-0">
                  <Heart className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-navy-900 mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
                    Donate
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Your donation supports the YMJ BSD Community Orchestra — helping with rehearsal venue, sheet music, instrument maintenance, and concert production costs. Every contribution, large or small, makes a difference.
                  </p>
                  <div className="rounded-md bg-navy-50 border border-navy-100 p-4">
                    <p className="text-xs uppercase tracking-wider text-navy-700 font-semibold mb-2">Bank Transfer</p>
                    <p className="text-sm text-navy-900">Bank: [To be filled]</p>
                    <p className="text-sm text-navy-900">Account: [To be filled]</p>
                    <p className="text-sm text-navy-900">a.n. Yayasan Musik Jakarta</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    After transfer, please contact us via WhatsApp for confirmation.
                  </p>
                </div>
              </div>
            </Card>

            {/* Sponsorship */}
            <Card className="border-gold-500/30 bg-white p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-500/15 text-gold-600 flex-shrink-0">
                  <Gift className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-navy-900 mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
                    Become a Sponsor
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Sponsorship opportunities are available for businesses and individuals who wish to support the orchestra at a higher level. Sponsors receive recognition in concert programs, on our website, and at events.
                  </p>
                  <p className="text-sm text-navy-900 font-medium">
                    Sponsorship tiers: [To be filled — Platinum, Gold, Silver, Bronze]
                  </p>
                </div>
              </div>
            </Card>

            {/* Volunteer / Get Involved */}
            <Card className="border-gold-500/30 bg-white p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-500/15 text-gold-600 flex-shrink-0">
                  <Users className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-navy-900 mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
                    Get Involved
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    There are many ways to support the orchestra beyond financial contributions — volunteer at concerts, help with logistics, assist with marketing and social media, or share your professional skills.
                  </p>
                  <p className="text-sm text-navy-900">
                    Contact us to learn how you can help.
                  </p>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card className="bg-navy-900 border-gold-500/30 p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
                Contact Us
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/628119892413" target="_blank" rel="noreferrer">
                  <Button className="bg-[#25D366] hover:bg-[#1ebe5b] text-white">
                    <Phone className="mr-2 h-4 w-4" /> WhatsApp 0811 9892 413
                  </Button>
                </a>
                <a href="mailto:bsd.orchestra@ymj-stage.org">
                  <Button variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10">
                    <Mail className="mr-2 h-4 w-4" /> Email Us
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
