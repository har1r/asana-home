# Product Requirements Document (PRD)
## Sistem Pengarsipan dan Pengelolaan Permohonan Layanan Pajak Bumi dan Bangunan — Architax

---

## 1. Document Metadata

| Atribut | Keterangan |
|---|---|
| **Judul Dokumen** | PRD — Sistem Pengarsipan dan Pengelolaan Permohonan Layanan Pajak Bumi dan Bangunan (Architax) |
| **Modul** | Pengarsipan & Pengelolaan Permohonan Layanan Pajak Bumi dan Bangunan |
| **Versi** | 2.9 |
| **Status** | Final — Revised |
| **Sumber** | Cetak Biru (Blueprint) Final & Komprehensif — Tata Usaha Pengarsipan Pendapatan Daerah Sipetra |
| **Tanggal Revisi** | 25 Juni 2026 |
| **Changelog v2.1** | Tambah peran `SUPERVISOR`; tambah fitur "Buka Kunci Bundle" dengan persyaratan persetujuan Supervisor. |
| **Changelog v2.2** | Desain ulang fitur koreksi: dari per-Bundle menjadi per-Permohonan. Tiga fitur koreksi berurutan. Tambah versioning Arsip Digital. Tambah aturan Bundle Void. |
| **Changelog v2.3** | Penetapan prinsip **Strict State Machine**: status Permohonan hanya boleh bergerak tepat satu langkah per transisi, baik maju maupun mundur, tanpa pengecualian. Fitur koreksi mundur yang melewati lebih dari satu langkah dieksekusi sebagai rangkaian transisi atomik yang tercatat satu per satu di Audit Log. Penyesuaian seluruh alur koreksi mengikuti prinsip ini. |
| **Changelog v2.4** | Tambah aturan bisnis **Bundle Homogen**: satu Bundle hanya boleh berisi Permohonan dengan jenis yang sama; pencampuran jenis Permohonan dalam satu Bundle dilarang dan divalidasi di sisi server. |
| **Changelog v2.5** | Koreksi skema notifikasi: In-App Notification untuk seluruh komunikasi antar petugas internal; WhatsApp (Fonnte API) eksklusif untuk notifikasi ke wajib pajak pada 4 event (`SUBMITTED`, `REVISION`, `SENT`, `COMPLETED`). Tambah field wajib nomor WhatsApp wajib pajak pada input Permohonan Fase 1. |
| **Changelog v2.6** | (1) Tambah fitur "Resubmit" oleh Penginput sebagai pemicu eksplisit transisi `REVISION` → `SUBMITTED`. (2) "Batal Selesai" kini wajib acc Supervisor. (3) Tidak ada batasan maksimum versi Arsip Digital per Permohonan. (4) Tambah mekanisme idempotency dan retry untuk Cron Job Tutup Buku Tahunan. |
| **Changelog v2.7** | Klarifikasi 4 keputusan product: (1) `REVISION → SUBMITTED` dipicu secara eksplisit oleh Penginput melalui tombol **"Resubmit"** — tidak otomatis saat simpan. (2) "Batal Selesai" wajib acc Supervisor karena `COMPLETED` adalah status paling akhir; alur `PENDING_APPROVAL` berlaku penuh. (3) Tidak ada batasan maksimum jumlah versi upload ulang Arsip Digital per Permohonan — seluruh riwayat versi tetap tersimpan di Vercel Blob. (4) Tambah mekanisme idempotency dan retry untuk Cron Job Tutup Buku Tahunan. |
| **Changelog v2.8** | Perbaikan berdasarkan stress test alur: (1) Koreksi channel notifikasi ke Supervisor dari WhatsApp → In-App di seluruh dokumen; WhatsApp tetap eksklusif untuk wajib pajak. (2) Tambah aturan **freeze Permohonan** selama `PENDING_APPROVAL` — tidak dapat dieksekusi peran lain hingga Supervisor memutuskan. (3) Tambah notifikasi khusus dan flag UI **"Perlu Re-Upload"** untuk Pengarsip setelah "Kembalikan ke Pengarsip" disetujui. (4) Tambah klausul **anti-race Cron vs Resubmit** via optimistic locking di `$transaction` pada momen 31 Desember 23:59. (5) Eksplisitkan prasyarat Fase 4: validasi "seluruh Permohonan `ARCHIVED`" dilakukan **per Bundle**, bukan global. (6) Tambah mekanisme **timeout `PENDING_APPROVAL`**: reminder 3×24 jam, eskalasi 7×24 jam. (7) Tambah notifikasi In-App ke **Peneliti** saat Penginput menekan Resubmit (`REVISION` → `SUBMITTED`). |
| **Changelog v2.9** | Finalisasi dokumen — penyelesaian 3 ambiguitas terakhir: (1) Koreksi poin 5 logika Cron Job: notifikasi ke Penginput menggunakan **In-App**, notifikasi ke wajib pajak menggunakan **WhatsApp** — dua poin kini terpisah eksplisit. (2) Definisi **"Peneliti aktif"** untuk penerima notifikasi Resubmit: seluruh pengguna dengan peran `PENELITI` yang terdaftar aktif di sistem, tanpa bergantung pada status login saat itu. (3) Mekanisme implementasi timeout `PENDING_APPROVAL` didefinisikan: **Vercel Cron Job terpisah** berjalan setiap jam, memeriksa field `reminderSentAt` dan `escalationSentAt` pada entitas permintaan koreksi; kedua field wajib ada di skema Prisma. |

---

## 2. Tech Stack & Setup Proyek

### 2.1 Stack Wajib (Tidak Boleh Diganti)

| Layer | Teknologi | Keterangan |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Semua routing menggunakan App Router, tidak boleh Pages Router |
| Bahasa | TypeScript (strict mode) | `strict: true` wajib aktif di `tsconfig.json` |
| Styling | Tailwind CSS + CSS Module | Tailwind untuk utilitas; CSS Module untuk komponen kompleks |
| Database | MongoDB | Hosted di MongoDB Atlas |
| ORM | Prisma | Prisma Client sebagai satu-satunya cara akses database |
| API Layer | REST API via Route Handlers + Server Actions | Route Handlers untuk endpoint eksternal; Server Actions untuk mutasi dari UI |
| Autentikasi | NextAuth.js (Credentials Provider, strategi JWT) | Sesi disimpan sebagai JWT; tidak ada session database |
| Penyimpanan File | Vercel Blob | Untuk unggahan Arsip Digital (PDF per Permohonan) dan Bukti Tanda Terima |
| State Management | React Server Components + Client Components | Minimalisasi penggunaan Client Component; prioritaskan RSC |
| Validasi | Zod + React Hook Form + `@hookform/resolvers` | Zod schema wajib digunakan di server dan client secara bersamaan |
| Cron Job | Vercel Cron | Untuk otomasi Aturan Tutup Buku Tahunan |
| Validasi Tipe File | `file-type` | Wajib digunakan saat menerima unggahan file di server |
| Generator PDF | `@react-pdf/renderer` | Untuk mencetak Surat Pengantar Bundle, Kertas Kerja, dan Surat Pengantar Manifest |
| Notifikasi WhatsApp | Fonnte API (`https://api.fonnte.com/send`) | Untuk notifikasi perubahan status ke petugas terkait |

### 2.2 Konvensi Penamaan (Wajib Konsisten)

| Konteks | Konvensi | Contoh |
|---|---|---|
| File & Folder | `kebab-case` | `bundle-list.tsx`, `create-manifest/` |
| Komponen React | `PascalCase` | `BundleCard`, `ManifestTable` |
| Fungsi & Variabel | `camelCase` | `getBundleById`, `isLocked` |
| Tipe & Interface TypeScript | `PascalCase` dengan prefix `T` atau `I` | `TPermohonan`, `IUserSession` |
| Konstanta Global | `SCREAMING_SNAKE_CASE` | `MAX_BUNDLE_CAPACITY` |
| API Route | `kebab-case` | `/api/permohonan/[id]/revisi` |
| Kolom Database (Prisma) | `camelCase` | `bundleId`, `manifestId`, `createdAt` |
| Enum Prisma | `SCREAMING_SNAKE_CASE` | `SUBMITTED`, `IN_MANIFEST` |

---

## 3. Product Overview & Objective

Sistem Architax (bagian dari Sipetra) adalah sistem pengarsipan dan pengelolaan permohonan layanan Pajak Bumi dan Bangunan (PBB) yang dirancang untuk mendigitalisasi dan mengotomasi alur kerja mulai dari penerimaan permohonan fisik hingga penyelesaian layanan oleh kantor pusat.

Sistem dibangun di atas tiga entitas utama yang hierarkis:

```
Manifest (1)
  └── Bundle (banyak)
        └── Permohonan (banyak)
```

Satu **Manifest** dapat berisi banyak **Bundle**, dan satu **Bundle** dapat berisi banyak **Permohonan**.

*State Machine* pada sistem merepresentasikan **keadaan aktual objek** (bukan aktivitas pengguna), sehingga setiap entitas memiliki status yang dikelola secara independen.

Sistem mengakomodasi **6 (enam) jenis permohonan layanan PBB**, yaitu:

| No | Jenis Permohonan | Kode |
|---|---|---|
| 1 | Mutasi Sebagian | `MUTASI_SEBAGIAN` |
| 2 | Mutasi Habis Update | `MUTASI_HABIS_UPDATE` |
| 3 | Mutasi Habis Reguler | `MUTASI_HABIS_REGULER` |
| 4 | Objek Pajak Baru | `OBJEK_PAJAK_BARU` |
| 5 | Pembetulan | `PEMBETULAN` |
| 6 | Pengaktifan | `PENGAKTIFAN` |

> **Catatan:** Kode jenis permohonan digunakan sebagai nilai enum Prisma dan konstanta di seluruh codebase.

---

## 4. User Roles & Permissions

Sistem memetakan **6 (enam) peran pengguna**. Lima peran operasional bertanggung jawab pada satu fase alur kerja utama (*happy path*), satu peran supervisori memiliki kewenangan lintas fase untuk menyetujui seluruh tindakan koreksi mundur.

| No | Peran | Kode Peran | Fase / Lingkup | Tanggung Jawab Utama |
|---|---|---|---|---|
| 1 | Penginput | `PENGINPUT` | Fase 1 — Penerimaan Data | Menerima dokumen permohonan fisik dan menginput data awal ke sistem. |
| 2 | Peneliti | `PENELITI` | Fase 2 — Verifikasi & Pengelompokan | Memverifikasi kelengkapan berkas dan mengelompokkan Permohonan ke dalam Bundle. |
| 3 | Pengarsip | `PENGARSIP` | Fase 3 — Digitalisasi | Memindai dokumen fisik per Permohonan dan mengunggah hasilnya sebagai Arsip Digital. Berwenang memutuskan apakah Permohonan yang bermasalah cukup di-upload ulang (koreksi minor) atau perlu dikembalikan ke Peneliti (koreksi major). |
| 4 | Pengirim | `PENGIRIM` | Fase 4 — Logistik | Membuat Manifest, memasukkan Bundle, dan mengirimkan fisik ke kantor pusat. |
| 5 | Pemantau | `PEMANTAU` | Fase 5 — Pemantauan | Memantau permohonan yang fisiknya telah tiba di kantor pusat dan menandai penyelesaian layanan. |
| 6 | Supervisor | `SUPERVISOR` | Lintas Fase — Supervisori | Tidak terlibat dalam alur kerja operasional harian. Berwenang memberikan persetujuan atau penolakan terhadap seluruh permintaan koreksi mundur yang diajukan peran operasional. |

> **Catatan:** Kode Peran digunakan sebagai nilai enum di tabel `User` pada skema Prisma dan sebagai nilai klaim `role` di payload JWT NextAuth.

> **Prinsip Supervisor:** Supervisor **tidak dapat** memicu tindakan koreksi secara langsung — ia hanya memberikan atau menolak persetujuan. Ini memastikan jejak audit yang jelas: siapa yang meminta dan siapa yang menyetujui.

---

## 5. Core Entities & State Machine

### 5.1 Prinsip Strict State Machine

Seluruh transisi status Permohonan dalam sistem mengikuti prinsip **Strict State Machine**:

> **Status Permohonan hanya boleh bergerak tepat satu langkah per transisi, baik maju maupun mundur. Tidak ada lompatan status dalam kondisi apapun.**

Urutan status Permohonan adalah:

```
SUBMITTED → BUNDLED → ARCHIVED → COMPLETED    (arah maju — happy path)
SUBMITTED ← BUNDLED ← ARCHIVED ← COMPLETED    (arah mundur — corrective path)
```

`REVISION` adalah cabang khusus satu langkah di bawah `SUBMITTED`, hanya dapat dicapai dari `SUBMITTED` dan hanya dapat kembali ke `SUBMITTED`.

```
SUBMITTED ⇄ REVISION    (cabang khusus, dua arah)
```

**Implikasi pada fitur koreksi yang melewati lebih dari satu langkah:**
Jika sebuah fitur koreksi secara logis perlu memundurkan Permohonan lebih dari satu langkah (misal: `ARCHIVED → BUNDLED → SUBMITTED`), maka sistem mengeksekusinya sebagai **rangkaian transisi atomik** — setiap langkah tetap dicatat secara berurutan di Audit Log, namun dari sudut pandang pengguna hanya ada satu tombol dan satu permintaan acc Supervisor.

---

### 5.2 Entitas: Permohonan

**Definisi:** Representasi digital dari satu berkas permohonan layanan PBB yang diterima dari wajib pajak.

| Status | Kode | Definisi |
|---|---|---|
| Diajukan | `SUBMITTED` | Berkas dan data awal diterima oleh Penginput; menunggu verifikasi oleh Peneliti. |
| Perlu Revisi | `REVISION` | Berkas dikembalikan karena tidak lengkap atau tidak valid; Penginput berwenang mengubah data dan melakukan Resubmit setelah perbaikan selesai. Cabang khusus dari `SUBMITTED`. |
| Terbundel | `BUNDLED` | Permohonan telah diverifikasi dan dikunci ke dalam Bundle; menunggu digitalisasi oleh Pengarsip. |
| Terarsip | `ARCHIVED` | Dokumen fisik telah berhasil dipindai dan Arsip Digital (PDF) versi aktif tersedia di sistem. |
| Selesai | `COMPLETED` | Produk layanan dari kantor pusat telah terbit dan ditandai selesai oleh Pemantau. |
| Ditolak | `REJECTED` | *Status terminal.* Ditetapkan otomatis oleh sistem terhadap Permohonan berstatus `REVISION` yang tidak diselesaikan hingga pergantian tahun anggaran. |

**Diagram Lengkap Transisi Status Permohonan:**

```
                    HAPPY PATH (Maju)
                    ─────────────────────────────────────────────────────►
[Input]
  │
  ▼
SUBMITTED ──────────────► BUNDLED ──────────────► ARCHIVED ──────────────► COMPLETED
  │  ▲                      │  ▲                     │  ▲                      │
  │  │                      │  │                     │  │                      │
  │  │ (Keluarkan           │  │ (Kembalikan         │  │ (Kembalikan          │
  │  │  dari Bundle)        │  │  ke Peneliti:       │  │  ke Pengarsip:       │
  │  │  BUNDLED→SUBMITTED   │  │  ARCHIVED→BUNDLED   │  │  COMPLETED→ARCHIVED) │
  │  │  [acc Supervisor     │  │  →SUBMITTED)        │  │  [Batal Selesai,     │
  │  │   jika LOCKED]       │  │  [acc Supervisor]   │  │   wajib acc Supv]    │
  │  │                      │  │                     │  │                      │
  ▼  │                      ▼  │                     ▼  │                      │
REVISION ──(Resubmit: tombol eksplisit Penginput)──► SUBMITTED ◄────────────────────────────────────────────┘
  │
  │ (Tutup Buku Tahunan — otomatis)
  ▼
REJECTED (Terminal)

                    ◄─────────────────────────────────────────────────────
                    CORRECTIVE PATH (Mundur)
```

> **Catatan Diagram:** Setiap panah mundur merepresentasikan transisi yang dieksekusi sebagai rangkaian atomik sesuai prinsip Strict State Machine. "Kembalikan ke Peneliti" misalnya mengeksekusi dua transisi (`ARCHIVED → BUNDLED → SUBMITTED`) secara atomik dalam satu permintaan.

---

### 5.3 Entitas: Bundle

**Definisi:** Wadah pengelompokan sejumlah Permohonan yang telah diverifikasi, direpresentasikan secara fisik sebagai satu map dokumen.

| Status | Kode | Definisi |
|---|---|---|
| Draf | `DRAFT` | Bundle dibuat dan sedang dalam proses seleksi Permohonan oleh Peneliti. |
| Terkunci | `LOCKED` | Pengelompokan ditutup; dokumen fisik tersusun dalam map; Surat Pengantar Bundle telah dicetak. |
| Dalam Manifest | `IN_MANIFEST` | Bundle telah dimasukkan ke dalam Manifest oleh Pengirim. |
| Void | `VOID` | *Status terminal.* Bundle dikosongkan dari seluruh Permohonannya akibat proses koreksi; tidak dapat digunakan kembali. |

**Aturan Bisnis: Bundle Homogen**

> Satu Bundle hanya boleh berisi Permohonan dengan **jenis yang sama** (`jenisPermohonan`). Pencampuran jenis Permohonan yang berbeda dalam satu Bundle dilarang mutlak.

Contoh yang **valid:**
- Bundle 101: 10 Permohonan `MUTASI_HABIS_UPDATE` ✅
- Bundle 102: 10 Permohonan `MUTASI_SEBAGIAN` ✅

Contoh yang **tidak valid:**
- Bundle 101: 5 `MUTASI_HABIS_UPDATE` + 5 `MUTASI_SEBAGIAN` ❌

**Implementasi Teknis:**
- Saat Peneliti mencoba memasukkan Permohonan ke dalam Bundle, server wajib memvalidasi bahwa `jenisPermohonan` Permohonan yang akan dimasukkan sama dengan `jenisPermohonan` yang sudah ada di Bundle tersebut.
- Jika Bundle masih kosong (baru dibuat), `jenisPermohonan` pertama yang dimasukkan menjadi **jenis terkunci** untuk Bundle tersebut — seluruh Permohonan berikutnya yang akan dimasukkan harus memiliki jenis yang sama.
- Validasi dilakukan di sisi server (Zod schema + Prisma query) sebelum transaksi database dieksekusi; bukan hanya di sisi UI.
- Sistem wajib menampilkan pesan error yang jelas jika validasi gagal, menyebutkan jenis Permohonan yang diizinkan untuk Bundle tersebut.

**Diagram Transisi Status Bundle:**

```
[Buat Bundle]
      │
      ▼
    DRAFT ──────────────────────────────────────────► LOCKED ──────────────► IN_MANIFEST
      │                                                  │  ▲                    │
      │ (jika semua Permohonan                           │  │ (Revisi Manifest)  │
      │  dikeluarkan saat DRAFT)                         │  └────────────────────┘
      │                                                  │
      ▼                                                  │ (jika semua Permohonan
    VOID ◄─────────────────────────────────────────────┘   dikeluarkan saat LOCKED)
```

---

### 5.4 Entitas: Manifest

**Definisi:** Wadah pengiriman yang menampung satu atau lebih Bundle untuk dikirimkan ke kantor pusat dalam satu kargo.

| Status | Kode | Definisi |
|---|---|---|
| Draf | `DRAFT` | Manifest dibuat dan sedang dalam proses pemasukan Bundle oleh Pengirim. |
| Terkunci | `LOCKED` | Pengiriman ditutup; kardus disegel; Surat Pengantar Manifest telah dicetak. |
| Terkirim | `SENT` | Bukti Tanda Terima dari kantor pusat telah diunggah; status terminal logistik. |

**Diagram Transisi Status Manifest:**

```
[Buat Manifest]
      │
      ▼
    DRAFT ──────────────► LOCKED ──────────────► SENT (Terminal)
              ▲               │
              │ (Revisi       │
              └───────────────┘
                Manifest)
```

---

### 5.5 Entitas: Arsip Digital

**Definisi:** File PDF hasil pemindaian satu Permohonan oleh Pengarsip. Satu Permohonan dapat memiliki lebih dari satu Arsip Digital jika terjadi upload ulang. Pada satu waktu, hanya satu Arsip Digital yang berstatus `ACTIVE` per Permohonan.

| Status Versi | Kode | Definisi |
|---|---|---|
| Aktif | `ACTIVE` | Versi PDF terbaru dan valid; digunakan sebagai referensi resmi Permohonan. |
| Digantikan | `SUPERSEDED` | Versi PDF lama yang telah digantikan oleh versi lebih baru; tetap tersimpan di Vercel Blob untuk keperluan audit. |
| Dibatalkan | `INVALIDATED` | Seluruh versi PDF yang dibatalkan akibat Permohonan dikembalikan ke Peneliti; tetap tersimpan di Vercel Blob untuk keperluan audit. |

**Aturan Versioning:**
- Saat Pengarsip mengunggah PDF baru (Upload Ulang), sistem otomatis mengubah Arsip Digital lama dari `ACTIVE` → `SUPERSEDED`, lalu menyimpan yang baru sebagai `ACTIVE`.
- Saat Permohonan dikembalikan ke Peneliti (`ARCHIVED → BUNDLED → SUBMITTED`), seluruh Arsip Digital milik Permohonan tersebut (baik `ACTIVE` maupun `SUPERSEDED`) diubah menjadi `INVALIDATED`.
- File di Vercel Blob **tidak pernah dihapus** dalam kondisi apapun.
- **Tidak ada batasan maksimum jumlah versi upload ulang per Permohonan.** Satu Permohonan dapat memiliki berapapun riwayat versi Arsip Digital; seluruhnya tetap tersimpan di Vercel Blob untuk keperluan audit.

---

## 6. Functional Requirements: Happy Path

### Fase 1: Penerimaan Data
**Peran:** `PENGINPUT`

**Prasyarat:** Tidak ada (titik masuk sistem).

**Aksi:**
1. Penginput menerima dokumen permohonan fisik dari wajib pajak.
2. Penginput membuka form input di sistem dan mengisi seluruh data yang diperlukan, termasuk **jenis permohonan** (salah satu dari 6 kode jenis yang tersedia).
3. Penginput menyimpan data.

**Transisi Status:** Permohonan → `SUBMITTED`.

**Validasi (Zod):** Wajib memvalidasi kode jenis permohonan, NIK/NOP, nomor WhatsApp wajib pajak (`nomorWhatsapp`), dan seluruh field wajib lainnya sebelum data disimpan ke database. Format `nomorWhatsapp` harus berupa nomor valid (diawali `08` atau `628`).

---

### Fase 2: Verifikasi & Pengelompokan
**Peran:** `PENELITI`

**Prasyarat:** Terdapat minimal satu Permohonan berstatus `SUBMITTED`.

**Aksi:**
1. Peneliti membuat Bundle baru → status Bundle menjadi `DRAFT`.
2. Peneliti memverifikasi kesesuaian berkas fisik dengan data yang diinput.
3. Peneliti mencentang Permohonan yang valid untuk dimasukkan ke Bundle → status Permohonan menjadi `BUNDLED` dan atribut `bundleId` pada Permohonan terisi. **Server memvalidasi bahwa jenis Permohonan yang dimasukkan sesuai dengan jenis terkunci Bundle (aturan Bundle Homogen).**
4. Peneliti mencetak **Surat Pengantar Bundle**.
5. **Khusus jika terdapat Permohonan berjenis `MUTASI_SEBAGIAN`:** Peneliti wajib mencetak **Kertas Kerja** untuk setiap Permohonan `MUTASI_SEBAGIAN` tersebut.
6. Peneliti menyusun dokumen fisik ke dalam map secara berurutan sesuai Surat Pengantar Bundle.
7. Peneliti mengunci Bundle → status Bundle menjadi `LOCKED`.

**Transisi Status:** Bundle → `LOCKED`; setiap Permohonan yang dimasukkan → `BUNDLED`.

**Dokumen Fisik yang Diterbitkan:**
- Surat Pengantar Bundle (wajib, setiap Bundle).
- Kertas Kerja (wajib, setiap Permohonan berjenis `MUTASI_SEBAGIAN`).

---

### Fase 3: Digitalisasi
**Peran:** `PENGARSIP`

**Prasyarat:** Terdapat Bundle berstatus `LOCKED`.

**Aksi:**
1. Pengarsip mengambil map fisik yang sesuai dengan Bundle berstatus `LOCKED`.
2. Untuk setiap Permohonan dalam Bundle, Pengarsip memindai dokumen fisiknya menjadi satu file PDF.
3. Pengarsip mengunggah PDF tersebut ke sistem satu per satu sebagai **Arsip Digital** (disimpan di Vercel Blob, status versi `ACTIVE`).
4. Sistem memvalidasi tipe file menggunakan library `file-type` (wajib bertipe PDF).
5. Setiap Permohonan yang PDF-nya berhasil diunggah langsung berpindah ke status `ARCHIVED`.

**Transisi Status:** Setiap Permohonan → `ARCHIVED` secara bertahap, satu per satu, sesuai urutan unggahan.

---

### Fase 4: Logistik
**Peran:** `PENGIRIM`

**Prasyarat:** Terdapat minimal satu Bundle berstatus `LOCKED` yang **seluruh Permohonan di dalamnya** berstatus `ARCHIVED`. Validasi ini dilakukan per Bundle: server wajib menolak permintaan memasukkan Bundle ke Manifest jika masih terdapat satu atau lebih Permohonan dalam Bundle tersebut yang berstatus selain `ARCHIVED`. Bundle yang sebagian Permohonannya masih `BUNDLED` tidak dapat dimasukkan ke Manifest.

**Aksi:**
1. Pengirim membuat Manifest baru → status Manifest menjadi `DRAFT`.
2. Pengirim memasukkan satu atau lebih Bundle ke dalam Manifest → status Bundle menjadi `IN_MANIFEST` dan atribut `manifestId` pada Bundle terisi.
3. Pengirim mencetak **Surat Pengantar Manifest**.
4. Pengirim menyegel kardus dan mengunci Manifest → status Manifest menjadi `LOCKED`.
5. Setelah kargo fisik tiba di kantor pusat, Pengirim mengunggah **Bukti Tanda Terima** (PDF/JPG/PNG, divalidasi `file-type`).

**Transisi Status:** Manifest → `SENT` (status terminal logistik).

---

### Fase 5: Pemantauan
**Peran:** `PEMANTAU`

**Prasyarat:** Terdapat Permohonan berstatus `ARCHIVED` yang Manifestnya berstatus `SENT`.

**Aksi:**
1. Pemantau mengecek dashboard permohonan yang fisiknya telah tiba di kantor pusat.
2. Saat produk layanan riil untuk sebuah Permohonan telah terbit dari kantor pusat, Pemantau menandai Permohonan tersebut sebagai selesai.

**Transisi Status (Akhir):** Permohonan → `COMPLETED`.

---

## 7. Exception Handling & Corrective Flows

### Prinsip Umum

**1. Strict State Machine:** Setiap transisi status hanya boleh bergerak tepat satu langkah. Jika sebuah fitur koreksi secara logis memerlukan lebih dari satu langkah mundur, sistem mengeksekusinya sebagai **rangkaian transisi atomik** — setiap langkah tercatat di Audit Log secara berurutan, namun pengguna hanya menekan satu tombol dan hanya memerlukan satu permintaan acc Supervisor.

**2. Acc Supervisor:** Seluruh fitur koreksi mundur wajib mendapat persetujuan `SUPERVISOR` sebelum dieksekusi, **kecuali:**
- "Keluarkan dari Bundle" saat Bundle masih `DRAFT` (koreksi rutin operasional).
- "Upload Ulang Arsip Digital" untuk koreksi minor (tidak mengubah status Permohonan).
- "Revisi Manifest" dan "Laporkan Bundle Hilang" (koreksi logistik, tidak mengubah status Permohonan).

> **Catatan:** "Batal Selesai" **wajib acc Supervisor** karena `COMPLETED` adalah status paling akhir dalam sistem dan pembaliknya bersifat destruktif. Tidak ada pengecualian untuk fitur ini.

**3. Alur Persetujuan Supervisor (berlaku untuk semua fitur yang memerlukannya):**
1. Peran operasional mengajukan permintaan koreksi + mengisi catatan alasan.
2. Sistem membuat entri permintaan berstatus `PENDING_APPROVAL`.
3. Sistem mengirim **In-App Notification** ke Supervisor. (WhatsApp tidak digunakan untuk komunikasi antar petugas internal dalam kondisi apapun.)
4. Supervisor membuka halaman approval → menekan "Setujui" atau "Tolak" + mengisi catatan.
5a. **Disetujui:** sistem mengeksekusi transisi atomik; peran pengaju menerima In-App Notification.
5b. **Ditolak:** tidak ada perubahan status; peran pengaju menerima In-App Notification + catatan penolakan.

> **Timeout `PENDING_APPROVAL`:** Jika Supervisor tidak memberikan keputusan dalam **3 × 24 jam** sejak permintaan masuk, sistem mengirim ulang In-App Notification sebagai pengingat. Jika dalam **7 × 24 jam** masih belum ada keputusan, sistem mengirim notifikasi eskalasi dan mencatat status timeout di Audit Log. Permintaan tetap terbuka hingga ada keputusan eksplisit dari Supervisor; sistem tidak mengeksekusi keputusan default secara otomatis.
>
> **Mekanisme Implementasi Timeout:** Timeout dikelola oleh **Vercel Cron Job terpisah** (`/api/cron/pending-approval-check`) yang berjalan setiap jam. Setiap eksekusi, Cron mengambil seluruh entri `PENDING_APPROVAL` dan memeriksa selisih waktu antara `createdAt` dengan waktu saat itu. Jika selisih ≥ 72 jam dan reminder belum dikirim (`reminderSentAt` masih `null`), sistem kirim reminder dan catat `reminderSentAt`. Jika selisih ≥ 168 jam dan eskalasi belum dikirim (`escalationSentAt` masih `null`), sistem kirim eskalasi dan catat `escalationSentAt`. Field `reminderSentAt` dan `escalationSentAt` wajib ada pada entitas permintaan koreksi di skema Prisma.

**4. Bundle Void:** Bundle yang seluruh Permohonannya dikeluarkan melalui proses koreksi (baik saat `DRAFT` maupun `LOCKED`) secara otomatis berstatus `VOID`. Bundle `VOID` tidak dapat diisi ulang atau digunakan kembali.

**5. Per Permohonan:** Seluruh fitur koreksi mundur bekerja per Permohonan, bukan per Bundle. Bundle lain dan Permohonan lain dalam Bundle yang sama tidak terpengaruh.

**6. Freeze selama `PENDING_APPROVAL`:** Permohonan yang permintaan koreksinya sedang berstatus `PENDING_APPROVAL` wajib dibekukan (*frozen*) dari seluruh aksi peran lain hingga Supervisor memberikan keputusan. Selama freeze, tidak ada peran lain (termasuk Pengarsip) yang dapat mengeksekusi aksi apapun terhadap Permohonan tersebut. UI wajib menampilkan indikator status "Menunggu Persetujuan Supervisor" secara jelas pada Permohonan yang bersangkutan. Freeze dicabut secara otomatis saat Supervisor menekan "Setujui" atau "Tolak".

---

### 7.1 Fase 1 — Koreksi oleh `PENGINPUT`

#### Anomali A: Salah Input Data

| Atribut | Detail |
|---|---|
| **Pemicu** | Penginput menyadari adanya kesalahan pada data Permohonan yang telah disimpan. |
| **Kondisi yang Diperlukan** | Status Permohonan adalah `SUBMITTED` **DAN** atribut `bundleId` masih `null`. |
| **Aksi Koreksi** | Penginput menggunakan fitur **"Update Data"**. |
| **Perlu Acc Supervisor** | Tidak. |
| **Batasan** | Fitur dikunci otomatis jika salah satu kondisi di atas tidak terpenuhi. |
| **Larangan Absolut** | *Hard Delete* dilarang mutlak dalam kondisi apapun. |
| **Transisi Status** | Tidak ada (tetap `SUBMITTED`). |
| **Audit Log** | Tidak wajib (data input biasa), namun direkomendasikan untuk perubahan field kritis (NIK/NOP). |

---

### 7.2 Fase 2 — Koreksi oleh `PENELITI`

#### Anomali A: Berkas Tidak Valid / Tidak Memenuhi Syarat

| Atribut | Detail |
|---|---|
| **Pemicu** | Peneliti menemukan berkas fisik yang tidak lengkap atau tidak valid saat verifikasi. |
| **Kondisi yang Diperlukan** | Permohonan berstatus `SUBMITTED` (belum atau sudah di Bundle `DRAFT`). |
| **Aksi Koreksi** | Peneliti menekan **"Minta Revisi"**. Jika Permohonan sudah ada di Bundle `DRAFT`, sistem otomatis mengosongkan `bundleId` terlebih dahulu sebelum menurunkan status. |
| **Perlu Acc Supervisor** | Tidak. |
| **Transisi Status** | `SUBMITTED` → `REVISION` (satu langkah). |
| **Tindak Lanjut** | Penginput memperbaiki data (fitur "Update Data" aktif saat `REVISION`) → setelah selesai, Penginput menekan tombol **"Resubmit"** secara eksplisit sebagai pernyataan bahwa berkas sudah siap diverifikasi ulang → status kembali ke `SUBMITTED` → Peneliti verifikasi ulang. Transisi **tidak dipicu secara otomatis** saat Penginput menekan simpan; Penginput wajib menekan tombol "Resubmit" secara terpisah. |
| **Audit Log** | Tidak wajib. |

#### Anomali B: Kapasitas Map Penuh (Bundle masih `DRAFT`)

| Atribut | Detail |
|---|---|
| **Pemicu** | Bundle `DRAFT` terlalu banyak Permohonan sehingga fisik tidak muat dalam satu map. |
| **Kondisi yang Diperlukan** | Status Bundle adalah `DRAFT`; Permohonan berstatus `BUNDLED`. |
| **Aksi Koreksi** | Peneliti menggunakan fitur **"Keluarkan dari Bundle"** pada Permohonan yang perlu dipindahkan. |
| **Perlu Acc Supervisor** | Tidak (Bundle masih `DRAFT` — koreksi operasional rutin). |
| **Transisi Status** | `BUNDLED` → `SUBMITTED` (satu langkah); `bundleId` dikosongkan. |
| **Efek pada Bundle** | Jika seluruh Permohonan dikeluarkan → Bundle → `VOID`. |
| **Tindak Lanjut** | Permohonan yang dikeluarkan masuk antrian `SUBMITTED` untuk dimasukkan ke Bundle berikutnya. |
| **Audit Log** | Tidak wajib. |

#### Anomali C: Permohonan Bermasalah Ditemukan Setelah Bundle `LOCKED`

| Atribut | Detail |
|---|---|
| **Pemicu** | Peneliti menemukan satu atau beberapa Permohonan bermasalah di dalam Bundle yang sudah berstatus `LOCKED`. |
| **Kondisi yang Diperlukan** | Status Bundle adalah `LOCKED`; Permohonan berstatus `BUNDLED`. |
| **Aksi Koreksi** | Peneliti mengajukan **"Keluarkan dari Bundle"** pada Permohonan bermasalah (per Permohonan). |
| **Perlu Acc Supervisor** | **Ya** — karena Bundle sudah `LOCKED`. |
| **Transisi Status (jika disetujui)** | `BUNDLED` → `SUBMITTED` (satu langkah); `bundleId` dikosongkan. Bundle tetap `LOCKED` dengan sisa Permohonan. Jika seluruh Permohonan dikeluarkan → Bundle → `VOID`. |
| **Tindak Lanjut Fisik** | Peneliti mencabut berkas fisik dari map; menyusun ulang map; mencetak ulang Surat Pengantar Bundle dan Kertas Kerja (jika ada `MUTASI_SEBAGIAN`). |
| **Tindak Lanjut Sistem** | Permohonan yang dikeluarkan masuk antrian `SUBMITTED`; Peneliti menentukan apakah langsung masuk Bundle baru atau perlu "Minta Revisi" terlebih dahulu. |
| **Audit Log** | Wajib. Mencatat: ID Permohonan, ID Bundle, ID Peneliti pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Peneliti, catatan Supervisor. |

#### Anomali D: Race Condition (Tabrakan Aksi Bersamaan)

| Atribut | Detail |
|---|---|
| **Pemicu** | Dua atau lebih Peneliti mencoba memasukkan Permohonan yang sama ke Bundle berbeda secara bersamaan. |
| **Mekanisme Pencegahan** | **Prisma `$transaction`** di sisi server; hanya satu operasi yang berhasil. |
| **Respons ke Pengguna** | Peneliti yang "kalah" menerima pesan error informatif dan diminta me-refresh daftar Permohonan. |

---

### 7.3 Fase 3 — Koreksi oleh `PENGARSIP`

#### Anomali A: Koreksi Minor — Kualitas Scan Tidak Memuaskan

| Atribut | Detail |
|---|---|
| **Pemicu** | Hasil scan tidak memuaskan secara kualitas (miring, buram, halaman terlewat) namun berkas fisik valid dan tidak bermasalah secara substansi. |
| **Kondisi yang Diperlukan** | Permohonan berstatus `ARCHIVED` dan memiliki Arsip Digital berstatus `ACTIVE`. |
| **Aksi Koreksi** | Pengarsip menggunakan fitur **"Upload Ulang Arsip Digital"** — scan ulang dan unggah PDF baru. |
| **Perlu Acc Supervisor** | **Tidak** — koreksi teknis murni, tidak mengubah status Permohonan. |
| **Transisi Status** | Tidak ada (Permohonan tetap `ARCHIVED`). |
| **Efek pada Arsip Digital** | Arsip Digital lama → `SUPERSEDED`; PDF baru tersimpan sebagai `ACTIVE`. File lama tetap di Vercel Blob. |
| **Audit Log** | Wajib. Mencatat: ID Permohonan, ID Arsip Digital lama (`SUPERSEDED`), ID Arsip Digital baru (`ACTIVE`), ID Pengarsip, timestamp. |

#### Anomali B: Koreksi Major — Berkas Fisik Cacat atau Salah Berkas

| Atribut | Detail |
|---|---|
| **Pemicu** | Berkas fisik dalam map ditemukan rusak, sobek, atau merupakan berkas yang salah sehingga memerlukan perbaikan dari Peneliti atau dari wajib pajak. |
| **Kondisi yang Diperlukan** | Permohonan berstatus `BUNDLED` atau `ARCHIVED`. |
| **Aksi Koreksi** | Pengarsip mengajukan **"Kembalikan ke Peneliti"** pada Permohonan yang bermasalah (per Permohonan). |
| **Perlu Acc Supervisor** | **Ya.** |
| **Transisi Status (jika disetujui)** | Dieksekusi sebagai rangkaian transisi atomik: `ARCHIVED → BUNDLED → SUBMITTED` (jika dari `ARCHIVED`) atau `BUNDLED → SUBMITTED` (jika dari `BUNDLED`). Setiap langkah tercatat di Audit Log secara berurutan. `bundleId` Permohonan dikosongkan. |
| **Efek pada Arsip Digital** | Seluruh Arsip Digital milik Permohonan tersebut (baik `ACTIVE` maupun `SUPERSEDED`) diubah menjadi `INVALIDATED`. File tetap tersimpan di Vercel Blob. |
| **Efek pada Bundle** | Bundle tetap `LOCKED` dengan sisa Permohonan. Jika seluruh Permohonan dikeluarkan → Bundle → `VOID`. Surat Pengantar Bundle dan Kertas Kerja wajib dicetak ulang. |
| **Tindak Lanjut Fisik** | Map diserahkan kembali ke Peneliti untuk dikaji. Peneliti memutuskan: jika perlu perbaikan dari wajib pajak → "Minta Revisi" (`SUBMITTED` → `REVISION`); jika bisa langsung diperbaiki → masuk Bundle baru. |
| **Audit Log** | Wajib. Mencatat: ID Permohonan, ID Bundle, setiap transisi status beserta timestamp-nya, ID Pengarsip pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengarsip, catatan Supervisor. |

---

### 7.4 Fase 4 — Koreksi oleh `PENGIRIM`

#### Anomali A: Permohonan Bermasalah Ditemukan Saat Logistik

| Atribut | Detail |
|---|---|
| **Pemicu** | Pengirim menemukan satu atau beberapa Permohonan bermasalah (misal: Arsip Digital tidak sesuai fisik yang dikemas). |
| **Kondisi yang Diperlukan** | Permohonan berstatus `ARCHIVED`; Bundle berstatus `IN_MANIFEST`. |
| **Aksi Koreksi** | Pengirim mengajukan **"Kembalikan ke Pengarsip"** pada Permohonan yang bermasalah (per Permohonan). |
| **Perlu Acc Supervisor** | **Ya.** |
| **Transisi Status (jika disetujui)** | `ARCHIVED → BUNDLED` (satu langkah). `bundleId` tetap terisi — Permohonan masih tercatat dalam Bundle yang sama. Arsip Digital aktif milik Permohonan ditandai `SUPERSEDED` sementara menunggu upload baru dari Pengarsip. |
| **Efek pada Bundle** | Bundle tetap `IN_MANIFEST`. Jika seluruh Permohonan dalam Bundle dikembalikan → `manifestId` Bundle dikosongkan; Bundle kembali ke `LOCKED` dari `IN_MANIFEST`. |
| **Notifikasi ke Pengarsip** | Setelah Supervisor menyetujui, sistem wajib mengirim **In-App Notification** ke Pengarsip dengan detail: ID Permohonan, ID Bundle, dan instruksi bahwa Permohonan ini memerlukan upload ulang Arsip Digital. UI dashboard Pengarsip wajib menampilkan flag khusus **"Perlu Re-Upload"** pada Permohonan berstatus `BUNDLED` yang memiliki Arsip Digital berstatus `SUPERSEDED` (penanda bahwa ini bukan Permohonan baru, melainkan koreksi yang dikembalikan dari Fase 4). |
| **Keputusan Pengarsip (setelah menerima Permohonan)** | **(a) Koreksi Minor:** Pengarsip scan ulang dan upload PDF baru ("Upload Ulang Arsip Digital") → Permohonan kembali `ARCHIVED` → tidak perlu acc Supervisor. **(b) Koreksi Major:** Pengarsip mengajukan "Kembalikan ke Peneliti" → ikuti alur 7.3 Anomali B → perlu acc Supervisor. |
| **Tindak Lanjut Fisik** | Berkas fisik Permohonan bermasalah dikeluarkan dari kardus dan diserahkan ke Pengarsip. |
| **Audit Log** | Wajib. Mencatat: ID Permohonan, ID Bundle, ID Manifest, transisi status beserta timestamp, ID Pengirim pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengirim, catatan Supervisor. |

#### Anomali B: Map (Bundle) Tertinggal Tidak Masuk Kardus

| Atribut | Detail |
|---|---|
| **Pemicu** | Setelah Manifest `LOCKED`, ada Bundle yang terdaftar tapi fisiknya tertinggal dan tidak ikut dikemas. |
| **Kondisi yang Diperlukan** | Status Manifest adalah `LOCKED`. |
| **Aksi Koreksi** | Pengirim menggunakan fitur **"Revisi Manifest"**. |
| **Perlu Acc Supervisor** | Tidak (koreksi logistik, tidak mengubah status Permohonan). |
| **Efek pada Sistem** | Manifest: `LOCKED` → `DRAFT`; Pengirim melepas Bundle tertinggal (`manifestId` Bundle dikosongkan; Bundle kembali ke `LOCKED`); Manifest dikunci ulang. |
| **Tindak Lanjut** | Bundle yang dilepas dimasukkan ke Manifest pengiriman berikutnya. |

#### Anomali C: Map (Bundle) Hilang Saat Transit

| Atribut | Detail |
|---|---|
| **Pemicu** | Satu atau lebih Bundle dikonfirmasi hilang dalam proses pengiriman. |
| **Kondisi yang Diperlukan** | Kargo utama sudah tiba; Manifest dalam proses penyelesaian. |
| **Aksi Koreksi** | Pengirim menyelesaikan Manifest (unggah Bukti Tanda Terima → `SENT`), lalu menggunakan fitur **"Laporkan Bundle Hilang"** pada Bundle yang hilang. |
| **Perlu Acc Supervisor** | Tidak. |
| **Efek pada Sistem** | `manifestId` Bundle yang hilang dikosongkan; Bundle kembali ke `LOCKED` untuk dilacak secara terpisah. |
| **Catatan** | Manifest yang sudah `SENT` tidak dapat diubah; penanganan Bundle hilang dilakukan secara independen. |

---

### 7.5 Fase 5 — Koreksi oleh `PEMANTAU`

#### Anomali A: Salah Menandai Permohonan sebagai Selesai

| Atribut | Detail |
|---|---|
| **Pemicu** | Pemantau secara tidak sengaja menandai Permohonan sebagai `COMPLETED`, atau produk layanan yang terbit dari kantor pusat perlu dibatalkan. |
| **Kondisi yang Diperlukan** | Status Permohonan adalah `COMPLETED`. |
| **Aksi Koreksi** | Pemantau mengajukan **"Batal Selesai" (*Rollback*)**. |
| **Perlu Acc Supervisor** | **Ya — wajib.** `COMPLETED` adalah status paling akhir dalam sistem; pembatalannya bersifat destruktif dan wajib diotorisasi Supervisor. Alur lengkap: Pemantau mengisi alasan → sistem membuat entri `PENDING_APPROVAL` → In-App Notification ke Supervisor → Supervisor menekan "Setujui" atau "Tolak" + mengisi catatan. |
| **Transisi Status (jika disetujui)** | `COMPLETED` → `ARCHIVED` (satu langkah — sesuai Strict State Machine). |
| **Transisi Status (jika ditolak)** | Tidak ada perubahan; status Permohonan tetap `COMPLETED`. |
| **Audit Log** | Wajib. Mencatat: ID Permohonan, ID Pemantau pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pemantau, catatan Supervisor, status sebelum (`COMPLETED`), status sesudah (`ARCHIVED`). |

---

## 8. System Automation & Non-Functional Requirements

### 8.1 Otomasi Sistem: Aturan Tutup Buku Tahunan

**Mekanisme:** Vercel Cron Job dijadwalkan berjalan pada **31 Desember pukul 23:59 WIB** setiap tahun anggaran.

**Logika:**
1. Sistem mengambil seluruh Permohonan berstatus `REVISION`.
2. Setiap Permohonan tersebut dipaksa transisi `REVISION` → `REJECTED`.
3. Tombol "Update Data" pada Permohonan `REJECTED` dikunci secara permanen.
4. Wajib pajak diwajibkan mengajukan permohonan baru dari awal.
5. Sistem mengirimkan **In-App Notification** ke Penginput yang bertanggung jawab atas setiap Permohonan yang di-`REJECTED` (komunikasi internal — bukan WhatsApp).
6. Sistem mengirimkan **notifikasi WhatsApp** via Fonnte API ke wajib pajak pemilik setiap Permohonan yang di-`REJECTED` (komunikasi eksternal ke wajib pajak).

**Keamanan Endpoint Cron:** Wajib dilindungi menggunakan header `Authorization: Bearer {CRON_SECRET}` yang dicocokkan dengan environment variable `CRON_SECRET`.

**Idempotency & Retry:**
- Eksekusi Cron Job bersifat **idempoten**: jika dijalankan lebih dari sekali dalam satu periode (misal akibat retry otomatis Vercel), Permohonan yang sudah berstatus `REJECTED` tidak akan diproses ulang — query hanya menarget Permohonan yang masih berstatus `REVISION`.
- Jika eksekusi gagal di tengah jalan (misal: timeout setelah sebagian Permohonan berhasil di-`REJECTED`), Vercel Cron akan melakukan retry otomatis. Karena sifat idempoten di atas, Permohonan yang sudah berhasil di-`REJECTED` tidak akan terdampak retry.
- Setiap eksekusi Cron — baik sukses maupun gagal — wajib mencatat entri ke Audit Log dengan jumlah Permohonan yang berhasil diproses, jumlah yang gagal (jika ada), timestamp mulai, timestamp selesai, dan status eksekusi (`SUCCESS` / `PARTIAL` / `FAILED`).
- Jika status eksekusi adalah `PARTIAL` atau `FAILED`, sistem mengirim In-App Notification ke `SUPERVISOR` agar dapat ditindaklanjuti secara manual.

**Penanganan Race Condition Cron vs Resubmit:**
Transisi `REVISION → SUBMITTED` (Resubmit oleh Penginput) dan transisi `REVISION → REJECTED` (Cron Job) wajib dibungkus dalam **Prisma `$transaction`** yang sama dengan **optimistic locking** pada field status Permohonan. Jika kedua operasi tiba bersamaan pada momen 31 Desember 23:59, hanya satu yang berhasil di-commit; yang lain menerima conflict error dan dibatalkan. Dengan demikian, tidak ada Permohonan yang dapat berstatus `SUBMITTED` dan `REJECTED` sekaligus. Urutan prioritas diselesaikan oleh database (first-write-wins); tidak ada aturan bisnis yang mengutamakan salah satu.

### 8.2 Larangan Hard Delete

*Hard Delete* dilarang mutlak pada entitas **Permohonan** dan **Arsip Digital**, dalam kondisi apapun dan oleh peran apapun. Sistem tidak boleh menyediakan UI atau API endpoint yang memungkinkan Hard Delete pada kedua entitas tersebut.

### 8.3 Aturan Bundle Void

Bundle yang dikosongkan dari seluruh Permohonannya (baik saat `DRAFT` maupun `LOCKED`) secara otomatis berstatus `VOID`. Bundle `VOID` tidak dapat diisi ulang, dikunci, atau dimasukkan ke Manifest. Pembuatan Bundle baru dilakukan secara terpisah melalui alur normal Fase 2.

### 8.4 Audit Log

Sistem wajib mencatat Audit Log untuk seluruh aksi koreksi berikut. Untuk transisi atomik multi-langkah, setiap langkah transisi dicatat sebagai entri terpisah yang terikat satu `correlationId` yang sama.

| Aksi | Data yang Dicatat |
|---|---|
| Batal Selesai (*Rollback*) | ID Permohonan, ID Pemantau pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pemantau, catatan Supervisor, status sebelum (`COMPLETED`), status sesudah (`ARCHIVED`) |
| Tutup Buku Tahunan (Cron) | Jumlah Permohonan yang di-`REJECTED`, jumlah yang gagal diproses (jika ada), timestamp mulai, timestamp selesai, status eksekusi (`SUCCESS` / `PARTIAL` / `FAILED`) |
| Laporkan Bundle Hilang | ID Bundle, ID Manifest, ID Pengirim, timestamp |
| Keluarkan dari Bundle (saat `LOCKED`) | ID Permohonan, ID Bundle, ID Peneliti pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Peneliti, catatan Supervisor |
| Kembalikan ke Peneliti | ID Permohonan, ID Bundle, setiap transisi status + timestamp-nya, ID Pengarsip pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengarsip, catatan Supervisor |
| Kembalikan ke Pengarsip | ID Permohonan, ID Bundle, ID Manifest, transisi status + timestamp, ID Pengirim pengaju, ID Supervisor pemutus, timestamp pengajuan, timestamp keputusan, keputusan, catatan Pengirim, catatan Supervisor |
| Upload Ulang Arsip Digital | ID Permohonan, ID Arsip Digital lama (`SUPERSEDED`), ID Arsip Digital baru (`ACTIVE`), ID Pengarsip, timestamp |

### 8.5 Penanganan Race Condition

Seluruh operasi yang mengubah atribut `bundleId` atau `manifestId` wajib dibungkus dalam **Prisma `$transaction`** di sisi server untuk mencegah kondisi tabrakan.

### 8.6 Validasi File Unggahan

Seluruh endpoint yang menerima unggahan file wajib:
1. Memvalidasi tipe file menggunakan library `file-type` di sisi server (bukan hanya ekstensi nama file).
2. Menolak file dengan tipe MIME yang tidak sesuai.
3. Membatasi ukuran file (rekomendasi: ≤ 20 MB per file).

### 8.7 Skema Notifikasi

Sistem menggunakan dua channel notifikasi dengan peruntukan yang berbeda dan tidak saling tumpang tindih.

#### 8.7.1 In-App Notification — Komunikasi Antar Petugas Internal

Seluruh komunikasi antar petugas di dalam sistem menggunakan **In-App Notification**. Notifikasi muncul di dashboard penerima saat mereka membuka aplikasi.

| Event | Pengirim | Penerima |
|---|---|---|
| Permohonan berstatus `REVISION` | Sistem | Penginput yang bertanggung jawab |
| Penginput menekan Resubmit (`REVISION` → `SUBMITTED`) | Sistem | Seluruh pengguna dengan peran `PENELITI` yang terdaftar aktif di sistem (tidak bergantung pada status login saat itu) |
| Bundle berstatus `LOCKED` | Sistem | Pengarsip |
| Manifest berstatus `SENT` | Sistem | Pemantau |
| Permohonan di-`REJECTED` oleh Cron | Sistem | Penginput yang bertanggung jawab |
| Permintaan koreksi mundur masuk (`PENDING_APPROVAL`) | Sistem | Supervisor |
| Permintaan koreksi mundur disetujui | Sistem | Peran pengaju |
| Permintaan koreksi mundur ditolak | Sistem | Peran pengaju |
| Permohonan selesai diperbaiki Pengarsip (kembali `ARCHIVED`) | Sistem | Pengirim yang mengajukan koreksi |
| Bundle dilepas otomatis dari Manifest (seluruh Permohonan dikembalikan) | Sistem | Pengirim |
| Permohonan `COMPLETED` diajukan untuk dibatalkan (`PENDING_APPROVAL`) | Sistem | Supervisor |
| "Batal Selesai" disetujui | Sistem | Pemantau pengaju |
| "Batal Selesai" ditolak | Sistem | Pemantau pengaju |
| Cron Job Tutup Buku Tahunan gagal / parsial (`PARTIAL` atau `FAILED`) | Sistem | Supervisor |
| `PENDING_APPROVAL` belum diputuskan setelah 3 × 24 jam | Sistem | Supervisor (reminder) |
| `PENDING_APPROVAL` belum diputuskan setelah 7 × 24 jam | Sistem | Supervisor (eskalasi) |
| Permohonan `BUNDLED` memerlukan re-upload Arsip Digital (setelah "Kembalikan ke Pengarsip" disetujui) | Sistem | Pengarsip |

#### 8.7.2 WhatsApp (Fonnte API) — Notifikasi ke Wajib Pajak

WhatsApp **eksklusif** digunakan untuk memberitahu wajib pajak tentang perkembangan status Permohonan mereka. Tidak ada notifikasi WhatsApp yang dikirim ke petugas internal dalam kondisi apapun.

**Endpoint:** `https://api.fonnte.com/send`

**Field wajib:** Nomor WhatsApp wajib pajak (`nomorWhatsapp`) wajib diinput oleh Penginput saat menginput data Permohonan pada Fase 1. Field ini wajib divalidasi formatnya (Zod) sebelum data disimpan.

| Event | Status Permohonan / Entitas | Pesan ke Wajib Pajak |
|---|---|---|
| Permohonan berhasil diinput | `SUBMITTED` | "Permohonan [jenis] Anda dengan nomor [ID] telah berhasil diterima dan sedang dalam proses verifikasi." |
| Permohonan dikembalikan untuk perbaikan | `REVISION` | "Permohonan [jenis] Anda dengan nomor [ID] memerlukan kelengkapan berkas. Harap segera hubungi petugas untuk informasi lebih lanjut." |
| Berkas fisik telah dikirim ke kantor pusat | Manifest → `SENT` | "Berkas Permohonan [jenis] Anda dengan nomor [ID] telah dikirimkan ke kantor pusat untuk diproses." |
| Permohonan selesai diproses | `COMPLETED` | "Permohonan [jenis] Anda dengan nomor [ID] telah selesai diproses. Produk layanan dapat segera diambil." |
| Permohonan ditolak (tutup buku tahunan) | `REJECTED` | "Permohonan [jenis] Anda dengan nomor [ID] tidak dapat diproses karena melewati batas tahun anggaran. Silakan mengajukan permohonan baru." |

> **Catatan:** Notifikasi WhatsApp untuk event `SENT` dikirim ke seluruh wajib pajak yang Permohonannya terdapat dalam Manifest tersebut, bukan hanya satu wajib pajak.

---

## 9. Glossary / Kamus Istilah

| Istilah | Kode / Enum | Penjelasan |
|---|---|---|
| **Permohonan** | — | Entitas utama; representasi digital satu berkas permohonan layanan PBB dari wajib pajak. |
| **Bundle** | — | Entitas utama; wadah kumpulan Permohonan yang telah diverifikasi; direpresentasikan fisik sebagai satu map. |
| **Manifest** | — | Entitas utama; wadah pengiriman yang menampung satu atau lebih Bundle untuk dikirim ke kantor pusat. |
| **Arsip Digital** | — | File PDF hasil pemindaian satu Permohonan oleh Pengarsip; disimpan di Vercel Blob; memiliki status versi `ACTIVE`, `SUPERSEDED`, atau `INVALIDATED`. |
| **Strict State Machine** | — | Prinsip sistem: status Permohonan hanya boleh bergerak tepat satu langkah per transisi, baik maju maupun mundur. Fitur koreksi yang memerlukan lebih dari satu langkah dieksekusi sebagai rangkaian transisi atomik. |
| **Transisi Atomik** | — | Rangkaian dua atau lebih transisi status yang dieksekusi sekaligus dalam satu operasi database (`$transaction`), dipicu oleh satu permintaan pengguna, namun setiap langkahnya dicatat terpisah di Audit Log dengan `correlationId` yang sama. |
| **`correlationId`** | — | ID unik yang mengikat seluruh entri Audit Log dari satu rangkaian transisi atomik, untuk memudahkan penelusuran. |
| **Mutasi Sebagian** | `MUTASI_SEBAGIAN` | Jenis permohonan yang memerlukan pencetakan Kertas Kerja tambahan pada Fase 2. |
| **Mutasi Habis Update** | `MUTASI_HABIS_UPDATE` | Jenis permohonan layanan PBB. |
| **Mutasi Habis Reguler** | `MUTASI_HABIS_REGULER` | Jenis permohonan layanan PBB. |
| **Objek Pajak Baru** | `OBJEK_PAJAK_BARU` | Jenis permohonan layanan PBB. |
| **Pembetulan** | `PEMBETULAN` | Jenis permohonan layanan PBB. |
| **Pengaktifan** | `PENGAKTIFAN` | Jenis permohonan layanan PBB. |
| **Surat Pengantar Bundle** | — | Dokumen fisik yang dicetak Peneliti saat mengunci Bundle; wajib dicetak ulang jika komposisi Bundle berubah akibat koreksi. |
| **Kertas Kerja** | — | Dokumen fisik wajib untuk setiap Permohonan `MUTASI_SEBAGIAN` dalam Bundle; wajib dicetak ulang jika komposisi Bundle berubah. |
| **Surat Pengantar Manifest** | — | Dokumen fisik yang dicetak Pengirim saat mengunci Manifest. |
| **Bukti Tanda Terima** | — | File yang diunggah Pengirim setelah fisik tiba di kantor pusat; menandai Manifest → `SENT`. |
| **`bundleId`** | — | Atribut pengikat Permohonan ke Bundle; bernilai `null` jika Permohonan belum terikat Bundle. Penginput hanya bisa "Update Data" jika `bundleId` = `null` dan status `SUBMITTED`. |
| **`manifestId`** | — | Atribut pengikat Bundle ke Manifest; dikosongkan saat "Laporkan Bundle Hilang" atau saat Bundle dilepas dari Manifest. |
| **Hard Delete** | — | Penghapusan permanen data dari database; **dilarang mutlak** pada entitas Permohonan dan Arsip Digital. |
| **Update Data** | — | Fitur Penginput untuk memperbaiki data Permohonan; hanya aktif jika status `SUBMITTED` dan `bundleId` = `null`, atau saat status `REVISION`. |
| **Resubmit** | — | Fitur Penginput untuk mengembalikan Permohonan dari `REVISION` → `SUBMITTED` setelah perbaikan data selesai. Dipicu secara **eksplisit** oleh Penginput dengan menekan tombol **"Resubmit"** — **tidak dipicu secara otomatis** saat Penginput menekan simpan data. Tombol "Resubmit" adalah pernyataan eksplisit Penginput bahwa berkas sudah siap diverifikasi ulang oleh Peneliti. Tidak perlu acc Supervisor. |
| **Minta Revisi** | — | Fitur Peneliti untuk menurunkan status Permohonan: `SUBMITTED` → `REVISION` (satu langkah). |
| **Keluarkan dari Bundle** | — | Fitur Peneliti untuk melepas Permohonan bermasalah dari Bundle; transisi `BUNDLED` → `SUBMITTED`; tidak perlu acc Supervisor jika Bundle `DRAFT`; wajib acc Supervisor jika Bundle `LOCKED`. |
| **Kembalikan ke Peneliti** | — | Fitur Pengarsip untuk mengembalikan Permohonan bermasalah; transisi atomik `ARCHIVED → BUNDLED → SUBMITTED` (atau `BUNDLED → SUBMITTED` jika belum sempat terarsip); wajib acc Supervisor; seluruh Arsip Digital Permohonan diubah ke `INVALIDATED`. |
| **Kembalikan ke Pengarsip** | — | Fitur Pengirim untuk mengembalikan Permohonan bermasalah; transisi `ARCHIVED → BUNDLED` (satu langkah); wajib acc Supervisor; Arsip Digital aktif diubah ke `SUPERSEDED` sementara menunggu upload baru. |
| **Upload Ulang Arsip Digital** | — | Fitur Pengarsip untuk mengunggah PDF baru sebagai koreksi minor; tidak mengubah status Permohonan; tidak perlu acc Supervisor; Arsip Digital lama → `SUPERSEDED`; **tidak ada batasan maksimum jumlah kali upload ulang per Permohonan**. |
| **ACTIVE** | — | Status versi Arsip Digital yang sedang berlaku sebagai referensi resmi Permohonan. |
| **SUPERSEDED** | — | Status versi Arsip Digital yang telah digantikan oleh versi lebih baru; tetap tersimpan di Vercel Blob untuk audit. |
| **INVALIDATED** | — | Status Arsip Digital yang dibatalkan akibat Permohonan dikembalikan ke Peneliti; tetap tersimpan di Vercel Blob untuk audit. |
| **Bundle Homogen** | — | Aturan bisnis yang mewajibkan satu Bundle hanya berisi Permohonan dengan jenis yang sama (`jenisPermohonan`). Jenis pertama yang dimasukkan menjadi jenis terkunci untuk Bundle tersebut. Divalidasi di sisi server. |
| **Bundle Void** | `VOID` | Status terminal Bundle yang dikosongkan dari seluruh Permohonannya; tidak dapat digunakan kembali. |
| **PENDING_APPROVAL** | — | Status entri permintaan koreksi mundur yang sedang menunggu keputusan Supervisor. |
| **Revisi Manifest** | — | Fitur Pengirim untuk membuka kembali Manifest dari `LOCKED` → `DRAFT` guna melepas Bundle yang tertinggal; tidak perlu acc Supervisor. |
| **Laporkan Bundle Hilang** | — | Fitur Pengirim untuk memutus `manifestId` dari Bundle yang hilang saat transit; mengembalikan Bundle ke `LOCKED`; tidak perlu acc Supervisor. |
| **Batal Selesai (Rollback)** | — | Fitur Pemantau untuk mengembalikan Permohonan: `COMPLETED` → `ARCHIVED` (satu langkah); **wajib acc Supervisor** tanpa pengecualian; alur penuh: Pemantau mengisi alasan → `PENDING_APPROVAL` → In-App Notification ke Supervisor → Supervisor memutuskan; wajib mencatat Audit Log lengkap termasuk catatan Pemantau dan Supervisor. |
| **In-App Notification** | — | Channel notifikasi internal sistem; digunakan untuk seluruh komunikasi antar petugas (Penginput, Peneliti, Pengarsip, Pengirim, Pemantau, Supervisor); muncul di dashboard penerima saat membuka aplikasi. |
| **WhatsApp Notification** | — | Channel notifikasi eksternal via Fonnte API; eksklusif untuk wajib pajak; dikirim pada 4 event: `SUBMITTED`, `REVISION`, `SENT` (Manifest), `COMPLETED`, dan `REJECTED`. |
| **`nomorWhatsapp`** | — | Atribut wajib pada entitas Permohonan; nomor WhatsApp wajib pajak yang diinput manual oleh Penginput pada Fase 1; digunakan sebagai tujuan pengiriman notifikasi WhatsApp. |
| **Aturan Tutup Buku Tahunan** | — | Otomasi sistem yang memaksa Permohonan `REVISION` → `REJECTED` setiap akhir tahun anggaran via Vercel Cron. Eksekusi bersifat idempoten; mendukung retry otomatis; setiap eksekusi mencatat status `SUCCESS` / `PARTIAL` / `FAILED` di Audit Log; jika `PARTIAL` atau `FAILED`, In-App Notification dikirim ke Supervisor. |
| **Race Condition (Tabrakan)** | — | Kondisi anomali teknis dicegah melalui Prisma `$transaction` di sisi server. |
| **Audit Log** | — | Catatan sistem yang merekam setiap transisi status kritis beserta metadata lengkap; transisi atomik diikat oleh `correlationId`. |
| **Penginput** | `PENGINPUT` | Peran Fase 1; input data awal Permohonan. |
| **Peneliti** | `PENELITI` | Peran Fase 2; verifikasi berkas dan pengelompokan ke Bundle. |
| **Pengarsip** | `PENGARSIP` | Peran Fase 3; digitalisasi per Permohonan; decision maker untuk koreksi Permohonan yang dikembalikan Pengirim. |
| **Pengirim** | `PENGIRIM` | Peran Fase 4; logistik pengiriman Bundle ke kantor pusat via Manifest. |
| **Pemantau** | `PEMANTAU` | Peran Fase 5; pemantauan dan penandaan penyelesaian Permohonan. |
| **Supervisor** | `SUPERVISOR` | Peran supervisori lintas fase; menyetujui atau menolak seluruh permintaan koreksi mundur yang memerlukan acc. |
