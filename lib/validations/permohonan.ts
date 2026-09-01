import { z } from 'zod';

/**
 * ============================================================
 * SCHEMA DATA LAMA ITEM
 * ============================================================
 */

export const dataLamaItemSchema = z.object({
  nopLama: z.string().nullable().optional(),

  namaPemilikLama: z.string().nullable().optional(),
  alamatPemilikLama: z.string().nullable().optional(),
  blokPemilikLama: z.string().nullable().optional(),
  rtPemilikLama: z.string().nullable().optional(),
  rwPemilikLama: z.string().nullable().optional(),

  kecamatanPemilikLama: z.string().nullable().optional(),
  desaPemilikLama: z.string().nullable().optional(),

  alamatObjekLama: z.string().nullable().optional(),
  blokObjekLama: z.string().nullable().optional(),
  rtObjekLama: z.string().nullable().optional(),
  rwObjekLama: z.string().nullable().optional(),

  kecamatanObjekLama: z.string().nullable().optional(),
  desaObjekLama: z.string().nullable().optional(),

  luasTanahLama: z.coerce.number().nullable().optional(),
  luasBangunanLama: z.coerce.number().nullable().optional(),

  sertifikatLama: z.string().nullable().optional(),

  isUtama: z.boolean().nullable().optional(),

  catatan: z.string().nullable().optional(),
});


/**
 * ============================================================
 * SCHEMA DATA BARU ITEM
 * ============================================================
 */

export const dataBaruItemSchema = z.object({
  nopBaru: z.string().nullable().optional(),

  namaPemilikBaru: z.string().nullable().optional(),
  alamatPemilikBaru: z.string().nullable().optional(),
  blokPemilikBaru: z.string().nullable().optional(),
  rtPemilikBaru: z.string().nullable().optional(),
  rwPemilikBaru: z.string().nullable().optional(),

  kecamatanPemilikBaru: z.string().nullable().optional(),
  desaPemilikBaru: z.string().nullable().optional(),

  alamatObjekBaru: z.string().nullable().optional(),
  blokObjekBaru: z.string().nullable().optional(),
  rtObjekBaru: z.string().nullable().optional(),
  rwObjekBaru: z.string().nullable().optional(),

  kecamatanObjekBaru: z.string().nullable().optional(),
  desaObjekBaru: z.string().nullable().optional(),

  luasTanahBaru: z.coerce.number().nullable().optional(),
  luasBangunanBaru: z.coerce.number().nullable().optional(),

  sertifikatBaru: z.string().nullable().optional(),

  catatan: z.string().nullable().optional(),
});


/**
 * ============================================================
 * HELPER: REQUIRED STRING
 * ============================================================
 */

function requireString(
  value: string | null | undefined,
  path: (string | number)[],
  message: string,
  ctx: z.RefinementCtx
) {
  if (value == null || value.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      message,
      path,
    });
  }
}


/**
 * ============================================================
 * HELPER: REQUIRED NUMBER >= 0
 * ============================================================
 */

function requireNonNegativeNumber(
  value: number | null | undefined,
  path: (string | number)[],
  message: string,
  ctx: z.RefinementCtx
) {
  if (
    value == null ||
    Number.isNaN(value) ||
    value < 0
  ) {
    ctx.addIssue({
      code: 'custom',
      message,
      path,
    });
  }
}


/**
 * ============================================================
 * HELPER: VALIDASI DATA LAMA SNAPSHOT
 * ============================================================
 */

function validateDataLamaSnapshot(
  data: {
    namaPemilikLama?: string | null;

    alamatPemilikLama?: string | null;
    blokPemilikLama?: string | null;
    rtPemilikLama?: string | null;
    rwPemilikLama?: string | null;

    kecamatanPemilikLama?: string | null;
    desaPemilikLama?: string | null;

    alamatObjekLama?: string | null;
    blokObjekLama?: string | null;
    rtObjekLama?: string | null;
    rwObjekLama?: string | null;

    kecamatanObjekLama?: string | null;
    desaObjekLama?: string | null;

    luasTanahLama?: number | null;
    luasBangunanLama?: number | null;

    sertifikatLama?: string | null;
  },
  ctx: z.RefinementCtx
) {
  requireString(
    data.namaPemilikLama,
    ['namaPemilikLama'],
    'Nama pemilik lama wajib diisi',
    ctx
  );

  requireString(
    data.alamatObjekLama,
    ['alamatObjekLama'],
    'Alamat objek lama wajib diisi',
    ctx
  );

  requireString(
    data.blokObjekLama,
    ['blokObjekLama'],
    'Blok objek lama wajib diisi',
    ctx
  );

  requireString(
    data.rtObjekLama,
    ['rtObjekLama'],
    'RT objek lama wajib diisi',
    ctx
  );

  requireString(
    data.rwObjekLama,
    ['rwObjekLama'],
    'RW objek lama wajib diisi',
    ctx
  );

  requireString(
    data.kecamatanObjekLama,
    ['kecamatanObjekLama'],
    'Kecamatan objek lama wajib diisi',
    ctx
  );

  requireString(
    data.desaObjekLama,
    ['desaObjekLama'],
    'Desa objek lama wajib diisi',
    ctx
  );

  requireNonNegativeNumber(
    data.luasTanahLama,
    ['luasTanahLama'],
    'Luas tanah lama wajib diisi dan harus >= 0',
    ctx
  );

  requireNonNegativeNumber(
    data.luasBangunanLama,
    ['luasBangunanLama'],
    'Luas bangunan lama wajib diisi dan harus >= 0',
    ctx
  );

}


/**
 * ============================================================
 * 6. HELPER: VALIDASI DATA LAMA ITEM
 * ============================================================
 *
 * Digunakan KHUSUS untuk:
 *
 * MUTASI_PENGGABUNGAN
 *
 * Aturan:
 *
 * WAJIB:
 * - nopLama
 * - namaPemilikLama
 * - kecamatanPemilikLama
 * - desaPemilikLama
 * - alamatObjekLama
 * - blokObjekLama
 * - rtObjekLama
 * - rwObjekLama
 * - kecamatanObjekLama
 * - desaObjekLama
 * - luasTanahLama
 * - luasBangunanLama
 *
 * OPTIONAL:
 * - alamatPemilikLama
 * - blokPemilikLama
 * - rtPemilikLama
 * - rwPemilikLama
 * - sertifikatLama
 */

function validateDataLamaItem(
  item: z.infer<typeof dataLamaItemSchema>,
  index: number,
  ctx: z.RefinementCtx
) {
  const basePath = ['dataLama', index] as (string | number)[];


  // ==========================================================
  // NOP LAMA
  // ==========================================================

  requireString(
    item.nopLama,
    [...basePath, 'nopLama'],
    'NOP lama wajib diisi',
    ctx
  );


  // ==========================================================
  // DATA PEMILIK LAMA
  // ==========================================================

  requireString(
    item.namaPemilikLama,
    [...basePath, 'namaPemilikLama'],
    'Nama pemilik lama wajib diisi',
    ctx
  );

  /*
   * alamatPemilikLama -> OPTIONAL
   * blokPemilikLama   -> OPTIONAL
   * rtPemilikLama     -> OPTIONAL
   * rwPemilikLama     -> OPTIONAL
   */

  /*
   * kecamatanPemilikLama -> OPTIONAL
   * desaPemilikLama      -> OPTIONAL
   */


  // ==========================================================
  // DATA OBJEK LAMA
  // ==========================================================

  requireString(
    item.alamatObjekLama,
    [...basePath, 'alamatObjekLama'],
    'Alamat objek lama wajib diisi',
    ctx
  );

  requireString(
    item.blokObjekLama,
    [...basePath, 'blokObjekLama'],
    'Blok objek lama wajib diisi',
    ctx
  );

  requireString(
    item.rtObjekLama,
    [...basePath, 'rtObjekLama'],
    'RT objek lama wajib diisi',
    ctx
  );

  requireString(
    item.rwObjekLama,
    [...basePath, 'rwObjekLama'],
    'RW objek lama wajib diisi',
    ctx
  );

  requireString(
    item.kecamatanObjekLama,
    [...basePath, 'kecamatanObjekLama'],
    'Kecamatan objek lama wajib diisi',
    ctx
  );

  requireString(
    item.desaObjekLama,
    [...basePath, 'desaObjekLama'],
    'Desa objek lama wajib diisi',
    ctx
  );


  // ==========================================================
  // LUAS
  // ==========================================================

  requireNonNegativeNumber(
    item.luasTanahLama,
    [...basePath, 'luasTanahLama'],
    'Luas tanah lama wajib diisi dan harus >= 0',
    ctx
  );

  requireNonNegativeNumber(
    item.luasBangunanLama,
    [...basePath, 'luasBangunanLama'],
    'Luas bangunan lama wajib diisi dan harus >= 0',
    ctx
  );

  /*
   * sertifikatLama -> OPTIONAL
   */
}


/**
 * ============================================================
 * 7. HELPER: VALIDASI DATA LAMA LENGKAP
 * ============================================================
 *
 * Digunakan untuk:
 *
 * - PENGAKTIFAN
 * - PEMBETULAN
 *
 * SEMUA FIELD DATA LAMA WAJIB.
 */

function validateAllDataLamaSnapshot(
  data: {
    namaPemilikLama?: string | null;

    alamatPemilikLama?: string | null;
    blokPemilikLama?: string | null;
    rtPemilikLama?: string | null;
    rwPemilikLama?: string | null;

    kecamatanPemilikLama?: string | null;
    desaPemilikLama?: string | null;

    alamatObjekLama?: string | null;
    blokObjekLama?: string | null;
    rtObjekLama?: string | null;
    rwObjekLama?: string | null;

    kecamatanObjekLama?: string | null;
    desaObjekLama?: string | null;

    luasTanahLama?: number | null;
    luasBangunanLama?: number | null;

    sertifikatLama?: string | null;
  },
  ctx: z.RefinementCtx
) {
  requireString(
    data.namaPemilikLama,
    ['namaPemilikLama'],
    'Nama pemilik lama wajib diisi',
    ctx
  );

  requireString(
    data.alamatPemilikLama,
    ['alamatPemilikLama'],
    'Alamat pemilik lama wajib diisi',
    ctx
  );

  requireString(
    data.blokPemilikLama,
    ['blokPemilikLama'],
    'Blok pemilik lama wajib diisi',
    ctx
  );

  requireString(
    data.rtPemilikLama,
    ['rtPemilikLama'],
    'RT pemilik lama wajib diisi',
    ctx
  );

  requireString(
    data.rwPemilikLama,
    ['rwPemilikLama'],
    'RW pemilik lama wajib diisi',
    ctx
  );

  /*
   * kecamatanPemilikLama -> OPTIONAL
   * desaPemilikLama      -> OPTIONAL
   */

  requireString(
    data.alamatObjekLama,
    ['alamatObjekLama'],
    'Alamat objek lama wajib diisi',
    ctx
  );

  requireString(
    data.blokObjekLama,
    ['blokObjekLama'],
    'Blok objek lama wajib diisi',
    ctx
  );

  requireString(
    data.rtObjekLama,
    ['rtObjekLama'],
    'RT objek lama wajib diisi',
    ctx
  );

  requireString(
    data.rwObjekLama,
    ['rwObjekLama'],
    'RW objek lama wajib diisi',
    ctx
  );

  requireString(
    data.kecamatanObjekLama,
    ['kecamatanObjekLama'],
    'Kecamatan objek lama wajib diisi',
    ctx
  );

  requireString(
    data.desaObjekLama,
    ['desaObjekLama'],
    'Desa objek lama wajib diisi',
    ctx
  );

  requireNonNegativeNumber(
    data.luasTanahLama,
    ['luasTanahLama'],
    'Luas tanah lama wajib diisi dan harus >= 0',
    ctx
  );

  requireNonNegativeNumber(
    data.luasBangunanLama,
    ['luasBangunanLama'],
    'Luas bangunan lama wajib diisi dan harus >= 0',
    ctx
  );

  requireString(
    data.sertifikatLama,
    ['sertifikatLama'],
    'Sertifikat lama wajib diisi',
    ctx
  );
}


/**
 * ============================================================
 * 8. HELPER: VALIDASI DATA BARU
 * ============================================================
 *
 * requireNopBaru:
 *
 * true:
 *   NOP baru WAJIB
 *
 * false:
 *   NOP baru OPTIONAL
 *
 * Field lainnya SELALU WAJIB jika dataBaru memang dibutuhkan
 * oleh jenis layanan tersebut.
 */

function validateDataBaru(
  dataBaru: z.infer<typeof dataBaruItemSchema>[] | undefined,
  ctx: z.RefinementCtx,
  requireNopBaru: boolean
) {
  // ==========================================================
  // MINIMAL 1 DATA BARU
  // ==========================================================

  if (!dataBaru || dataBaru.length === 0) {

    ctx.addIssue({
      code: 'custom',
      message: 'Minimal 1 data baru wajib diisi',
      path: ['dataBaru'],
    });

    return;
  }


  // ==========================================================
  // VALIDASI SETIAP ITEM
  // ==========================================================

  dataBaru.forEach((item, index) => {

    const basePath = ['dataBaru', index] as (string | number)[];


    // ========================================================
    // NOP BARU
    // ========================================================

    if (requireNopBaru) {

      requireString(
        item.nopBaru,
        [...basePath, 'nopBaru'],
        'NOP baru wajib diisi',
        ctx
      );

    }


    // ========================================================
    // DATA PEMILIK BARU
    // ========================================================

    requireString(
      item.namaPemilikBaru,
      [...basePath, 'namaPemilikBaru'],
      'Nama pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.alamatPemilikBaru,
      [...basePath, 'alamatPemilikBaru'],
      'Alamat pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.blokPemilikBaru,
      [...basePath, 'blokPemilikBaru'],
      'Blok pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.rtPemilikBaru,
      [...basePath, 'rtPemilikBaru'],
      'RT pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.rwPemilikBaru,
      [...basePath, 'rwPemilikBaru'],
      'RW pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.kecamatanPemilikBaru,
      [...basePath, 'kecamatanPemilikBaru'],
      'Kecamatan pemilik baru wajib diisi',
      ctx
    );

    requireString(
      item.desaPemilikBaru,
      [...basePath, 'desaPemilikBaru'],
      'Desa pemilik baru wajib diisi',
      ctx
    );


    // ========================================================
    // DATA OBJEK BARU
    // ========================================================

    requireString(
      item.alamatObjekBaru,
      [...basePath, 'alamatObjekBaru'],
      'Alamat objek baru wajib diisi',
      ctx
    );

    requireString(
      item.blokObjekBaru,
      [...basePath, 'blokObjekBaru'],
      'Blok objek baru wajib diisi',
      ctx
    );

    requireString(
      item.rtObjekBaru,
      [...basePath, 'rtObjekBaru'],
      'RT objek baru wajib diisi',
      ctx
    );

    requireString(
      item.rwObjekBaru,
      [...basePath, 'rwObjekBaru'],
      'RW objek baru wajib diisi',
      ctx
    );

    requireString(
      item.kecamatanObjekBaru,
      [...basePath, 'kecamatanObjekBaru'],
      'Kecamatan objek baru wajib diisi',
      ctx
    );

    requireString(
      item.desaObjekBaru,
      [...basePath, 'desaObjekBaru'],
      'Desa objek baru wajib diisi',
      ctx
    );


    // ========================================================
    // LUAS
    // ========================================================

    requireNonNegativeNumber(
      item.luasTanahBaru,
      [...basePath, 'luasTanahBaru'],
      'Luas tanah baru wajib diisi dan harus >= 0',
      ctx
    );

    requireNonNegativeNumber(
      item.luasBangunanBaru,
      [...basePath, 'luasBangunanBaru'],
      'Luas bangunan baru wajib diisi dan harus >= 0',
      ctx
    );


    // ========================================================
    // SERTIFIKAT BARU
    // ========================================================

    requireString(
      item.sertifikatBaru,
      [...basePath, 'sertifikatBaru'],
      'Sertifikat baru wajib diisi',
      ctx
    );

  });
}


/**
 * ============================================================
 * 9. SCHEMA PERMOHONAN UTAMA
 * ============================================================
 */

export const permohonanSchema = z.object({

  // ==========================================================
  // INFORMASI PERMOHONAN
  // ==========================================================

  jenisPermohonan: z.enum([
    'MUTASI_SEBAGIAN',
    'MUTASI_PENGGABUNGAN',
    'MUTASI_HABIS_UPDATE',
    'MUTASI_HABIS_REGULER',
    'OBJEK_PAJAK_BARU',
    'PEMBETULAN',
    'PENGAKTIFAN',
  ] as const),

  nomorPelayanan: z.string().nullable().optional(),

  tanggalNoPelayanan: z.string().nullable().optional(),

  tanggalPenyelesaian: z.string().nullable().optional(),

  nop: z.string().nullable().optional(),

  noWhatsapp: z.string().nullable().optional(),


  // ==========================================================
  // SNAPSHOT DATA LAMA
  // ==========================================================

  namaPemilikLama: z.string().nullable().optional(),
  alamatPemilikLama: z.string().nullable().optional(),
  blokPemilikLama: z.string().nullable().optional(),
  rtPemilikLama: z.string().nullable().optional(),
  rwPemilikLama: z.string().nullable().optional(),

  kecamatanPemilikLama: z.string().nullable().optional(),
  desaPemilikLama: z.string().nullable().optional(),

  alamatObjekLama: z.string().nullable().optional(),
  blokObjekLama: z.string().nullable().optional(),
  rtObjekLama: z.string().nullable().optional(),
  rwObjekLama: z.string().nullable().optional(),

  kecamatanObjekLama: z.string().nullable().optional(),
  desaObjekLama: z.string().nullable().optional(),

  luasTanahLama: z.coerce.number().nullable().optional(),
  luasBangunanLama: z.coerce.number().nullable().optional(),

  sertifikatLama: z.string().nullable().optional(),


  // ==========================================================
  // ARRAY DATA LAMA
  // ==========================================================

  dataLama: z.array(dataLamaItemSchema).nullable().optional(),


  // ==========================================================
  // ARRAY DATA BARU
  // ==========================================================

  dataBaru: z.array(dataBaruItemSchema).nullable().optional(),

}).superRefine((data, ctx) => {

  const {
    jenisPermohonan,
    nop,
    dataLama,
    dataBaru,
  } = data;


  // ==========================================================
  // A. VALIDASI FIELD UMUM
  // ==========================================================

  requireString(
    data.nomorPelayanan,
    ['nomorPelayanan'],
    'Nomor pelayanan wajib diisi',
    ctx
  );

  requireString(
    data.tanggalNoPelayanan,
    ['tanggalNoPelayanan'],
    'Tanggal nomor pelayanan wajib diisi',
    ctx
  );

  requireString(
    data.tanggalPenyelesaian,
    ['tanggalPenyelesaian'],
    'Tanggal penyelesaian wajib diisi',
    ctx
  );

  requireString(
    data.noWhatsapp,
    ['noWhatsapp'],
    'Nomor WhatsApp wajib diisi',
    ctx
  );

  if (
    data.noWhatsapp != null &&
    data.noWhatsapp.trim() !== '' &&
    !/^(08|628)\d{8,12}$/.test(data.noWhatsapp)
  ) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Nomor WhatsApp tidak valid (contoh: 08123456789)',
      path: ['noWhatsapp'],
    });
  }


  // ==========================================================
  // B. VALIDASI NOP UTAMA
  // ==========================================================

  /**
   * OBJEK_PAJAK_BARU:
   * NOP utama tidak wajib.
   *
   * Layanan lainnya:
   * NOP utama wajib dan harus 18 digit.
   */

  if (jenisPermohonan !== 'OBJEK_PAJAK_BARU') {

    if (!nop || nop.trim() === '') {

      ctx.addIssue({
        code: 'custom',
        message: 'NOP wajib diisi',
        path: ['nop'],
      });

    } else {

      const cleanNop = nop.replace(/[.\-]/g, '');

      if (!/^\d{18}$/.test(cleanNop)) {

        ctx.addIssue({
          code: 'custom',
          message:
            'NOP harus terdiri dari 18 digit angka',
          path: ['nop'],
        });

      }

    }
  }


  // ==========================================================
  // C. OBJEK PAJAK BARU
  // ==========================================================

  if (jenisPermohonan === 'OBJEK_PAJAK_BARU') {

    /**
     * DATA LAMA:
     *
     * SEMUA FIELD BOLEH KOSONG.
     *
     * Tidak ada validasi required pada data lama.
     */


    /**
     * DATA BARU:
     *
     * Minimal 1 item.
     *
     * SEMUA FIELD WAJIB.
     *
     * Termasuk:
     * - nopBaru
     * - namaPemilikBaru
     * - alamatPemilikBaru
     * - blokPemilikBaru
     * - rtPemilikBaru
     * - rwPemilikBaru
     * - kecamatanPemilikBaru
     * - desaPemilikBaru
     * - alamatObjekBaru
     * - blokObjekBaru
     * - rtObjekBaru
     * - rwObjekBaru
     * - kecamatanObjekBaru
     * - desaObjekBaru
     * - luasTanahBaru
     * - luasBangunanBaru
     * - sertifikatBaru
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      true
    );


    /**
     * OBJEK PAJAK BARU hanya memiliki 1 data baru.
     */

    if (dataBaru && dataBaru.length > 1) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Objek Pajak Baru hanya diperbolehkan memiliki 1 data baru',
        path: ['dataBaru'],
      });

    }

    return;
  }


  // ==========================================================
  // D. PENGAKTIFAN
  // ==========================================================

  if (jenisPermohonan === 'PENGAKTIFAN') {

    /**
     * DATA LAMA:
     *
     * SEMUA FIELD WAJIB.
     */

    validateAllDataLamaSnapshot(
      data,
      ctx
    );


    /**
     * DATA BARU:
     *
     * TIDAK WAJIB.
     *
     * Jadi:
     *
     * dataBaru undefined -> VALID
     * dataBaru null      -> VALID
     * dataBaru []        -> VALID
     *
     * Jika diisi, tidak dipaksa lengkap.
     */

    return;
  }


  // ==========================================================
  // E. MUTASI PENGGABUNGAN
  // ==========================================================

  if (jenisPermohonan === 'MUTASI_PENGGABUNGAN') {

    /**
     * DATA LAMA:
     *
     * Wajib berupa array.
     *
     * Minimal 2 NOP asal.
     */

    if (!dataLama || dataLama.length < 2) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Mutasi Penggabungan wajib memiliki minimal 2 NOP asal',
        path: ['dataLama'],
      });

    } else {

      /**
       * Setiap item data lama wajib memenuhi:
       *
       * WAJIB:
       * - nopLama
       * - namaPemilikLama
       * - kecamatanPemilikLama
       * - desaPemilikLama
       * - alamatObjekLama
       * - blokObjekLama
       * - rtObjekLama
       * - rwObjekLama
       * - kecamatanObjekLama
       * - desaObjekLama
       * - luasTanahLama
       * - luasBangunanLama
       *
       * OPTIONAL:
       * - alamatPemilikLama
       * - blokPemilikLama
       * - rtPemilikLama
       * - rwPemilikLama
       * - sertifikatLama
       */

      dataLama.forEach((item, index) => {

        validateDataLamaItem(
          item,
          index,
          ctx
        );

      });
    }


    /**
     * DATA BARU:
     *
     * Minimal 1.
     *
     * Semua field wajib kecuali nopBaru.
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      false
    );


    /**
     * Hanya boleh 1 data baru.
     */

    if (dataBaru && dataBaru.length > 1) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Mutasi Penggabungan hanya diperbolehkan memiliki 1 data baru',
        path: ['dataBaru'],
      });

    }

    return;
  }


  // ==========================================================
  // F. MUTASI HABIS UPDATE
  // ==========================================================

  if (jenisPermohonan === 'MUTASI_HABIS_UPDATE') {

    /**
     * DATA LAMA:
     *
     * WAJIB:
     * - namaPemilikLama
     * - kecamatanPemilikLama
     * - desaPemilikLama
     * - alamatObjekLama
     * - blokObjekLama
     * - rtObjekLama
     * - rwObjekLama
     * - kecamatanObjekLama
     * - desaObjekLama
     * - luasTanahLama
     * - luasBangunanLama
     *
     * OPTIONAL:
     * - alamatPemilikLama
     * - blokPemilikLama
     * - rtPemilikLama
     * - rwPemilikLama
     * - sertifikatLama
     */

    validateDataLamaSnapshot(
      data,
      ctx
    );


    /**
     * DATA BARU:
     *
     * Semua wajib kecuali nopBaru.
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      false
    );


    /**
     * Maksimal 1 data baru.
     */

    if (dataBaru && dataBaru.length > 1) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Mutasi Habis Update hanya diperbolehkan memiliki 1 data baru',
        path: ['dataBaru'],
      });

    }

    return;
  }


  // ==========================================================
  // G. MUTASI HABIS REGULER
  // ==========================================================

  if (jenisPermohonan === 'MUTASI_HABIS_REGULER') {

    /**
     * DATA LAMA:
     *
     * WAJIB:
     * - namaPemilikLama
     * - kecamatanPemilikLama
     * - desaPemilikLama
     * - alamatObjekLama
     * - blokObjekLama
     * - rtObjekLama
     * - rwObjekLama
     * - kecamatanObjekLama
     * - desaObjekLama
     * - luasTanahLama
     * - luasBangunanLama
     *
     * OPTIONAL:
     * - alamatPemilikLama
     * - blokPemilikLama
     * - rtPemilikLama
     * - rwPemilikLama
     * - sertifikatLama
     */

    validateDataLamaSnapshot(
      data,
      ctx
    );


    /**
     * DATA BARU:
     *
     * Semua wajib kecuali nopBaru.
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      false
    );


    /**
     * Maksimal 1 data baru.
     */

    if (dataBaru && dataBaru.length > 1) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Mutasi Habis Reguler hanya diperbolehkan memiliki 1 data baru',
        path: ['dataBaru'],
      });

    }

    return;
  }


  // ==========================================================
  // H. MUTASI SEBAGIAN
  // ==========================================================

  if (jenisPermohonan === 'MUTASI_SEBAGIAN') {

    /**
     * DATA LAMA:
     *
     * WAJIB:
     * - namaPemilikLama
     * - kecamatanPemilikLama
     * - desaPemilikLama
     * - alamatObjekLama
     * - blokObjekLama
     * - rtObjekLama
     * - rwObjekLama
     * - kecamatanObjekLama
     * - desaObjekLama
     * - luasTanahLama
     * - luasBangunanLama
     *
     * OPTIONAL:
     * - alamatPemilikLama
     * - blokPemilikLama
     * - rtPemilikLama
     * - rwPemilikLama
     * - sertifikatLama
     */

    validateDataLamaSnapshot(
      data,
      ctx
    );


    /**
     * DATA BARU:
     *
     * Minimal 1.
     *
     * Semua field wajib kecuali nopBaru.
     *
     * MUTASI_SEBAGIAN BOLEH memiliki lebih dari 1 data baru.
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      false
    );

    return;
  }


  // ==========================================================
  // I. PEMBETULAN
  // ==========================================================

  if (jenisPermohonan === 'PEMBETULAN') {

    /**
     * DATA LAMA:
     *
     * SEMUA FIELD WAJIB.
     */

    validateAllDataLamaSnapshot(
      data,
      ctx
    );


    /**
     * DATA BARU:
     *
     * Semua field wajib kecuali nopBaru.
     */

    validateDataBaru(
      dataBaru ?? undefined,
      ctx,
      false
    );


    /**
     * PEMBETULAN hanya boleh memiliki 1 data baru.
     */

    if (dataBaru && dataBaru.length > 1) {

      ctx.addIssue({
        code: 'custom',
        message:
          'Pembetulan hanya diperbolehkan memiliki 1 data baru',
        path: ['dataBaru'],
      });

    }

    return;
  }

}); 
