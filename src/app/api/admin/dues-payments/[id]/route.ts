// PATCH /api/admin/dues-payments/[id] — admin verifies or rejects payment
// Body: { status: "VERIFIED" | "REJECTED", adminNote? }
// Admin can also edit amountPaid, proofUrl (override member submission)
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logHistory } from "@/lib/history"

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
      status?: "VERIFIED" | "REJECTED"
      adminNote?: string
      amountPaid?: number
      proofUrl?: string
    }

    const existing = await db.duesPayment.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.status !== undefined) {
      if (body.status !== "VERIFIED" && body.status !== "REJECTED") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      data.status = body.status
      data.verifiedAt = new Date()
      data.verifiedById = session.userId
    }
    if (body.adminNote !== undefined) data.adminNote = body.adminNote
    if (body.amountPaid !== undefined) data.amountPaid = Number(body.amountPaid)
    if (body.proofUrl !== undefined) data.proofUrl = body.proofUrl

    const updated = await db.duesPayment.update({ where: { id }, data })

    // Log verification history to the member
    if (body.status) {
      await logHistory({
        userId: existing.userId,
        eventType: "PAYMENT",
        title: body.status === "VERIFIED" ? "Payment verified" : "Payment rejected",
        description: `Your payment for dues "${(await db.dues.findUnique({ where: { id: existing.duesId } }))?.title || ""}" was ${body.status.toLowerCase()} by admin.${body.adminNote ? ` Note: ${body.adminNote}` : ""}`,
        metadata: { paymentId: id, status: body.status, adminNote: body.adminNote },
      })
    }

    return NextResponse.json({
      ok: true,
      payment: {
        ...updated,
        paidAt: updated.paidAt.toISOString(),
        verifiedAt: updated.verifiedAt?.toISOString() || null,
      },
    })
  } catch (err) {
    console.error("[admin/dues-payments PATCH] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/dues-payments/[id] — admin deletes payment (member cannot)
import path from "path"
import fs from "fs/promises"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const existing = await db.duesPayment.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    // Delete local file if it's a local upload (not Vercel Blob URL)
    if (existing.proofType === "UPLOAD" && existing.proofUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", existing.proofUrl)
        await fs.unlink(filePath)
      } catch {
        // ignore file delete errors
      }
    }

    await db.duesPayment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[admin/dues-payments DELETE] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
