// POST /api/auth/login
// Body: { email, password }
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, setSessionCookie } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
    const ok = await verifyPassword(body.password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
    await setSessionCookie({ userId: user.id, email: user.email, role: user.role })
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        instrument: user.instrument,
        instrumentSection: user.instrumentSection,
        ageCategory: user.ageCategory,
        whatsapp: user.whatsapp,
        age: user.age,
        experienceYears: user.experienceYears,
        address: user.address,
        provider: user.provider,
        emailVerified: user.emailVerified,
      },
    })
  } catch (err) {
    console.error("[login] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
