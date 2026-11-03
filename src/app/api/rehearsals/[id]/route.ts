// PATCH /api/rehearsals/[id] — admin updates rehearsal (toggle attendanceOpen, edit fields)
// DELETE /api/rehearsals/[id] — admin deletes rehearsal (cascades attendance)
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const body = (await req.json()) as {
      title?: string
      date?: string
      location?: string
      notes?: string
      attendanceOpen?: boolean
    }

    const existing = await db.rehearsal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Rehearsal not found" }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.location !== undefined) data.location = body.location
    if (body.notes !== undefined) data.notes = body.notes
    if (body.attendanceOpen !== undefined) data.attendanceOpen = body.attendanceOpen
    if (body.date !== undefined) {
      const d = new Date(body.date)
      if (!isNaN(d.getTime())) data.date = d
    }

    const updated = await db.rehearsal.update({ where: { id }, data })
    return NextResponse.json({
      ok: true,
      rehearsal: {
        ...updated,
        date: updated.date.toISOString(),
        createdAt: updated.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error("[rehearsals PATCH] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const existing = await db.rehearsal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Rehearsal not found" }, { status: 404 })

    await db.rehearsal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[rehearsals DELETE] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
