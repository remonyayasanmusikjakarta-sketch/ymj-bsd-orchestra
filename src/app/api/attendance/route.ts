// POST /api/attendance — member marks own attendance (immutable after create)
// Body: { rehearsalId, status, reason? }
// Member can only mark attendance if rehearsal.attendanceOpen === true
// Member can only mark ONCE per rehearsal (enforced by @@unique constraint)
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logHistory } from "@/lib/history"

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"]

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const body = (await req.json()) as {
      rehearsalId?: string
      status?: string
      reason?: string
    }
    if (!body.rehearsalId || !body.status) {
      return NextResponse.json({ error: "rehearsalId and status are required" }, { status: 400 })
    }
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    if (body.status === "EXCUSED" && !body.reason) {
      return NextResponse.json({ error: "Reason is required for EXCUSED status" }, { status: 400 })
    }

    const rehearsal = await db.rehearsal.findUnique({ where: { id: body.rehearsalId } })
    if (!rehearsal) return NextResponse.json({ error: "Rehearsal not found" }, { status: 404 })
    if (!rehearsal.attendanceOpen) {
      return NextResponse.json(
        { error: "Attendance is not open for this rehearsal. Please wait for the admin to open it." },
        { status: 403 }
      )
    }

    // Check if already marked (immutable)
    const existing = await db.attendance.findUnique({
      where: { rehearsalId_userId: { rehearsalId: body.rehearsalId, userId: session.userId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "You have already marked attendance for this rehearsal. Attendance cannot be changed." },
        { status: 409 }
      )
    }

    const attendance = await db.attendance.create({
      data: {
        rehearsalId: body.rehearsalId,
        userId: session.userId,
        status: body.status,
        reason: body.reason || null,
      },
    })

    // Log attendance history
    await logHistory({
      userId: session.userId,
      eventType: "ATTENDANCE",
      title: `Attendance marked: ${body.status}`,
      description: `Marked "${body.status}" for rehearsal "${rehearsal.title}" on ${rehearsal.date.toLocaleString()}.${body.reason ? ` Reason: ${body.reason}` : ""}`,
      metadata: { rehearsalId: body.rehearsalId, status: body.status },
    })

    return NextResponse.json({
      ok: true,
      attendance: {
        ...attendance,
        markedAt: attendance.markedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error("[attendance POST] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
