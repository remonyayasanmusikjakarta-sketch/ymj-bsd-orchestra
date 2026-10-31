# 🚀 Panduan Upload ke GitHub (Tanpa Testing Lokal)

Panduan ini khusus untuk Anda — langsung upload ke GitHub, tanpa perlu test lokal dulu.

---

## 📋 Fitur Baru Versi 2

Versi ZIP baru (`ymj-bsd-orchestra-v2.zip`) sudah berisi semua fitur yang Anda minta:

✅ **3 Bahasa** (Indonesia / English / 中文) — switcher di navbar kanan atas
✅ **Foto wajib saat registrasi** — diupload langsung, ada preview
✅ **Name tag otomatis** — dibuat server-side pakai foto + nama + instrumen
✅ **Admin upload partitur musik** — kelola via Dashboard → Admin → Sheet Music Manager
✅ **Video portofolio** — admin bisa upload file MP4 ATAU paste link YouTube/Vimeo
✅ **Multiple admin** — admin bisa promote/demote member lewat Admin Panel
✅ **Privacy note** — pemberitahuan "data privat" di section Contact
✅ **Tidak ada email verification** — auto-verified langsung (sesuai permintaan Anda)
✅ **Tidak ada email notifications** — semua info via grup WhatsApp

---

## 📥 Langkah 1: Download ZIP Baru

1. Lihat panel **download** di chat ini (kanan/bawah interface)
2. Cari file: **`ymj-bsd-orchestra-v2.zip`** (157 KB)
3. Klik → download ke komputer Anda (folder Downloads)

---

## 📦 Langkah 2: Extract ZIP

### Cara di Windows:

1. Buka **File Explorer** → ke folder **Downloads**
2. Klik kanan file `ymj-bsd-orchestra-v2.zip`
3. Pilih **"Extract All..."**
4. Pilih lokasi tujuan (recommended: `Documents`)
5. Klik **Extract**
6. Folder `ymj-bsd-orchestra-v2` akan muncul

### Verifikasi Hasil Extract

Buka folder `ymj-bsd-orchestra-v2` — Anda harus lihat file:
- `package.json` (PALING PENTING — kalau tidak ada, extract gagal)
- `README.md`, `DEPLOYMENT.md`
- folder `src/`, `prisma/`, `scripts/`, `public/`

---

## 🐙 Langkah 3: Buat Akun & Repository GitHub

### 3.1 Buat Akun GitHub (Kalau Belum Punya)

1. Buka [github.com](https://github.com)
2. Klik **"Sign up"** (pojok kanan atas)
3. Isi email, buat password, pilih username
4. Verifikasi email (cek inbox, klik link dari GitHub)

### 3.2 Buat Repository Baru

1. Login ke GitHub
2. Klik tanda **"+"** di pojok kanan atas → pilih **"New repository"**
3. Isi form:
   - **Repository name**: `ymj-bsd-orchestra` (atau nama lain bebas)
   - **Description** (opsional): `YMJ BSD Community Orchestra - Open Recruitment & Member Portal`
   - **Public** atau **Private**:
     - Pilih **Public** kalau mau deploy gratis ke Vercel
     - Pilih **Private** kalau mau repo tertutup (Vercel tetap gratis, tinggal authorize)
   - **JANGAN centang**: "Add a README", "Add .gitignore", "Choose a license" (sudah ada di proyek)
4. Klik tombol hijau **"Create repository"**

### 3.3 Catat URL Repository Anda

Setelah repo dibuat, GitHub kasih URL seperti:
```
https://github.com/USERNAME/ymj-bsd-orchestra.git
```

Catat URL ini — Anda butuh di Langkah 5.

---

## 🛠️ Langkah 4: Install Git (Kalau Belum Punya)

Cek dulu apakah Git sudah terinstall:

### Cara Cek:

1. Buka **Command Prompt** (CMD) atau **PowerShell**
   - Tekan `Win + R` → ketik `cmd` → Enter
2. Ketik perintah:
   ```cmd
   git --version
   ```
3. Tekan Enter

**Kalau muncul** `git version 2.x.x ...` → Git sudah terinstall, **LANJUT KE LANGKAH 5**

**Kalau muncul** `'git' is not recognized...` → install dulu:

### Install Git di Windows:

1. Download dari [git-scm.com/download/win](https://git-scm.com/download/win)
2. Jalankan installer (klik ganda file yang didownload)
3. **Penting**: Pilih opsi **"Git from the command line and also from 3rd-party software"** saat installer minta pilih adjustment
4. Klik **Next** terus sampai **Install** → **Finish**
5. **Tutup semua CMD yang terbuka**, lalu buka CMD baru
6. Verify: `git --version`

---

## 📤 Langkah 5: Upload Kode ke GitHub

### 5.1 Buka CMD di Folder Hasil Extract

**Cara paling gampang:**

1. Buka **File Explorer**
2. Navigasi ke folder `ymj-bsd-orchestra-v2` (hasil extract)
3. **Klik kotak address bar** di bagian atas (yang nunjukin path)
4. **Hapus semua text di address bar**
5. **Ketik `cmd`**
6. **Tekan Enter**
7. CMD akan terbuka **langsung di folder tersebut**

### 5.2 Verifikasi Anda di Folder yang Benar

Di CMD, ketik:

```cmd
dir package.json
```

**Harus muncul** file `package.json`. Kalau muncul "File Not Found", Anda masih di folder salah.

### 5.3 Inisialisasi Git

Jalankan perintah berikut satu per satu (Enter setiap perintah):

```cmd
git init
```

Output: `Initialized empty Git repository in .../ymj-bsd-orchestra-v2/.git/`

### 5.4 Konfigurasi Git (Hanya Sekali di Komputer Ini)

Kalau Anda belum pernah pakai Git di komputer ini, jalankan (ganti dengan data Anda):

```cmd
git config --global user.name "Nama Anda"
git config --global user.email "email.anda@example.com"
```

> Pakai email yang sama dengan akun GitHub Anda.

### 5.5 Tambahkan Semua File

```cmd
git add .
```

(Tidak ada output — itu normal.)

### 5.6 Commit (Simpan Snapshot)

```cmd
git commit -m "Initial commit: YMJ BSD Community Orchestra v2"
```

Output akan menampilkan file-file yang ditambahkan.

### 5.7 Hubungkan ke Repository GitHub

**Ganti `USERNAME` dengan username GitHub Anda:**

```cmd
git remote add origin https://github.com/USERNAME/ymj-bsd-orchestra.git
```

### 5.8 Push (Upload) ke GitHub

```cmd
git branch -M main
git push -u origin main
```

### 5.9 Login GitHub Saat Diminta

Saat pertama kali push, akan muncul popup **"Sign in to GitHub"**:

1. Pilih **"Sign in with your browser"**
2. Browser akan terbuka otomatis
3. Login dengan akun GitHub Anda
4. Klik **"Authorize git-ecosystem"** (atau nama serupa)
5. Kembali ke CMD → proses push akan lanjut

### 5.10 Verifikasi Upload Berhasil

1. Buka browser → ke `https://github.com/USERNAME/ymj-bsd-orchestra`
2. Refresh halaman
3. Anda harus lihat semua file proyek:
   - `README.md`, `DEPLOYMENT.md`
   - `package.json`
   - folder `src/`, `prisma/`, `scripts/`, `public/`

✅ **SELAMAT! Kode Anda sudah ada di GitHub!**

---

## 🌐 Langkah 6: Deploy ke Vercel (Opsional tapi Recommended)

Setelah kode di GitHub, deploy ke Vercel supaya website online.

### 6.1 Buat Akun Vercel

1. Buka [vercel.com](https://vercel.com)
2. Klik **"Sign Up"** → pilih **"Continue with GitHub"**
3. Authorize Vercel untuk akses GitHub Anda

### 6.2 Import Repository

1. Klik **"Add New..."** → **"Project"**
2. Cari repository `ymj-bsd-orchestra`
3. Klik **"Import"**

### 6.3 Konfigurasi Environment Variables

Scroll ke bagian **"Environment Variables"**. Tambah 3 variabel:

| Key | Value |
|---|---|
| `DATABASE_URL` | `file:./db/custom.db` (sementara untuk testing. Production sebaiknya pakai PostgreSQL — lihat DEPLOYMENT.md) |
| `SESSION_SECRET` | String random panjang. Generate di [random.org/strings](https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new) |
| `NODE_ENV` | `production` |

Klik **"Add"** setelah masing-masing variabel.

### 6.4 Deploy

Klik tombol **"Deploy"** (biru, besar). Tunggu 2-3 menit.

### 6.5 Setup Database di Production

Setelah deploy sukses, setup database di Vercel:

**Cara via Vercel CLI** (recommended):

1. Install Vercel CLI:
   ```cmd
   npm install -g vercel
   ```
2. Login:
   ```cmd
   vercel login
   ```
3. Link ke project:
   ```cmd
   cd path\ke\ymj-bsd-orchestra-v2
   vercel link
   ```
4. Jalankan db push dengan env production:
   ```cmd
   vercel env pull .env.production.local
   ```
5. Edit `.env.production.local` — copy `DATABASE_URL` value
6. Setup database lokal pakai env production:
   ```cmd
   set DATABASE_URL=value-dari-vercel
   bun run db:push
   bun run scripts/seed.ts
   ```

**Atau cara alternatif (lebih simpel):** pakai PostgreSQL Neon (gratis):

1. Daftar di [neon.tech](https://neon.tech)
2. Buat project baru → copy connection string
3. Update `prisma/schema.prisma` — ganti `provider = "sqlite"` jadi `provider = "postgresql"`
4. Commit & push ke GitHub
5. Set `DATABASE_URL` di Vercel = URL Neon
6. Vercel auto-deploy ulang

---

## 🎯 Langkah 7: Test Website Production

Setelah deploy:

1. Buka URL Vercel Anda (mis. `ymj-bsd-orchestra.vercel.app`)
2. **Coba 3 bahasa** — klik tombol language di navbar (pojok kanan atas), ganti-ganti bahasa
3. **Coba login admin**:
   - Email: `admin@ymj-stage.org`
   - Password: `admin123`
4. **Test fitur admin**:
   - Buka Dashboard → tab Admin
   - Klik "Sheet Music Manager" → upload partitur PDF baru
   - Klik "Video Portfolio Manager" → tambah video via link YouTube
   - Klik "All Registrations" → promote/demote member
5. **Test registrasi member baru**:
   - Logout
   - Klik "Become a Founding Member"
   - Isi form lengkap + upload foto
   - Setelah submit, lihat Profile → harus ada name tag dengan foto Anda
6. **Test Gallery section**:
   - Buka landing page → scroll ke section "Activities & Portfolio"
   - Video yang Anda upload harus muncul di sana

---

## ❓ FAQ

### Q: Kalau saya sudah punya versi 1 di GitHub, gimana cara update ke v2?

**A:** Mudah saja:

1. Download `ymj-bsd-orchestra-v2.zip` & extract
2. Copy SEMUA file dari folder v2 ke folder repo lokal Anda (overwrite semua)
3. Jalankan:
   ```cmd
   git add .
   git commit -m "Upgrade to v2: i18n, photo upload, name tags, video portfolio, multiple admins"
   git push origin main
   ```

### Q: Password admin default (`admin123`) tidak aman. Bagaimana cara ganti?

**A:** Setelah deploy production:

1. Login sebagai admin
2. Daftarkan akun baru untuk diri Anda sendiri (register biasa dengan email Anda)
3. Login sebagai `admin@ymj-stage.org`, buka Admin Panel
4. Promote akun baru Anda jadi Admin
5. Logout, login pakai akun baru Anda
6. Demote akun lama `admin@ymj-stage.org` jadi Member
7. Atau hapus akun lama langsung di database (kalau perlu)

### Q: Bagaimana cara menambah admin lain selain saya?

**A:**

1. Calon admin mendaftar dulu sebagai member biasa di website (klik "Become a Founding Member")
2. Mereka upload foto, isi form, jadi member
3. Anda login sebagai admin → buka Dashboard → tab Admin → "All Registrations"
4. Cari nama calon admin di list
5. Klik tombol **"Promote jadi Admin"** (oranye, di samping nama mereka)
6. Konfirmasi
7. Calon admin logout dan login lagi → sekarang mereka punya akses Admin

### Q: File upload (foto, partitur, video) disimpan di mana?

**A:** Disimpan di folder `public/uploads/`:
- `public/uploads/members/` — foto profil member
- `public/uploads/nametags/` — name tag yang di-generate
- `public/uploads/sheet-music/` — partitur PDF admin upload
- `public/uploads/videos/` — video file admin upload

**Catatan untuk production (Vercel):** filesystem Vercel tidak persisten untuk file upload. Untuk production sebaiknya pakai cloud storage seperti:
- **Vercel Blob** ([vercel.com/storage](https://vercel.com/storage)) — recommended, integrasi langsung
- **Cloudinary** ([cloudinary.com](https://cloudinary.com)) — gratis 25GB
- **AWS S3** — kalau sudah pakai AWS

Untuk demo/dev: SQLite + filesystem lokal sudah cukup.

### Q: Bahasa yang dipilih user, disimpan di mana?

**A:** Disimpan di:
- **localStorage** browser (`ymj_lang` key) — supaya preferensi tetap setelah refresh
- **Cookie** (`ymj_lang`) — supaya server juga tahu bahasa user

User bisa ganti bahasa kapan saja via tombol globe di navbar.

### Q: Kalau ada error saat `git push`, apa yang harus saya lakukan?

**A:** Error umum:

- `error: failed to push some refs` → repository GitHub Anda sudah ada isinya (README dari GitHub). Solusi:
  ```cmd
  git pull origin main --allow-unrelated-histories
  git push -u origin main
  ```

- `error: remote origin already exists` → Anda sudah `git remote add origin` sebelumnya. Solusi:
  ```cmd
  git remote remove origin
  git remote add origin https://github.com/USERNAME/ymj-bsd-orchestra.git
  ```

- `Permission denied (publickey)` → GitHub butuh autentikasi. Pastikan Anda pakai HTTPS URL (bukan SSH), atau setup SSH keys.

### Q: Bagaimana cara update website setelah ada perubahan kode?

**A:** Setiap kali Anda (atau saya) update kode di sandbox:

1. Saya buat ZIP baru
2. Anda download & extract
3. Copy file baru ke folder repo lokal Anda
4. Jalankan:
   ```cmd
   git add .
   git commit -m "Update: <deskripsi perubahan>"
   git push origin main
   ```
5. Kalau Vercel terhubung ke repo → auto-deploy terjadi
6. Website production auto-update dalam 1-2 menit

---

## 📞 Butuh Bantuan?

Kalau ada masalah dengan langkah tertentu:

1. **Screenshot error** atau **copy-paste output CMD** ke chat ini
2. Beri tahu saya di langkah mana Anda stuck
3. Saya akan bantu troubleshoot

Selamat upload! 🚀🎵
