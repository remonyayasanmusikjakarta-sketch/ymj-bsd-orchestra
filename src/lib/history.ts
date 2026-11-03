// Helper to log membership history events.
import { db } from "./db"

export type HistoryEventType =
  | "JOINED"
  | "STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "ATTENDANCE"
  | "PAYMENT"

interface LogHistoryParams {
  userId: string
  eventType: HistoryEventType
  title: string
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Log a membership history event. Best-effort — does not throw on error.
 */
export async function logHistory({
  userId,
  eventType,
  title,
  description,
  metadata,
}: LogHistoryParams): Promise<void> {
  try {
    await db.membershipHistory.create({
      data: {
        userId,
        eventType,
        title,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (err) {
    console.error("[logHistory] failed:", err)
  }
}
