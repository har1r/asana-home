/**
 * Shared Constants & Static Data for Permohonan PBB Workspaces
 */

export const JENIS_OPTIONS = [
  { value: 'MUTASI_SEBAGIAN', label: 'MUTASI SEBAGIAN' },
  { value: 'MUTASI_HABIS_UPDATE', label: 'MUTASI HABIS UPDATE' },
  { value: 'MUTASI_HABIS_REGULER', label: 'MUTASI HABIS REGULER' },
  { value: 'OBJEK_PAJAK_BARU', label: 'OBJEK PAJAK BARU' },
  { value: 'PEMBETULAN', label: 'PEMBETULAN' },
  { value: 'PENGAKTIFAN', label: 'PENGAKTIFAN' }
] as const;

export const SERVICES_NEED_DATA_LAMA = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'PENGAKTIFAN'
];

export const SERVICES_NEED_DATA_BARU = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'OBJEK_PAJAK_BARU'
];

// Data Kecamatan dan Desa di wilayah kerja objek pajak (Kabupaten Tangerang)
export const KECAMATAN_DATA: Record<string, string[]> = {
  'PAKUHAJI': [
    "KALIBARU",
    "SURYA BAHARI",
    "SUKAWALI",
    "KRAMAT",
    "KOHOD",
    "GAGA",
    "KIARA PAYUNG",
    "BUARAN BAMBU",
    "PAKU ALAM",
    "BUARAN MANGGA",
    "PAKUHAJI",
    "BUNISARI",
    "LAKSANA",
    "RAWABONI",
  ],
  'KOSAMBI': [
    "SALEMBARAN JAYA",
    "SALEMBARAN JATI",
    "KOSAMBI BARAT",
    "KOSAMBI TIMUR",
    "DADAP",
    "JATIMULYA",
    "CENGKLONG",
    "BLIMBING",
    "RAWA BURUNG",
    "RAWA RENGAS",
  ],
  'TELUKNAGA': [
    "BOJONG RENGED",
    "KEBON CAU",
    "TELUKNAGA",
    "BABAKAN ASEM",
    "KAMP MELAYU T",
    "KAMP MELAYU B",
    "KAMPUNG BESAR",
    "LEMO",
    "TEGAL ANGUS",
    "PANGKALAN",
    "TANJUNG BURUNG",
    "TANJUNG PASIR",
    "MUARA",
  ],
  'SEPATAN TIMUR': [
    "KEDAUNG BARAT",
    "LEBAK WANGI",
    "TANAH MERAH",
    "JATI MULYA",
    "GEMPOLSARI",
    "SANGIANG",
    "PONDOK KELOR",
    "KAMPUNG KELOR",
  ],
  'SEPATAN': [
    "MEKARJAYA",
    "KARET",
    "LEBAK WANGI",
    "KEDAUNG BARAT",
    "PONDOK JAYA",
    "SEPATAN",
    "PISANGAN JAYA",
    "SARAKAN",
    "TANAH MERAH",
    "JATI MULYA",
    "GEMPOLSARI",
    "SANGIANG",
    "KAYU AGUNG",
    "KAYU BONGKOK",
    "KAMPUNG KELOR"
  ],
};

export const NOP_MAPPING: Record<string, { name: string, villages: Record<string, string> }> = {
  '150': {
    name: 'SEPATAN',
    villages: {
      '001': 'MEKARJAYA',
      '002': 'KARET',
      '003': 'LEBAK WANGI',
      '004': 'KEDAUNG BARAT',
      '005': 'PONDOK JAYA',
      '006': 'SEPATAN',
      '007': 'PISANGAN JAYA',
      '008': 'SARAKAN',
      '009': 'TANAH MERAH',
      '010': 'JATI MULYA',
      '011': 'GEMPOLSARI',
      '012': 'SANGIANG',
      '013': 'KAYU AGUNG',
      '014': 'KAYU BONGKOK',
      '023': 'KAMPUNG KELOR',
    }
  },
  '151': {
    name: 'PAKUHAJI',
    villages: {
      '001': 'KALIBARU',
      '002': 'SURYA BAHARI',
      '003': 'SUKAWALI',
      '004': 'KRAMAT',
      '005': 'KOHOD',
      '006': 'GAGA',
      '007': 'KIARA PAYUNG',
      '008': 'BUARAN BAMBU',
      '009': 'PAKU ALAM',
      '010': 'BUARAN MANGGA',
      '011': 'PAKUHAJI',
      '012': 'BUNISARI',
      '013': 'LAKSANA',
      '014': 'RAWABONI',
    }
  },
  '152': {
    name: 'SEPATAN TIMUR',
    villages: {
      '001': 'KEDAUNG BARAT',
      '002': 'LEBAK WANGI',
      '003': 'TANAH MERAH',
      '004': 'JATI MULYA',
      '005': 'GEMPOLSARI',
      '006': 'SANGIANG',
      '007': 'PONDOK KELOR',
      '008': 'KAMPUNG KELOR',
    }
  },
  '160': {
    name: 'TELUKNAGA',
    villages: {
      '002': 'BOJONG RENGED',
      '004': 'KEBON CAU',
      '005': 'TELUKNAGA',
      '006': 'BABAKAN ASEM',
      '015': 'KAMP MELAYU T',
      '016': 'KAMP MELAYU B',
      '017': 'KAMPUNG BESAR',
      '018': 'LEMO',
      '019': 'TEGAL ANGUS',
      '020': 'PANGKALAN',
      '021': 'TANJUNG BURUNG',
      '022': 'TANJUNG PASIR',
      '023': 'MUARA',
    }
  },
  '161': {
    name: 'KOSAMBI',
    villages: {
      '001': 'SALEMBARAN JAYA',
      '002': 'SALEMBARAN JATI',
      '003': 'KOSAMBI BARAT',
      '004': 'KOSAMBI TIMUR',
      '005': 'DADAP',
      '006': 'JATIMULYA',
      '007': 'CENGKLONG',
      '008': 'BLIMBING',
      '009': 'RAWA BURUNG',
      '010': 'RAWA RENGAS',
    }
  }
};

export const createEmptyDataBaruItem = () => ({
  namaPemilikBaru: '',
  alamatPemilikBaru: '',
  kecamatanPemilikBaru: '',
  desaPemilikBaru: '',
  alamatObjekBaru: '',
  kecamatanObjekBaru: '',
  desaObjekBaru: '',
  luasTanahBaru: '',
  luasBangunanBaru: '',
  sertifikatBaru: ''
});

export const toTitleCase = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/\D/g, '');
  if (cleanNop.length === 17 || cleanNop.length === 18) {
    const p = cleanNop.length === 17 ? cleanNop + '0' : cleanNop;
    return `${p.slice(0, 2)}.${p.slice(2, 4)}.${p.slice(4, 7)}.${p.slice(7, 10)}.${p.slice(10, 13)}-${p.slice(13, 17)}.${p.slice(17)}`;
  }
  return nop;
};
