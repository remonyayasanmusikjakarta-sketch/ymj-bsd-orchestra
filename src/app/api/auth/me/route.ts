// GET /api/auth/me — returns the currently logged-in user (or null).
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ user: null })
    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsapp: user.whatsapp,
        ageCategory: user.ageCategory,
        age: user.age,
        instrument: user.instrument,
        instrumentSection: user.instrumentSection,
        experienceYears: user.experienceYears,
        address: user.address,
        photoUrl: user.photoUrl,
        nameTagUrl: user.nameTagUrl,
        role: user.role,
        status: user.status,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    console.error("[me] error:", err)
    return NextResponse.json({ user: null })
  }
}
