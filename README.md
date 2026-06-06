# GymnaScore 🏆

**GymnaScore** adalah platform digital manajemen kompetisi dan penilaian olahraga senam (gymnastics) yang responsif, dinamis, dan terintegrasi secara real-time. Platform ini memfasilitasi seluruh alur kompetisi mulai dari administrasi panitia, penilaian juri multi-panel, hingga dashboard publik dan layanan mandiri bagi peserta.

---

## 🚀 Fitur Utama & Arsitektur Peran

Aplikasi ini dibagi menjadi beberapa modul peran khusus (Multi-Role Portal) dengan hak akses yang terisolasi dan aman:

### 1. 🏅 Portal Peserta (Layanan Mandiri)
- **Login Akun Individu**: Setiap atlet/peserta memiliki akun login masing-masing (contoh: username `abiyu`, `rifda`, `fajar` dengan kata sandi `peserta123`).
- **Unduh E-Sertifikat Kepesertaan (.pdf)**: Peserta dapat mengunduh E-Sertifikat partisipasi resmi secara instan. Nama peserta langsung tersemat secara otomatis pada sertifikat sesuai template dinamis yang dikonfigurasi panitia.
- **Unduh Klasemen Keseluruhan**: Dapat mengunduh buku klasemen terpadu dalam dua format:
  - **spreadsheet Excel (.xlsx)**
  - **Dokumen cetak (.pdf)**
- **Proteksi Data Nilai**: Peserta hanya dapat mengamati papan peringkat akumulatif dan klasemen keseluruhan, serta tidak diberikan akses untuk mengunduh rincian detail nilai per peserta lainnya guna menjaga sportivitas dan kerahasiaan penilaian internal.

### 2. 🎚️ Portal Panitia (Manajemen GOR & Event)
- **Registrasi Atlet**: Pendaftaran atlet baru dengan input nama, unit klub, kategori umur, dan jenis kelamin.
- **Kondisi Alat & Arena**: Mengatur status ketersediaan alat tanding secara live.
- **E-Certificate Builder**: Manajemen penyesuaian desain templat sertifikat (judul, teks penjelasan, penandatangan, posisi jabatan, tanggal penyerahan) yang otomatis tersimpan ke dalam sistem memori lokal untuk langsung dirender ke sertifikat peserta.

### 3. ⚖️ Portal Juri (Sistem Penulisan Skor Modular)
Sesuai regulasi federasi senam nasional/internasional, panel juri dibagi demi objektivitas:
- **Juri D (Difficulty)**: Memasukkan nilai kesulitan gerakan atlet.
- **Juri E (Execution)**: Menilai kualitas eksekusi gerakan atlet dengan sistem pengurangan nilai dari standard awal.
- **Juri Neutral (Line & Penalty)**: Memasukkan penalti administratif seperti keluar garis (out of bounds) atau pelanggaran durasi.

### 4. 🔑 Portal Superadmin
- Memiliki kontrol penuh untuk mereset seluruh database papan nilai, atlet, penjenjangan, serta hak akses akun di sistem.

---

## 🛠️ Teknologi & Pustaka Pendukung
Aplikasi dibangun dengan menggunakan arsitektur modern:
- **React.js & TypeScript** — Konsistensi kode berorientasi static-typing tinggi.
- **Tailwind CSS** — Antarmuka pengguna modern dengan desain bento-grid, kontras visual tinggi, dan tipografi elegan.
- **jsPDF** — Handler tangguh untuk merender dan mengekspor dokumen sertifikat digital dan berkas buku klasemen ke `.pdf` langsung di sisi klien.
- **SheetJS (XLSX)** — Library untuk mengekspor data klasemen real-time ke dalam file spreadsheet Excel `.xlsx`.
- **Lucide React** — Set ikon minimalis beresolusi tajam sesuai standar desain modern.

---

## 💻 Panduan Menjalankan Aplikasi secara Lokal (LAN Setup)

Aplikasi ini sangat cocok digunakan di lokasi pertandingan langsung menggunakan laptop server lokal yang dihubungkan ke WiFi yang sama dengan HP/Tablet Juri dan Peserta.

Untuk petunjuk penyiapan jaringan lokal, silakan buka dan ikuti langkah-langkah di berkas penjelasan khusus:
👉 **[PANDUAN_LOKAL.md](./PANDUAN_LOKAL.md)**

---

## 📝 Akun Pengujian Standard (Demo Accounts)

Untuk melakukan evaluasi fitur, Anda dapat menggunakan daftar kredensial berikut:

| Peran | Username | Password | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `superadmin` | `superadmin123` | Portal Konfigurasi Utama |
| **Panitia** | `panitia` | `panitia123` | Manajemen Pendaftaran & Templat Sertifikat |
| **Peserta** (Abiyu Rafi) | `abiyu` | `peserta123` | Unduh Sertifikat & Klasemen (.pdf/.xlsx) |
| **Peserta** (Rifda I.) | `rifda` | `peserta123` | Unduh Sertifikat & Klasemen (.pdf/.xlsx) |
| **Juri Panel D** | `jurid` | `juriD123` | Input Nilai Kesulitan (Difficulty) |
| **Juri Panel E** | `jurie` | `juriE123` | Input Nilai Kerapian Eksekusi |
| **Juri Neutral** | `jurin` | `juriN123` | Input Potongan Penalti Administratif |

---
*Dikembangkan dengan penuh dedikasi untuk mendukung kemajuan sistem keolahragaan senam Indonesia.*
