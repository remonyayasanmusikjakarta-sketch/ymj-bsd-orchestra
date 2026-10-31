// Public: GET /api/videos — list all portfolio videos (for landing page)
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const items = await db.video.findMany({ orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }] })
    const serialized = items.map((v) => ({
      ...v,
      eventDate: v.eventDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }))
    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[videos] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
