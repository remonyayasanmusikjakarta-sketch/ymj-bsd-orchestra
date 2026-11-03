// GET /api/dues — list all active dues (member & admin)
// POST /api/dues — admin creates new dues campaign
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const items = await db.dues.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { _count: { select: { payments: true } } },
    })
    const serialized = items.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      paymentCount: d._count.payments,
    }))
    return NextResponse.json({ items: serialized })
  } catch (err) {
    console.error("[dues GET] error:", err)
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
      description?: string
      minAmount?: number
    }
    if (!body.title || !body.description || body.minAmount === undefined) {
      return NextResponse.json({ error: "Title, description, and minAmount are required" }, { status: 400 })
    }
    if (body.minAmount < 0) {
      return NextResponse.json({ error: "minAmount must be >= 0" }, { status: 400 })
    }

    const dues = await db.dues.create({
      data: {
        title: body.title,
        description: body.description,
        minAmount: Number(body.minAmount),
        active: true,
        createdById: session.userId,
      },
    })
    return NextResponse.json({
      ok: true,
      dues: {
        ...dues,
        createdAt: dues.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error("[dues POST] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
