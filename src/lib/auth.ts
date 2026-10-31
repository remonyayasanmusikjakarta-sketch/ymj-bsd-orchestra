// Lightweight cookie-session auth for YMJ BSD Community Orchestra.
// Sessions are HMAC-signed JSON in an httpOnly cookie. No external deps.
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "ymj_session"
const SESSION_SECRET = process.env.SESSION_SECRET || "ymj-bsd-orchestra-dev-secret-change-in-prod"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// ---------- Crypto helpers ----------
async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Buffer.from(new Uint8Array(sig)).toString("base64url")
}

export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder().encode(plain)
  const digest = await crypto.subtle.digest("SHA-256", enc)
  return Buffer.from(new Uint8Array(digest)).toString("base64")
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  const candidate = await hashPassword(plain)
  return candidate === hashed
}

// ---------- Session payload ----------
export interface SessionPayload {
  userId: string
  email: string
  role: string
  iat: number
}

export async function createSessionToken(payload: Omit<SessionPayload, "iat">): Promise<string> {
  const full: SessionPayload = { ...payload, iat: Date.now() }
  const json = JSON.stringify(full)
  const b64 = Buffer.from(json).toString("base64url")
  const sig = await hmac(b64)
  return `${b64}.${sig}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null
  const [b64, sig] = token.split(".")
  const expectedSig = await hmac(b64)
  if (sig !== expectedSig) return null
  try {
    const json = Buffer.from(b64, "base64url").toString("utf-8")
    const payload = JSON.parse(json) as SessionPayload
    return payload
  } catch {
    return null
  }
}

// ---------- Cookie helpers (server) ----------
export async function setSessionCookie(payload: Omit<SessionPayload, "iat">) {
  const token = await createSessionToken(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// ---------- Edge/runtime helper for route handlers ----------
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
