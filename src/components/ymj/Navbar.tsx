"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LogIn, UserPlus, Music2, LogOut, LayoutDashboard, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { LANGS, t } from "@/lib/i18n"

const NAV_LINKS = [
  { id: "about", key: "nav.about" },
  { id: "sections", key: "nav.sections" },
  { id: "categories", key: "nav.categories" },
  { id: "schedule", key: "nav.schedule" },
  { id: "concert", key: "nav.concert" },
  { id: "contact", key: "nav.contact" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { user, openAuth, logoutLocal, setView, triggerScroll, view, lang, setLang } = useAppStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleNav = (id: string) => {
    setOpen(false)
    if (view === "DASHBOARD") {
      setView("LANDING")
      setTimeout(() => triggerScroll(id), 60)
    } else {
      triggerScroll(id)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore network errors
    }
    logoutLocal()
  }

  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[1]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-navy-900/95 backdrop-blur-md shadow-lg shadow-navy-950/20 border-b border-gold-500/30"
          : "bg-navy-900/80 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          onClick={() => {
            setView("LANDING")
            setOpen(false)
          }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/60 bg-navy-950/50">
            <Music2 className="h-5 w-5 text-gold-400" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className="text-base font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              YMJ BSD
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold-400/90">
              Community Orchestra
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => handleNav(l.id)}
                className="px-3 py-2 text-sm font-medium text-navy-100 hover:text-gold-400 transition-colors rounded-md hover:bg-white/5"
              >
                {t(lang, l.key)}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop auth actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              onBlur={() => setTimeout(() => setLangOpen(false), 150)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-navy-100 hover:text-gold-400 hover:bg-white/5 text-sm"
              aria-label={t(lang, "nav.language")}
            >
              <Globe className="h-4 w-4" />
              <span className="text-base">{currentLang.flag}</span>
              <span className="text-xs uppercase font-medium">{currentLang.code}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-white shadow-lg overflow-hidden">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setLang(l.code)
                      setLangOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-navy-50 transition-colors",
                      l.code === lang ? "bg-gold-50 text-navy-900 font-medium" : "text-navy-800"
                    )}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-navy-100 hover:text-gold-400 hover:bg-white/5"
                onClick={() => setView("DASHBOARD")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t(lang, "nav.dashboard")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gold-500/40 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 hover:text-gold-300"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t(lang, "nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-navy-100 hover:text-gold-400 hover:bg-white/5"
                onClick={() => openAuth("LOGIN")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {t(lang, "nav.login")}
              </Button>
              <Button
                size="sm"
                className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold shadow-md shadow-gold-500/20"
                onClick={() => openAuth("REGISTER")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t(lang, "nav.register")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-1">
          {/* Mobile language quick switch */}
          <button
            className="lg:hidden grid h-9 w-9 place-items-center rounded-md text-white hover:bg-white/10"
            onClick={() => {
              const idx = LANGS.findIndex((l) => l.code === lang)
              const next = LANGS[(idx + 1) % LANGS.length]
              setLang(next.code)
            }}
            aria-label="Switch language"
          >
            <span className="text-base">{currentLang.flag}</span>
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-md text-white hover:bg-white/10"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-navy-950/95 backdrop-blur-md border-t border-gold-500/20">
          <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => handleNav(l.id)}
                  className="block w-full text-left px-3 py-2.5 rounded-md text-navy-100 hover:text-gold-400 hover:bg-white/5"
                >
                  {t(lang, l.key)}
                </button>
              </li>
            ))}
            <li className="h-px bg-gold-500/20 my-2" />
            {user ? (
              <>
                <li>
                  <Button
                    variant="outline"
                    className="w-full border-gold-500/40 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20"
                    onClick={() => {
                      setView("DASHBOARD")
                      setOpen(false)
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t(lang, "nav.dashboard")}
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-navy-100 hover:bg-white/5"
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t(lang, "nav.logout")}
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full text-navy-100 hover:bg-white/5"
                    onClick={() => {
                      openAuth("LOGIN")
                      setOpen(false)
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t(lang, "nav.login")}
                  </Button>
                </li>
                <li>
                  <Button
                    className="w-full bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
                    onClick={() => {
                      openAuth("REGISTER")
                      setOpen(false)
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t(lang, "nav.register")}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
