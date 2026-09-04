/**
 *  OPTIONS JENIS PERMOHONAN
 */
export const APPLICATION_TYPE_OPTIONS = [
  { value: 'PARTIAL_MUTATION', label: 'MUTASI SEBAGIAN' },
  { value: 'MERGER_MUTATION', label: 'MUTASI PENGGABUNGAN' },
  { value: 'EXPIRED_UPDATE', label: 'MUTASI HABIS UPDATE' },
  { value: 'EXPIRED_REGULAR', label: 'MUTASI HABIS REGULER' },
  { value: 'NEW_TAX_OBJECT', label: 'OBJEK PAJAK BARU' },
  { value: 'CORRECTION', label: 'PEMBETULAN' },
  { value: 'REACTIVATION', label: 'PENGAKTIFAN' }
] as const;

/**
 *  LAYANAN YANG MEMBUTUHKAN DATA LAMA (PREVIOUS DATA)
 */
export const SERVICES_NEED_PREVIOUS_DATA = [
  'PARTIAL_MUTATION',
  'MERGER_MUTATION',
  'EXPIRED_UPDATE',
  'EXPIRED_REGULAR',
  'CORRECTION',
  'REACTIVATION'
];

/**
 *  LAYANAN YANG MEMBUTUHKAN DATA BARU (TARGET DATA)
 */
export const SERVICES_NEED_TARGET_DATA = [
  'PARTIAL_MUTATION',
  'MERGER_MUTATION',
  'EXPIRED_UPDATE',
  'EXPIRED_REGULAR',
  'CORRECTION',
  'NEW_TAX_OBJECT'
];


// DATA WILAYAH (TIDAK BERUBAH, KARENA INI ADALAH DOMAIN BUSINESS LOGIC)
export const KECAMATAN_DATA: Record<string, string[]> = {
  'PAKUHAJI': [
    "KALIBARU", "SURYA BAHARI", "SUKAWALI", "KRAMAT", "KOHOD", "GAGA",
    "KIARA PAYUNG", "BUARAN BAMBU", "PAKU ALAM", "BUARAN MANGGA", "PAKUHAJI",
    "BUNISARI", "LAKSANA", "RAWABONI",
  ],
  'KOSAMBI': [
    "SALEMBARAN JAYA", "SALEMBARAN JATI", "KOSAMBI BARAT", "KOSAMBI TIMUR",
    "DADAP", "JATIMULYA", "CENGKLONG", "BLIMBING", "RAWA BURUNG", "RAWA RENGAS",
  ],
  'TELUKNAGA': [
    "BOJONG RENGED", "KEBON CAU", "TELUKNAGA", "BABAKAN ASEM",
    "KAMPUNG MELAYU TIMUR", "KAMPUNG MELAYU BARAT", "KAMPUNG BESAR", "LEMO",
    "TEGAL ANGUS", "PANGKALAN", "TANJUNG BURUNG", "TANJUNG PASIR", "MUARA",
  ],
  'SEPATAN TIMUR': [
    "KEDAUNG BARAT", "LEBAK WANGI", "TANAH MERAH", "JATI MULYA",
    "GEMPOLSARI", "SANGIANG", "PONDOK KELOR", "KAMPUNG KELOR",
  ],
  'SEPATAN': [
    "MEKARJAYA", "KARET", "LEBAK WANGI", "KEDAUNG BARAT", "PONDOK JAYA",
    "SEPATAN", "PISANGAN JAYA", "SARAKAN", "TANAH MERAH", "JATI MULYA",
    "GEMPOLSARI", "SANGIANG", "KAYU AGUNG", "KAYU BONGKOK", "KAMPUNG KELOR"
  ],
};

// MAPPING NOP BERDASARKAN KECAMATAN
export const NOP_MAPPING: Record<string, { name: string, villages: Record<string, string> }> = {
  '150': {
    name: 'SEPATAN',
    villages: {
      '001': 'MEKARJAYA', '002': 'KARET', '003': 'LEBAK WANGI', '004': 'KEDAUNG BARAT',
      '005': 'PONDOK JAYA', '006': 'SEPATAN', '007': 'PISANGAN JAYA', '008': 'SARAKAN',
      '009': 'TANAH MERAH', '010': 'JATI MULYA', '011': 'GEMPOLSARI', '012': 'SANGIANG',
      '013': 'KAYU AGUNG', '014': 'KAYU BONGKOK', '023': 'KAMPUNG KELOR',
    }
  },
  '151': {
    name: 'PAKUHAJI',
    villages: {
      '001': 'KALIBARU', '002': 'SURYA BAHARI', '003': 'SUKAWALI', '004': 'KRAMAT',
      '005': 'KOHOD', '006': 'GAGA', '007': 'KIARA PAYUNG', '008': 'BUARAN BAMBU',
      '009': 'PAKU ALAM', '010': 'BUARAN MANGGA', '011': 'PAKUHAJI', '012': 'BUNISARI',
      '013': 'LAKSANA', '014': 'RAWABONI',
    }
  },
  '152': {
    name: 'SEPATAN TIMUR',
    villages: {
      '001': 'KEDAUNG BARAT', '002': 'LEBAK WANGI', '003': 'TANAH MERAH', '004': 'JATI MULYA',
      '005': 'GEMPOLSARI', '006': 'SANGIANG', '007': 'PONDOK KELOR', '008': 'KAMPUNG KELOR',
    }
  },
  '160': {
    name: 'TELUKNAGA',
    villages: {
      '002': 'BOJONG RENGED', '004': 'KEBON CAU', '005': 'TELUKNAGA', '006': 'BABAKAN ASEM',
      '015': 'KAMP MELAYU T', '016': 'KAMP MELAYU B', '017': 'KAMPUNG BESAR', '018': 'LEMO',
      '019': 'TEGAL ANGUS', '020': 'PANGKALAN', '021': 'TANJUNG BURUNG', '022': 'TANJUNG PASIR', '023': 'MUARA',
    }
  },
  '161': {
    name: 'KOSAMBI',
    villages: {
      '001': 'SALEMBARAN JAYA', '002': 'SALEMBARAN JATI', '003': 'KOSAMBI BARAT', '004': 'KOSAMBI TIMUR',
      '005': 'DADAP', '006': 'JATIMULYA', '007': 'CENGKLONG', '008': 'BLIMBING',
      '009': 'RAWA BURUNG', '010': 'RAWA RENGAS',
    }
  }
};


/**
 * MEMBUAT DATA PREVIOUS DATA KOSONG
 */
export const createEmptyPreviousDataItem = () => ({
  nop: '',
  ownerName: '',
  whatsappNumber: '',
  ownerAddress: '',
  ownerBlock: '',
  ownerRt: '',
  ownerRw: '',
  ownerKecamatan: '',
  ownerDesa: '',
  objectAddress: '',
  objectBlock: '',
  objectRt: '',
  objectRw: '',
  objectKecamatan: '',
  objectDesa: '',
  landArea: 0,
  buildingArea: 0,
  certificate: '',
  isPrimary: false,
  notes: ''
});

/**
 * MEMBUAT DATA TARGET DATA KOSONG
 */
export const createEmptyTargetDataItem = () => ({
  nopTemporary: '',
  ownerName: '',
  whatsappNumber: '',
  ownerAddress: '',
  ownerBlock: '',
  ownerRt: '',
  ownerRw: '',
  ownerKecamatan: '',
  ownerDesa: '',
  objectAddress: '',
  objectBlock: '',
  objectRt: '',
  objectRw: '',
  objectKecamatan: '',
  objectDesa: '',
  landArea: 0,
  buildingArea: 0,
  certificate: '',
  notes: '',
  files: []
});

/**
 * FORMAT ALAMAT LENGKAP
 */
export const formatAlamatLengkap = (opts: {
  alamat?: string | null;
  blok?: string | null;
  rt?: string | null;
  rw?: string | null;
}): string => {
  const parts: string[] = [];
  if (opts.alamat?.trim()) parts.push(opts.alamat.trim());
  if (opts.blok?.trim()) parts.push(`Blok ${opts.blok.trim()}`);
  if (opts.rt?.trim() || opts.rw?.trim()) {
    const rtStr = opts.rt?.trim() || '-';
    const rwStr = opts.rw?.trim() || '-';
    parts.push(`RT ${rtStr}/RW ${rwStr}`);
  }
  return parts.join(' ');
};

/**
 * FORMAT TEXT MENJADI TITLE CASE
 */
export const toTitleCase = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * FORMAT NOP MENJADI XX.XX.XXX.XXX.XXX-XXXX.X
 */
export const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/\D/g, '');
  if (cleanNop.length === 17 || cleanNop.length === 18) {
    const p = cleanNop.length === 17 ? cleanNop + '0' : cleanNop;
    return `${p.slice(0, 2)}.${p.slice(2, 4)}.${p.slice(4, 7)}.${p.slice(7, 10)}.${p.slice(10, 13)}-${p.slice(13, 17)}.${p.slice(17)}`;
  }
  return nop;
};

// Backward Compatibility Export Aliases
export const JENIS_OPTIONS = APPLICATION_TYPE_OPTIONS;
export const SERVICES_NEED_DATA_LAMA = SERVICES_NEED_PREVIOUS_DATA;
export const SERVICES_NEED_DATA_BARU = SERVICES_NEED_TARGET_DATA;
export const createEmptyDataBaruItem = createEmptyTargetDataItem;

/**
 * CLEAN PECAHAN SUFFIX FROM NAME
 */
export const cleanPecahanSuffix = (name?: string | null): string => {
  if (!name) return '';
  return name
    .replace(/\s*\([^)]*pecahan[^)]*\)/gi, '')
    .replace(/\s*\(Pecahan\s*\d+\)/gi, '')
    .replace(/\s*Pecahan\s*\d+/gi, '')
    .trim();
};