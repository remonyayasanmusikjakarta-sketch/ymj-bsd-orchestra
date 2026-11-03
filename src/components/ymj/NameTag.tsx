"use client"

import { useRef, useState } from "react"
import { Download, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppStore, type UserProfile } from "@/lib/store"
import { t } from "@/lib/i18n"

interface NameTagProps {
  user: UserProfile
}

/**
 * Client-side name tag component.
 * Renders the name tag as HTML/CSS, and provides a "Download as PNG" button
 * that uses Canvas API to generate a downloadable image.
 *
 * This replaces the server-side Sharp-based generation, which doesn't work
 * well on Vercel serverless (ephemeral filesystem).
 */
export function NameTag({ user }: NameTagProps) {
  const { lang } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState(false)

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const sectionLabel = (() => {
    const map: Record<string, string> = {
      STRINGS: lang === "id" ? "Strings" : "Strings",
      WOODWINDS: "Woodwinds",
      BRASS: "Brass",
      PERCUSSION: "Percussion",
    }
    return map[user.instrumentSection] || user.instrumentSection
  })()

  const categoryLabel = user.ageCategory === "JUNIOR"
    ? (lang === "id" ? "Junior Orchestra" : "Junior Orchestra")
    : (lang === "id" ? "Community Orchestra" : "Community Orchestra")

  const downloadNameTag = async () => {
    setDownloading(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Canvas dimensions (matching the old server-side version)
      const W = 800
      const H = 1000
      canvas.width = W
      canvas.height = H

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H)
      bgGrad.addColorStop(0, "#06152C")
      bgGrad.addColorStop(0.5, "#0A1F44")
      bgGrad.addColorStop(1, "#122140")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // Gold glow (radial)
      const glowGrad = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, 400)
      glowGrad.addColorStop(0, "rgba(201, 162, 39, 0.18)")
      glowGrad.addColorStop(1, "rgba(201, 162, 39, 0)")
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, W, H)

      // Outer border
      ctx.strokeStyle = "#C9A227"
      ctx.lineWidth = 3
      roundRect(ctx, 20, 20, W - 40, H - 40, 8)
      ctx.stroke()

      // Inner border
      ctx.strokeStyle = "rgba(201, 162, 39, 0.5)"
      ctx.lineWidth = 1
      roundRect(ctx, 30, 30, W - 60, H - 60, 4)
      ctx.stroke()

      // Top decoration: orchestra name
      ctx.fillStyle = "#C9A227"
      ctx.font = "bold 32px Georgia, serif"
      ctx.textAlign = "center"
      ctx.fillText("🎵 YMJ BSD", W / 2, 80)

      ctx.fillStyle = "#ECC65A"
      ctx.font = "600 14px Arial, sans-serif"
      // letter-spacing simulation — draw each char
      drawSpacedText(ctx, "COMMUNITY ORCHESTRA", W / 2, 115, 3, "600 14px Arial, sans-serif", "#ECC65A")

      // Photo circle (gold ring)
      const photoSize = 360
      const photoX = (W - photoSize) / 2
      const photoY = 140
      const centerX = W / 2
      const centerY = photoY + photoSize / 2

      // Gold ring
      ctx.strokeStyle = "#C9A227"
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(centerX, centerY, photoSize / 2 + 8, 0, Math.PI * 2)
      ctx.stroke()

      // Photo or initials
      if (user.photoUrl) {
        // Try to load and draw the photo
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = user.photoUrl!
          })
          // Draw circular clipped photo
          ctx.save()
          ctx.beginPath()
          ctx.arc(centerX, centerY, photoSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize)
          ctx.restore()
        } catch {
          // Fallback: draw initials
          drawInitialsCircle(ctx, centerX, centerY, photoSize / 2, initials)
        }
      } else {
        // No photo — draw initials
        drawInitialsCircle(ctx, centerX, centerY, photoSize / 2, initials)
      }

      // Name
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 56px Georgia, serif"
      ctx.textAlign = "center"
      // Truncate long names
      const displayName = user.name.length > 25 ? user.name.substring(0, 25) + "…" : user.name
      ctx.fillText(displayName, W / 2, 610)

      // Instrument
      ctx.fillStyle = "#ECC65A"
      ctx.font = "600 32px Arial, sans-serif"
      ctx.fillText(user.instrument, W / 2, 670)

      // Section + Category badge
      const badgeText = `${sectionLabel} · ${user.ageCategory === "JUNIOR" ? "JUNIOR" : "COMMUNITY"}`
      const badgeW = 220
      const badgeH = 36
      const badgeX = (W - badgeW) / 2
      const badgeY = 700
      ctx.fillStyle = "#C9A227"
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18)
      ctx.fill()
      ctx.fillStyle = "#0A1F44"
      ctx.font = "bold 14px Arial, sans-serif"
      drawSpacedText(ctx, badgeText, W / 2, 724, 2, "bold 14px Arial, sans-serif", "#0A1F44")

      // Divider line
      ctx.strokeStyle = "rgba(201, 162, 39, 0.5)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(200, 780)
      ctx.lineTo(W - 200, 780)
      ctx.stroke()

      // Footer
      ctx.fillStyle = "#ECC65A"
      ctx.font = "italic 20px Georgia, serif"
      ctx.fillText("Founding Member", W / 2, 830)

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "12px Arial, sans-serif"
      ctx.fillText("Yayasan Musik Jakarta · BSD Campus", W / 2, 870)

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "11px Arial, sans-serif"
      ctx.fillText("Saturday 14.00 – 17.00 WIB · Concert Feb 2027", W / 2, 895)

      // Convert canvas to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `nametag-${user.name.replace(/\s+/g, "-").toLowerCase()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, "image/png")
    } catch (err) {
      console.error("Name tag generation failed:", err)
      alert(lang === "id" ? "Gagal generate name tag. Coba lagi." : "Failed to generate name tag. Try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="md:col-span-3">
      <Card className="border-gold-500/30 bg-white p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Visual preview (HTML/CSS) */}
          <div className="flex-shrink-0">
            <div
              className="w-48 rounded-lg shadow-md border border-gold-500/20 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #06152C 0%, #0A1F44 50%, #122140 100%)",
                aspectRatio: "4/5",
              }}
            >
              {/* Top decoration */}
              <div className="text-center pt-3">
                <p className="text-[10px] font-bold text-gold-500" style={{ fontFamily: "Georgia, serif" }}>
                  🎵 YMJ BSD
                </p>
                <p className="text-[6px] text-gold-300 tracking-widest">COMMUNITY ORCHESTRA</p>
              </div>

              {/* Photo / initials circle */}
              <div className="grid place-items-center mt-2 mb-2">
                <div className="h-20 w-20 rounded-full border-2 border-gold-500 overflow-hidden bg-navy-950 grid place-items-center">
                  {user.photoUrl ? (
                     
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gold-400" style={{ fontFamily: "Georgia, serif" }}>
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <p className="text-center text-[11px] font-bold text-white px-2 truncate" style={{ fontFamily: "Georgia, serif" }}>
                {user.name}
              </p>
              {/* Instrument */}
              <p className="text-center text-[8px] text-gold-300 font-semibold mt-0.5">
                {user.instrument}
              </p>
              {/* Badge */}
              <div className="grid place-items-center mt-1">
                <span className="text-[6px] bg-gold-500 text-navy-950 px-2 py-0.5 rounded-full font-bold tracking-wider">
                  {sectionLabel} · {user.ageCategory === "JUNIOR" ? "JUNIOR" : "COMMUNITY"}
                </span>
              </div>
              {/* Divider */}
              <div className="h-px bg-gold-500/30 mx-4 mt-2" />
              {/* Footer */}
              <p className="text-center text-[7px] text-gold-300 italic mt-1" style={{ fontFamily: "Georgia, serif" }}>
                Founding Member
              </p>
              <p className="text-center text-[5px] text-white/60 mt-0.5">
                Yayasan Musik Jakarta · BSD
              </p>
              <p className="text-center text-[5px] text-white/40 mt-3 mb-2">
                Saturday 14.00 – 17.00 WIB · Concert Feb 2027
              </p>
            </div>
          </div>

          {/* Description + download */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <Award className="h-5 w-5 text-gold-500" />
              <h3 className="font-semibold text-navy-900" style={{ fontFamily: "var(--font-display), serif" }}>
                {t(lang, "dashboard.memberNameTag")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "id"
                ? "Name tag Founding Member Anda. Klik tombol di bawah untuk download sebagai gambar PNG — siap dicetak atau dibagikan."
                : "Your Founding Member name tag. Click the button below to download as a PNG image — ready to print or share."}
            </p>
            <Button
              onClick={downloadNameTag}
              disabled={downloading}
              className="bg-gold-500 text-navy-950 hover:bg-gold-400 font-semibold"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t(lang, "dashboard.downloadNameTag")}
            </Button>
          </div>
        </div>

        {/* Hidden canvas for PNG generation */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Card>
    </div>
  )
}

// Helper: draw rounded rectangle
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Helper: draw text with letter spacing
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
  font: string,
  color: string
) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = "center"
  // Calculate total width
  let totalW = 0
  for (const ch of text) {
    totalW += ctx.measureText(ch).width + spacing
  }
  totalW -= spacing
  let x = centerX - totalW / 2
  ctx.textAlign = "left"
  for (const ch of text) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, x, y)
    x += w + spacing
  }
  ctx.textAlign = "center"
}

// Helper: draw initials in a circle (fallback when no photo)
function drawInitialsCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  initials: string
) {
  // Background circle
  ctx.fillStyle = "#06152C"
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  // Initials text
  ctx.fillStyle = "#C9A227"
  ctx.font = "bold 120px Georgia, serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(initials, centerX, centerY)
  ctx.textBaseline = "alphabetic"
}
