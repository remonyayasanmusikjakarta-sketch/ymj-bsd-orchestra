# Panduan Deployment — YMJ BSD Community Orchestra

Dokumen ini menjelaskan cara meng-upload dan men-deploy aplikasi ke website Anda sendiri via GitHub.

---

## Daftar Isi

1. [Persiapan Repository](#1-persiapan-repository)
2. [Upload ke GitHub](#2-upload-ke-github)
3. [Deploy ke Vercel (Recommended)](#3-deploy-ke-vercel-recommended)
4. [Deploy ke Netlify](#4-deploy-ke-netlify)
5. [Deploy ke VPS Sendiri](#5-deploy-ke-vps-sendiri)
6. [Setup Database PostgreSQL untuk Production](#6-setup-database-postgresql-untuk-production)
7. [Hubungkan Custom Domain](#7-hubungkan-custom-domain)
8. [Konfigurasi Google Spreadsheet Webhook](#8-konfigurasi-google-spreadsheet-webhook)
9. [Upgrade ke OAuth Google Sungguhan](#9-upgrade-ke-oauth-google-sungguhan)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Persiapan Repository

### File-file Penting yang Sudah Disiapkan

- `.gitignore` — mengabaikan `node_modules`, `.env`, `db/*.db`, `.next/`, dll
- `.env.example` — template environment variables
- `README.md` — dokumentasi singkat
- `DEPLOYMENT.md` — file ini

### Yang Perlu Anda Edit Sebelum Upload

1. **`.env`** — JANGAN di-upload! Hanya ada secara lokal. Pastikan ada di `.gitignore` (sudah).
2. **`README.md`** — ganti `USERNAME` di URL GitHub dengan username Anda
3. **`prisma/schema.prisma`** — kalau deploy ke Vercel/Netlify (serverless), WAJIB ganti ke PostgreSQL (lihat bagian 6)

### Verifikasi Sebelum Commit

```bash
# Pastikan tidak ada file sensitif yang akan di-upload
git status

# Pastikan .env tidak masuk
cat .gitignore | grep -E "^\*.env|^\.env"
# Harus muncul: .env*
```

---

## 2. Upload ke GitHub

### Opsi A: Buat Repository Baru di GitHub

1. **Buat repository di GitHub**:
   - Buka [github.com/new](https://github.com/new)
   - Repository name: `ymj-bsd-orchestra` (atau bebas)
   - **Public** atau **Private** (terserah)
   - **Jangan** centang "Add a README" (sudah ada)
   - Klik **Create repository**

2. **Di komputer Anda (di folder proyek)**:

```bash
# Inisialisasi git (kalau belum)
git init

# Tambah remote GitHub (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/ymj-bsd-orchestra.git

# Tambah semua file
git add .

# Commit pertama
git commit -m "Initial commit: YMJ BSD Community Orchestra"

# Push ke GitHub
git branch -M main
git push -u origin main
```

### Opsi B: Upload via GitHub Web Interface

1. Buka [github.com/new](https://github.com/new) → buat repo kosong
2. Download proyek sebagai ZIP dari sandbox
3. Extract di komputer Anda
4. Buka GitHub Desktop atau VS Code → drag-and-drop file ke repo baru
5. Commit & push

### Opsi C: Import via GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com/
gh auth login
gh repo create ymj-bsd-orchestra --public --source=. --remote=origin --push
```

---

## 3. Deploy ke Vercel (Recommended)

Vercel adalah platform deployment paling mudah untuk Next.js — dibuat oleh tim Next.js sendiri. **Gratis** untuk proyek kecil-menengah.

### Langkah

1. **Buka [vercel.com](https://vercel.com)** → Sign up dengan akun GitHub Anda

2. **Import repository**:
   - Klik **"Add New Project"**
   - Pilih repository `ymj-bsd-orchestra` Anda
   - Vercel akan otomatis deteksi ini proyek Next.js

3. **Konfigurasi Environment Variables** (PENTING!):
   - Scroll ke **"Environment Variables"**
   - Tambah variabel berikut:
     - `DATABASE_URL` = URL database PostgreSQL Anda (lihat bagian 6)
     - `SESSION_SECRET` = string random panjang (gunakan `openssl rand -hex 32` untuk generate)
     - `NODE_ENV` = `production`

4. **Deploy**:
   - Klik **"Deploy"**
   - Tunggu 2-3 menit sampai build selesai
   - Anda akan dapat URL sementara seperti `ymj-bsd-orchestra.vercel.app`

5. **Setup database & seed di production**:
   - Setelah deploy sukses, buka **Terminal** di dashboard Vercel (atau jalankan lokal dengan DATABASE_URL production):
   ```bash
   # Set env var sementara di shell Anda
   export DATABASE_URL="postgresql://..."  # URL production
   
   # Push schema
   bun run db:push
   
   # Seed data awal
   bun run scripts/seed.ts
   ```

6. **Test**:
   - Buka URL Vercel Anda
   - Login pakai akun demo (`admin@ymj-stage.org` / `admin123`)
   - Kalau berhasil → deployment sukses!

---

## 4. Deploy ke Netlify

Alternatif Vercel. Untuk Next.js, gunakan **Netlify Functions** adapter.

### Langkah

1. Buka [netlify.com](https://netlify.com) → Sign up dengan GitHub
2. **Add new site** → **Import existing project**
3. Pilih repository Anda
4. Build settings:
   - Build command: `bun run build` (atau `npm run build`)
   - Publish directory: `.next`
5. Environment variables: sama seperti Vercel (`DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`)
6. Deploy

**Catatan**: Untuk Netlify, install juga package `@netlify/plugin-nextjs`:
```bash
bun add -D @netlify/plugin-nextjs
```

Lalu tambahkan ke `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 5. Deploy ke VPS Sendiri

Untuk VPS (DigitalOcean, Vultr, Linode, AWS EC2, dll):

### Prasyarat di VPS
- Node.js 18+ atau Bun
- Nginx (reverse proxy)
- PM2 (process manager)
- PostgreSQL (atau pakai SQLite dengan filesystem persisten)

### Langkah

```bash
# 1. SSH ke VPS Anda
ssh root@your-vps-ip

# 2. Install dependencies
curl -fsSL https://bun.sh/install | bash  # install Bun

# 3. Clone repo
git clone https://github.com/USERNAME/ymj-bsd-orchestra.git
cd ymj-bsd-orchestra

# 4. Install dependencies
bun install

# 5. Setup env
cp .env.example .env
nano .env  # edit DATABASE_URL, SESSION_SECRET

# 6. Setup database
bun run db:push
bun run db:generate
bun run scripts/seed.ts

# 7. Build untuk production
bun run build

# 8. Jalankan dengan PM2
bun add -g pm2
pm2 start "bun .next/standalone/server.js" --name ymj-orchestra
pm2 save
pm2 startup  # auto-start saat boot

# 9. Setup Nginx reverse proxy
nano /etc/nginx/sites-available/ymj-orchestra
```

Isi Nginx config:
```nginx
server {
    listen 80;
    server_name bsd.orchestra.ymj-stage.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 10. Enable site & reload nginx
ln -s /etc/nginx/sites-available/ymj-orchestra /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 11. Setup SSL dengan Certbot (gratis via Let's Encrypt)
apt install certbot python3-certbot-nginx
certbot --nginx -d bsd.orchestra.ymj-stage.org
```

---

## 6. Setup Database PostgreSQL untuk Production

SQLite cocok untuk development tapi **tidak cocok untuk production di serverless** (Vercel/Netlify) karena filesystem tidak persisten. Gunakan PostgreSQL.

### Opsi Provider PostgreSQL Gratis

#### A. Neon (Recommended — gratis 0.5GB)
1. Daftar di [neon.tech](https://neon.tech)
2. Buat project baru
3. Copy connection string: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

#### B. Supabase (gratis 500MB)
1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Settings → Database → Copy connection string (URI)

#### C. Railway (gratis $5 credit/bulan)
1. Daftar di [railway.app](https://railway.app)
2. New project → PostgreSQL
3. Copy `DATABASE_URL` dari Connect tab

### Update Schema ke PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ganti dari "sqlite"
  url      = env("DATABASE_URL")
}
```

Lalu jalankan:
```bash
bun run db:push     # buat tabel di database production
bun run db:generate
bun run scripts/seed.ts  # isi data awal
```

---

## 7. Hubungkan Custom Domain

### Untuk Vercel
1. Dashboard Vercel → proyek Anda → **Settings** → **Domains**
2. Tambah `bsd.orchestra.ymj-stage.org`
3. Vercel akan memberi instruksi DNS:
   - Tambah **CNAME record** di DNS provider domain Anda:
     - Name/Host: `bsd.orchestra`
     - Value/Target: `cname.vercel-dns.com`
4. Tunggu propagasi DNS (5-30 menit)
5. Vercel otomatis issue SSL certificate gratis

### Untuk Netlify
1. Dashboard Netlify → Site settings → **Domain management**
2. Add custom domain
3. Tambah CNAME record di DNS: `bsd.orchestra` → `[your-site].netlify.app`

### Untuk VPS
1. Tambah A record di DNS provider:
   - Name: `bsd.orchestra`
   - Value: IP VPS Anda
2. Tunggu propagasi DNS
3. Jalankan certbot untuk SSL (lihat bagian 5)

---

## 8. Konfigurasi Google Spreadsheet Webhook

Setelah website live, hubungkan spreadsheet untuk menyimpan semua data pendaftar secara real-time:

### Buat Apps Script

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru berjudul "YMJ BSD Orchestra Registrations"
2. Menu **Extensions** → **Apps Script**
3. Hapus kode default, paste:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Buat header kalau sheet masih kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'WhatsApp',
      'Age Category', 'Age', 'Instrument', 'Section',
      'Experience (Years)', 'Address', 'Provider', 'Status'
    ]);
    
    // Format header
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Tambah baris data baru
  sheet.appendRow([
    data.timestamp,
    data.name,
    data.email,
    data.whatsapp,
    data.ageCategory,
    data.age,
    data.instrument,
    data.instrumentSection,
    data.experienceYears,
    data.address,
    data.provider,
    data.status
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, received: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Klik **Deploy** → **New deployment**
5. Klik icon ⚙️ → **Web app**
6. Settings:
   - **Description**: YMJ BSD Orchestra Webhook
   - **Execute as**: Me (email Anda)
   - **Who has access**: **Anyone** (PENTING — supaya server bisa POST)
7. Klik **Deploy**
8. Authorize akses saat diminta
9. Copy URL deployment: `https://script.google.com/macros/s/AKfyc.../exec`

### Hubungkan ke Website

1. Login ke website Anda sebagai admin (`admin@ymj-stage.org` / `admin123`)
2. Buka Dashboard → tab **Admin**
3. Paste URL Apps Script ke field "Webhook URL"
4. Klik **Save webhook URL**

### Test

1. Logout, lakukan registrasi baru dengan email berbeda
2. Cek spreadsheet Google Sheets Anda — data pendaftar baru harus muncul otomatis dalam beberapa detik

---

## 9. Upgrade ke OAuth Google Sungguhan

Saat ini "Continue with Google" adalah simulasi. Untuk gunakan OAuth Google asli:

### 1. Buat Google OAuth Client

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih yang ada
3. **APIs & Services** → **OAuth consent screen**
   - User type: External
   - App name: YMJ BSD Orchestra
   - Support email: email Anda
   - Authorized domains: domain Anda (mis. `bsd.orchestra.ymj-stage.org`)
4. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**
   - Application type: Web application
   - Authorized JavaScript origins: `https://bsd.orchestra.ymj-stage.org`
   - Authorized redirect URIs: `https://bsd.orchestra.ymj-stage.org/api/auth/callback/google`
5. Copy **Client ID** dan **Client Secret**

### 2. Install NextAuth.js

```bash
bun add next-auth @auth/prisma-adapter
```

### 3. Tambah Environment Variables

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."  # generate dengan: openssl rand -hex 32
NEXTAUTH_URL="https://bsd.orchestra.ymj-stage.org"
```

### 4. Setup NextAuth

Buat `src/lib/auth.config.ts` dengan Google provider dan Prisma adapter. Lalu update `AuthModals.tsx` untuk redirect ke `/api/auth/signin/google` ketika tombol "Continue with Google" diklik.

(Dokumentasi lengkap: [next-auth.js.org/getting-started/example](https://next-auth.js.org/getting-started/example))

---

## 10. Troubleshooting

### Error: "PrismaClientInitializationError"
- **Penyebab**: `DATABASE_URL` salah atau database belum di-migrate
- **Solusi**: 
  ```bash
  bun run db:push
  bun run db:generate
  ```

### Error: "Cannot find module '@/lib/db'"
- **Penyebab**: Prisma client belum di-generate
- **Solusi**: `bun run db:generate`

### Login tidak berhasil di production
- **Penyebab**: `SESSION_SECRET` belum diset di environment variables production
- **Solusi**: Tambah `SESSION_SECRET` di dashboard Vercel/Netlify, lalu redeploy

### Google Sheet webhook tidak menerima data
- **Cek hal berikut**:
  1. URL webhook benar (akhiran `/exec`)
  2. Deployment access: **Anyone** (bukan "Anyone with Google account")
  3. Apps Script sudah di-deploy ulang setelah edit terakhir
  4. Cek log: di website login sebagai admin → tab Admin → lihat status webhook saat ada registrasi baru

### Tab di dashboard tidak bisa diklik
- Ini adalah quirk agent-browser dengan Radix UI. Di browser real (Chrome, Firefox, Safari), tab bisa diklik normal karena klik mouse akan fire `mousedown` event yang didengarkan Radix.

### Custom domain tidak resolve
- **Cek DNS**: `dig bsd.orchestra.ymj-stage.org` atau `nslookup bsd.orchestra.ymj-stage.org`
- DNS propagation bisa 5-30 menit (kadang sampai 24 jam)
- Pastikan CNAME record benar: `bsd.orchestra` → target platform

### Build gagal di Vercel
- Cek log build di dashboard Vercel
- Umumnya karena: TypeScript error, env var belum diset, atau Prisma generate belum dijalankan
- Pastikan `postinstall` script di package.json: `"postinstall": "prisma generate"`

### Data registrasi hilang setelah redeploy (Vercel)
- **Penyebab**: masih pakai SQLite (filesystem tidak persisten di serverless)
- **Solusi**: ganti ke PostgreSQL (lihat bagian 6)

---

## Butuh Bantuan?

- **Issues**: buat issue di repository GitHub Anda
- **Dokumentasi Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Dokumentasi Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **Dokumentasi Vercel**: [vercel.com/docs](https://vercel.com/docs)
