// Zustand store for view state + cached user profile + UI flags + i18n.
"use client"

import { create } from "zustand"
import type { Lang } from "./i18n"

export type View = "LANDING" | "DASHBOARD"
export type AuthModal = null | "LOGIN" | "REGISTER" | "GOOGLE"

export interface UserProfile {
  id: string
  email: string
  name: string
  whatsapp: string
  ageCategory: "JUNIOR" | "COMMUNITY"
  age: number
  instrument: string
  instrumentSection: string
  experienceYears: number
  address: string
  photoUrl?: string | null
  nameTagUrl?: string | null
  role: "MEMBER" | "ADMIN"
  status: "PENDING" | "VERIFIED" | "REJECTED"
  provider: "EMAIL" | "GOOGLE"
  emailVerified: boolean
  createdAt?: string
}

interface AppState {
  // view
  view: View
  setView: (v: View) => void

  // auth
  user: UserProfile | null
  setUser: (u: UserProfile | null) => void
  logoutLocal: () => void

  // modals
  authModal: AuthModal
  openAuth: (m: AuthModal) => void
  closeAuth: () => void

  // bootstrap
  booting: boolean
  setBooting: (b: boolean) => void

  // landing nav (active section highlight + smooth scroll trigger)
  scrollTo: string | null
  triggerScroll: (id: string) => void
  clearScroll: () => void

  // language
  lang: Lang
  setLang: (l: Lang) => void
}

const LANG_COOKIE = "ymj_lang"
const LANG_LS_KEY = "ymj_lang"

function detectInitialLang(): Lang {
  // SSR-safe: only check window in browser
  if (typeof window === "undefined") return "id"
  // 1. localStorage
  try {
    const stored = window.localStorage.getItem(LANG_LS_KEY)
    if (stored === "en" || stored === "id" || stored === "zh") return stored
  } catch {
    // ignore
  }
  // 2. cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))
  if (match) {
    const v = decodeURIComponent(match[1])
    if (v === "en" || v === "id" || v === "zh") return v
  }
  // 3. browser language
  const nav = navigator.language?.toLowerCase() ?? ""
  if (nav.startsWith("zh")) return "zh"
  if (nav.startsWith("en")) return "en"
  return "id"
}

export const useAppStore = create<AppState>((set) => ({
  view: "LANDING",
  setView: (v) => set({ view: v }),

  user: null,
  setUser: (u) => set({ user: u, view: u ? "DASHBOARD" : "LANDING" }),
  logoutLocal: () => set({ user: null, view: "LANDING", authModal: null }),

  authModal: null,
  openAuth: (m) => set({ authModal: m }),
  closeAuth: () => set({ authModal: null }),

  booting: true,
  setBooting: (b) => set({ booting: b }),

  scrollTo: null,
  triggerScroll: (id) => set({ scrollTo: id }),
  clearScroll: () => set({ scrollTo: null }),

  // initialize lang lazily via getter pattern (call detectInitialLang once on client)
  lang: typeof window !== "undefined" ? detectInitialLang() : "id",
  setLang: (l) => {
    // persist
    try {
      window.localStorage.setItem(LANG_LS_KEY, l)
    } catch {
      // ignore
    }
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`
    set({ lang: l })
  },
}))
