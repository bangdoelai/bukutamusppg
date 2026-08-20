# Panduan Deployment Buku Tamu Digital SPPG ke Vercel

Dokumen ini berisi panduan langkah demi langkah untuk mendeploy aplikasi **Buku Tamu Digital SPPG Bontang Selatan** ke platform **Vercel** menggunakan **Database PostgreSQL Cloud (Neon.tech)**.

---

## 📌 Konsep Database Cloud

Vercel adalah platform Serverless/Cloud yang membutuhkan **Database PostgreSQL Cloud** agar data tamu tersimpan secara permanen dan dapat diakses dari mana saja.

Rekomendasi database cloud gratis terbaik & paling kompatibel dengan Drizzle ORM adalah **[Neon.tech](https://neon.tech)** (atau [Supabase](https://supabase.com)).

---

## 🚀 Langkah-Langkah Deployment

### 1. Buat Database Cloud Gratis (Neon.tech)

1. Buka [neon.tech](https://neon.tech) dan **Sign Up** menggunakan akun GitHub atau Google (100% Gratis).
2. Buat proyek baru (*New Project*), beri nama misalnya: `bukutamu-sppg`.
3. Setelah proyek terbuat, Anda akan mendapatkan baris **Connection String (DATABASE_URL)**.
   *Contoh format URL:*
   ```text
   postgresql://neondb_owner:npg_xYz12345@ep-cool-lake-a5xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Salin (*copy*) URL koneksi tersebut.

---

### 2. Push Skema Tabel ke Database Cloud Baru

Buka terminal di laptop Anda pada folder proyek (`/Users/abdullah_1/bukutamusppg`), lalu jalankan perintah berikut untuk membuat tabel `guestbook_entries` di database Neon:

```bash
DATABASE_URL="paste_url_neon_anda_di_sini" npx drizzle-kit push
```

---

### 3. Upload Kode Proyek ke GitHub

Jika proyek Anda belum di-upload ke GitHub, jalankan perintah git berikut:

```bash
git init
git add .
git commit -m "Siap deploy ke Vercel"
git branch -M main
git remote add origin https://github.com/USERNAME_GITHUB_ANDA/bukutamusppg.git
git push -u origin main
```

---

### 4. Deploy Proyek ke Vercel

1. Buka [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** $\rightarrow$ pilih **"Project"**.
3. Pilih repository `bukutamusppg` Anda, lalu klik **Import**.
4. Sebelum mengklik Deploy, buka bagian **Environment Variables** dan masukkan variabel lingkungan berikut:

| Key (Nama Variable) | Value (Isi Nilai) | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | *Paste URL koneksi dari Neon.tech (Langkah 1)* | URL koneksi database PostgreSQL cloud |
| `ADMIN_USERNAME` | `admin` | Username untuk login halaman `/rekap` |
| `ADMIN_PASSWORD` | `sppgbontang123` | Password untuk login halaman `/rekap` |
| `SESSION_SECRET` | `sppg_bontang_selatan_secret_key_2026_super_secure` | Kunci enkripsi cookie sesi admin |

5. Klik tombol **"Deploy"**.
6. Tunggu sekitar 1 menit hingga Vercel selesai melakukan proses kompilasi (*build*).

---

## 🎉 Selesai!

Aplikasi Anda kini telah **100% Online** dan dapat diakses dari mana saja (HP, Tablet, PC) melalui URL gratis Vercel seperti:
`https://bukutamusppg.vercel.app`

---

## 💡 Tips & Pengelolaan Tambahan

- **Mengubah Username / Password Admin**: Jika ingin mengganti password admin di kemudian hari, cukup ubah nilai `ADMIN_USERNAME` dan `ADMIN_PASSWORD` pada menu **Settings $\rightarrow$ Environment Variables** di Dashboard Vercel Anda tanpa perlu mengubah kodingan.
- **Export & Print**: Fitur pencarian, filter tanggal, ekspor CSV/Excel, serta cetak rekapitulasi tetap dapat digunakan 100% lancar di Vercel.
- **Real-Time Live Sync**: Fitur auto-update data tamu baru tetap berjalan secara instan melalui Server-Sent Events (SSE).
