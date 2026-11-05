"use client"

import { Music2, FileMusic, MessageCircle, CalendarDays, Wallet, History as HistoryIcon, User as UserIcon, Settings } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isAdmin: boolean
}

/**
 * Mobile bottom navigation bar — only visible on mobile (lg:hidden).
 * Provides native-app-like navigation for the dashboard.
 */
export function BottomNav({ activeTab, onTabChange, isAdmin }: BottomNavProps) {
  const { lang } = useAppStore()

  const tabs = [
    { id: "library", icon: FileMusic, label: lang === "id" ? "Partitur" : "Sheets" },
    { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { id: "announcements", icon: CalendarDays, label: lang === "id" ? "Jadwal" : "Schedule" },
    { id: "attendance", icon: CalendarDays, label: lang === "id" ? "Absen" : "Attend" },
    { id: "dues", icon: Wallet, label: lang === "id" ? "Iuran" : "Dues" },
    { id: "history", icon: HistoryIcon, label: lang === "id" ? "Riwayat" : "History" },
    { id: "profile", icon: UserIcon, label: lang === "id" ? "Profil" : "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: Settings, label: "Admin" }] : []),
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900 border-t border-gold-500/30 shadow-lg">
      {/* Scrollable tab bar */}
      <div className="flex overflow-x-auto scroll-thin no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-16 px-2 flex-shrink-0 transition-colors",
                isActive ? "text-gold-400" : "text-navy-100"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive && "text-gold-400")} />
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 bg-gold-500 rounded-b-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
