"use client"

import { useEffect, useState } from "react"
import {
  Play, Video, Calendar as CalendarIcon, X, Loader2, ExternalLink,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { t } from "@/lib/i18n"

interface VideoItem {
  id: string
  title: string
  description?: string | null
  videoType: string // "FILE" | "YOUTUBE" | "VIMEO"
  videoUrl: string
  thumbnailUrl?: string | null
  eventDate: string
}

function youtubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
}

function vimeoEmbedUrl(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  if (m) return `https://player.vimeo.com/video/${m[1]}`
  return null
}

export function Gallery() {
  const { lang } = useAppStore()
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/videos", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load videos")
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section id="gallery" className="section-fade bg-paper py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-gold-600">
            {t(lang, "gallery.eyebrow")}
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-navy-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {t(lang, "gallery.title")}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
            {t(lang, "gallery.subtitle")}
          </p>
          <div className="flex items-center justify-center pt-2">
            <span className="block h-0.5 w-16 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
          </div>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid place-items-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-sm">{t(lang, "common.loading")}</p>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              <span>{error}</span>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-dashed border-2 p-12 text-center text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>{t(lang, "gallery.empty")}</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((v) => (
                <VideoCard key={v.id} video={v} onClick={() => setActiveVideo(v)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video player modal */}
      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  )
}

function VideoCard({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  const { lang } = useAppStore()
  const d = new Date(video.eventDate)
  const dateStr = d.toLocaleDateString(lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US", {
    day: "numeric", month: "short", year: "numeric",
  })

  let thumb = video.thumbnailUrl
  if (!thumb && video.videoType === "FILE") {
    // For uploaded videos without thumbnail, use a gradient placeholder
    thumb = null
  }

  return (
    <Card
      className="overflow-hidden border-gold-500/20 bg-white hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-navy-900 to-navy-950 overflow-hidden">
        {thumb ? (
           
          <img
            src={thumb}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Video className="h-12 w-12 text-gold-500/50" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 grid place-items-center bg-navy-950/30 group-hover:bg-navy-950/50 transition-colors">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-500/90 group-hover:bg-gold-500 transition-colors shadow-xl">
            <Play className="h-6 w-6 text-navy-950 ml-0.5" fill="currentColor" />
          </span>
        </div>
        {/* Type badge */}
        <Badge
          variant="outline"
          className="absolute top-2 right-2 bg-navy-950/70 border-gold-500/40 text-gold-400 text-[10px] uppercase tracking-wider"
        >
          {video.videoType === "YOUTUBE" ? "YouTube" : video.videoType === "VIMEO" ? "Vimeo" : "Video"}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="font-semibold text-navy-900 leading-tight mb-1 line-clamp-2"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="h-3 w-3" />
          {dateStr}
        </div>
      </div>
    </Card>
  )
}

function VideoPlayerModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const { lang } = useAppStore()
  const d = new Date(video.eventDate)
  const dateStr = d.toLocaleDateString(lang === "zh" ? "zh-CN" : lang === "id" ? "id-ID" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  let embedSrc: string | null = null
  if (video.videoType === "YOUTUBE") embedSrc = youtubeEmbedUrl(video.videoUrl)
  if (video.videoType === "VIMEO") embedSrc = vimeoEmbedUrl(video.videoUrl)

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-navy-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy-900 border border-gold-500/30 rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-800">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-white truncate"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {video.title}
            </h3>
            <p className="text-xs text-gold-400">{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-navy-100 hover:bg-white/10"
            aria-label={t(lang, "common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player */}
        <div className="aspect-video bg-navy-950">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.videoType === "FILE" ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-navy-100">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300"
              >
                <ExternalLink className="h-4 w-4" />
                Open video in new tab
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="p-4">
            <p className="text-sm text-navy-100">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
