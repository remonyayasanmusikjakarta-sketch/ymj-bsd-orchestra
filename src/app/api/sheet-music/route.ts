// GET /api/sheet-music?section=...&category=...&instrument=...
// Returns sheet music filtered by the member's section/category/instrument,
// including ALL-inclusive items.
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
    const instrument = url.searchParams.get("instrument")
    const q = url.searchParams.get("q")?.trim()

    // Build OR clauses: items matching the member's section OR explicitly ALL
    const sectionClause = section
      ? [{ section }, { section: "ALL" }]
      : undefined

    const categoryClause = category
      ? [{ category }, { category: "ALL" }]
      : undefined

    const instrumentClause = instrument
      ? [{ instrument }, { instrument: "ALL" }]
      : undefined

    const where: Record<string, unknown> = { AND: [] as unknown[] }
    if (sectionClause) (where.AND as unknown[]).push({ OR: sectionClause })
    if (categoryClause) (where.AND as unknown[]).push({ OR: categoryClause })
    if (instrumentClause) (where.AND as unknown[]).push({ OR: instrumentClause })
    if (q) {
      (where.AND as unknown[]).push({
        OR: [
          { title: { contains: q } },
          { composer: { contains: q } },
        ],
      })
    }
    if ((where.AND as unknown[]).length === 0) delete where.AND

    const items = await db.sheetMusic.findMany({
      where: where as never,
      orderBy: [{ section: "asc" }, { title: "asc" }],
    })
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[sheet-music] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
