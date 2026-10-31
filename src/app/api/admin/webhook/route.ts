// GET /api/admin/webhook — return the current Google Sheet webhook URL.
// POST /api/admin/webhook — set the Google Sheet webhook URL. Admin only.
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { getWebhookUrl, setWebhookUrl } from "@/lib/webhook"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const url = await getWebhookUrl()
    return NextResponse.json({ webhookUrl: url || "" })
  } catch (err) {
    console.error("[admin/webhook GET] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const body = (await req.json()) as { webhookUrl?: string }
    const url = (body.webhookUrl || "").trim()
    await setWebhookUrl(url)
    return NextResponse.json({ ok: true, webhookUrl: url })
  } catch (err) {
    console.error("[admin/webhook POST] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
