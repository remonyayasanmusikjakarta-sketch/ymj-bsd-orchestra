// Server-side name tag generation using Sharp.
// Composites a member photo onto a navy+gold template with their name & instrument.
import sharp from "sharp"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "nametags")

// Navy + gold brand colors
const NAVY = "#0A1F44"
const NAVY_DARK = "#06152C"
const GOLD = "#C9A227"
const GOLD_LIGHT = "#ECC65A"
const WHITE = "#FFFFFF"

/**
 * Generate a name tag image (800x1000 px PNG) for a member.
 * Saves it to public/uploads/nametags/<id>.png and returns the public URL path.
 */
export async function generateNameTag(opts: {
  memberId: string
  name: string
  instrument: string
  section: string
  ageCategory: string
  photoUrl: string // absolute filesystem path or URL of the photo
}): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${opts.memberId}-${crypto.randomBytes(4).toString("hex")}.png`
  const filepath = path.join(UPLOAD_DIR, filename)

  // Read & preprocess the member photo: crop to a circle, 320x320
  // We'll composite it on top of a navy background with a gold ring.
  let photoBuffer: Buffer | null = null
  try {
    if (opts.photoUrl.startsWith("http")) {
      const res = await fetch(opts.photoUrl)
      if (res.ok) photoBuffer = Buffer.from(await res.arrayBuffer())
    } else {
      const localPath = opts.photoUrl.startsWith("/")
        ? path.join(process.cwd(), "public", opts.photoUrl)
        : opts.photoUrl
      try {
        photoBuffer = await fs.readFile(localPath)
      } catch {
        photoBuffer = null
      }
    }
  } catch {
    photoBuffer = null
  }

  // Build the SVG overlay (text + decorative elements) on top of navy bg.
  // Photo will be composited as a circle in the upper portion.
  const W = 800
  const H = 1000

  // Photo circle geometry
  const photoSize = 360
  const photoX = (W - photoSize) / 2
  const photoY = 140

  // Build SVG with gold ring + text. Photo is composited separately.
  const svgOverlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY_DARK}"/>
      <stop offset="0.5" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DARK}"/>
    </linearGradient>
    <linearGradient id="goldgrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}"/>
      <stop offset="1" stop-color="${GOLD}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.3" r="0.6">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Decorative border -->
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="${GOLD}" stroke-width="3" rx="8"/>
  <rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.5" rx="4"/>

  <!-- Top decoration: music note + orchestra name -->
  <text x="${W / 2}" y="80" font-family="serif" font-size="32" fill="${GOLD}" text-anchor="middle" font-weight="bold">🎵 YMJ BSD</text>
  <text x="${W / 2}" y="115" font-family="sans-serif" font-size="14" fill="${GOLD_LIGHT}" text-anchor="middle" letter-spacing="3">COMMUNITY ORCHESTRA</text>

  <!-- Photo circle ring (gold) -->
  <circle cx="${W / 2}" cy="${photoY + photoSize / 2}" r="${photoSize / 2 + 8}" fill="none" stroke="url(#goldgrad)" stroke-width="6"/>

  <!-- Photo placeholder if no photo -->
  ${!photoBuffer ? `<circle cx="${W / 2}" cy="${photoY + photoSize / 2}" r="${photoSize / 2}" fill="${NAVY_DARK}"/><text x="${W / 2}" y="${photoY + photoSize / 2 + 20}" font-family="serif" font-size="120" fill="${GOLD}" text-anchor="middle">${(opts.name || "?").charAt(0).toUpperCase()}</text>` : ""}

  <!-- Name -->
  <text x="${W / 2}" y="610" font-family="serif" font-size="56" fill="${WHITE}" text-anchor="middle" font-weight="bold">${escapeXml(opts.name)}</text>

  <!-- Instrument -->
  <text x="${W / 2}" y="670" font-family="sans-serif" font-size="32" fill="${GOLD_LIGHT}" text-anchor="middle" font-weight="600">${escapeXml(opts.instrument)}</text>

  <!-- Section badge -->
  <rect x="${W / 2 - 110}" y="700" width="220" height="36" fill="${GOLD}" rx="18"/>
  <text x="${W / 2}" y="724" font-family="sans-serif" font-size="14" fill="${NAVY}" text-anchor="middle" font-weight="bold" letter-spacing="2">${escapeXml(opts.section)} · ${escapeXml(opts.ageCategory === "JUNIOR" ? "JUNIOR" : "COMMUNITY")}</text>

  <!-- Decorative divider -->
  <line x1="200" y1="780" x2="${W - 200}" y2="780" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.5"/>

  <!-- Footer -->
  <text x="${W / 2}" y="830" font-family="serif" font-size="20" fill="${GOLD_LIGHT}" text-anchor="middle" font-style="italic">Founding Member</text>
  <text x="${W / 2}" y="870" font-family="sans-serif" font-size="12" fill="${WHITE}" text-anchor="middle" opacity="0.7">Yayasan Musik Jakarta · BSD Campus</text>
  <text x="${W / 2}" y="895" font-family="sans-serif" font-size="11" fill="${WHITE}" text-anchor="middle" opacity="0.5">Saturday 14.00 – 17.00 WIB · Concert Feb 2027</text>
</svg>
`

  // Build the image pipeline
  let pipeline = sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: NAVY,
    },
  })

  // Compose layers
  const layers: sharp.OverlayOptions[] = [
    { input: Buffer.from(svgOverlay), top: 0, left: 0 },
  ]

  if (photoBuffer) {
    try {
      // Resize + circle mask the photo
      const circlePhoto = await sharp(photoBuffer)
        .resize(photoSize, photoSize, { fit: "cover", position: "center" })
        .composite([{
          input: Buffer.from(`<svg width="${photoSize}" height="${photoSize}"><circle cx="${photoSize / 2}" cy="${photoSize / 2}" r="${photoSize / 2}" fill="white"/></svg>`),
          blend: "dest-in",
        }])
        .png()
        .toBuffer()
      layers.unshift({ input: circlePhoto, top: photoY, left: photoX })
    } catch {
      // ignore photo errors, fall back to placeholder
    }
  }

  await pipeline.composite(layers).png().toFile(filepath)

  return `/uploads/nametags/${filename}`
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
