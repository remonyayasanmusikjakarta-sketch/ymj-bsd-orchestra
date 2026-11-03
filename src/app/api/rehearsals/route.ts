// GET /api/rehearsals — list all rehearsals (member & admin)
// POST /api/rehearsals — admin creates new rehearsal
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const items = await db.rehearsal.findMany({
      orderBy: [{ date: "desc" }],
      include: { _count: { select: { attendances: true } } },
    })
    const serialized = items.map((r) => ({
      ...r,
      date: r.date.toISOString(),
      createdAt: r.createdAt.toISOString(),
      attendanceCount: r._count.attendances,
    }))
    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[rehearsals GET] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const body = (await req.json()) as {
      title?: string
      date?: string
      location?: string
      notes?: string
    }
    if (!body.title || !body.date || !body.location) {
      return NextResponse.json({ error: "Title, date, and location are required" }, { status: 400 })
    }
    const rehearsalDate = new Date(body.date)
    if (isNaN(rehearsalDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const rehearsal = await db.rehearsal.create({
      data: {
        title: body.title,
        date: rehearsalDate,
        location: body.location,
        notes: body.notes || null,
        attendanceOpen: false, // default closed — admin must explicitly open
        createdById: session.userId,
      },
    })
    return NextResponse.json({
      ok: true,
      rehearsal: {
        ...rehearsal,
        date: rehearsal.date.toISOString(),
        createdAt: rehearsal.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error("[rehearsals POST] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
