"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { PageShell } from "@/components/ymj/PageShell"
import { Card } from "@/components/ui/card"

interface FAQItem {
  q: string
  a: string
}

const FAQS: FAQItem[] = [
  {
    q: "Who can join the YMJ BSD Community Orchestra?",
    a: "Anyone aged 8 and above who has at least 1 year of instrument study (for Junior Orchestra, ages 8–16) or 2 years (for Community Orchestra, teens & adults). We welcome all instruments: Strings (Violin, Viola, Cello, Double Bass), Woodwinds (Flute, Oboe, Clarinet, Bassoon), Brass (Trumpet, French Horn, Trombone, Tuba), and Percussion (Timpani, Percussion).",
  },
  {
    q: "Do I need to audition?",
    a: "Yes, there will be an audition for chair placement. The audition includes: 1 etude of your choice, 1 orchestral excerpt (provided by the committee), and sight-reading. The audition date will be announced. Contact your section coordinator for details.",
  },
  {
    q: "When and where are rehearsals?",
    a: "Rehearsals are every Saturday from 14.00 to 17.00 WIB (Jakarta time) at the Yayasan Musik Jakarta Campus in BSD, Tangerang, Indonesia. Members should arrive 15 minutes early for tuning. Bring your own sheet music and instrument (except large percussion, which is available on-site).",
  },
  {
    q: "Is there a membership fee or dues?",
    a: "Yes, there are dues (iuran) for community purchases such as concert uniforms, equipment, and other shared expenses. The admin will announce specific dues campaigns with minimum amounts. Members can pay via bank transfer and upload proof of payment through the member dashboard. Payments are flexible — no fixed deadline.",
  },
  {
    q: "What is the attendance policy?",
    a: "Minimum 80% attendance is required to perform in the February 2027 inaugural concert. Attendance is tracked through the member dashboard — members mark their own attendance for each rehearsal (when the admin opens it). Once marked, attendance cannot be changed.",
  },
  {
    q: "When is the inaugural concert?",
    a: "The target date for the inaugural concert is February 2027, at the Yayasan Musik Jakarta BSD auditorium. The exact date and repertoire will be announced closer to the event.",
  },
  {
    q: "Do I need to bring my own instrument?",
    a: "Yes, members should bring their own instruments to rehearsals. The exception is large percussion instruments (timpani, etc.), which are available on-site at the YMJ Campus BSD.",
  },
  {
    q: "Can I join if I haven't played in a while?",
    a: "Absolutely! The Community Orchestra welcomes musicians returning after a long break. As long as you have at least 2 years of prior instrument study, you are welcome to join. Our conductors and section coordinators will help you get back into shape.",
  },
  {
    q: "How do I register?",
    a: "Click the 'Become a Founding Member' button on our website, fill out the registration form (name, email, WhatsApp, age, instrument, experience, address), and upload a profile photo (optional). After registration, you'll get access to the member dashboard with sheet music, WhatsApp groups, schedule, attendance, and dues features.",
  },
  {
    q: "Is my personal data private?",
    a: "Yes. Your registration data is private — only orchestra admins can view it. Other members cannot see your personal information (email, WhatsApp, address, etc.). Your data is stored securely and is only used for orchestra coordination purposes.",
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <PageShell>
      <main className="bg-paper">
        <section className="bg-hero-orchestra relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-staff-lines opacity-20 pointer-events-none" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400 font-semibold mb-3">FAQ</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
              Frequently Asked Questions
            </h1>
            <p className="text-navy-100 text-lg max-w-2xl mx-auto">
              Everything you need to know about joining and participating in the orchestra.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx
              return (
                <Card key={idx} className="border-gold-500/20 bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-navy-50/30 transition-colors"
                  >
                    <span className="font-medium text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-gold-600 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gold-600 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </PageShell>
  )
}
