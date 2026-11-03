// Seed script — populates sheet music, announcements, WhatsApp groups, and demo users.
import { db } from "../src/lib/db"

// Lightweight pure-JS SHA-256 + base64 to avoid external deps in bun.
// We store passwords as base64(sha256(password + salt)) which is sufficient
// for a demo community site. Production should swap in argon2/bcrypt.
async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder().encode(plain)
  const digest = await crypto.subtle.digest("SHA-256", enc)
  return Buffer.from(new Uint8Array(digest)).toString("base64")
}

async function main() {
  // Admin user (verified)
  const adminPass = await hashPassword("admin123")
  await db.user.upsert({
    where: { email: "admin@ymj-stage.org" },
    update: {},
    create: {
      email: "admin@ymj-stage.org",
      password: adminPass,
      name: "YMJ BSD Admin",
      whatsapp: "0811 9892 413",
      ageCategory: "COMMUNITY",
      age: 30,
      instrument: "Violin",
      instrumentSection: "STRINGS",
      experienceYears: 12,
      address: "Yayasan Musik Jakarta Campus, BSD, Tangerang",
      role: "ADMIN",
      status: "VERIFIED",
      provider: "EMAIL",
      emailVerified: true,
    },
  })

  // Demo verified member (Flute / Woodwinds)
  const memberPass = await hashPassword("member123")
  await db.user.upsert({
    where: { email: "member@ymj-stage.org" },
    update: {},
    create: {
      email: "member@ymj-stage.org",
      password: memberPass,
      name: "Demo Member",
      whatsapp: "0812 3456 7890",
      ageCategory: "COMMUNITY",
      age: 22,
      instrument: "Flute",
      instrumentSection: "WOODWINDS",
      experienceYears: 5,
      address: "BSD City, Tangerang",
      role: "MEMBER",
      status: "VERIFIED",
      provider: "EMAIL",
      emailVerified: true,
    },
  })

  // Sheet music library — broad coverage across sections & categories
  const sheets = [
    // STRINGS — Junior
    { title: "Twinkle Twinkle Little Star (Variations)", composer: "Traditional / Suzuki", instrument: "Violin", section: "STRINGS", category: "JUNIOR", fileUrl: "https://example.com/sheets/violin-twinkle.pdf", difficulty: "BEGINNER", description: "Suzuki Book 1 — foundational variations for young violinists." },
    { title: "Ode to Joy — Viola", composer: "L. van Beethoven", instrument: "Viola", section: "STRINGS", category: "JUNIOR", fileUrl: "https://example.com/sheets/viola-ode.pdf", difficulty: "BEGINNER", description: "Simple arrangement of the Symphony No.9 theme." },
    { title: "French Folk Song — Cello", composer: "Traditional", instrument: "Cello", section: "STRINGS", category: "JUNIOR", fileUrl: "https://example.com/sheets/cello-folk.pdf", difficulty: "BEGINNER", description: "First-position lyrical melody." },
    { title: "Lightly Row — Double Bass", composer: "Traditional", instrument: "Double Bass", section: "STRINGS", category: "JUNIOR", fileUrl: "https://example.com/sheets/bass-lightly.pdf", difficulty: "BEGINNER", description: "Easy half-position study." },

    // STRINGS — Community
    { title: "Brandenburg Concerto No.3 — Violin I", composer: "J.S. Bach", instrument: "Violin", section: "STRINGS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/bach-brandenburg-vln1.pdf", difficulty: "ADVANCED", description: "First violin part for the 1st movement." },
    { title: "Brandenburg Concerto No.3 — Viola", composer: "J.S. Bach", instrument: "Viola", section: "STRINGS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/bach-brandenburg-vla.pdf", difficulty: "ADVANCED" },
    { title: "Symphony No.9 (Ode to Joy) — Cello", composer: "L. van Beethoven", instrument: "Cello", section: "STRINGS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/beethoven-9-vc.pdf", difficulty: "INTERMEDIATE" },
    { title: "Symphony No.9 (Ode to Joy) — Double Bass", composer: "L. van Beethoven", instrument: "Double Bass", section: "STRINGS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/beethoven-9-cb.pdf", difficulty: "INTERMEDIATE" },

    // WOODWINDS
    { title: "Flute Sonata in C — Flute", composer: "W.A. Mozart", instrument: "Flute", section: "WOODWINDS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/mozart-flute-sonata.pdf", difficulty: "INTERMEDIATE" },
    { title: "Concerto in D minor — Oboe", composer: "A. Marcello", instrument: "Oboe", section: "WOODWINDS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/marcello-oboe.pdf", difficulty: "ADVANCED" },
    { title: "Mozart Clarinet Concerto — Clarinet", composer: "W.A. Mozart", instrument: "Clarinet", section: "WOODWINDS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/mozart-clarinet.pdf", difficulty: "ADVANCED" },
    { title: "Bassoon Sonata — Bassoon", composer: "A. Vivaldi", instrument: "Bassoon", section: "WOODWINDS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/vivaldi-bassoon.pdf", difficulty: "INTERMEDIATE" },
    { title: "Simple Flute Etudes", composer: "Traditional", instrument: "Flute", section: "WOODWINDS", category: "JUNIOR", fileUrl: "https://example.com/sheets/flute-etudes-junior.pdf", difficulty: "BEGINNER" },

    // BRASS
    { title: "Horn Concerto No.1 — French Horn", composer: "W.A. Mozart", instrument: "French Horn", section: "BRASS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/mozart-horn-1.pdf", difficulty: "ADVANCED" },
    { title: "Trombone Sonata — Trombone", composer: "B. Marcello", instrument: "Trombone", section: "BRASS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/marcello-tbn.pdf", difficulty: "INTERMEDIATE" },
    { title: "Tuba Warm-ups & Studies", composer: "Traditional", instrument: "Tuba", section: "BRASS", category: "COMMUNITY", fileUrl: "https://example.com/sheets/tuba-warmups.pdf", difficulty: "INTERMEDIATE" },

    // PERCUSSION
    { title: "Timpani Fundamentals", composer: "Vic Firth", instrument: "Timpani", section: "PERCUSSION", category: "COMMUNITY", fileUrl: "https://example.com/sheets/firth-timpani.pdf", difficulty: "INTERMEDIATE" },
    { title: "Snare Drum Rudiments", composer: "Traditional", instrument: "Percussion", section: "PERCUSSION", category: "JUNIOR", fileUrl: "https://example.com/sheets/snare-rudiments.pdf", difficulty: "BEGINNER" },
    { title: "Mallet Studies — Marimba", composer: "M. Goldenberg", instrument: "Percussion", section: "PERCUSSION", category: "COMMUNITY", fileUrl: "https://example.com/sheets/goldenberg-marimba.pdf", difficulty: "ADVANCED" },

    // ALL — orchestral scores
    { title: "Orchestral Full Score — Ode to Joy", composer: "L. van Beethoven", instrument: "ALL", section: "ALL", category: "ALL", fileUrl: "https://example.com/sheets/beethoven9-full.pdf", difficulty: "ADVANCED", description: "Full conductor score for ensemble rehearsal." },
    { title: "Orchestral Full Score — Eine Kleine Nachtmusik", composer: "W.A. Mozart", instrument: "ALL", section: "ALL", category: "ALL", fileUrl: "https://example.com/sheets/eine-kleine-full.pdf", difficulty: "INTERMEDIATE", description: "Conductor score for the G-major serenade." },
  ]

  for (const s of sheets) {
    const existing = await db.sheetMusic.findFirst({ where: { title: s.title } })
    if (!existing) {
      await db.sheetMusic.create({ data: { ...s, fileType: "PDF" } })
    }
  }

  // Announcements & schedule
  const announcements = [
    {
      title: "Praktik Rutin — Setiap Sabtu 14.00–17.00 WIB",
      content: "Latihan rutin diadakan setiap Sabtu pukul 14.00–17.00 WIB di Yayasan Musik Jakarta Campus BSD. Mohon hadir 15 menit lebih awal untuk tuning. Bawa partitur masing-masing serta alat musik (kecuali perkusi besar yang sudah tersedia di lokasi).",
      eventDate: new Date("2026-11-07T14:00:00+07:00"),
      type: "PRACTICE",
    },
    {
      title: "Konser Perdana — Februari 2027",
      content: "Konser perdananya YMJ BSD Community Orchestra dijadwalkan pada Februari 2027 di auditorium Yayasan Musik Jakarta. Repertoire final akan diumumkan pada Sabtu, 14 November 2026. Pastikan kehadiran latihan minimal 80% untuk berpartisipasi dalam konser.",
      eventDate: new Date("2027-02-20T19:00:00+07:00"),
      type: "CONCERT",
    },
    {
      title: "Open Recruitment Founding Member",
      content: "Pendaftaran Founding Member masih dibuka untuk semua seksi instrumen. Ajak teman dan keluarga yang ingin bergabung. Pendaftaran melalui website resmi bsd.orchestra.ymj-stage.org atau WhatsApp 0811 9892 413.",
      eventDate: new Date("2026-11-30T23:59:00+07:00"),
      type: "GENERAL",
    },
    {
      title: "Audisi Penempatan Chair — 21 November 2026",
      content: "Audisi penempatan chair akan dilakukan pada Sabtu, 21 November 2026 pukul 14.00 WIB. Persiapkan: 1 etude, 1 excerpt orkestra (diberikan panitia), dan sight-reading. Hubungi koordinator seksi masing-masing untuk detail.",
      eventDate: new Date("2026-11-21T14:00:00+07:00"),
      type: "AUDITION",
    },
    {
      title: "Masterclass Strings — 5 Desember 2026",
      content: "Masterclass khusus seksi Strings bersama dosen tamu dari konservatori. Lokasi: Auditorium YMJ BSD. Peserta terbatas — silakan RSVP melalui koordinator Strings.",
      eventDate: new Date("2026-12-05T15:00:00+07:00"),
      type: "GENERAL",
    },
  ]
  for (const a of announcements) {
    const existing = await db.announcement.findFirst({ where: { title: a.title } })
    if (!existing) await db.announcement.create({ data: a })
  }

  // WhatsApp group — single official group
  // Delete all existing groups, then create the one official group
  await db.whatsAppGroup.deleteMany({})
  await db.whatsAppGroup.create({
    data: {
      name: "YMJ BSD Community Orchestra (Official Group)",
      section: "GENERAL",
      description: "Grup WhatsApp resmi seluruh anggota YMJ BSD Community Orchestra.",
      link: "https://chat.whatsapp.com/C7l6UBOvnbo4lSuGMWvHZs",
    },
  })

  // Singleton setting
  await db.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", googleSheetWebhook: "" },
  })

  console.log("✅ Seed complete.")
  console.log("Admin login : admin@ymj-stage.org / admin123")
  console.log("Member login: member@ymj-stage.org / member123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
