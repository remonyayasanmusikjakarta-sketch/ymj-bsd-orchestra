// POST /api/auth/verify-email — marks the current user's email as verified.
// In production this would be triggered by clicking a link in an email.
// For the demo it's called automatically after registration, but exposed
// so the UI can simulate "click the verification link".
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    await db.user.update({
      where: { id: session.userId },
      data: { emailVerified: true, status: "VERIFIED" },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[verify-email] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
