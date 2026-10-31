// GET /api/admin/registrations — list all registrations (admin only).
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        ageCategory: true,
        age: true,
        instrument: true,
        instrumentSection: true,
        experienceYears: true,
        address: true,
        role: true,
        status: true,
        provider: true,
        emailVerified: true,
        photoUrl: true,
        createdAt: true,
      },
    })
    const serialized = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
    return NextResponse.json({ users: serialized })
  } catch (err) {
    console.error("[admin/registrations] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
