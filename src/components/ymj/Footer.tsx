"use client"

import { Music2, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { t } from "@/lib/i18n"

export function Footer() {
  const { lang } = useAppStore()
  return (
    <footer className="mt-auto bg-navy-950 text-navy-100 border-t border-gold-500/20">
      <div className="container mx-auto px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-gold-500/60 bg-navy-900">
              <Music2 className="h-5 w-5 text-gold-400" />
            </span>
            <div>
              <p
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                YMJ BSD Community Orchestra
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400/90">
                Yayasan Musik Jakarta · BSD Campus
              </p>
            </div>
          </div>
          <p className="text-sm text-navy-200 leading-relaxed max-w-md">
            {t(lang, "footer.tagline")}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-400/90 font-semibold">
            {t(lang, "footer.contact")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://wa.me/628119892413"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-gold-500" />
                WhatsApp 0811 9892 413
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-500" />
              <span>bsd.orchestra@ymj-stage.org</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold-500 mt-0.5" />
              <span>Yayasan Musik Jakarta Campus, BSD, Tangerang, Indonesia</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-400/90 font-semibold">
            {t(lang, "footer.online")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="https://bsd.orchestra.ymj-stage.org"
                target="_blank"
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-gold-500" />
                bsd.orchestra.ymj-stage.org
              </Link>
            </li>
            <li className="text-navy-200">Saturday 14.00 – 17.00 WIB</li>
            <li className="text-navy-200">Target Concert · February 2027</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container mx-auto px-4 md:px-6 py-4 text-center text-xs text-navy-300">
          {t(lang, "footer.copyright")}
        </div>
      </div>
    </footer>
  )
}
