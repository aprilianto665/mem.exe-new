# Feature Request: Sistem Sub-Quest (Pemecahan Milestone) untuk Lifetime Objectives

## 🎯 Deskripsi
"Lifetime Objectives" seringkali merupakan tujuan yang sangat masif dan membutuhkan waktu lama untuk diselesaikan. Agar pengguna tidak kehilangan motivasi, kita perlu menambahkan fitur untuk memecah objektif besar ini menjadi **Sub-Tasks** berjenjang, mirip dengan *quest lines* di game MMO. 

**Contoh Kasus:**
Jika Lifetime Objective-nya adalah "Lulus Ujian JFT A2", pengguna bisa menambahkan sub-tasks seperti:
- [x] Selesaikan modul tata bahasa
- [ ] Hafal 50 Kanji pertama
- [ ] Simulasi ujian

Dengan adanya fitur ini, kita bisa menampilkan **Progress Bar (Persentase)** pada kartu objektif. Hal ini akan memberikan *sense of achievement* dan memvisualisasikan progres secara bertahap, jauh sebelum objektif utamanya sendiri dicentang selesai.

---

## 🛠️ Tahapan Implementasi
*(Panduan ini disusun secara terstruktur langkah demi langkah. Silakan ikuti urutan fase berikut untuk mengimplementasikan fitur ini)*

### Phase 1: Pembaruan Skema Database (Data Layer)
Pertama, kita perlu tempat untuk menyimpan data sub-tasks ini agar tersimpan permanen.
1. **Buka file skema database** (misalnya `schema.prisma` jika project ini menggunakan Prisma ORM, atau file skema database yang relevan).
2. **Buat model/tabel baru** bernama `SubObjective` (atau `SubQuest`).
3. **Definisikan field berikut di dalam model tersebut:**
   - `id`: Tipe data ID / UUID (Primary key).
   - `title`: Tipe data String (Untuk menyimpan nama sub-task).
   - `isCompleted`: Tipe data Boolean (Status selesai/belum, berikan nilai default: `false`).
   - `objectiveId`: Foreign key yang menghubungkan sub-task ini ke tabel `Objective` utama.
   - `createdAt` & `updatedAt`: Tipe data DateTime (untuk tracking waktu).
4. **Tambahkan relasi:** Pastikan di model `Objective` utama ditambahkan relasi *one-to-many* ke `SubObjective`.
5. **Jalankan migrasi database** (contoh command: `npx prisma db push` atau `npx prisma migrate dev`) agar tabel baru benar-benar terbuat di database.

### Phase 2: Pembuatan API Endpoint / Server Actions (Logic Layer)
Selanjutnya, buat fungsi-fungsi di backend untuk membaca dan mengubah data sub-tasks tersebut.
1. **Create:** Buat fungsi `createSubObjective(objectiveId, title)` yang menerima ID objektif dan judul sub-task, lalu menyimpannya ke database.
2. **Toggle Status:** Buat fungsi `toggleSubObjective(subObjectiveId, isCompleted)` untuk mengubah status centang (dari false ke true, atau sebaliknya).
3. **Delete:** Buat fungsi `deleteSubObjective(subObjectiveId)` agar pengguna bisa menghapus sub-task jika terjadi kesalahan input.
4. **Fetch:** Modifikasi query yang bertugas mengambil daftar "Ongoing Objectives". Pastikan query tersebut sekarang juga melakukan *join/include* data `SubObjective` agar frontend menerima data lengkap objektif beserta anak-anak sub-tasknya.

### Phase 3: Perhitungan Progress (Business Logic)
Buat logika sederhana untuk menghitung berapa persen progres dari sebuah objektif berdasarkan sub-task yang selesai.
1. **Rumus Dasar:** `Persentase = (Jumlah Sub-task yang isCompleted == true / Total Jumlah Sub-task) * 100`.
2. **Edge case (Penting):** Jika sebuah Objective *tidak memiliki* sub-task sama sekali, maka progress bar tidak perlu ditampilkan, atau persentasenya dikembalikan 0% (jika belum selesai) dan 100% (jika dicentang selesai). Hati-hati dengan error *pembagian dengan nol (division by zero)*.

### Phase 4: Pembaruan UI/Frontend (Presentation Layer)
Terakhir, tampilkan data dan fungsi yang sudah dibuat ke antarmuka pengguna (UI).
1. **Komponen Form Tambah:** Di halaman detail atau saat pengguna mengklik sebuah Objective, tambahkan input text sederhana dengan tombol "+" di bawahnya untuk menambah sub-task baru.
2. **Daftar Sub-Tasks:** Render daftar sub-task menggunakan komponen *Checkbox*. Jika checkbox diklik, panggil fungsi `toggleSubObjective` dari Phase 2.
3. **Indikator Progres di Card:** Pada halaman utama (seperti pada menu "Missions"), tambahkan komponen visual `ProgressBar` (bar horizontal kecil) di dalam setiap kartu Objective. Gunakan hasil persentase dari Phase 3 untuk menentukan panjang/lebar warna bar tersebut.

---
**💡 Catatan Penting untuk Implementator:** 
Kerjakan secara berurutan mulai dari Phase 1 hingga Phase 4. Sangat disarankan untuk melakukan pengujian manual kecil-kecilan di setiap akhir fase (misal: cek database GUI setelah Phase 1, coba jalankan fungsi backend di terminal setelah Phase 2) sebelum melangkah ke penulisan kode UI di fase selanjutnya.
