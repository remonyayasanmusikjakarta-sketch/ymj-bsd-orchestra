// PATCH /api/admin/users/[id]
// Body: { role: "ADMIN" | "MEMBER" }
// Admin only. Updates a user's role (promote/demote).
// Cannot demote yourself (to prevent locking yourself out).
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
    const body = (await req.json()) as { role?: "ADMIN" | "MEMBER" }
    const newRole = body.role
    if (newRole !== "ADMIN" && newRole !== "MEMBER") {
      return NextResponse.json({ error: "Invalid role. Must be ADMIN or MEMBER" }, { status: 400 })
    }

    // Prevent self-demotion
    if (id === session.userId && newRole !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot demote yourself. Ask another admin to demote you." },
        { status: 400 }
      )
    }

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const updated = await db.user.update({
      where: { id },
      data: { role: newRole },
    })

    // Count admins — ensure at least 1 remains
    if (newRole === "MEMBER") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } })
      if (adminCount === 0) {
        // revert
        await db.user.update({ where: { id }, data: { role: "ADMIN" } })
        return NextResponse.json(
          { error: "Cannot demote — at least one admin must remain." },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    })
  } catch (err) {
    console.error("[admin/users PATCH] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
