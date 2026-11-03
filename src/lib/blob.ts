// File upload helper — uses Vercel Blob if BLOB_READ_WRITE_TOKEN is set,
// otherwise falls back to local filesystem (for dev/testing).
import { put } from "@vercel/blob"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

interface UploadResult {
  url: string
  storageType: "blob" | "local"
}

/**
 * Upload a file to persistent storage (Vercel Blob) or fall back to local.
 * Returns the public URL to access the file.
 */
export async function uploadFile(
  file: File,
  folder: "payments" | "members" | "sheet-music" | "videos" | "nametags"
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (token) {
    // Use Vercel Blob (persistent in production)
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const filename = `${folder}/${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      token,
    })
    return { url: blob.url, storageType: "blob" }
  }

  // Fallback: local filesystem (ephemeral on Vercel serverless, persistent in dev)
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder)
  await fs.mkdir(uploadDir, { recursive: true })
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
  const filename = `${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`
  const filepath = path.join(uploadDir, filename)
  const buf = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buf)
  return { url: `/uploads/${folder}/${filename}`, storageType: "local" }
}

/**
 * Upload a Buffer (e.g. generated name tag) to persistent storage.
 */
export async function uploadBuffer(
  buffer: Buffer,
  folder: "payments" | "members" | "sheet-music" | "videos" | "nametags",
  ext: string = "png"
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (token) {
    const filename = `${folder}/${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`
    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix: false,
      token,
    })
    return { url: blob.url, storageType: "blob" }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder)
  await fs.mkdir(uploadDir, { recursive: true })
  const filename = `${crypto.randomBytes(8).toString("hex")}-${Date.now()}.${ext}`
  const filepath = path.join(uploadDir, filename)
  await fs.writeFile(filepath, buffer)
  return { url: `/uploads/${folder}/${filename}`, storageType: "local" }
}

export function hasBlobStorage(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}
