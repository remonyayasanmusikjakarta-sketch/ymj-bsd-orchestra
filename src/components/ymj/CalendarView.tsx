"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string // "PRACTICE" | "CONCERT" | "GENERAL" | "AUDITION" | "REHEARSAL"
  location?: string
  description?: string
}

const EVENT_COLORS: Record<string, { dot: string; badge: string; label: string }> = {
  PRACTICE: { dot: "bg-blue-500", badge: "border-blue-400/40 text-blue-700 bg-blue-50", label: "Practice" },
  REHEARSAL: { dot: "bg-purple-500", badge: "border-purple-400/40 text-purple-700 bg-purple-50", label: "Rehearsal" },
  CONCERT: { dot: "bg-gold-500", badge: "border-gold-500/40 text-gold-700 bg-gold-50", label: "Concert" },
  AUDITION: { dot: "bg-pink-500", badge: "border-pink-400/40 text-pink-700 bg-pink-50", label: "Audition" },
  GENERAL: { dot: "bg-navy-500", badge: "border-navy-400/40 text-navy-700 bg-navy-50", label: "General" },
}

const MONTH_NAMES = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  id: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  zh: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
}

const DAY_NAMES = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  id: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  zh: ["日", "一", "二", "三", "四", "五", "六"],
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const { lang } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthNames = lang === "zh" ? MONTH_NAMES.zh : lang === "id" ? MONTH_NAMES.id : MONTH_NAMES.en
  const dayNames = lang === "zh" ? DAY_NAMES.zh : lang === "id" ? DAY_NAMES.id : DAY_NAMES.en

  // Group events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      const d = new Date(ev.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!map[key]) map[key] = []
      map[key].push(ev)
    }
    return map
  }, [events])

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: (Date | null)[] = []
    // Fill empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }, [currentMonth])

  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  const isToday = (d: Date) => {
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }

  const isSelected = (d: Date) => {
    if (!selectedDate) return false
    return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const selectedDateEvents = selectedDate ? eventsByDate[dateKey(selectedDate)] || [] : []
  const locale = lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US"

  return (
    <Card className="border-gold-500/20 bg-white p-4 md:p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-navy-900" />
          <h3 className="text-xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={goToToday} className="text-xs">
            {lang === "zh" ? "今天" : lang === "id" ? "Hari Ini" : "Today"}
          </Button>
          <Button size="sm" variant="outline" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(EVENT_COLORS).map(([type, meta]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
            {meta.label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {/* Day cells */}
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }
          const key = dateKey(day)
          const dayEvents = eventsByDate[key] || []
          const hasEvents = dayEvents.length > 0
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "aspect-square rounded-md text-sm transition-all relative flex flex-col items-center justify-center",
                isSelected(day)
                  ? "bg-navy-900 text-white font-bold shadow-md"
                  : hasEvents
                    ? "bg-gold-50 text-navy-900 hover:bg-gold-100 border border-gold-500/30"
                    : "text-navy-700 hover:bg-navy-50",
                isToday(day) && !isSelected(day) && "ring-2 ring-gold-500/50"
              )}
            >
              <span className={cn("text-sm", isSelected(day) ? "font-bold" : "")}>
                {day.getDate()}
              </span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const color = EVENT_COLORS[ev.type] || EVENT_COLORS.GENERAL
                    return <span key={ev.id} className={cn("h-1 w-1 rounded-full", isSelected(day) ? "bg-gold-400" : color.dot)} />
                  })}
                  {dayEvents.length > 3 && (
                    <span className={cn("text-[8px]", isSelected(day) ? "text-gold-400" : "text-muted-foreground")}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-semibold text-navy-900 mb-2">
            {selectedDate.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          {selectedDateEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              {lang === "zh" ? "这一天没有活动。" : lang === "id" ? "Tidak ada acara di tanggal ini." : "No events on this date."}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((ev) => {
                const color = EVENT_COLORS[ev.type] || EVENT_COLORS.GENERAL
                return (
                  <div key={ev.id} className="flex items-start gap-2 p-2 rounded-md bg-navy-50/50">
                    <span className={cn("h-2 w-2 rounded-full mt-1.5 flex-shrink-0", color.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{ev.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(ev.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {ev.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                      {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
                      <Badge variant="outline" className={cn("text-[9px] uppercase mt-1", color.badge)}>
                        {color.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
