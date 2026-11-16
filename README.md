# RuangDegup — Sistem Informasi Perpustakaan Digital
**SMKN 6 Surakarta • Ruang Cerita, Ruang Rasa**

[![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Railway](https://img.shields.io/badge/Hosted_on-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.com)

---

## 📌 1. Deskripsi Proyek

**RuangDegup** adalah platform sistem informasi perpustakaan berbasis web dengan pendekatan kurasi editorial yang hangat (*warm editorial aesthetic*). Aplikasi ini dirancang untuk mendigitalkan proses pencarian katalog buku, sirkulasi peminjaman dan pengembalian mandiri oleh siswa, pengelolaan rak favorit, serta apresiasi ulasan buku di **SMKN 6 Surakarta**.

Sistem ini dibangun dengan arsitektur modern: **Laravel 12 REST API** sebagai backend dan **React 19 SPA + Vite 8** sebagai frontend, didukung autentikasi berbasis token **Laravel Sanctum**.

* **Live Website Publik:** [https://ruangdegup.web.id](https://ruangdegup.web.id)
* **Backend API Base:** [https://api.ruangdegup.web.id](https://api.ruangdegup.web.id)
* **Repositori GitHub:** [Bianca3020/RuangDegup](https://github.com/Bianca3020/RuangDegup)

---

## 👥 2. Akun Demo Pengujian

Penguji / Guru dapat menggunakan akun pengujian khusus berikut untuk menguji masing-masing hak akses pada lingkungan lokal atau demo:

| Peran | Email | Kata Sandi | Keterangan Akses |
| :--- | :--- | :--- | :--- |
| **Admin (Petugas)** | `admin@ruangdegup.com` | `admin123` *(atau sesuai seeder)* | Akses penuh Dashboard Admin, CRUD Buku, Kategori, Anggota Siswa, Peminjaman, Ekspor Laporan PDF, & Kutipan Footer. |
| **Member (Siswa)** | `bianca@ruangdegup.local` | `RuangDegup123!` *(atau sesuai seeder)* | Akses Ruang Anggota, pinjam buku fisik, kembalikan buku mandiri, simpan rak favorit, & tulis ulasan. |

> **Catatan:** Pengguna umum juga dapat langsung membuat akun Member siswa baru melalui tombol **Daftar** pada modal autentikasi. Pastikan untuk mengganti kata sandi default apabila aplikasi digunakan di lingkungan produksi.

---

## 🚀 3. Fitur Utama & Kriteria Pemenuhan Tugas

### A. Autentikasi & Multi-Role (Admin & Member)
- Sistem login & registrasi terintegrasi dengan validasi kredensial.
- Pembatasan rute dan otorisasi ketat menggunakan token **Laravel Sanctum** serta middleware role (`admin` & `member`).
- Session view tersimpan aman (`sessionStorage` + sinkronisasi URL Hash) sehingga tidak ter-reset ke halaman beranda saat halaman dimuat ulang.

### B. Manajemen Katalog Buku & Pencarian (CRUD Lengkap)
- **Katalog Buku:** Tambah, baca, perbarui metadata buku (ISBN, penulis, penerbit, tahun terbit, stok, sinopsis), dan hapus buku.
- **Upload Sampul:** Mendukung unggah berkas gambar foto sampul fisik maupun tautan URL gambar eksternal.
- **Kategori Koleksi:** CRUD klasifikasi kategori buku dengan proteksi integritas relasi database (`RESTRICT`).
- **Pencarian Real-Time (Live Search):** Filter buku instan berdasarkan judul, nama penulis, maupun ISBN tanpa perlu me-reload halaman.
- **Baru Menghiasi Rak (New Arrivals):** Section koleksi 6 buku terbaru terurut berdasarkan tanggal penambahan (`created_at DESC`).

### C. Sirkulasi Peminjaman & Pengembalian Mandiri
- Peminjaman buku fisik oleh siswa dengan verifikasi stok tersedia dan batas waktu pengembalian 7 hari.
- **Manajemen Stok Otomatis:** Stok buku di database otomatis berkurang saat dipinjam dan bertambah kembali saat buku dikembalikan.
- Transaksi dilindungi mekanisme transaksi database atomik (`DB::transaction` dengan `lockForUpdate`) untuk mencegah *race condition*.

### D. Interaksi Siswa (Favorit & Ulasan)
- **Rak Buku Favorit:** Siswa dapat menandai hingga 4 buku favorit pilihan di dashboard.
- **Catatan Apresiasi & Ulasan:** Siswa dapat memberikan rating (1–5 bintang) beserta ulasan tertulis (1 ulasan per siswa per buku).

### E. Laporan Transaksi Peminjaman (Ekspor PDF)
- Admin dapat mencetak dan mengunduh laporan sirkulasi perpustakaan dalam format **PDF** (`barryvdh/laravel-dompdf`).
- Mendukung filter status laporan: *Semua Riwayat*, *Sedang Dipinjam*, *Telah Dikembalikan*, serta indikator keterlambatan.

### F. Dynamic Editorial Footer Quotes
- Kutipan sastra & inspiratif di footer publik yang berganti secara dinamis di setiap kunjungan baru.
- Dilengkapi tautan publikasi Substack `https://substack.com/@ruangdegup`.
- Admin dapat mengelola, menambah, mengubah, mengaktifkan/menonaktifkan, serta menghapus kutipan melalui Admin Panel.

---

## 🔒 4. Keamanan Sistem Dasar

1. **Password Hashing:** Semua kata sandi akun dienkripsi menggunakan algoritma hashing **Bcrypt** (`Hash::make`).
2. **Prepared Statements:** Seluruh interaksi database menggunakan Laravel Eloquent ORM dan PDO binding untuk mencegah celah **SQL Injection**.
3. **Validasi Input Ketat:** Setiap data masukan divalidasi ketat pada Controller dengan rules MIME type, batas ukuran berkas, tipe data integer, dan sanitasi string.
4. **Proteksi Otorisasi:** Endpoint sensitif admin dilindungi middleware `auth:sanctum` dan middleware role `admin`.

---

## 📱 5. Tampilan Responsif (Mobile Friendly)

Antarmuka web dirancang responsif dan fleksibel menggunakan *CSS Grid*, *Flexbox*, dan *Media Queries* sehingga nyaman diakses melalui:
- **Smartphone / HP** (layar 320px – 480px)
- **Tablet / iPad** (layar 768px – 1024px)
- **Laptop & Desktop Monitor** (1280px+)

---

## 🗄️ 6. Rancangan Basis Data & ERD

### Diagram ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o| MEMBERS : "owns (1-to-1)"
    CATEGORIES ||--o{ BOOKS : "classifies (1-to-many)"
    BOOKS ||--o{ BORROWINGS : "borrowed in (1-to-many)"
    MEMBERS ||--o{ BORROWINGS : "makes (1-to-many)"
    MEMBERS ||--o{ FAVORITES : "saves (1-to-many)"
    BOOKS ||--o{ FAVORITES : "saved as (1-to-many)"
    MEMBERS ||--o{ REVIEWS : "writes (1-to-many)"
    BOOKS ||--o{ REVIEWS : "reviewed in (1-to-many)"

    CATEGORIES {
        bigint id PK
        string nama_kategori
    }

    USERS {
        bigint id PK
        string name
        string email
        string password
        enum role
    }

    BOOKS {
        bigint id PK
        bigint category_id FK
        string judul
        string penulis
        string penerbit
        year tahun_terbit
        string isbn
        integer stok
        string cover
        text deskripsi
    }

    MEMBERS {
        bigint id PK
        bigint user_id FK
        string nomor_anggota
        string nama
        string kelas
        string no_hp
        text alamat
        text bio
        string profile_photo
        string profile_background
        date tanggal_daftar
    }

    BORROWINGS {
        bigint id PK
        bigint member_id FK
        bigint book_id FK
        date tanggal_pinjam
        date tanggal_kembali
        enum status
    }

    FAVORITES {
        bigint id PK
        bigint member_id FK
        bigint book_id FK
    }

    REVIEWS {
        bigint id PK
        bigint member_id FK
        bigint book_id FK
        tinyint rating
        text ulasan
    }

    FOOTER_QUOTES {
        bigint id PK
        text quote
        string author
        boolean is_active
    }
```

> File gambar vektor ERD lengkap tersedia pada berkas [erd-ruangdegup.svg](./erd-ruangdegup.svg).

---

## 🛠️ 7. Panduan Instalasi Lokal (Local Development)

### Prasyarat Sistem
* PHP >= 8.2 (ekstensi `pdo_mysql`, `gd`, `fileinfo`, `mbstring` aktif)
* Composer 2.x
* Node.js >= 18.x & npm
* MySQL / MariaDB (misal via XAMPP)

### Langkah-Langkah

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/Bianca3020/RuangDegup.git
   cd RuangDegup
   ```

2. **Setup Backend (Laravel):**
   ```bash
   # Salin berkas lingkungan
   cp .env.example .env

   # Install dependencies PHP
   composer install

   # Generate Application Key
   php artisan key:generate

   # Buat symbolic link folder storage publik
   php artisan storage:link

   # Jalankan migrasi dan seeder database
   php artisan migrate --seed
   ```

3. **Setup Frontend (React + Vite):**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Menjalankan Server:**
   ```bash
   # Terminal 1: Backend
   php artisan serve

   # Terminal 2: Frontend (mode dev)
   cd frontend
   npm run dev
   ```
   Akses aplikasi di browser pada: `http://localhost:5173` atau `http://localhost:8000`.

---

## 📄 8. Lisensi & Hak Cipta

Dikembangkan oleh **Bianca** untuk tugas akhir kejuruan **SMKN 6 Surakarta**.  
Hak Cipta © 2026 **RuangDegup**. Seluruh hak dilindungi undang-undang.

---

## 🖼️ 9. Preview Website & Dokumentasi Antarmuka

Berikut adalah tangkapan layar aktual dari aplikasi **RuangDegup** yang sedang berjalan pada resolusi desktop (1920×1080):

### A. Public Interface
| Tampilan | Preview |
| :--- | :--- |
| **Homepage & Hero Section**<br>Navigasi utama, identitas RuangDegup, tagline *Ruang Cerita, Ruang Rasa*, dan hero carousel editorial. | ![RuangDegup Homepage](docs/screenshots/homepage.png) |
| **Katalog Buku & Pencarian**<br>Daftar buku lengkap dengan kolom pencarian instan (judul, penulis, ISBN) dan filter kategori. | ![RuangDegup Catalog](docs/screenshots/catalog.png) |
| **Baru Menghiasi Rak**<br>Section koleksi 6 buku fisik terbaru yang siap dipinjam oleh siswa. | ![RuangDegup New Arrivals](docs/screenshots/new-arrivals.png) |
| **Detail Buku & Ulasan Komunitas**<br>Modal detail buku menampilkan cover, sinopsis, penerbit, tahun terbit, ISBN, stok, tombol pinjam, dan ulasan siswa. | ![RuangDegup Book Detail](docs/screenshots/book-detail.png) |

### B. Admin Interface (Petugas Perpustakaan)
| Tampilan | Preview |
| :--- | :--- |
| **Admin Dashboard**<br>Ringkasan metrik perpustakaan (total judul, stok, kategori, anggota, pinjaman aktif, terlambat) dan aksi cepat sirkulasi. | ![Admin Dashboard](docs/screenshots/admin-dashboard.png) |
| **Manajemen Koleksi Buku**<br>Tabel inventaris buku dengan pencarian, filter kategori, informasi stok, serta aksi edit & hapus. | ![Admin Book Management](docs/screenshots/admin-books.png) |
| **Form Tambah / Edit Buku**<br>Modal pengisian metadata buku, stok fisik, sinopsis, dan unggah foto sampul atau tautan URL. | ![Admin Book Form](docs/screenshots/admin-book-form.png) |
| **Manajemen Kategori**<br>Daftar klasifikasi rak kategori beserta jumlah buku terkait pada setiap kategori. | ![Admin Categories](docs/screenshots/admin-categories.png) |
| **Manajemen Anggota Siswa**<br>Data anggota siswa SMKN 6 Surakarta berdasarkan tingkat kelas dan 7 kompetensi keahlian. | ![Admin Members](docs/screenshots/admin-members.png) |
| **Sirkulasi Peminjaman & Pengembalian**<br>Meja transaksi peminjaman manual oleh petugas, tanggal jatuh tempo, dan status pengembalian. | ![Admin Borrowings](docs/screenshots/admin-borrowings.png) |
| **Laporan Sirkulasi & Ekspor PDF**<br>Rekapitulasi transaksi dengan filter status dinamis dan tombol *Unduh Laporan PDF*. | ![Admin Reports](docs/screenshots/admin-reports.png) |
| **Manajemen Kutipan Editorial**<br>Pengelolaan kutipan literasi footer publik dilengkapi sakelar aktivasi (*toggle switch*) instan. | ![Admin Editorial Quotes](docs/screenshots/admin-quotes.png) |

### C. Member Interface (Siswa)
| Tampilan | Preview |
| :--- | :--- |
| **Member Dashboard (Ruang Anggota)**<br>Identitas siswa, nomor anggota digital, kelas, ringkasan statistik sirkulasi, favorit, dan ulasan. | ![Member Dashboard](docs/screenshots/member-dashboard.png) |
| **Peminjaman & Riwayat Transaksi**<br>Daftar buku yang sedang dipinjam maupun riwayat pengembalian yang telah selesai. | ![Member Borrowings](docs/screenshots/member-borrowings.png) |
| **Rak Buku Favorit**<br>Koleksi personal maksimal 4 buku favorit pilihan siswa pada Ruang Anggota. | ![Member Favorites](docs/screenshots/member-favorites.png) |
| **Ulasan & Apresiasi Siswa**<br>Daftar catatan refleksi bacaan dan rating bintang yang ditulis oleh siswa. | ![Member Reviews](docs/screenshots/member-reviews.png) |
| **Profil Siswa & Kartu Anggota Digital**<br>Kartu keanggotaan digital SMKN 6 Surakarta, pengaturan biodata, kontak WhatsApp, bio, avatar, dan cover. | ![Member Profile](docs/screenshots/member-profile.png) |
| **Pengaturan Keamanan & Password**<br>Form pembaruan kata sandi siswa (password lama, baru, dan konfirmasi) dengan enkripsi Bcrypt. | ![Member Password Settings](docs/screenshots/member-password.png) |
