// GET /api/dues/me — member's own payment history
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const items = await db.duesPayment.findMany({
      where: { userId: session.userId },
      include: {
        dues: { select: { id: true, title: true, description: true, minAmount: true, active: true } },
      },
      orderBy: { paidAt: "desc" },
    })

    const serialized = items.map((p) => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
      verifiedAt: p.verifiedAt?.toISOString() || null,
    }))

    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[dues/me] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
