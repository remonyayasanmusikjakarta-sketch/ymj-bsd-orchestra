// POST /api/auth/register
// Body: { name, email, password, whatsapp, ageCategory, age, instrument, experienceYears, address, photoUrl }
// On success: creates user, generates name tag, sends data to Google Sheet webhook, sets session cookie.
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, setSessionCookie } from "@/lib/auth"
import { getSectionForInstrument } from "@/lib/instruments"
import { sendRegistrationToWebhook } from "@/lib/webhook"
import { generateNameTag } from "@/lib/name-tag"

interface RegisterBody {
  name?: string
  email?: string
  password?: string
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
    const body = (await req.json()) as RegisterBody
    const {
      name,
      email,
      password,
      whatsapp,
      ageCategory,
      age,
      instrument,
      experienceYears,
      address,
      photoUrl,
    } = body

    // Basic validation
    const missing: string[] = []
    if (!name) missing.push("name")
    if (!email) missing.push("email")
    if (!password) missing.push("password")
    if (!whatsapp) missing.push("whatsapp")
    if (!ageCategory) missing.push("ageCategory")
    if (age === undefined || age === null) missing.push("age")
    if (!instrument) missing.push("instrument")
    if (experienceYears === undefined || experienceYears === null) missing.push("experienceYears")
    if (!address) missing.push("address")
    if (!photoUrl) missing.push("photoUrl")
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email!)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }
    if (password!.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }
    if (ageCategory === "JUNIOR" && (age! < 8 || age! > 16)) {
      return NextResponse.json({ error: "Junior Orchestra is for ages 8–16" }, { status: 400 })
    }
    if (ageCategory === "COMMUNITY" && age! < 13) {
      return NextResponse.json({ error: "Community Orchestra is for teens & adults (13+)" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email: email!.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered. Please log in." }, { status: 409 })
    }

    const instrumentSection = getSectionForInstrument(instrument!)
    const hashed = await hashPassword(password!)

    // Create user first (without nameTagUrl, we'll generate it after)
    const user = await db.user.create({
      data: {
        email: email!.toLowerCase(),
        password: hashed,
        name: name!,
        whatsapp: whatsapp!,
        ageCategory: ageCategory!,
        age: age!,
        instrument: instrument!,
        instrumentSection,
        experienceYears: Number(experienceYears),
        address: address!,
        photoUrl: photoUrl!,
        provider: "EMAIL",
        emailVerified: true,
        status: "VERIFIED",
      },
    })

    // Generate name tag (best-effort — don't fail registration if it errors)
    let nameTagUrl: string | null = null
    try {
      nameTagUrl = await generateNameTag({
        memberId: user.id,
        name: user.name,
        instrument: user.instrument,
        section: user.instrumentSection,
        ageCategory: user.ageCategory,
        photoUrl: user.photoUrl,
      })
      if (nameTagUrl) {
        await db.user.update({ where: { id: user.id }, data: { nameTagUrl } })
      }
    } catch (e) {
      console.error("[register] name tag generation failed:", e)
    }

    // Fire webhook to Google Sheet
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
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
