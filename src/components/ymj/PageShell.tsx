"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppStore, type UserProfile } from "@/lib/store"
import { Navbar } from "@/components/ymj/Navbar"
import { Footer } from "@/components/ymj/Footer"
import { AuthModals } from "@/components/ymj/AuthModals"

interface PageShellProps {
  children: React.ReactNode
}

/**
 * Shared layout wrapper for all public pages.
 * Includes Navbar, Footer, AuthModals, and auth bootstrap.
 */
export function PageShell({ children }: PageShellProps) {
  const { user, setUser, booting, setBooting, setView } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && data?.user) {
          setUser(data.user as UserProfile)
        }
      } catch {
        // network errors are fine
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => { cancelled = true }
  }, [setUser, setBooting])

  const goToDashboard = () => {
    setView("DASHBOARD")
    router.push("/")
  }

  if (booting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 grid place-items-center bg-paper">
          <div className="text-center">
            <div className="inline-block h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading YMJ BSD Community Orchestra…</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <AuthModals />
    </div>
  )
}
