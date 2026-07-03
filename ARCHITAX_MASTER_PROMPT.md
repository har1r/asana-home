# MASTER PROMPT — Implementasi Sistem Architax
## PRD v2.9 Final | Sistem Pengarsipan PBB (Sipetra)

> **Instruksi untuk AI:** Baca seluruh prompt ini secara menyeluruh sebelum menulis satu baris kode pun. Prompt ini adalah satu-satunya sumber kebenaran. Setiap keputusan implementasi harus dapat ditelusuri kembali ke salah satu bagian di sini.

---

## BAGIAN 0 — PRINSIP EKSEKUSI

1. **Jangan berasumsi.** Jika ada ambiguitas yang tidak tercakup dokumen ini, tanyakan sebelum implementasi.
2. **Jangan skip.** Semua bagian wajib diimplementasikan, termasuk edge case, audit log, notifikasi, dan cron job.
3. **Strict State Machine adalah hukum.** Tidak ada satu pun transisi status yang boleh melewati lebih dari satu langkah tanpa rangkaian atomik.
4. **Validasi berlapis.** Setiap aksi divalidasi di sisi server (Zod + Prisma), bukan hanya di UI.
5. **Hard Delete dilarang mutlak** pada entitas `Permohonan` dan `ArsipDigital` dalam kondisi apapun.

---

## BAGIAN 1 — TECH STACK (TIDAK BOLEH DIGANTI)

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14+ (App Router wajib — Pages Router dilarang) |
| Bahasa | TypeScript strict mode (`"strict": true` di tsconfig.json) |
| Styling | Tailwind CSS + CSS Module |
| Database | MongoDB (hosted di MongoDB Atlas) |
| ORM | Prisma (satu-satunya cara akses database) |
| API | REST via Route Handlers (endpoint eksternal) + Server Actions (mutasi UI) |
| Auth | NextAuth.js — Credentials Provider — strategi JWT (no session DB) |
| File Storage | Vercel Blob (PDF arsip + bukti tanda terima) |
| State | React Server Components + Client Components (minimalisasi client) |
| Validasi | Zod + React Hook Form + `@hookform/resolvers` |
| Cron | Vercel Cron |
| Validasi File | `file-type` (wajib di server saat terima upload) |
| PDF Generator | `@react-pdf/renderer` |
| Notif WA | Fonnte API (`https://api.fonnte.com/send`) |

---

## BAGIAN 2 — KONVENSI PENAMAAN (WAJIB KONSISTEN)

| Konteks | Konvensi | Contoh |
|---|---|---|
| File & Folder | kebab-case | `bundle-list.tsx`, `create-manifest/` |
| Komponen React | PascalCase | `BundleCard`, `ManifestTable` |
| Fungsi & Variabel | camelCase | `getBundleById`, `isLocked` |
| Tipe/Interface TS | PascalCase dengan prefix `T` atau `I` | `TPermohonan`, `IUserSession` |
| Konstanta Global | SCREAMING_SNAKE_CASE | `MAX_BUNDLE_CAPACITY` |
| API Route | kebab-case | `/api/permohonan/[id]/revisi` |
| Kolom DB (Prisma) | camelCase | `bundleId`, `manifestId`, `createdAt` |
| Enum Prisma | SCREAMING_SNAKE_CASE | `SUBMITTED`, `IN_MANIFEST` |

---

## BAGIAN 3 — SKEMA DATABASE (PRISMA — MONGODB)

Implementasikan skema Prisma berikut secara lengkap. Jangan ada field yang terlewat.

### 3.1 Enum

```prisma
enum UserRole {
  PENGINPUT
  PENELITI
  PENGARSIP
  PENGIRIM
  PEMANTAU
  SUPERVISOR
}

enum JenisPermohonan {
  MUTASI_SEBAGIAN
  MUTASI_HABIS_UPDATE
  MUTASI_HABIS_REGULER
  OBJEK_PAJAK_BARU
  PEMBETULAN
  PENGAKTIFAN
}

enum StatusPermohonan {
  SUBMITTED
  REVISION
  BUNDLED
  ARCHIVED
  COMPLETED
  REJECTED
}

enum StatusBundle {
  DRAFT
  LOCKED
  IN_MANIFEST
  VOID
}

enum StatusManifest {
  DRAFT
  LOCKED
  SENT
}

enum StatusArsipDigital {
  ACTIVE
  SUPERSEDED
  INVALIDATED
}

enum StatusKoreksi {
  PENDING_APPROVAL
  APPROVED
  REJECTED
}
```

### 3.2 Model User

```prisma
model User {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 3.3 Model Permohonan & DataBaru

```prisma
model Permohonan {
  id               String           @id @default(auto()) @map("_id") @db.ObjectId
  nomorPermohonan  String           @unique
  jenisPermohonan  JenisPermohonan
  status           StatusPermohonan @default(SUBMITTED)
  bundleId         String?          @db.ObjectId
  
  // Data wajib pajak (namaWajibPajak dan alamat sebagai derived fields)
  namaWajibPajak   String
  nop              String
  noWhatsapp       String           // wajib, format 08xxx atau 628xxx
  alamat           String
  nomorPelayanan   String

  // Data Lama
  namaPemilikLama      String?
  alamatPemilikLama    String?
  kecamatanPemilikLama String?
  desaPemilikLama      String?
  alamatObjekLama      String?
  kecamatanObjekLama   String?
  desaObjekLama        String?
  luasTanahLama        Float?
  luasBangunanLama     Float?
  sertifikatLama       String?

  // Data Baru (One-to-Many)
  dataBaru             DataBaru[]
  
  // Relasi
  penginputId      String           @db.ObjectId
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  arsipDigital     ArsipDigital[]
  bundle           Bundle?          @relation(fields: [bundleId], references: [id])
  penginput        User             @relation(fields: [penginputId], references: [id])
}

model DataBaru {
  id                   String     @id @default(auto()) @map("_id") @db.ObjectId
  permohonanId         String     @db.ObjectId
  namaPemilikBaru      String
  alamatPemilikBaru    String
  kecamatanPemilikBaru String
  desaPemilikBaru      String
  alamatObjekBaru      String
  kecamatanObjekBaru   String
  desaObjekBaru        String
  luasTanahBaru        Float
  luasBangunanBaru     Float
  sertifikatBaru       String
  
  permohonan           Permohonan @relation(fields: [permohonanId], references: [id], onDelete: Cascade)
}
```

### 3.4 Model Bundle

```prisma
model Bundle {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  nomorBundle     String       @unique
  status          StatusBundle @default(DRAFT)
  manifestId      String?      @db.ObjectId
  jenisPermohonan JenisPermohonan? // terkunci setelah Permohonan pertama dimasukkan
  
  penelitiId      String       @db.ObjectId
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  permohonan      Permohonan[]
  manifest        Manifest?    @relation(fields: [manifestId], references: [id])
  peneliti        User         @relation(fields: [penelitiId], references: [id])
}
```

### 3.5 Model Manifest

```prisma
model Manifest {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  nomorManifest  String         @unique
  status         StatusManifest @default(DRAFT)
  buktiTandaTerima String?      // URL Vercel Blob
  
  pengirimId     String         @db.ObjectId
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  
  bundle         Bundle[]
  pengirim       User           @relation(fields: [pengirimId], references: [id])
}
```

### 3.6 Model ArsipDigital

```prisma
model ArsipDigital {
  id            String             @id @default(auto()) @map("_id") @db.ObjectId
  permohonanId  String             @db.ObjectId
  urlBlob       String             // URL file di Vercel Blob
  status        StatusArsipDigital @default(ACTIVE)
  versi         Int                // nomor versi (increment per upload)
  
  pengarsipId   String             @db.ObjectId
  createdAt     DateTime           @default(now())
  
  permohonan    Permohonan         @relation(fields: [permohonanId], references: [id])
  pengarsip     User               @relation(fields: [pengarsipId], references: [id])
}
```

### 3.7 Model PermintaanKoreksi

```prisma
model PermintaanKoreksi {
  id               String        @id @default(auto()) @map("_id") @db.ObjectId
  permohonanId     String        @db.ObjectId
  jenisKoreksi     String        // e.g. "KELUARKAN_DARI_BUNDLE", "KEMBALIKAN_KE_PENELITI", dll.
  status           StatusKoreksi @default(PENDING_APPROVAL)
  
  pengajuId        String        @db.ObjectId
  supervisorId     String?       @db.ObjectId
  catatanPengaju   String
  catatanSupervisor String?
  
  reminderSentAt   DateTime?     // WAJIB ada — untuk cron timeout 72 jam
  escalationSentAt DateTime?     // WAJIB ada — untuk cron timeout 168 jam
  
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  diputuskanAt     DateTime?
}
```

### 3.8 Model InAppNotification

```prisma
model InAppNotification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  judul       String
  pesan       String
  isRead      Boolean  @default(false)
  metadata    Json?    // data tambahan (idPermohonan, idBundle, dll.)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}
```

### 3.9 Model AuditLog

```prisma
model AuditLog {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  entityType      String   // "PERMOHONAN", "BUNDLE", "MANIFEST", "CRON"
  entityId        String?  @db.ObjectId
  aksi            String   // deskripsi aksi
  statusSebelum   String?
  statusSesudah   String?
  pelakuId        String?  @db.ObjectId
  correlationId   String?  // mengikat transisi atomik multi-langkah
  metadata        Json?    // data tambahan sesuai jenis aksi
  createdAt       DateTime @default(now())
}
```

---

## BAGIAN 4 — AUTENTIKASI (NEXTAUTH.JS)

- Provider: **Credentials** (email + password)
- Strategi sesi: **JWT** (tidak ada session database)
- Payload JWT wajib memuat: `id`, `name`, `email`, `role`
- Seluruh route dilindungi middleware yang memvalidasi JWT dan `role`
- Implementasikan helper `getServerSession()` untuk digunakan di Server Actions dan Route Handlers
- Password disimpan sebagai hash (gunakan `bcryptjs`)

---

## BAGIAN 5 — ALUR KERJA UTAMA (HAPPY PATH)

Implementasikan 5 fase berikut secara berurutan:

### FASE 1 — Penerimaan Data (`PENGINPUT`)

**Titik masuk sistem.**

**Struktur Form & Validasi (3 Bagian):**
1. **Data Utama**:
   - `jenisPermohonan`: enum `JenisPermohonan`
   - `nomorPelayanan`: string, tidak kosong
   - `nop`: string, tepat 18 digit angka
   - `noWhatsapp`: string, format `08xxx` atau `628xxx`
2. **Data Lama**:
   - `namaPemilikLama`, `alamatPemilikLama`, `kecamatanPemilikLama`, `desaPemilikLama`, `alamatObjekLama`, `kecamatanObjekLama`, `desaObjekLama`, `luasTanahLama` (number >= 0), `luasBangunanLama` (number >= 0), `sertifikatLama`
   - **Wajib diisi** untuk: `MUTASI_SEBAGIAN`, `MUTASI_HABIS_UPDATE`, `MUTASI_HABIS_REGULER`, `PEMBETULAN`, `PENGAKTIFAN`.
   - **Opsional/Diabaikan** untuk: `OBJEK_PAJAK_BARU`.
3. **Data Baru**:
   - `namaPemilikBaru`, `alamatPemilikBaru`, `kecamatanPemilikBaru`, `desaPemilikBaru`, `alamatObjekBaru`, `kecamatanObjekBaru`, `desaObjekBaru`, `luasTanahBaru` (number >= 0), `luasBangunanBaru` (number >= 0), `sertifikatBaru`
   - **Wajib diisi** untuk: `MUTASI_SEBAGIAN`, `MUTASI_HABIS_UPDATE`, `MUTASI_HABIS_REGULER`, `PEMBETULAN`, `OBJEK_PAJAK_BARU`.
   - **Opsional/Diabaikan** untuk: `PENGAKTIFAN`.
   - **Mutasi Sebagian**: Mendukung banyak pemilik baru sekaligus (tidak terbatas).
   - **Jenis lainnya**: Tepat 1 pemilik baru.

*Catatan Backwards Compatibility: Kolom `namaWajibPajak` dan `alamat` pada tabel `Permohonan` diisi secara otomatis (derived fields) menggunakan data dari pemilik baru pertama (jika ada), atau pemilik lama (jika pemilik baru kosong).*

**Setelah simpan:**
- Permohonan → `SUBMITTED`
- Kirim **notifikasi WhatsApp** via Fonnte API ke `noWhatsapp` wajib pajak:
  > *"Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah berhasil diterima dan sedang dalam proses verifikasi."*

**Fitur tambahan Penginput:**
- **"Update Data"**: hanya aktif jika status = `SUBMITTED` DAN `bundleId` = `null`, ATAU status = `REVISION`. Jika kondisi tidak terpenuhi, tombol dikunci.
- **"Resubmit"**: tombol terpisah yang muncul hanya saat status = `REVISION`. Ketika ditekan:
  - Transisi: `REVISION` → `SUBMITTED`
  - Kirim **In-App Notification** ke **seluruh User dengan role `PENELITI` yang `isActive = true`** (tidak bergantung status login)
  - Kirim **notifikasi WhatsApp** ke wajib pajak:
    > *"Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah berhasil diterima dan sedang dalam proses verifikasi."*
  - Tombol "Resubmit" adalah aksi eksplisit terpisah dari tombol "Simpan" — **tidak dipicu otomatis saat Penginput menekan simpan**

---

### FASE 2 — Verifikasi & Pengelompokan (`PENELITI`)

**Prasyarat:** Ada minimal 1 Permohonan `SUBMITTED`.

**Alur:**
1. Peneliti membuat Bundle baru → status `DRAFT`
2. Peneliti memasukkan Permohonan ke Bundle:
   - **Validasi server — Bundle Homogen:** `jenisPermohonan` Permohonan yang dimasukkan HARUS sama dengan `jenisPermohonan` Bundle. Jika Bundle masih kosong, `jenisPermohonan` pertama yang dimasukkan menjadi jenis terkunci Bundle. Jika gagal validasi, kembalikan error yang menyebutkan jenis yang diizinkan.
   - Status Permohonan → `BUNDLED`, `bundleId` terisi
   - Bungkus dalam Prisma `$transaction` (mencegah race condition)
3. Untuk Permohonan `MUTASI_SEBAGIAN`: cetak **Kertas Kerja** (`@react-pdf/renderer`)
4. Cetak **Surat Pengantar Bundle** (`@react-pdf/renderer`)
5. Peneliti mengunci Bundle → status `LOCKED`
   - Kirim **In-App Notification** ke seluruh User `PENGARSIP` yang aktif

---

### FASE 3 — Digitalisasi (`PENGARSIP`)

**Prasyarat:** Ada Bundle `LOCKED`.

**Alur per Permohonan dalam Bundle:**
1. Pengarsip upload PDF hasil scan
2. Server validasi tipe file menggunakan `file-type` (wajib PDF)
3. Batasi ukuran ≤ 20 MB
4. Upload ke Vercel Blob → simpan URL
5. Buat entri `ArsipDigital` dengan status `ACTIVE`, versi increment
6. Permohonan → `ARCHIVED`

**Aturan versioning:**
- Satu Permohonan bisa memiliki berapapun riwayat versi ArsipDigital (tidak ada batas maksimum)
- Hanya satu yang berstatus `ACTIVE` pada satu waktu
- File di Vercel Blob tidak pernah dihapus

---

### FASE 4 — Logistik (`PENGIRIM`)

**Prasyarat per Bundle:** SELURUH Permohonan dalam Bundle harus `ARCHIVED`. Validasi dilakukan per Bundle di sisi server — Bundle yang masih memiliki Permohonan `BUNDLED` dilarang masuk Manifest.

**Alur:**
1. Pengirim buat Manifest baru → `DRAFT`
2. Masukkan satu atau lebih Bundle (yang lolos validasi) → Bundle → `IN_MANIFEST`, `manifestId` Bundle terisi
3. Cetak **Surat Pengantar Manifest** (`@react-pdf/renderer`)
4. Kunci Manifest → `LOCKED`
5. Upload Bukti Tanda Terima (PDF/JPG/PNG, validasi `file-type`) setelah fisik tiba → Manifest → `SENT`
   - Kirim **In-App Notification** ke seluruh User `PEMANTAU` yang aktif
   - Kirim **notifikasi WhatsApp** ke SELURUH wajib pajak yang Permohonannya ada dalam Manifest tersebut:
     > *"Berkas Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah dikirimkan ke kantor pusat untuk diproses."*

---

### FASE 5 — Pemantauan (`PEMANTAU`)

**Prasyarat:** Ada Permohonan `ARCHIVED` yang Manifestnya `SENT`.

**Alur:**
1. Pemantau melihat daftar Permohonan yang siap ditandai selesai
2. Pemantau tandai Permohonan → `COMPLETED`
3. Kirim **notifikasi WhatsApp** ke wajib pajak:
   > *"Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah selesai diproses. Produk layanan dapat segera diambil."*

---

## BAGIAN 6 — ALUR KOREKSI (CORRECTIVE FLOWS)

### Prinsip Umum Koreksi

**Strict State Machine:** Status hanya bergerak 1 langkah. Koreksi multi-langkah = transisi atomik (`$transaction`) dengan `correlationId` sama di setiap entri Audit Log.

**Freeze saat PENDING_APPROVAL:** Permohonan yang koreksinya sedang `PENDING_APPROVAL` WAJIB dibekukan dari seluruh aksi peran lain. UI menampilkan badge "Menunggu Persetujuan Supervisor". Freeze dicabut otomatis setelah Supervisor memutuskan.

**Alur persetujuan Supervisor (berlaku untuk semua yang memerlukan acc):**
1. Peran operasional → isi alasan → submit
2. Sistem buat entri `PermintaanKoreksi` dengan status `PENDING_APPROVAL`
3. Kirim **In-App Notification** ke seluruh User `SUPERVISOR` aktif
4. Supervisor buka halaman approval → "Setujui" atau "Tolak" + isi catatan
5a. Disetujui → eksekusi transisi atomik + In-App Notification ke pengaju
5b. Ditolak → tidak ada perubahan + In-App Notification ke pengaju + catatan penolakan

---

### 6.1 Koreksi PENGINPUT

#### Anomali A — Salah Input Data
- **Kondisi:** Status `SUBMITTED` DAN `bundleId` = `null`
- **Aksi:** Tombol "Update Data" aktif
- **Perlu acc Supervisor:** Tidak
- **Transisi:** Tidak ada (tetap `SUBMITTED`)
- **Catatan:** Update Data juga aktif saat status `REVISION`

---

### 6.2 Koreksi PENELITI

#### Anomali A — Berkas Tidak Valid (`SUBMITTED` → `REVISION`)
- **Kondisi:** Permohonan `SUBMITTED` (boleh sudah di Bundle `DRAFT`)
- **Aksi:** Tombol "Minta Revisi"
- **Perlu acc Supervisor:** Tidak
- **Transisi:** `SUBMITTED` → `REVISION` (1 langkah)
- **Jika Permohonan sudah di Bundle DRAFT:** server otomatis kosongkan `bundleId` sebelum transisi
- **Notifikasi:** In-App ke Penginput yang bertanggung jawab
- **WhatsApp ke wajib pajak:**
  > *"Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] memerlukan kelengkapan berkas. Harap segera hubungi petugas untuk informasi lebih lanjut."*

#### Anomali B — Keluarkan dari Bundle (Bundle `DRAFT`)
- **Kondisi:** Bundle `DRAFT`, Permohonan `BUNDLED`
- **Aksi:** "Keluarkan dari Bundle"
- **Perlu acc Supervisor:** Tidak
- **Transisi:** `BUNDLED` → `SUBMITTED` (1 langkah); `bundleId` dikosongkan
- **Efek Bundle:** Jika Bundle jadi kosong → Bundle → `VOID`

#### Anomali C — Keluarkan dari Bundle (Bundle `LOCKED`)
- **Kondisi:** Bundle `LOCKED`, Permohonan `BUNDLED`
- **Aksi:** "Keluarkan dari Bundle" (memerlukan acc)
- **Perlu acc Supervisor:** **Ya**
- **Transisi (jika disetujui):** `BUNDLED` → `SUBMITTED` (1 langkah); `bundleId` dikosongkan
- **Efek Bundle:** Jika Bundle jadi kosong → Bundle → `VOID`
- **Tindak lanjut fisik:** cetak ulang Surat Pengantar Bundle + Kertas Kerja jika ada `MUTASI_SEBAGIAN`
- **Audit Log:** Wajib — ID Permohonan, ID Bundle, ID Peneliti pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Peneliti, catatan Supervisor

#### Anomali D — Race Condition
- Dua Peneliti memasukkan Permohonan yang sama ke Bundle berbeda secara bersamaan
- **Pencegahan:** `$transaction` Prisma — hanya satu yang berhasil
- **Respons:** error informatif ke yang "kalah", minta refresh

---

### 6.3 Koreksi PENGARSIP

#### Anomali A — Upload Ulang Arsip Digital (Koreksi Minor)
- **Kondisi:** Permohonan `ARCHIVED`, ada ArsipDigital `ACTIVE`
- **Aksi:** "Upload Ulang Arsip Digital" — upload PDF baru
- **Perlu acc Supervisor:** Tidak
- **Transisi Permohonan:** Tidak ada (tetap `ARCHIVED`)
- **Efek ArsipDigital:** ArsipDigital lama → `SUPERSEDED`; PDF baru → `ACTIVE`
- **File lama di Vercel Blob:** Tidak dihapus
- **Tidak ada batas maksimum** jumlah kali upload ulang per Permohonan
- **Audit Log:** Wajib — ID Permohonan, ID ArsipDigital lama (SUPERSEDED), ID ArsipDigital baru (ACTIVE), ID Pengarsip, timestamp

#### Anomali B — Kembalikan ke Peneliti (Koreksi Major)
- **Kondisi:** Permohonan `BUNDLED` atau `ARCHIVED`
- **Aksi:** "Kembalikan ke Peneliti"
- **Perlu acc Supervisor:** **Ya**
- **Transisi (jika disetujui):**
  - Dari `ARCHIVED`: **transisi atomik** `ARCHIVED → BUNDLED → SUBMITTED` (2 langkah, 1 `$transaction`, 2 entri Audit Log dengan `correlationId` sama)
  - Dari `BUNDLED`: `BUNDLED → SUBMITTED` (1 langkah)
  - `bundleId` dikosongkan
- **Efek ArsipDigital:** Seluruh ArsipDigital milik Permohonan (`ACTIVE` + `SUPERSEDED`) → `INVALIDATED`. File tetap di Vercel Blob.
- **Efek Bundle:** Bundle tetap `LOCKED` dengan sisa Permohonan. Jika kosong → `VOID`. Wajib cetak ulang Surat Pengantar Bundle + Kertas Kerja.
- **Audit Log:** Wajib — ID Permohonan, ID Bundle, setiap transisi + timestamp, ID Pengarsip pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengarsip, catatan Supervisor

---

### 6.4 Koreksi PENGIRIM

#### Anomali A — Kembalikan ke Pengarsip
- **Kondisi:** Permohonan `ARCHIVED`, Bundle `IN_MANIFEST`
- **Aksi:** "Kembalikan ke Pengarsip"
- **Perlu acc Supervisor:** **Ya**
- **Transisi (jika disetujui):** `ARCHIVED → BUNDLED` (1 langkah); `bundleId` TETAP terisi
- **Efek ArsipDigital:** ArsipDigital `ACTIVE` → `SUPERSEDED` (menunggu upload baru Pengarsip)
- **Efek Bundle:**
  - Jika SEMUA Permohonan dalam Bundle dikembalikan → `manifestId` Bundle dikosongkan; Bundle → `LOCKED` dari `IN_MANIFEST`
  - Bundle yang sebagian Permohonannya dikembalikan tetap `IN_MANIFEST`
- **Notifikasi setelah disetujui:**
  - In-App Notification ke Pengarsip dengan detail: ID Permohonan, ID Bundle, instruksi re-upload
  - UI dashboard Pengarsip wajib tampilkan flag **"Perlu Re-Upload"** pada Permohonan `BUNDLED` yang ArsipDigitalnya berstatus `SUPERSEDED`
- **Keputusan Pengarsip setelah menerima:**
  - **(a)** Upload ulang (koreksi minor) → Permohonan kembali `ARCHIVED` — tidak perlu acc
  - **(b)** Kembalikan ke Peneliti (koreksi major) → ikuti alur 6.3.B — perlu acc
- **Audit Log:** Wajib — ID Permohonan, ID Bundle, ID Manifest, transisi + timestamp, ID Pengirim pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengirim, catatan Supervisor

#### Anomali B — Revisi Manifest (Bundle Tertinggal)
- **Kondisi:** Manifest `LOCKED`
- **Aksi:** "Revisi Manifest"
- **Perlu acc Supervisor:** Tidak
- **Efek:** Manifest → `DRAFT`; Pengirim lepas Bundle tertinggal (`manifestId` Bundle dikosongkan; Bundle → `LOCKED`); Manifest dikunci ulang

#### Anomali C — Laporkan Bundle Hilang
- **Kondisi:** Manifest `SENT`
- **Aksi:** "Laporkan Bundle Hilang"
- **Perlu acc Supervisor:** Tidak
- **Efek:** `manifestId` Bundle dikosongkan; Bundle kembali ke `LOCKED`
- **Audit Log:** Wajib — ID Bundle, ID Manifest, ID Pengirim, timestamp

---

### 6.5 Koreksi PEMANTAU

#### Anomali A — Batal Selesai (Rollback)
- **Kondisi:** Permohonan `COMPLETED`
- **Aksi:** Pemantau ajukan "Batal Selesai" + isi alasan
- **Perlu acc Supervisor:** **Ya — WAJIB tanpa pengecualian**
- **Transisi (jika disetujui):** `COMPLETED` → `ARCHIVED` (1 langkah)
- **Transisi (jika ditolak):** Tidak ada perubahan, tetap `COMPLETED`
- **Audit Log:** Wajib — ID Permohonan, ID Pemantau pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pemantau, catatan Supervisor, status sebelum (`COMPLETED`), status sesudah (`ARCHIVED`)

---

## BAGIAN 7 — ATURAN BUNDLE

### Bundle Homogen
- Satu Bundle hanya berisi `jenisPermohonan` yang sama
- Permohonan pertama menentukan jenis terkunci Bundle
- Validasi dilakukan di sisi server sebelum transaksi database
- Jika gagal: error message menyebutkan jenis yang diizinkan

### Bundle Void
- Bundle yang dikosongkan dari SELURUH Permohonannya → otomatis `VOID`
- Berlaku baik saat Bundle `DRAFT` maupun `LOCKED`
- Bundle `VOID` tidak bisa diisi ulang, dikunci, atau dimasukkan ke Manifest

---

## BAGIAN 8 — SISTEM NOTIFIKASI

### 8.1 In-App Notification (Antar Petugas Internal — EKSKLUSIF)

Tidak ada notifikasi WhatsApp untuk petugas internal dalam kondisi apapun.

| Event | Penerima |
|---|---|
| Permohonan → `REVISION` | Penginput yang bertanggung jawab |
| Penginput tekan Resubmit (`REVISION` → `SUBMITTED`) | Seluruh User `PENELITI` yang `isActive = true` |
| Bundle → `LOCKED` | Seluruh User `PENGARSIP` yang aktif |
| Manifest → `SENT` | Seluruh User `PEMANTAU` yang aktif |
| Permohonan di-`REJECTED` oleh Cron | Penginput yang bertanggung jawab |
| Permintaan koreksi masuk (`PENDING_APPROVAL`) | Seluruh User `SUPERVISOR` yang aktif |
| Permintaan koreksi disetujui | Peran pengaju |
| Permintaan koreksi ditolak | Peran pengaju + catatan penolakan |
| Permohonan selesai diperbaiki Pengarsip (kembali `ARCHIVED`) | Pengirim yang mengajukan koreksi |
| Bundle dilepas otomatis dari Manifest (semua Permohonan dikembalikan) | Pengirim |
| Permohonan `COMPLETED` diajukan untuk dibatalkan | Supervisor |
| "Batal Selesai" disetujui | Pemantau pengaju |
| "Batal Selesai" ditolak | Pemantau pengaju |
| Cron Tutup Buku gagal/parsial | Supervisor |
| `PENDING_APPROVAL` belum diputus 72 jam | Supervisor (reminder) |
| `PENDING_APPROVAL` belum diputus 168 jam | Supervisor (eskalasi) |
| Permohonan memerlukan re-upload (setelah "Kembalikan ke Pengarsip" disetujui) | Pengarsip |

**Implementasi:** Simpan di tabel `InAppNotification`. Tampilkan di header/dashboard saat user login. Tandai sudah dibaca.

### 8.2 WhatsApp via Fonnte API (Wajib Pajak — EKSKLUSIF)

Endpoint: `POST https://api.fonnte.com/send`

| Event | Pesan |
|---|---|
| Permohonan → `SUBMITTED` | "Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah berhasil diterima dan sedang dalam proses verifikasi." |
| Permohonan → `REVISION` | "Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] memerlukan kelengkapan berkas. Harap segera hubungi petugas untuk informasi lebih lanjut." |
| Manifest → `SENT` | "Berkas Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah dikirimkan ke kantor pusat untuk diproses." (kirim ke SELURUH wajib pajak yang Permohonannya ada di Manifest) |
| Permohonan → `COMPLETED` | "Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] telah selesai diproses. Produk layanan dapat segera diambil." |
| Permohonan → `REJECTED` (Cron) | "Permohonan [jenisPermohonan] Anda dengan nomor [nomorPermohonan] tidak dapat diproses karena melewati batas tahun anggaran. Silakan mengajukan permohonan baru." |

---

## BAGIAN 9 — CRON JOB

### 9.1 Cron Tutup Buku Tahunan

**Jadwal:** 31 Desember pukul 23:59 WIB (`0 16 31 12 *` dalam UTC)
**Endpoint:** `/api/cron/tutup-buku`
**Keamanan:** Header `Authorization: Bearer {CRON_SECRET}` — cocokkan dengan env var `CRON_SECRET`

**Logika:**
1. Ambil semua Permohonan dengan status = `REVISION`
2. Untuk setiap Permohonan, eksekusi dalam `$transaction` dengan **optimistic locking** pada field `status`:
   - Verifikasi status masih `REVISION` saat transaksi dimulai (anti-race dengan Resubmit)
   - Ubah status → `REJECTED`
   - Kunci tombol "Update Data" permanen
3. Kirim **In-App Notification** ke Penginput masing-masing Permohonan
4. Kirim **notifikasi WhatsApp** ke wajib pajak masing-masing Permohonan
5. Catat di AuditLog: jumlah berhasil, jumlah gagal, timestamp mulai, timestamp selesai, status eksekusi (`SUCCESS` / `PARTIAL` / `FAILED`)
6. Jika status `PARTIAL` atau `FAILED`: kirim **In-App Notification** ke Supervisor

**Idempotency:** Query hanya menarget Permohonan `REVISION` → Permohonan yang sudah `REJECTED` tidak diproses ulang meski Cron dijalankan lebih dari sekali.

**Anti-race Condition (Cron vs Resubmit):**
- Bungkus `REVISION → REJECTED` dan `REVISION → SUBMITTED` dalam `$transaction` yang sama dengan **optimistic locking** pada field `status`
- Hanya satu yang berhasil commit; yang lain mendapat conflict error dan dibatalkan
- Urutan prioritas: first-write-wins (tidak ada aturan bisnis yang mengutamakan salah satu)

---

### 9.2 Cron Timeout PENDING_APPROVAL

**Jadwal:** Setiap jam (`0 * * * *`)
**Endpoint:** `/api/cron/pending-approval-check`
**Keamanan:** Header `Authorization: Bearer {CRON_SECRET}`

**Logika:**
1. Ambil semua `PermintaanKoreksi` dengan status = `PENDING_APPROVAL`
2. Untuk setiap entri:
   - Hitung selisih waktu antara `createdAt` dan sekarang
   - Jika selisih ≥ 72 jam DAN `reminderSentAt` = `null`:
     → Kirim In-App Notification "reminder" ke Supervisor
     → Set `reminderSentAt` = now()
   - Jika selisih ≥ 168 jam DAN `escalationSentAt` = `null`:
     → Kirim In-App Notification "eskalasi" ke Supervisor
     → Set `escalationSentAt` = now()
3. Tidak ada keputusan default otomatis — permintaan tetap terbuka hingga Supervisor memutuskan

---

## BAGIAN 10 — DOKUMEN FISIK (PDF via @react-pdf/renderer)

Implementasikan 3 template PDF:

### 10.1 Surat Pengantar Bundle
- Dicetak oleh Peneliti saat mengunci Bundle (`LOCKED`)
- Berisi: nomor Bundle, jenis Permohonan, daftar seluruh Permohonan dalam Bundle (nomor, nama wajib pajak, NOP), tanggal, tanda tangan Peneliti
- **Wajib dicetak ulang** jika komposisi Bundle berubah akibat koreksi

### 10.2 Kertas Kerja
- Dicetak untuk setiap Permohonan `MUTASI_SEBAGIAN` dalam Bundle
- Berisi detail Permohonan yang relevan untuk proses mutasi sebagian
- **Wajib dicetak ulang** jika komposisi Bundle berubah

### 10.3 Surat Pengantar Manifest
- Dicetak oleh Pengirim saat mengunci Manifest (`LOCKED`)
- Berisi: nomor Manifest, daftar Bundle (nomor Bundle, jumlah Permohonan), tanggal, tanda tangan Pengirim

---

## BAGIAN 11 — AUDIT LOG

Implementasikan pencatatan Audit Log wajib untuk aksi-aksi berikut. Untuk transisi atomik multi-langkah, setiap langkah dicatat sebagai entri terpisah dengan `correlationId` yang sama.

| Aksi | Field yang Dicatat |
|---|---|
| Batal Selesai (Rollback) | ID Permohonan, ID Pemantau pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pemantau, catatan Supervisor, status sebelum (`COMPLETED`), status sesudah (`ARCHIVED`) |
| Tutup Buku Tahunan (Cron) | Jumlah Permohonan di-REJECTED, jumlah gagal, timestamp mulai, timestamp selesai, status eksekusi (`SUCCESS`/`PARTIAL`/`FAILED`) |
| Laporkan Bundle Hilang | ID Bundle, ID Manifest, ID Pengirim, timestamp |
| Keluarkan dari Bundle (LOCKED) | ID Permohonan, ID Bundle, ID Peneliti pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Peneliti, catatan Supervisor |
| Kembalikan ke Peneliti | ID Permohonan, ID Bundle, setiap transisi + timestamp, ID Pengarsip pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengarsip, catatan Supervisor |
| Kembalikan ke Pengarsip | ID Permohonan, ID Bundle, ID Manifest, transisi + timestamp, ID Pengirim pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengirim, catatan Supervisor |
| Upload Ulang Arsip Digital | ID Permohonan, ID ArsipDigital lama (SUPERSEDED), ID ArsipDigital baru (ACTIVE), ID Pengarsip, timestamp |

---

## BAGIAN 12 — ATURAN NON-FUNGSIONAL

### 12.1 Hard Delete Dilarang
- Entitas `Permohonan` dan `ArsipDigital`: hard delete dilarang mutlak
- Tidak ada UI, API endpoint, atau kode server yang memungkinkan penghapusan kedua entitas ini

### 12.2 Validasi File Upload
- Validasi tipe file menggunakan `file-type` di sisi server (bukan ekstensi nama file)
- Tipe yang diterima: PDF untuk ArsipDigital; PDF/JPG/PNG untuk Bukti Tanda Terima
- Batas ukuran: ≤ 20 MB per file

### 12.3 Race Condition
- Seluruh operasi yang mengubah `bundleId` atau `manifestId` wajib dibungkus dalam Prisma `$transaction`
- Transisi atomik multi-langkah juga wajib dalam satu `$transaction`
- Optimistic locking pada field `status` untuk anti-race Cron vs Resubmit

### 12.4 Freeze PENDING_APPROVAL
- Permohonan dengan koreksi `PENDING_APPROVAL` diblokir dari seluruh aksi peran lain
- UI menampilkan badge/indikator "Menunggu Persetujuan Supervisor"
- Freeze dicabut otomatis setelah Supervisor memutuskan (setujui atau tolak)

### 12.5 Vercel Blob
- File yang sudah diupload tidak pernah dihapus (termasuk versi `SUPERSEDED` dan `INVALIDATED`)

---

## BAGIAN 13 — STRUKTUR FOLDER (REKOMENDASI)

```
/app
  /(auth)
    /login
  /(dashboard)
    /penginput/
      /permohonan/
        /new/
        /[id]/
          /edit/
          /resubmit/
    /peneliti/
      /bundle/
        /new/
        /[id]/
          /lock/
          /koreksi/
    /pengarsip/
      /bundle/[id]/
        /arsip/[permohonanId]/
    /pengirim/
      /manifest/
        /new/
        /[id]/
          /lock/
          /sent/
    /pemantau/
      /permohonan/
    /supervisor/
      /approval/
/api
  /auth/[...nextauth]/
  /permohonan/
    /[id]/
      /update/
      /resubmit/
      /minta-revisi/
      /arsip/
  /bundle/
    /[id]/
      /lock/
      /tambah-permohonan/
      /keluarkan-permohonan/
  /manifest/
    /[id]/
      /lock/
      /sent/
      /revisi/
      /bundle-hilang/
  /koreksi/
    /[id]/
      /setujui/
      /tolak/
  /cron/
    /tutup-buku/
    /pending-approval-check/
/lib
  /prisma.ts
  /auth.ts
  /fonnte.ts        // wrapper Fonnte API
  /blob.ts          // wrapper Vercel Blob
  /notifications.ts // helper In-App + WhatsApp
  /audit.ts         // helper Audit Log
/components
  /ui/
  /permohonan/
  /bundle/
  /manifest/
  /notifications/
/schemas           // Zod schemas (dipakai di server + client)
/types             // TypeScript types & interfaces
```

---

## BAGIAN 14 — CHECKLIST VALIDASI SEBELUM DIANGGAP SELESAI

Tandai semua sebelum menyatakan implementasi complete:

**Auth & User**
- [ ] Login via NextAuth Credentials Provider
- [ ] JWT payload memuat id, name, email, role
- [ ] Middleware proteksi route per role
- [ ] User `isActive` untuk filter penerima notifikasi

**Permohonan (Fase 1)**
- [ ] Form 3 bagian dengan validasi Zod (Data Utama, Data Lama, Data Baru)
- [ ] Penghapusan NIK dan penambahan Nomor Pelayanan
- [ ] Dukungan banyak pemilik baru untuk Mutasi Sebagian
- [ ] Status → `SUBMITTED` saat simpan
- [ ] WhatsApp terkirim ke `noWhatsapp` saat `SUBMITTED`
- [ ] "Update Data" hanya aktif saat (`SUBMITTED` + `bundleId` null) or `REVISION`
- [ ] "Resubmit" sebagai tombol eksplisit terpisah — tidak auto
- [ ] Resubmit: `REVISION` → `SUBMITTED`
- [ ] Resubmit: In-App ke seluruh `PENELITI` aktif
- [ ] "Update Data" dikunci permanen saat `REJECTED`

**Bundle (Fase 2)**
- [ ] Buat Bundle baru → `DRAFT`
- [ ] Validasi Bundle Homogen di server
- [ ] Permohonan masuk Bundle → `BUNDLED`, `bundleId` terisi
- [ ] `$transaction` untuk anti-race condition
- [ ] Kunci Bundle → `LOCKED`
- [ ] In-App ke `PENGARSIP` saat `LOCKED`
- [ ] Cetak Surat Pengantar Bundle (PDF)
- [ ] Cetak Kertas Kerja untuk `MUTASI_SEBAGIAN` (PDF)
- [ ] Bundle kosong → otomatis `VOID`

**ArsipDigital (Fase 3)**
- [ ] Upload PDF per Permohonan
- [ ] Validasi tipe file via `file-type` di server
- [ ] Batas 20 MB
- [ ] Upload ke Vercel Blob
- [ ] Permohonan → `ARCHIVED` per upload
- [ ] Versioning: ArsipDigital lama → `SUPERSEDED`, baru → `ACTIVE`
- [ ] Tidak ada batas maksimum versi
- [ ] File Blob tidak pernah dihapus

**Manifest (Fase 4)**
- [ ] Buat Manifest → `DRAFT`
- [ ] Validasi: semua Permohonan Bundle harus `ARCHIVED` sebelum masuk Manifest
- [ ] Bundle masuk Manifest → `IN_MANIFEST`, `manifestId` terisi
- [ ] Cetak Surat Pengantar Manifest (PDF)
- [ ] Kunci Manifest → `LOCKED`
- [ ] Upload Bukti Tanda Terima → Manifest → `SENT`
- [ ] In-App ke `PEMANTAU` saat `SENT`
- [ ] WhatsApp ke seluruh wajib pajak dalam Manifest saat `SENT`

**Pemantauan (Fase 5)**
- [ ] Tandai Permohonan → `COMPLETED`
- [ ] WhatsApp ke wajib pajak saat `COMPLETED`

**Koreksi**
- [ ] Minta Revisi: `SUBMITTED` → `REVISION` (In-App Penginput + WA wajib pajak)
- [ ] Keluarkan dari Bundle (DRAFT): tanpa acc
- [ ] Keluarkan dari Bundle (LOCKED): dengan acc Supervisor + Audit Log
- [ ] Upload Ulang: tanpa acc + Audit Log
- [ ] Kembalikan ke Peneliti: acc Supervisor + transisi atomik + semua ArsipDigital → INVALIDATED + Audit Log
- [ ] Kembalikan ke Pengarsip: acc Supervisor + ArsipDigital aktif → SUPERSEDED + notif Pengarsip + flag UI "Perlu Re-Upload" + Audit Log
- [ ] Revisi Manifest: tanpa acc
- [ ] Laporkan Bundle Hilang: tanpa acc + Audit Log
- [ ] Batal Selesai: acc Supervisor WAJIB + Audit Log

**Supervisor**
- [ ] Halaman approval untuk semua `PENDING_APPROVAL`
- [ ] Setujui: eksekusi transisi + In-App pengaju
- [ ] Tolak: tidak ada perubahan + In-App pengaju + catatan

**Freeze**
- [ ] Permohonan `PENDING_APPROVAL` diblokir dari aksi lain
- [ ] Badge UI "Menunggu Persetujuan Supervisor"
- [ ] Freeze dicabut otomatis setelah keputusan

**Notifikasi**
- [ ] Seluruh 15 event In-App terimplementasi
- [ ] WhatsApp eksklusif untuk wajib pajak (5 event)
- [ ] Fonnte API wrapper

**Cron**
- [ ] Tutup Buku: `/api/cron/tutup-buku`, jadwal 31 Des 23:59 WIB
- [ ] Tutup Buku: idempoten (hanya target `REVISION`)
- [ ] Tutup Buku: optimistic locking anti-race vs Resubmit
- [ ] Tutup Buku: Audit Log dengan status SUCCESS/PARTIAL/FAILED
- [ ] Tutup Buku: In-App ke Supervisor jika PARTIAL/FAILED
- [ ] Tutup Buku: In-App ke Penginput + WA ke wajib pajak per Permohonan `REJECTED`
- [ ] Pending Approval Check: `/api/cron/pending-approval-check`, setiap jam
- [ ] Pending Approval Check: reminder 72 jam (`reminderSentAt`)
- [ ] Pending Approval Check: eskalasi 168 jam (`escalationSentAt`)
- [ ] Keamanan endpoint Cron via `CRON_SECRET`

**Audit Log**
- [ ] 7 aksi yang diwajibkan terimplementasi
- [ ] `correlationId` untuk transisi atomik multi-langkah

**Non-Fungsional**
- [ ] Hard delete dilarang untuk `Permohonan` dan `ArsipDigital`
- [ ] `$transaction` untuk semua operasi ubah `bundleId`/`manifestId`
- [ ] TypeScript strict mode aktif
- [ ] Zod schema dipakai di server dan client

---

## BAGIAN 15 — ENVIRONMENT VARIABLES YANG DIPERLUKAN

```env
# Database
DATABASE_URL=mongodb+srv://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# Fonnte WhatsApp API
FONNTE_TOKEN=...

# Cron Security
CRON_SECRET=...
```

---

*Master Prompt ini mencakup 100% isi PRD Architax v2.9 Final. Tidak ada fitur, aturan bisnis, edge case, atau non-functional requirement yang dihilangkan.*
