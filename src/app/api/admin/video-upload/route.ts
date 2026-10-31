// POST /api/admin/video-upload
// Two modes:
//   1. multipart/form-data with field "file" (video file) + metadata fields
//   2. JSON with videoUrl (YouTube/Vimeo link) + metadata
// Admin only.
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

const MAX_SIZE = 100 * 1024 * 1024 // 100 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos")
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

function classifyVideoUrl(url: string): "YOUTUBE" | "VIMEO" | "FILE" | null {
  const u = url.toLowerCase()
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE"
  if (u.includes("vimeo.com")) return "VIMEO"
  if (u.startsWith("/uploads/") || u.startsWith("http")) return "FILE"
  return null
}

// Extract YouTube video ID for thumbnail
function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const contentType = req.headers.get("content-type") || ""
    let title: string, description: string | null, eventDate: Date
    let videoType: "FILE" | "YOUTUBE" | "VIMEO"
    let videoUrl: string
    let thumbnailUrl: string | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      title = String(formData.get("title") || "").trim()
      description = String(formData.get("description") || "").trim() || null
      const eventDateStr = String(formData.get("eventDate") || "").trim()
      eventDate = eventDateStr ? new Date(eventDateStr) : new Date()
      const file = formData.get("file")

      if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })
      if (!file || !(file instanceof File)) return NextResponse.json({ error: "Video file is required" }, { status: 400 })
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
      }

      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4"
      const filename = `${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      const buf = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filepath, buf)

      videoType = "FILE"
      videoUrl = `/uploads/videos/${filename}`
      thumbnailUrl = null
    } else {
      // JSON body
      const body = await req.json()
      title = String(body.title || "").trim()
      description = String(body.description || "").trim() || null
      const eventDateStr = String(body.eventDate || "").trim()
      eventDate = eventDateStr ? new Date(eventDateStr) : new Date()
      const linkUrl = String(body.videoUrl || "").trim()

      if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })
      if (!linkUrl) return NextResponse.json({ error: "Video URL is required" }, { status: 400 })

      const kind = classifyVideoUrl(linkUrl)
      if (!kind) return NextResponse.json({ error: "Invalid video URL" }, { status: 400 })

      videoType = kind
      videoUrl = linkUrl
      if (kind === "YOUTUBE") {
        const ytId = youtubeId(linkUrl)
        if (ytId) thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      }
    }

    if (isNaN(eventDate.getTime())) eventDate = new Date()

    const video = await db.video.create({
      data: { title, description, videoType, videoUrl, thumbnailUrl, eventDate },
    })

    return NextResponse.json({ ok: true, video })
  } catch (err) {
    console.error("[admin/video-upload] error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
