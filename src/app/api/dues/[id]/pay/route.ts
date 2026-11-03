// POST /api/dues/[id]/pay — member uploads payment proof
// Body (multipart/form-data): { amountPaid, proofFile (image), proofUrl? (alternative) }
// OR JSON: { amountPaid, proofUrl } (when member pastes URL from external hosting)
// Once uploaded, member CANNOT edit/delete (immutable from member side)
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logHistory } from "@/lib/history"
import { uploadFile } from "@/lib/blob"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { id: duesId } = await params
    const dues = await db.dues.findUnique({ where: { id: duesId } })
    if (!dues) return NextResponse.json({ error: "Dues campaign not found" }, { status: 404 })
    if (!dues.active) {
      return NextResponse.json({ error: "This dues campaign is closed." }, { status: 400 })
    }

    let amountPaid: number
    let proofUrl: string
    let proofType: "UPLOAD" | "URL"

    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const amountStr = String(formData.get("amountPaid") || "")
      amountPaid = Number(amountStr)
      if (isNaN(amountPaid) || amountPaid <= 0) {
        return NextResponse.json({ error: "Valid amountPaid is required" }, { status: 400 })
      }
      const file = formData.get("proofFile")
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "proofFile is required (image)" }, { status: 400 })
      }
      // Validate file type & size
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WebP" }, { status: 400 })
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
      }
      const result = await uploadFile(file, "payments")
      proofUrl = result.url
      proofType = "UPLOAD"
    } else {
      // JSON body — member pastes URL
      const body = (await req.json()) as { amountPaid?: number; proofUrl?: string }
      amountPaid = Number(body.amountPaid)
      if (isNaN(amountPaid) || amountPaid <= 0) {
        return NextResponse.json({ error: "Valid amountPaid is required" }, { status: 400 })
      }
      if (!body.proofUrl || !/^https?:\/\//.test(body.proofUrl)) {
        return NextResponse.json({ error: "Valid proofUrl is required" }, { status: 400 })
      }
      proofUrl = body.proofUrl
      proofType = "URL"
    }

    // Warn if below minimum (still allow — admin can reject later)
    const belowMin = amountPaid < dues.minAmount

    const payment = await db.duesPayment.create({
      data: {
        duesId,
        userId: session.userId,
        amountPaid,
        proofUrl,
        proofType,
        status: "PENDING",
      },
    })

    // Log payment history
    await logHistory({
      userId: session.userId,
      eventType: "PAYMENT",
      title: `Payment submitted: Rp ${amountPaid.toLocaleString("id-ID")}`,
      description: `Payment of Rp ${amountPaid.toLocaleString("id-ID")} for "${dues.title}" submitted. Status: PENDING VERIFICATION.${belowMin ? " (Below minimum amount)" : ""}`,
      metadata: { duesId, amountPaid, proofType },
    })

    return NextResponse.json({
      ok: true,
      payment: {
        ...payment,
        paidAt: payment.paidAt.toISOString(),
        verifiedAt: payment.verifiedAt?.toISOString() || null,
      },
      belowMin,
    })
  } catch (err) {
    console.error("[dues/[id]/pay POST] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
