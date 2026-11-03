// GET /api/admin/rehearsals/[id]/attendance — admin views all attendance for a rehearsal
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const rehearsal = await db.rehearsal.findUnique({ where: { id } })
    if (!rehearsal) return NextResponse.json({ error: "Rehearsal not found" }, { status: 404 })

    const attendances = await db.attendance.findMany({
      where: { rehearsalId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, instrument: true, instrumentSection: true, photoUrl: true },
        },
      },
      orderBy: { markedAt: "asc" },
    })

    const serialized = attendances.map((a) => ({
      ...a,
      markedAt: a.markedAt.toISOString(),
    }))

    // Get all members for comparison (who hasn't marked yet)
    const allMembers = await db.user.findMany({
      where: { role: "MEMBER", status: "VERIFIED" },
      select: { id: true, name: true, email: true, instrument: true, instrumentSection: true, photoUrl: true },
      orderBy: { name: "asc" },
    })

    const markedUserIds = new Set(attendances.map((a) => a.userId))
    const notMarked = allMembers.filter((m) => !markedUserIds.has(m.id))

    return NextResponse.json({
      rehearsal: {
        ...rehearsal,
        date: rehearsal.date.toISOString(),
        createdAt: rehearsal.createdAt.toISOString(),
      },
      attendances: serialized,
      notMarked,
    })
  } catch (err) {
    console.error("[admin/rehearsals/[id]/attendance] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
