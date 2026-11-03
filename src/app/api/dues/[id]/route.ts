// PATCH /api/dues/[id] — admin updates dues (toggle active, edit fields)
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
      description?: string
      minAmount?: number
      active?: boolean
    }

    const existing = await db.dues.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Dues not found" }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.minAmount !== undefined) data.minAmount = Number(body.minAmount)
    if (body.active !== undefined) data.active = body.active

    const updated = await db.dues.update({ where: { id }, data })
    return NextResponse.json({
      ok: true,
      dues: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error("[dues PATCH] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
