// Google Spreadsheet webhook integration.
// On each new registration we POST the payload to the configured Google Apps Script URL.
// Admin can configure this URL via /api/admin/webhook.

import { db } from "./db"

export interface RegistrationWebhookPayload {
  timestamp: string
  name: string
  email: string
  whatsapp: string
  ageCategory: string
  age: number
  instrument: string
  instrumentSection: string
  experienceYears: number
  address: string
  provider: string
  status: string
}

export async function getWebhookUrl(): Promise<string | null> {
  const setting = await db.setting.findUnique({ where: { id: "singleton" } })
  return setting?.googleSheetWebhook || null
}

export async function setWebhookUrl(url: string): Promise<void> {
  await db.setting.upsert({
    where: { id: "singleton" },
    update: { googleSheetWebhook: url || null },
    create: { id: "singleton", googleSheetWebhook: url || null },
  })
}

/**
 * Sends the registration payload to the configured Google Sheet webhook.
 * Failures are logged but do not block registration — we record `webhookOk`
 * so the admin can see if a delivery failed.
 */
export async function sendRegistrationToWebhook(
  payload: RegistrationWebhookPayload
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = await getWebhookUrl()
  if (!url) {
    return { ok: false, error: "No webhook URL configured (admin can set one in Member Dashboard > Admin)" }
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Google Apps Script can be slow on cold start.
      signal: AbortSignal.timeout(15000),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}
