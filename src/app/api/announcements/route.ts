// GET /api/announcements — list announcements sorted by eventDate asc.
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const items = await db.announcement.findMany({
      orderBy: [{ eventDate: "asc" }],
    })
    const serialized = items.map((a) => ({
      ...a,
      eventDate: a.eventDate.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }))
    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[announcements] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
