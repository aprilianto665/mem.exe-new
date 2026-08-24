# Pomodoro Timer untuk Daily Missions - Implementation Detail

## Konteks & Tujuan
Kita akan menambahkan fitur Pomodoro Timer yang terintegrasi dengan sistem "Daily Mission" yang sudah ada. 
Pomodoro ini berfungsi sebagai "kendaraan" atau mode eksekusi untuk mencatat waktu yang diselesaikan (`minutes_done`) pada entitas `mission_daily_progress`.

**Penting:** Jika preferensi `execution_mode` seorang user di tabel `user_settings` bernilai `pomodoro`, maka interaksi UI pada kartu misi (mission card) akan memunculkan fitur timer ini, bukan fitur centang atau input waktu manual.

## Strategi Utama (Wajib Dibaca)
1. **Cloud-First & Cross-Device Sync:** Agar timer fleksibel dan konsisten digunakan lintas perangkat (misal: mulai di PC, lalu memantau/selesai di HP), *Source of Truth* dari timer harus berada di **Database Backend**, bukan di `localStorage`.
2. **Server-Side Timestamp:** Waktu akhir (`expected_end_time`) harus dihitung di server untuk menghindari manipulasi waktu lokal atau zona waktu yang berbeda antar perangkat. Frontend hanya bertugas membaca selisih waktu tersebut untuk dirender ke UI.
3. **Simplified Mode (No Pause):** Untuk versi awal, tidak ada fitur *Pause*. Jika user harus berhenti lebih awal, mereka cukup menekan tombol Stop, dan durasi waktu yang sudah dilalui akan tetap dikirim ke backend agar progress user tidak hangus.

---

## Tahapan Implementasi

### Tahap 1: Persiapan Database (Backend)
Karena state harus konsisten lintas device, kita perlu tabel baru untuk menyimpan sesi timer yang sedang aktif. Karena user hanya bisa menjalankan 1 timer pada satu waktu, tambahkan model baru ini ke `schema.prisma`:

```prisma
model active_pomodoro_sessions {
  id                      String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id                 String    @unique @db.Uuid
  mission_id              String    @db.Uuid
  phase                   String    @default("focus") // "focus" | "rest"
  start_time              DateTime  @default(now()) @db.Timestamptz(6)
  expected_end_time       DateTime  @db.Timestamptz(6)
  
  users                   users     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  missions                missions  @relation(fields: [mission_id], references: [id], onDelete: Cascade)
}
```

### Tahap 2: Pembuatan API Endpoint Timer (Backend)
Buat modul API khusus untuk mengelola timer (`/api/v1/timer`):
1. **`GET /api/v1/timer/status`**: 
   Mengembalikan data dari `active_pomodoro_sessions` milik user yang sedang login. Dipanggil oleh frontend saat aplikasi pertama kali dimuat di device manapun.
2. **`POST /api/v1/timer/start`**: 
   Menerima `mission_id`. Menghapus sesi lama (jika ada), lalu membuat baris baru di `active_pomodoro_sessions` dengan `expected_end_time = server_now + focus_minutes`.
3. **`POST /api/v1/timer/action`**: 
   Menerima payload `{ action: 'stop_early' | 'finish_phase' }`.
   - **`finish_phase` (Sesi selesai):** Tambahkan `minutes_done` ke `mission_daily_progress`. Ubah `phase` ke `rest` dan set `expected_end_time` baru untuk masa istirahat.
   - **`stop_early` (Menyerah):** Kalkulasi waktu yang sudah dilalui sejak `start_time`, tambahkan pembulatannya ke `mission_daily_progress`, lalu hapus record tersebut dari `active_pomodoro_sessions`.

### Tahap 3: Persiapan Global State (Frontend)
Buat *global state* (seperti Zustand) yang akan menjadi cermin (mirror) dari API backend.
*   Frontend **tidak** lagi menyimpan state permanen di `localStorage`, melainkan me-render berdasarkan API.
*   Gunakan library *data fetching* seperti `SWR` atau `React Query` dengan fitur **polling** (misal: setiap 5 atau 10 detik) pada endpoint `GET /api/v1/timer/status`. 
*   **Keuntungan:** Jika timer dihentikan melalui Handphone, saat polling berikutnya terjadi di PC, UI PC akan otomatis ikut berhenti (sesi hilang dari server). Sinkronisasi sempurna.

### Tahap 4: Pembuatan UI Komponen Timer (Frontend)
Desain UI Pomodoro akan menggunakan pola **Expandable Mission Card** agar terintegrasi mulus dengan daftar tugas (*Missions*).

**Desain Layout (Expandable Card):**
1. **Kondisi Default (Collapsed):**
   - Pada kartu misi, tampilkan judul dan *Progress Bar* total waktu hari ini (`minutes_done` / `required_minutes`).
   - Tombol eksekusi hanya menggunakan **Icon** (misal: ikon `▶ Play`), tanpa teks "Start Focus".
2. **Kondisi Aktif (Expanded):**
   - Saat ikon `▶ Play` diklik, kartu memanjang ke bawah. Area bawah ini merender komponen Timer.
   - **Dual-Tone Progress Bar:** *Progress bar* utama misi menunjukkan 2 warna: warna *solid* untuk waktu yang sudah tersimpan (`minutes_done`), dan warna *bergaris/animasi* untuk porsi waktu Pomodoro yang sedang berjalan saat ini. Ini membantu user melihat proyeksi targetnya.
   - **Tampilan Timer:** Angka hitung mundur yang besar dan mencolok di tengah (misal: **24:59**).
   - **Tombol Berhenti:** Sebuah tombol **Icon** (misal: ikon `■ Stop`), tanpa teks. Di bawah ikon ini, letakkan teks pembantu abu-abu kecil: *"Menghentikan lebih awal tetap akan menyimpan progress Anda"*.
3. **Kondisi Istirahat (Rest Mode):**
   - Transisi otomatis terjadi ketika sesi fokus (Timer) menyentuh 00:00. Kartu **tetap dalam keadaan memanjang (expanded)**.
   - **Perubahan Visual:** Angka timer berubah warna (misal dari jingga/merah menjadi biru/hijau tenang). *Progress bar* utama berhenti beranimasi (karena waktu istirahat tidak dihitung ke `minutes_done`).
   - **Teks Bantuan:** Menampilkan teks *"Waktu Istirahat. Rileks sejenak!"*
   - **Tombol Aksi:** Ikon berubah menjadi ikon **`⏭ Skip`** (Lompati). Menekan tombol ini akan mengakhiri istirahat lebih awal.
   - Setelah waktu istirahat habis (menyentuh 00:00), kartu akan **otomatis menutup (collapse)** kembali ke kondisi default, menandakan 1 siklus usai.

**Logic Rendering (The Tick):**
*   State global menampung `expected_end_time` dari response server.
*   Gunakan `setInterval` di dalam `useEffect` yang berjalan setiap 1 detik.
*   Tugas interval ini HANYA untuk menghitung sisa waktu untuk UI: `timeLeft = expected_end_time - Date.now()`.
*   Jika `timeLeft <= 0` pada *phase* `focus`, putar suara alarm lalu otomatis panggil API `POST /api/v1/timer/action` dengan action `finish_phase` (API mengubah status ke `rest` dan memberikan `expected_end_time` baru).
*   Jika `timeLeft <= 0` pada *phase* `rest`, putar suara rileks lalu hapus sesi dari global state dan backend (kartu otomatis menutup/*collapse*).
*   Jika ikon `■ Stop` (saat fokus) atau `⏭ Skip` (saat istirahat) diklik, panggil API action `stop_early`. *(Sangat disarankan: Saat menekan tombol, frontend memunculkan efek loading/disabled sementara).*

### Tahap 5: Penanganan Edge Cases Penting
1. **Network Latency (Jeda Jaringan):** Karena interaksi tombol menembak API (butuh sekian milidetik), gunakan pola *Optimistic UI Updates* pada frontend. Saat user klik Stop Pomodoro, langsung hentikan dan hilangkan timer di layar secara instan, sembari request API berjalan di *background*.
2. **Kompensasi Waktu Server vs Klien:** Jam di device klien bisa sedikit meleset dari jam server. Sebaiknya hitung *offset* (selisih) waktu antara klien dan server saat pertama kali fetch `/status`, lalu terapkan selisih tersebut pada kalkulasi `Date.now() + offset` di interval frontend.
3. **Proteksi Pergantian Mode (Validation):** Tambahkan validasi keamanan di backend pada API Update User Settings (`PATCH /api/users/settings`). Jika user mencoba mengganti `execution_mode`, backend WAJIB mengecek apakah user tersebut masih memiliki *record* di tabel `active_pomodoro_sessions`. Jika ada (berarti timer masih berjalan), tolak request tersebut dengan error: `"Selesaikan atau hentikan timer Anda yang sedang berjalan terlebih dahulu"`. Di sisi UI (halaman Settings), *disable* opsi pergantian mode tersebut jika timer terpantau sedang aktif.

---
**Catatan untuk Eksekutor (Programmer / AI):**
Harap baca skema `prisma/schema.prisma` dan lakukan migrasi (`npx prisma migrate dev` atau `npx prisma db push`) setelah menambahkan model `active_pomodoro_sessions`. Jangan lupa untuk meregistrasikan tipe model baru ini di frontend. Gunakan TypeScript interfaces/types yang sudah didefinisikan sebelumnya di `/src/types/`.
