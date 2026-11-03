// GET /api/attendance/me — member's own attendance history
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const items = await db.attendance.findMany({
      where: { userId: session.userId },
      include: {
        rehearsal: { select: { id: true, title: true, date: true, location: true } },
      },
      orderBy: { markedAt: "desc" },
    })

    const serialized = items.map((a) => ({
      id: a.id,
      status: a.status,
      reason: a.reason,
      markedAt: a.markedAt.toISOString(),
      rehearsal: {
        ...a.rehearsal,
        date: a.rehearsal.date.toISOString(),
      },
    }))

    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[attendance/me] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
