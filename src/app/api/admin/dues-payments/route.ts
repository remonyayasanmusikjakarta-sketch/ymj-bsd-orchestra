// GET /api/admin/dues-payments — admin views all payments
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const url = new URL(req.url)
    const statusFilter = url.searchParams.get("status")
    const duesFilter = url.searchParams.get("duesId")

    const where: Record<string, unknown> = {}
    if (statusFilter) where.status = statusFilter
    if (duesFilter) where.duesId = duesFilter

    const items = await db.duesPayment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, instrument: true, instrumentSection: true } },
        dues: { select: { id: true, title: true, minAmount: true } },
      },
      orderBy: [{ status: "asc" }, { paidAt: "desc" }],
    })

    const serialized = items.map((p) => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
      verifiedAt: p.verifiedAt?.toISOString() || null,
    }))

    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[admin/dues-payments] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
