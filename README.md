# YMJ BSD Community Orchestra

Website resmi untuk **Open Recruitment** YMJ BSD Community Orchestra — sistem pendaftaran anggota + portal anggota dengan partitur, grup WhatsApp, dan papan pengumuman.

Dibangun dengan Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, dan Prisma ORM.

---

## Fitur Utama

### Landing Page (Publik)
- Hero banner "Open Recruitment — Become a Founding Member!"
- Tentang orkes, seksi instrumen (Strings / Woodwinds / Brass / Percussion)
- Kategori (Junior Orchestra 8–16 / Community Orchestra Teens & Adults)
- Jadwal latihan Sabtu 14.00–17.00 WIB di YMJ Campus BSD
- Target konser Februari 2027
- Kontak: WhatsApp 0811 9892 413, bsd.orchestra.ymj-stage.org

### Sistem Autentikasi
- Registrasi email/password dengan validasi lengkap
- Simulasi "Continue with Google" (siap diupgrade ke OAuth sungguhan via NextAuth)
- Sesi httpOnly cookie bertanda tangan HMAC (7 hari)
- Field registrasi: Nama, Email, WhatsApp, Kategori/Umur, Instrumen, Pengalaman, Alamat

### Member Dashboard
- **Sheet Music Library**: partitur terfilter berdasarkan instrumen anggota
- **WhatsApp Groups**: link grup terfilter berdasarkan seksi/kategori
- **Announcement & Schedule**: jadwal latihan + roadmap menuju konser Feb 2027
- **Profile & Status**: detail registrasi + badge status (Verified/Pending)

### Admin Panel (role ADMIN)
- Konfigurasi URL webhook Google Spreadsheet
- Statistik & tabel semua registrasi

### Integrasi Google Spreadsheet
Setiap registrasi baru otomatis POST payload JSON ke webhook URL yang dikonfigurasi admin (untuk Google Apps Script Web App).

---

## Akun Demo

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@ymj-stage.org` | `admin123` |
| Member | `member@ymj-stage.org` | `member123` |

---

## Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) 18+ atau [Bun](https://bun.sh/)
- Git

### Langkah

```bash
# 1. Clone repository
git clone https://github.com/USERNAME/ymj-bsd-orchestra.git
cd ymj-bsd-orchestra

# 2. Install dependencies
bun install
# atau: npm install

# 3. Siapkan environment variables
cp .env.example .env
# Edit .env, ganti SESSION_SECRET dengan string random panjang

# 4. Push schema database & generate Prisma client
bun run db:push
bun run db:generate

# 5. Jalankan seed untuk mengisi data awal
bun run scripts/seed.ts

# 6. Jalankan dev server
bun run dev
```

Buka `http://localhost:3000` di browser.

---

## Deployment

Lihat **[DEPLOYMENT.md](./DEPLOYMENT.md)** untuk panduan lengkap deployment ke Vercel, Netlify, atau VPS sendiri.

Ringkasan cepat untuk Vercel:

1. Push repository ke GitHub
2. Import ke [vercel.com](https://vercel.com) → pilih repo
3. Tambah environment variables: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
4. (Recommended) Ganti SQLite ke PostgreSQL — ubah `prisma/schema.prisma` provider jadi `postgresql`
5. Deploy → jalankan `bun run db:push` dan `bun run scripts/seed.ts` di production
6. Hubungkan custom domain `bsd.orchestra.ymj-stage.org` di settings Vercel

---

## Struktur Proyek

```
├── prisma/
│   └── schema.prisma          # Skema database (User, SheetMusic, Announcement, dll)
├── scripts/
│   └── seed.ts                # Seed data awal
├── src/
│   ├── app/
│   │   ├── api/               # API routes (auth, sheet-music, announcements, admin)
│   │   ├── globals.css        # Tema navy + gold
│   │   ├── layout.tsx         # Font + metadata
│   │   └── page.tsx           # Halaman utama (single-page app)
│   ├── components/
│   │   ├── ui/                # Komponen shadcn/ui
│   │   └── ymj/               # Komponen kustom (Navbar, Landing, AuthModals, Dashboard)
│   └── lib/
│       ├── auth.ts            # Sesi & hashing password
│       ├── db.ts              # Prisma client
│       ├── instruments.ts     # Katalog instrumen
│       ├── store.ts           # Zustand store
│       └── webhook.ts         # Integrasi Google Sheet webhook
├── .env.example
├── package.json
└── README.md
```

---

## Mengkonfigurasi Google Spreadsheet Webhook

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Extensions → Apps Script
3. Paste kode berikut:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Tambah header kalau sheet kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'WhatsApp',
      'Age Category', 'Age', 'Instrument', 'Section',
      'Experience', 'Address', 'Provider', 'Status'
    ]);
  }
  
  sheet.appendRow([
    data.timestamp, data.name, data.email, data.whatsapp,
    data.ageCategory, data.age, data.instrument, data.instrumentSection,
    data.experienceYears, data.address, data.provider, data.status
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy → New deployment → Type: Web app
   - Execute as: Me
   - Who has access: **Anyone**
5. Copy URL deployment (`https://script.google.com/macros/s/.../exec`)
6. Login sebagai admin → Dashboard → tab Admin → paste URL → Save

Setiap pendaftar baru otomatis masuk ke spreadsheet Anda.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite untuk dev, PostgreSQL untuk production)
- **State**: Zustand
- **Forms**: react-hook-form + zod
- **Fonts**: Playfair Display + Inter

---

## Lisensi

© Yayasan Musik Jakarta. All rights reserved.
