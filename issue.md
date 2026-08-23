# Issue: Sembunyikan tombol Edit dan Delete saat status mission Completed atau Canceled

## Deskripsi Masalah
Berdasarkan screenshot yang diberikan, pada halaman detail mission, tombol **Edit** dan **Delete** masih terlihat dan dapat diakses meskipun status mission tersebut sudah `COMPLETED` atau `CANCELED`. 

Sesuai dengan alur aplikasi yang benar, apabila sebuah mission sudah selesai (`completed`) atau dibatalkan (`canceled`), data tersebut seharusnya menjadi riwayat (history) dan tidak boleh diubah maupun dihapus lagi. Oleh karena itu, kedua tombol tersebut seharusnya disembunyikan.

## Lokasi File yang Perlu Diperbaiki
`src/views/Settings/MissionDetail.tsx`

## Tahapan Implementasi
*(Panduan untuk Junior Programmer / AI Agent yang akan mengerjakan issue ini)*

1. **Buka file target**
   Buka file `src/views/Settings/MissionDetail.tsx` di text editor atau IDE Anda.

2. **Cari komponen tombol action**
   Scroll ke bagian bawah kode render (sekitar baris ke 418+), temukan bagian kode yang memiliki komentar `{/* Actions */}`. Kode ini merupakan sebuah `div` (dengan class `flex gap-2 pt-2`) yang membungkus komponen `<Button>` untuk "Edit" dan "Delete".

3. **Bungkus dengan Conditional Rendering**
   Anda perlu menambahkan pengecekan kondisi (`conditional rendering`) menggunakan status dari mission. Sesuai dengan tipe data di `src/types/mission.types.ts`, nilai status yang mungkin adalah `'draft' | 'active' | 'completed' | 'canceled'`.
   
   Buat agar elemen pembungkus tombol action tersebut HANYA dirender jika `mission.status` **bukan** `'completed'` dan **bukan** `'canceled'`.

4. **Contoh Perubahan Kode**

   **Kondisi Awal (Sebelum):**
   ```tsx
   {/* Actions */}
   <div className="flex gap-2 pt-2">
     <Button
       className="flex-1 bg-[#7DB8E0] hover:bg-[#6BA7CF]"
       type="button"
       aria-label="Edit mission"
       onClick={handleEdit}
     >
       <PencilIcon strokeWidth={2} className="w-5 h-5" />
       <span>Edit</span>
     </Button>
     <Button
       className="flex-1 bg-[#FF6467] hover:bg-[#E5555A]"
       type="button"
       aria-label="Delete mission"
       onClick={handleDelete}
     >
       <TrashIcon strokeWidth={2} className="w-5 h-5" />
       <span>Delete</span>
     </Button>
   </div>
   ```

   **Kondisi Akhir (Sesudah diperbaiki):**
   ```tsx
   {/* Actions */}
   {mission.status !== 'completed' && mission.status !== 'canceled' && (
     <div className="flex gap-2 pt-2">
       <Button
         className="flex-1 bg-[#7DB8E0] hover:bg-[#6BA7CF]"
         type="button"
         aria-label="Edit mission"
         onClick={handleEdit}
       >
         <PencilIcon strokeWidth={2} className="w-5 h-5" />
         <span>Edit</span>
       </Button>
       <Button
         className="flex-1 bg-[#FF6467] hover:bg-[#E5555A]"
         type="button"
         aria-label="Delete mission"
         onClick={handleDelete}
       >
         <TrashIcon strokeWidth={2} className="w-5 h-5" />
         <span>Delete</span>
       </Button>
     </div>
   )}
   ```

5. **Verifikasi Perbaikan**
   - Simpan file yang telah diubah.
   - Buka aplikasi di browser (biasanya berjalan di `http://localhost:3000`).
   - Cek halaman detail mission untuk mission yang statusnya masih aktif, pastikan tombol Edit dan Delete **masih muncul**.
   - Cek halaman detail mission untuk mission yang statusnya sudah `Completed` atau `Canceled` (seperti "Belajar Basic Godot 4 Engine" dan "Belajar Bahasa Jepang" pada screenshot), pastikan tombol Edit dan Delete **sudah tidak muncul**.
