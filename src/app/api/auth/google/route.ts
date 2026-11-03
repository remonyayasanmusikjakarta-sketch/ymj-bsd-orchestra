// POST /api/auth/google
// Simulated Google sign-up. Accepts a profile payload
// { email, name, whatsapp, ageCategory, age, instrument, experienceYears, address, photoUrl }
// and creates/retrieves a user with provider=GOOGLE.
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { setSessionCookie } from "@/lib/auth"
import { sendRegistrationToWebhook } from "@/lib/webhook"
import { generateNameTag } from "@/lib/name-tag"

interface GoogleBody {
  email?: string
  name?: string
  whatsapp?: string
  ageCategory?: "JUNIOR" | "COMMUNITY"
  age?: number
  instrument?: string
  experienceYears?: number
  address?: string
  photoUrl?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GoogleBody
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "A valid Google email is required" }, { status: 400 })
    }
    if (!body.name) {
      return NextResponse.json({ error: "Google profile name is required" }, { status: 400 })
    }

    const email = body.email.toLowerCase()
    const existing = await db.user.findUnique({ where: { email } })

    if (existing) {
      // Log in existing Google user
      await setSessionCookie({ userId: existing.id, email: existing.email, role: existing.role })
      return NextResponse.json({
        ok: true,
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: existing.role,
          status: existing.status,
          instrument: existing.instrument,
          instrumentSection: existing.instrumentSection,
          ageCategory: existing.ageCategory,
          photoUrl: existing.photoUrl,
          nameTagUrl: existing.nameTagUrl,
        },
      })
    }

    // New Google user — require the rest of the registration fields (photo is OPTIONAL)
    const missing: string[] = []
    if (!body.whatsapp) missing.push("whatsapp")
    if (!body.ageCategory) missing.push("ageCategory")
    if (body.age === undefined) missing.push("age")
    if (!body.instrument) missing.push("instrument")
    if (body.experienceYears === undefined) missing.push("experienceYears")
    if (!body.address) missing.push("address")
    // photoUrl is optional — fallback to initials avatar if not provided
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing fields: ${missing.join(", ")}`, needProfile: true },
        { status: 400 }
      )
    }

    const instrument = body.instrument!
    const sectionMap: Record<string, string> = {
      Violin: "STRINGS", Viola: "STRINGS", Cello: "STRINGS", "Double Bass": "STRINGS",
      Flute: "WOODWINDS", Oboe: "WOODWINDS", Clarinet: "WOODWINDS", Bassoon: "WOODWINDS",
      Trumpet: "BRASS", "French Horn": "BRASS", Trombone: "BRASS", Tuba: "BRASS",
      Timpani: "PERCUSSION", Percussion: "PERCUSSION",
    }
    const instrumentSection = sectionMap[instrument] ?? "STRINGS"

    const user = await db.user.create({
      data: {
        email,
        password: null,
        name: body.name!,
        whatsapp: body.whatsapp!,
        ageCategory: body.ageCategory!,
        age: body.age!,
        instrument,
        instrumentSection,
        experienceYears: Number(body.experienceYears),
        address: body.address!,
        photoUrl: body.photoUrl || null,  // optional — fallback to initials avatar
        provider: "GOOGLE",
        emailVerified: true,
        status: "VERIFIED",
      },
    })

    // Generate name tag
    let nameTagUrl: string | null = null
    try {
      nameTagUrl = await generateNameTag({
        memberId: user.id,
        name: user.name,
        instrument: user.instrument,
        section: user.instrumentSection,
        ageCategory: user.ageCategory,
        photoUrl: user.photoUrl || "",
      })
      if (nameTagUrl) {
        await db.user.update({ where: { id: user.id }, data: { nameTagUrl } })
      }
    } catch (e) {
      console.error("[google] name tag generation failed:", e)
    }

    const webhookResult = await sendRegistrationToWebhook({
      timestamp: new Date().toISOString(),
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      ageCategory: user.ageCategory,
      age: user.age,
      instrument: user.instrument,
      instrumentSection: user.instrumentSection,
      experienceYears: user.experienceYears,
      address: user.address,
      provider: user.provider,
      status: user.status,
    })

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
        photoUrl: user.photoUrl,
        nameTagUrl,
      },
      webhook: webhookResult,
    })
  } catch (err) {
    console.error("[google] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
