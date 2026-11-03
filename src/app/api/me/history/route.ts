// GET /api/me/history — member's own membership history
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const items = await db.membershipHistory.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    })

    const serialized = items.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    }))

    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[me/history] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
