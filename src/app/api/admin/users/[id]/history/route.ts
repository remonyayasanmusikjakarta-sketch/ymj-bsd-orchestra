// GET /api/admin/users/[id]/history — admin views any user's history
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const items = await db.membershipHistory.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    })

    const serialized = items.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    }))

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
      items: serialized,
    })
  } catch (err) {
    console.error("[admin/users/[id]/history] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
