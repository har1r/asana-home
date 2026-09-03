import { z } from 'zod';

export const ApplicationTypeEnum = z.enum([
  'PARTIAL_MUTATION',       // Mutasi Sebagian
  'MERGER_MUTATION',        // Mutasi Penggabungan
  'EXPIRED_UPDATE',         // Mutasi Habis Update
  'EXPIRED_REGULAR',        // Mutasi Habis Reguler
  'NEW_TAX_OBJECT',         // Objek Pajak Baru
  'CORRECTION',             // Pembetulan
  'REACTIVATION',           // Pengaktifan
]);

export type ApplicationType = z.infer<typeof ApplicationTypeEnum>;

export const previousDataItemSchema = z.object({
  nop: z.string(),
  ownerName: z.string(),
  whatsappNumber: z.string().nullable().optional(),
  ownerAddress: z.string().nullable().optional(),
  ownerBlock: z.string().nullable().optional(),
  ownerRt: z.string().nullable().optional(),
  ownerRw: z.string().nullable().optional(),
  ownerKecamatan: z.string().nullable().optional(),
  ownerDesa: z.string().nullable().optional(),
  objectAddress: z.string(),
  objectBlock: z.string().nullable().optional(),
  objectRt: z.string().nullable().optional(),
  objectRw: z.string().nullable().optional(),
  objectKecamatan: z.string(),
  objectDesa: z.string(),
  landArea: z.coerce.number(),
  buildingArea: z.coerce.number().nullable().optional(),
  certificate: z.string().nullable().optional(),
  isPrimary: z.coerce.boolean().default(false),
  notes: z.string().nullable().optional(),
});

export const targetDataItemSchema = z.object({
  nopTemporary: z.string(),
  ownerName: z.string(),
  whatsappNumber: z.string(),
  ownerAddress: z.string(),
  ownerBlock: z.string().nullable().optional(),
  ownerRt: z.string().nullable().optional(),
  ownerRw: z.string().nullable().optional(),
  ownerKecamatan: z.string(),
  ownerDesa: z.string(),
  objectAddress: z.string(),
  objectBlock: z.string().nullable().optional(),
  objectRt: z.string().nullable().optional(),
  objectRw: z.string().nullable().optional(),
  objectKecamatan: z.string(),
  objectDesa: z.string(),
  landArea: z.coerce.number(),
  buildingArea: z.coerce.number().nullable().optional(),
  certificate: z.string(),
  notes: z.string().nullable().optional(),
});


// HELPERS
function requireString(value: string | null | undefined, path: (string | number)[], message: string, ctx: z.RefinementCtx) {
  if (value == null || value.trim() === '') {
    ctx.addIssue({ code: 'custom', message, path });
  }
}

function requireNonNegativeNumber(value: number | null | undefined, path: (string | number)[], message: string, ctx: z.RefinementCtx) {
  if (value == null || Number.isNaN(value) || value <= 0) {
    ctx.addIssue({ code: 'custom', message, path });
  }
}

function validatePreviousDataItem(item: z.infer<typeof previousDataItemSchema>, index: number, ctx: z.RefinementCtx) {
  const basePath = ['previousData', index] as (string | number)[];

  requireString(item.nop, [...basePath, 'nop'], 'NOP lama wajib diisi', ctx);
  requireString(item.ownerName, [...basePath, 'ownerName'], 'Nama pemilik lama wajib diisi', ctx);
  requireString(item.objectAddress, [...basePath, 'objectAddress'], 'Alamat objek lama wajib diisi', ctx);
  requireString(item.objectKecamatan, [...basePath, 'objectKecamatan'], 'Kecamatan objek lama wajib diisi', ctx);
  requireString(item.objectDesa, [...basePath, 'objectDesa'], 'Desa objek lama wajib diisi', ctx);
  requireNonNegativeNumber(item.landArea, [...basePath, 'landArea'], 'Luas tanah lama wajib diisi dan harus > 0', ctx);
}

function validateTargetDataItem(item: z.infer<typeof targetDataItemSchema>, index: number, ctx: z.RefinementCtx,) {
  const basePath = ['targetData', index] as (string | number)[];

  requireString(item.nopTemporary, [...basePath, 'nopTemporary'], 'NOP sementara wajib diisi', ctx);
  requireString(item.ownerName, [...basePath, 'ownerName'], 'Nama pemilik baru wajib diisi', ctx);
  requireString(item.whatsappNumber, [...basePath, 'whatsappNumber'], 'Nomor WhatsApp wajib diisi', ctx);
  if (item.whatsappNumber && !/^(08|628)\d{8,12}$/.test(item.whatsappNumber)) {
    ctx.addIssue({ code: 'custom', message: 'Nomor WhatsApp tidak valid (contoh: 08123456789)', path: [...basePath, 'whatsappNumber'] });
  }
  requireString(item.ownerAddress, [...basePath, 'ownerAddress'], 'Alamat pemilik baru wajib diisi', ctx);
  requireString(item.ownerKecamatan, [...basePath, 'ownerKecamatan'], 'Kecamatan pemilik baru wajib diisi', ctx);
  requireString(item.ownerDesa, [...basePath, 'ownerDesa'], 'Desa pemilik baru wajib diisi', ctx);
  requireString(item.objectAddress, [...basePath, 'objectAddress'], 'Alamat objek baru wajib diisi', ctx);
  requireString(item.objectKecamatan, [...basePath, 'objectKecamatan'], 'Kecamatan objek baru wajib diisi', ctx);
  requireString(item.objectDesa, [...basePath, 'objectDesa'], 'Desa objek baru wajib diisi', ctx);
  requireNonNegativeNumber(item.landArea, [...basePath, 'landArea'], 'Luas tanah baru wajib diisi dan harus > 0', ctx);
  requireString(item.certificate, [...basePath, 'certificate'], 'Sertifikat baru wajib diisi', ctx);
}

// MAIN SCHEMA
export const applicationSchema = z.object({
  applicationType: ApplicationTypeEnum,
  applicationNumber: z.string().length(11, 'Nomor pelayanan wajib diisi dan terdiri dari 11 karakter'),
  serviceNumberDate: z.string().min(1, 'Tanggal nomor pelayanan wajib diisi').refine((val: string) => !isNaN(Date.parse(val)), 'Tanggal nomor permohonan tidak valid'),
  completionDate: z.string().min(1, 'Tanggal penyelesaian wajib diisi').refine((val: string) => !isNaN(Date.parse(val)), 'Tanggal penyelesaian tidak valid'),

  previousData: z.array(previousDataItemSchema).nullable().optional(),
  targetData: z.array(targetDataItemSchema).nullable().optional(),

}).superRefine((data, ctx) => {
  const { applicationType, previousData, targetData } = data;

  // OBJEK PAJAK BARU
  if (applicationType === 'NEW_TAX_OBJECT') {
    if (previousData && previousData.length > 0) {
      ctx.addIssue({ code: 'custom', message: 'Objek Pajak Baru tidak memiliki data lama', path: ['previousData'] });
    }

    if (!targetData || targetData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data baru wajib diisi', path: ['targetData'] });
      return;
    }

    if (targetData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Objek Pajak Baru hanya diperbolehkan memiliki 1 data baru', path: ['targetData'] });
    }
    targetData.forEach((item, index) => validateTargetDataItem(item, index, ctx));
    return;
  }

  // PENGAKTIFAN (REACTIVATION)
  if (applicationType === 'REACTIVATION') {
    if (!previousData || previousData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data lama wajib diisi', path: ['previousData'] });
      return;
    }

    if (previousData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Pengaktifan hanya diperbolehkan memiliki 1 data lama', path: ['previousData'] });
    }
    previousData.forEach((item, index) => validatePreviousDataItem(item, index, ctx));

    if (targetData && targetData.length > 0) {
      ctx.addIssue({ code: 'custom', message: 'Pengaktifan tidak boleh memiliki data baru', path: ['targetData'] });
    }
    return;
  }

  // MUTASI PENGGABUNGAN
  if (applicationType === 'MERGER_MUTATION') {
    if (!previousData || previousData.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'Mutasi Penggabungan wajib memiliki minimal 2 NOP asal', path: ['previousData'] });
    } else {
      previousData.forEach((item, index) => validatePreviousDataItem(item, index, ctx));
    }

    if (!targetData || targetData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data baru wajib diisi', path: ['targetData'] });
    } else if (targetData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Mutasi Penggabungan hanya diperbolehkan memiliki 1 data baru', path: ['targetData'] });
    } else {
      targetData.forEach((item, index) => validateTargetDataItem(item, index, ctx));
    }
    return;
  }

  // PEMBETULAN
  if (applicationType === 'CORRECTION') {
    if (!previousData || previousData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data lama wajib diisi', path: ['previousData'] });
    } else if (previousData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Pembetulan hanya diperbolehkan memiliki 1 data lama', path: ['previousData'] });
    } else {
      previousData.forEach((item, index) => validatePreviousDataItem(item, index, ctx));
    }

    if (!targetData || targetData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data baru wajib diisi', path: ['targetData'] });
    } else if (targetData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Pembetulan hanya diperbolehkan memiliki 1 data baru', path: ['targetData'] });
    } else {
      targetData.forEach((item, index) => validateTargetDataItem(item, index, ctx));
    }
    return;
  }

  // MUTASI HABIS (UPDATE & REGULER)
  if (applicationType === 'EXPIRED_UPDATE' || applicationType === 'EXPIRED_REGULAR') {
    if (!previousData || previousData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data lama wajib diisi', path: ['previousData'] });
    } else if (previousData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Mutasi Habis hanya diperbolehkan memiliki 1 data lama', path: ['previousData'] });
    } else {
      previousData.forEach((item, index) => validatePreviousDataItem(item, index, ctx));
    }

    if (!targetData || targetData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data baru wajib diisi', path: ['targetData'] });
    } else if (targetData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Mutasi Habis hanya diperbolehkan memiliki 1 data baru', path: ['targetData'] });
    } else {
      targetData.forEach((item, index) => validateTargetDataItem(item, index, ctx));
    }
    return;
  }

  // MUTASI SEBAGIAN
  if (applicationType === 'PARTIAL_MUTATION') {
    if (!previousData || previousData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data lama wajib diisi', path: ['previousData'] });
    } else if (previousData.length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Mutasi Sebagian hanya diperbolehkan memiliki 1 data lama (induk)', path: ['previousData'] });
    } else {
      previousData.forEach((item, index) => validatePreviousDataItem(item, index, ctx));
    }

    if (!targetData || targetData.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Minimal 1 data baru wajib diisi', path: ['targetData'] });
    } else {
      targetData.forEach((item, index) => validateTargetDataItem(item, index, ctx));
    }
    return;
  }
});