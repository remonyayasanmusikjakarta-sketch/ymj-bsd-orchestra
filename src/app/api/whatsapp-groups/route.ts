// GET /api/whatsapp-groups?section=...
// Returns WhatsApp groups relevant to the member's section/category.
// Always includes the GENERAL group.
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const url = new URL(req.url)
    const section = url.searchParams.get("section")
    const category = url.searchParams.get("category")

    // Build OR: GENERAL + member's section + member's category
    const orClauses: { section: string }[] = [{ section: "GENERAL" }]
    if (section) orClauses.push({ section })
    if (category) orClauses.push({ section: category })

    const items = await db.whatsAppGroup.findMany({
      where: { OR: orClauses },
      orderBy: [{ section: "asc" }, { name: "asc" }],
    })
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[whatsapp-groups] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
