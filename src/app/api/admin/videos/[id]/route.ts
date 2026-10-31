// DELETE /api/admin/videos/[id] — admin deletes a video.
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const video = await db.video.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 })

    if (video.videoType === "FILE" && video.videoUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", video.videoUrl)
        await fs.unlink(filePath)
      } catch {
        // ignore file delete errors
      }
    }

    await db.video.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[admin/videos DELETE] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
