# PiDiEf Converter

PiDiEf Converter adalah utilitas web yang dirancang khusus untuk konversi gambar, manipulasi PDF, dan rendering dokumen ke PDF. Proyek ini dibangun menggunakan Next.js dengan fokus pada keamanan, privasi, dan performa.

**Akses langsung ke aplikasi:** [PiDiEf Converter](https://pidiefconverter.vercel.app)

## Fitur Utama

- Konversi Gambar: Konversi format gambar antara WebP, PNG, dan JPEG tanpa kehilangan kualitas. Proses dilakukan di sisi klien untuk kecepatan maksimal.
- Manipulasi PDF: Pisahkan atau gabungkan file PDF secara instan langsung di dalam browser Anda. File tidak pernah dikirim ke server.
- Dokumen ke PDF: Rendering standar profesional untuk file DOCX, XLSX, dan PPTX menjadi PDF (memerlukan integrasi CloudConvert API).
- Privasi Terjamin: Arsitektur tanpa status (stateless), memastikan file Anda tidak pernah disimpan di server setelah proses selesai.

## Struktur Proyek

Aplikasi ini menggunakan fitur Next.js terbaru (App Router) dan Tailwind CSS, serta komponen antarmuka yang modern.

## Panduan Instalasi

1. Pastikan Anda telah menginstal Node.js di sistem Anda.
2. Instal semua dependensi yang dibutuhkan:
   
   ```bash
   npm install
   ```

3. Konfigurasi Lingkungan (Opsional):
   Jika Anda berencana menggunakan fitur konversi Dokumen (.docx, .xlsx, .pptx) ke PDF, Anda harus menyediakan kunci API CloudConvert.
   
   Buat file bernama `.env.local` di direktori akar proyek, kemudian tambahkan baris berikut:
   
   ```env
   CLOUDCONVERT_API_KEY=kunci_api_anda_di_sini
   CLOUDCONVERT_API_URL=https://sync.api.cloudconvert.com/v2/jobs
   ```

4. Menjalankan Server Pengembangan:
   
   ```bash
   npm run dev
   ```

   Setelah server berjalan, buka tautan `http://localhost:3000` di peramban (browser) Anda.

## Keamanan dan Performa

Platform ini telah melewati proses audit dan implementasi keamanan dasar:
- Proteksi CORS dan CSRF pada rute API.
- Pembatasan laju permintaan (Rate Limiting) untuk mencegah penyalahgunaan API.
- Pengaturan Content Security Policy (CSP) dan header keamanan pendukung.
- Optimalisasi aset dan penghapusan dependensi javascript berat untuk rendering awal halaman (menggunakan animasi CSS murni).

## Hak Cipta dan Lisensi

Dibuat untuk kebutuhan produktivitas.
