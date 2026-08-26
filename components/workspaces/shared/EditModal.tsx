"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, AlertTriangle, CheckCircle, Phone, Trash2, Plus, Check } from 'lucide-react';
import { updatePermohonan } from '@/app/actions/penginput';
import { ActionStatusModal } from './ActionStatusModal';

interface EditModalProps {
  editTarget: any;
  onClose: () => void;
  onSuccess: () => void;
}

const JENIS_OPTIONS = [
  { value: 'MUTASI_SEBAGIAN', label: 'MUTASI SEBAGIAN' },
  { value: 'MUTASI_HABIS_UPDATE', label: 'MUTASI HABIS UPDATE' },
  { value: 'MUTASI_HABIS_REGULER', label: 'MUTASI HABIS REGULER' },
  { value: 'OBJEK_PAJAK_BARU', label: 'OBJEK PAJAK BARU' },
  { value: 'PEMBETULAN', label: 'PEMBETULAN' },
  { value: 'PENGAKTIFAN', label: 'PENGAKTIFAN' }
] as const;

const SERVICES_NEED_DATA_LAMA = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'PENGAKTIFAN'
];

const SERVICES_NEED_DATA_BARU = [
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'OBJEK_PAJAK_BARU'
];

// Data Kecamatan dan Desa di wilayah kerja objek pajak (Kabupaten Tangerang)
const KECAMATAN_DATA: Record<string, string[]> = {
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

const NOP_MAPPING: Record<string, { name: string, villages: Record<string, string> }> = {
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

const createEmptyDataBaruItem = () => ({
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

const formatNop = (nop: string) => {
  if (!nop) return '';
  const cleanNop = nop.replace(/[^0-9]/g, '');
  if (cleanNop.length === 17) {
    const padded = cleanNop + '0';
    return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17)}`;
  }
  if (cleanNop.length === 18) {
    return `${cleanNop.slice(0, 2)}.${cleanNop.slice(2, 4)}.${cleanNop.slice(4, 7)}.${cleanNop.slice(7, 10)}.${cleanNop.slice(10, 13)}-${cleanNop.slice(13, 17)}.${cleanNop.slice(17)}`;
  }
  return nop;
};

export const EditModal: React.FC<EditModalProps> = React.memo(({ editTarget, onClose, onSuccess }) => {
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
  const [tanggalNoPelayanan, setTanggalNoPelayanan] = useState('');
  const [tanggalPenyelesaian, setTanggalPenyelesaian] = useState('');
  const [nop, setNop] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');

  // Data Lama state
  const [namaPemilikLama, setNamaPemilikLama] = useState('');
  const [alamatPemilikLama, setAlamatPemilikLama] = useState('');
  const [kecamatanPemilikLama, setKecamatanPemilikLama] = useState('');
  const [desaPemilikLama, setDesaPemilikLama] = useState('');
  const [alamatObjekLama, setAlamatObjekLama] = useState('');
  const [kecamatanObjekLama, setKecamatanObjekLama] = useState('');
  const [desaObjekLama, setDesaObjekLama] = useState('');
  const [luasTanahLama, setLuasTanahLama] = useState('');
  const [luasBangunanLama, setLuasBangunanLama] = useState('');
  const [sertifikatLama, setSertifikatLama] = useState('');

  // Data Baru state
  const [dataBaru, setDataBaru] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Stepper State & Copy Feedback State
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedAlamatObjekIdx, setCopiedAlamatObjekIdx] = useState<number | null>(null);
  const [copiedAlamatPemilikIdx, setCopiedAlamatPemilikIdx] = useState<number | null>(null);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  const handleCloseStatusModal = useCallback(() => {
    setStatusModalOpen(false);
    if (statusModalStatus === 'success') {
      onSuccess();
      onClose();
    }
  }, [statusModalStatus, onSuccess, onClose]);

  // Sync editTarget to states
  useEffect(() => {
    if (!editTarget) return;
    setJenisPermohonan(editTarget.jenisPermohonan || 'MUTASI_SEBAGIAN');
    setNomorPelayanan((editTarget.nomorPelayanan || '').toUpperCase());

    const rawDate = editTarget.tanggalNoPelayanan ? new Date(editTarget.tanggalNoPelayanan) : null;
    setTanggalNoPelayanan(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

    const rawSelesaiDate = editTarget.tanggalPenyelesaian ? new Date(editTarget.tanggalPenyelesaian) : null;
    setTanggalPenyelesaian(rawSelesaiDate && !isNaN(rawSelesaiDate.getTime()) ? rawSelesaiDate.toISOString().split('T')[0] : '');

    setNop(formatNop(editTarget.nop || ''));
    setNoWhatsapp(editTarget.noWhatsapp || '');

    setNamaPemilikLama((editTarget.namaPemilikLama || '').toUpperCase());
    setAlamatPemilikLama((editTarget.alamatPemilikLama || '').toUpperCase());
    setKecamatanPemilikLama((editTarget.kecamatanPemilikLama || '').toUpperCase());
    setDesaPemilikLama((editTarget.desaPemilikLama || '').toUpperCase());
    setAlamatObjekLama((editTarget.alamatObjekLama || '').toUpperCase());
    setKecamatanObjekLama((editTarget.kecamatanObjekLama || '').toUpperCase());
    setDesaObjekLama((editTarget.desaObjekLama || '').toUpperCase());
    setLuasTanahLama(editTarget.luasTanahLama !== null && editTarget.luasTanahLama !== undefined ? String(editTarget.luasTanahLama) : '');
    setLuasBangunanLama(editTarget.luasBangunanLama !== null && editTarget.luasBangunanLama !== undefined ? String(editTarget.luasBangunanLama) : '');
    setSertifikatLama((editTarget.sertifikatLama || '').toUpperCase());

    if (editTarget.dataBaru && editTarget.dataBaru.length > 0) {
      setDataBaru(editTarget.dataBaru.map((dbItem: any) => ({
        namaPemilikBaru: (dbItem.namaPemilikBaru || '').toUpperCase(),
        alamatPemilikBaru: (dbItem.alamatPemilikBaru || '').toUpperCase(),
        kecamatanPemilikBaru: (dbItem.kecamatanPemilikBaru || '').toUpperCase(),
        desaPemilikBaru: (dbItem.desaPemilikBaru || '').toUpperCase(),
        alamatObjekBaru: (dbItem.alamatObjekBaru || '').toUpperCase(),
        kecamatanObjekBaru: (dbItem.kecamatanObjekBaru || '').toUpperCase(),
        desaObjekBaru: (dbItem.desaObjekBaru || '').toUpperCase(),
        luasTanahBaru: dbItem.luasTanahBaru !== null && dbItem.luasTanahBaru !== undefined ? String(dbItem.luasTanahBaru) : '',
        luasBangunanBaru: dbItem.luasBangunanBaru !== null && dbItem.luasBangunanBaru !== undefined ? String(dbItem.luasBangunanBaru) : '',
        sertifikatBaru: (dbItem.sertifikatBaru || '').toUpperCase()
      })));
    } else {
      setDataBaru([createEmptyDataBaruItem()]);
    }

    setFormErrors({});
    setError('');
    setSuccess('');
    setCurrentStep(1);
  }, [editTarget]);

  // Conditional logic rules
  const needDataLama = SERVICES_NEED_DATA_LAMA.includes(jenisPermohonan);
  const needDataBaru = SERVICES_NEED_DATA_BARU.includes(jenisPermohonan);

  // Generate Steps dynamically
  const steps = useMemo(() => {
    const list = [{ id: 1, label: 'Data Utama' }];
    if (needDataLama) {
      list.push({ id: list.length + 1, label: 'Data Lama (Asal)' });
    }
    if (needDataBaru) {
      list.push({ id: list.length + 1, label: 'Data Baru' });
    }
    return list;
  }, [needDataLama, needDataBaru]);

  const formProgress = useMemo(() => {
    let total = 5;
    let filled = 0;

    if (nomorPelayanan.trim()) filled++;
    if (tanggalNoPelayanan.trim()) filled++;
    if (tanggalPenyelesaian.trim()) filled++;
    if (nop.replace(/[.\-]/g, '').length === 18) filled++;
    if (noWhatsapp.trim().length >= 10) filled++;

    if (needDataLama) {
      total += 10;
      if (namaPemilikLama.trim()) filled++;
      if (alamatPemilikLama.trim()) filled++;
      if (kecamatanPemilikLama.trim()) filled++;
      if (desaPemilikLama.trim()) filled++;
      if (alamatObjekLama.trim()) filled++;
      if (kecamatanObjekLama.trim()) filled++;
      if (desaObjekLama.trim()) filled++;
      if (luasTanahLama.trim() !== '') filled++;
      if (luasBangunanLama.trim() !== '') filled++;
      if (sertifikatLama.trim()) filled++;
    }

    if (needDataBaru) {
      dataBaru.forEach(item => {
        total += 10;
        if (item.namaPemilikBaru.trim()) filled++;
        if (item.alamatPemilikBaru.trim()) filled++;
        if (item.kecamatanPemilikBaru.trim()) filled++;
        if (item.desaPemilikBaru.trim()) filled++;
        if (item.alamatObjekBaru.trim()) filled++;
        if (item.kecamatanObjekBaru.trim()) filled++;
        if (item.desaObjekBaru.trim()) filled++;
        if (item.luasTanahBaru !== '') filled++;
        if (item.luasBangunanBaru !== '') filled++;
        if (item.sertifikatBaru.trim()) filled++;
      });
    }

    return { total, filled, percentage: Math.round((filled / total) * 100) };
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    needDataLama, namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    needDataBaru, dataBaru
  ]);

  // Auto-fill kecamatan and desa objek based on NOP (skipped on initial load)
  useEffect(() => {
    if (isNopInitialLoad.current) {
      isNopInitialLoad.current = false;
      return;
    }
    const rawNop = nop.replace(/[^\d]/g, '');
    if (rawNop.length >= 10) {
      const kecCode = rawNop.slice(4, 7);
      const desaCode = rawNop.slice(7, 10);
      
      const mapping = NOP_MAPPING[kecCode];
      if (mapping) {
        const kecName = mapping.name;
        const desaName = mapping.villages[desaCode] || "";
        
        // Auto-fill Data Lama
        if (kecName) setKecamatanObjekLama(kecName);
        if (desaName) setDesaObjekLama(desaName);
        
        // Auto-fill Data Baru (for all owners)
        setDataBaru(prev => 
          prev.map(item => ({
            ...item,
            kecamatanObjekBaru: kecName || item.kecamatanObjekBaru,
            desaObjekBaru: desaName || item.desaObjekBaru
          }))
        );
      }
    }
  }, [nop]);

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      if (dataBaru.length > 1) {
        setDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [jenisPermohonan, dataBaru.length]);

  // Track initial sync of EditModal to prevent overriding stored data/date on modal open
  const isInitialLoad = React.useRef(true);
  const isNopInitialLoad = React.useRef(true);

  useEffect(() => {
    if (editTarget) {
      isInitialLoad.current = true;
      isNopInitialLoad.current = true;
    }
  }, [editTarget]);

  // Auto-calculate Tanggal Penyelesaian (real-time) when service or service date changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!tanggalNoPelayanan) return;
    const baseDate = new Date(tanggalNoPelayanan);
    if (isNaN(baseDate.getTime())) return;

    let monthsToAdd = 4; // Default: 4 months (Mutasi / Pembetulan)
    if (jenisPermohonan === 'OBJEK_PAJAK_BARU') {
      monthsToAdd = 6;
    } else if (jenisPermohonan === 'PENGAKTIFAN') {
      monthsToAdd = 1;
    }

    const targetDate = new Date(baseDate);
    targetDate.setMonth(baseDate.getMonth() + monthsToAdd);

    setTanggalPenyelesaian(targetDate.toISOString().split('T')[0]);
  }, [jenisPermohonan, tanggalNoPelayanan]);

  // Clear field errors in real-time as user types/corrects inputs
  useEffect(() => {
    setFormErrors(prev => {
      const copy = { ...prev };
      let changed = false;

      if (nomorPelayanan.trim() && copy.nomorPelayanan) {
        delete copy.nomorPelayanan;
        changed = true;
      }
      if (tanggalNoPelayanan.trim() && copy.tanggalNoPelayanan) {
        delete copy.tanggalNoPelayanan;
        changed = true;
      }
      if (tanggalPenyelesaian.trim() && copy.tanggalPenyelesaian) {
        delete copy.tanggalPenyelesaian;
        changed = true;
      }
      if (/^\d{18}$/.test(nop.replace(/[.\-]/g, '')) && copy.nop) {
        delete copy.nop;
        changed = true;
      }
      if (/^(628)\d{8,12}$/.test(noWhatsapp) && copy.noWhatsapp) {
        delete copy.noWhatsapp;
        changed = true;
      }

      // Data lama
      if (namaPemilikLama.trim() && copy.namaPemilikLama) { delete copy.namaPemilikLama; changed = true; }
      if (alamatPemilikLama.trim() && copy.alamatPemilikLama) { delete copy.alamatPemilikLama; changed = true; }
      if (kecamatanPemilikLama.trim() && copy.kecamatanPemilikLama) { delete copy.kecamatanPemilikLama; changed = true; }
      if (desaPemilikLama.trim() && copy.desaPemilikLama) { delete copy.desaPemilikLama; changed = true; }
      if (alamatObjekLama.trim() && copy.alamatObjekLama) { delete copy.alamatObjekLama; changed = true; }
      if (kecamatanObjekLama.trim() && copy.kecamatanObjekLama) { delete copy.kecamatanObjekLama; changed = true; }
      if (desaObjekLama.trim() && copy.desaObjekLama) { delete copy.desaObjekLama; changed = true; }
      if (luasTanahLama.trim() && Number(luasTanahLama) >= 0 && copy.luasTanahLama) { delete copy.luasTanahLama; changed = true; }
      if (luasBangunanLama.trim() && Number(luasBangunanLama) >= 0 && copy.luasBangunanLama) { delete copy.luasBangunanLama; changed = true; }
      if (sertifikatLama.trim() && copy.sertifikatLama) { delete copy.sertifikatLama; changed = true; }

      // Data baru
      dataBaru.forEach((item, idx) => {
        if (item.namaPemilikBaru.trim() && copy[`dataBaru.${idx}.namaPemilikBaru`]) {
          delete copy[`dataBaru.${idx}.namaPemilikBaru`];
          changed = true;
        }
        if (item.alamatPemilikBaru.trim() && copy[`dataBaru.${idx}.alamatPemilikBaru`]) {
          delete copy[`dataBaru.${idx}.alamatPemilikBaru`];
          changed = true;
        }
        if (item.kecamatanPemilikBaru.trim() && copy[`dataBaru.${idx}.kecamatanPemilikBaru`]) {
          delete copy[`dataBaru.${idx}.kecamatanPemilikBaru`];
          changed = true;
        }
        if (item.desaPemilikBaru.trim() && copy[`dataBaru.${idx}.desaPemilikBaru`]) {
          delete copy[`dataBaru.${idx}.desaPemilikBaru`];
          changed = true;
        }
        if (item.alamatObjekBaru.trim() && copy[`dataBaru.${idx}.alamatObjekBaru`]) {
          delete copy[`dataBaru.${idx}.alamatObjekBaru`];
          changed = true;
        }
        if (item.kecamatanObjekBaru.trim() && copy[`dataBaru.${idx}.kecamatanObjekBaru`]) {
          delete copy[`dataBaru.${idx}.kecamatanObjekBaru`];
          changed = true;
        }
        if (item.desaObjekBaru.trim() && copy[`dataBaru.${idx}.desaObjekBaru`]) {
          delete copy[`dataBaru.${idx}.desaObjekBaru`];
          changed = true;
        }
        if (item.luasTanahBaru.trim() && Number(item.luasTanahBaru) >= 0 && copy[`dataBaru.${idx}.luasTanahBaru`]) {
          delete copy[`dataBaru.${idx}.luasTanahBaru`];
          changed = true;
        }
        if (item.luasBangunanBaru.trim() && Number(item.luasBangunanBaru) >= 0 && copy[`dataBaru.${idx}.luasBangunanBaru`]) {
          delete copy[`dataBaru.${idx}.luasBangunanBaru`];
          changed = true;
        }
        if (item.sertifikatBaru.trim() && copy[`dataBaru.${idx}.sertifikatBaru`]) {
          delete copy[`dataBaru.${idx}.sertifikatBaru`];
          changed = true;
        }
      });

      return changed ? copy : prev;
    });
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataBaru
  ]);

  const handleOwnerChange = useCallback((index: number, field: string, value: any) => {
    setDataBaru(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  // Copy helpers with visual feedback
  const handleCopyPemilikFromLama = useCallback((idx: number) => {
    handleOwnerChange(idx, 'alamatPemilikBaru', alamatPemilikLama);
    handleOwnerChange(idx, 'kecamatanPemilikBaru', kecamatanPemilikLama);
    handleOwnerChange(idx, 'desaPemilikBaru', desaPemilikLama);
    setCopiedAlamatPemilikIdx(idx);
    setTimeout(() => setCopiedAlamatPemilikIdx(null), 1500);
  }, [alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama, handleOwnerChange]);

  const handleCopyFromLama = useCallback((idx: number) => {
    handleOwnerChange(idx, 'alamatObjekBaru', alamatObjekLama);
    handleOwnerChange(idx, 'kecamatanObjekBaru', kecamatanObjekLama);
    handleOwnerChange(idx, 'desaObjekBaru', desaObjekLama);
    setCopiedAlamatObjekIdx(idx);
    setTimeout(() => setCopiedAlamatObjekIdx(null), 1500);
  }, [alamatObjekLama, kecamatanObjekLama, desaObjekLama, handleOwnerChange]);

  // Actions
  const handleAddOwner = useCallback(() => {
    setDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  }, []);

  const handleRemoveOwner = useCallback((index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Step-level validation
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};
    const stepLabel = steps[currentStep - 1]?.label;

    if (stepLabel === 'Data Utama') {
      if (!nomorPelayanan || !nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
      if (!tanggalNoPelayanan || !tanggalNoPelayanan.trim()) errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
      if (!tanggalPenyelesaian || !tanggalPenyelesaian.trim()) errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
      if (!nop || !/^\d{18}$/.test(nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
      if (!noWhatsapp || !/^(628)\d{8,12}$/.test(noWhatsapp)) {
        errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';
      }
    } else if (stepLabel === 'Data Lama (Asal)') {
      if (!namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!kecamatanPemilikLama?.trim()) errors.kecamatanPemilikLama = 'Kecamatan pemilik lama wajib diisi';
      if (!desaPemilikLama?.trim()) errors.desaPemilikLama = 'Desa pemilik lama wajib diisi';
      if (!alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (luasTanahLama === undefined || luasTanahLama === null || luasTanahLama === '' || Number(luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
      }
      if (luasBangunanLama === undefined || luasBangunanLama === null || luasBangunanLama === '' || Number(luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
      }
      if (!sertifikatLama?.trim()) errors.sertifikatLama = 'Sertifikat lama wajib diisi';
    } else if (stepLabel === 'Data Baru') {
      dataBaru.forEach((item, idx) => {
        if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
        if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
        if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
        if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
        if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
        if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
        if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
        if (item.luasTanahBaru === undefined || item.luasTanahBaru === null || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
          errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru wajib diisi & >= 0';
        }
        if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === null || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
          errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru wajib diisi & >= 0';
        }
        if (!item.sertifikatBaru?.trim()) errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
      });
    }

    return errors;
  }, [
    currentStep, steps, nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataBaru
  ]);

  const handleNextStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');

      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        const element = document.getElementById(`edit_${firstErrorKey}`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      return;
    }
    setFormErrors({});
    setCurrentStep(prev => prev + 1);
  }, [validateCurrentStep]);

  const handlePrevStep = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const validateFullForm = (data: any) => {
    const errors: Record<string, string> = {};

    if (!data.nomorPelayanan || !data.nomorPelayanan.trim()) errors.nomorPelayanan = 'Nomor pelayanan wajib diisi';
    if (!data.tanggalNoPelayanan || !data.tanggalNoPelayanan.trim()) {
      errors.tanggalNoPelayanan = 'Tanggal pelayanan wajib diisi';
    }
    if (!data.tanggalPenyelesaian || !data.tanggalPenyelesaian.trim()) {
      errors.tanggalPenyelesaian = 'Tanggal penyelesaian wajib diisi';
    }
    if (!data.nop || !/^\d{18}$/.test(data.nop.replace(/[.\-]/g, ''))) errors.nop = 'NOP harus tepat 18 digit angka';
    if (!data.noWhatsapp || !/^(628)\d{8,12}$/.test(data.noWhatsapp)) {
      errors.noWhatsapp = 'WhatsApp tidak valid (minimal 10 digit angka setelah +62)';
    }

    if (needDataLama) {
      if (!data.namaPemilikLama?.trim()) errors.namaPemilikLama = 'Nama pemilik lama wajib diisi';
      if (!data.alamatPemilikLama?.trim()) errors.alamatPemilikLama = 'Alamat pemilik lama wajib diisi';
      if (!data.kecamatanPemilikLama?.trim()) errors.kecamatanPemilikLama = 'Kecamatan pemilik lama wajib diisi';
      if (!data.desaPemilikLama?.trim()) errors.desaPemilikLama = 'Desa pemilik lama wajib diisi';
      if (!data.alamatObjekLama?.trim()) errors.alamatObjekLama = 'Alamat objek lama wajib diisi';
      if (!data.kecamatanObjekLama?.trim()) errors.kecamatanObjekLama = 'Kecamatan objek lama wajib diisi';
      if (!data.desaObjekLama?.trim()) errors.desaObjekLama = 'Desa objek lama wajib diisi';
      if (data.luasTanahLama === undefined || data.luasTanahLama === null || data.luasTanahLama === '' || Number(data.luasTanahLama) < 0) {
        errors.luasTanahLama = 'Luas tanah lama wajib diisi & >= 0';
      }
      if (data.luasBangunanLama === undefined || data.luasBangunanLama === null || data.luasBangunanLama === '' || Number(data.luasBangunanLama) < 0) {
        errors.luasBangunanLama = 'Luas bangunan lama wajib diisi & >= 0';
      }
      if (!data.sertifikatLama || !data.sertifikatLama.trim()) {
        errors.sertifikatLama = 'Sertifikat lama wajib diisi';
      }
    }

    if (needDataBaru) {
      if (!data.dataBaru || data.dataBaru.length === 0) {
        errors.dataBaru = 'Minimal 1 data pemilik baru wajib diisi';
      } else {
        data.dataBaru.forEach((item: any, idx: number) => {
          if (!item.namaPemilikBaru?.trim()) errors[`dataBaru.${idx}.namaPemilikBaru`] = 'Nama pemilik baru wajib diisi';
          if (!item.alamatPemilikBaru?.trim()) errors[`dataBaru.${idx}.alamatPemilikBaru`] = 'Alamat pemilik baru wajib diisi';
          if (!item.kecamatanPemilikBaru?.trim()) errors[`dataBaru.${idx}.kecamatanPemilikBaru`] = 'Kecamatan pemilik baru wajib diisi';
          if (!item.desaPemilikBaru?.trim()) errors[`dataBaru.${idx}.desaPemilikBaru`] = 'Desa pemilik baru wajib diisi';
          if (!item.alamatObjekBaru?.trim()) errors[`dataBaru.${idx}.alamatObjekBaru`] = 'Alamat objek baru wajib diisi';
          if (!item.kecamatanObjekBaru?.trim()) errors[`dataBaru.${idx}.kecamatanObjekBaru`] = 'Kecamatan objek baru wajib diisi';
          if (!item.desaObjekBaru?.trim()) errors[`dataBaru.${idx}.desaObjekBaru`] = 'Desa objek baru wajib diisi';
          if (item.luasTanahBaru === undefined || item.luasTanahBaru === null || item.luasTanahBaru === '' || Number(item.luasTanahBaru) < 0) {
            errors[`dataBaru.${idx}.luasTanahBaru`] = 'Luas tanah baru wajib diisi & >= 0';
          }
          if (item.luasBangunanBaru === undefined || item.luasBangunanBaru === null || item.luasBangunanBaru === '' || Number(item.luasBangunanBaru) < 0) {
            errors[`dataBaru.${idx}.luasBangunanBaru`] = 'Luas bangunan baru wajib diisi & >= 0';
          }
          if (!item.sertifikatBaru || !item.sertifikatBaru.trim()) {
            errors[`dataBaru.${idx}.sertifikatBaru`] = 'Sertifikat baru wajib diisi';
          }
        });
      }
    }

    return errors;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setError('');
    setSuccess('');

    const formData = {
      jenisPermohonan,
      nomorPelayanan: nomorPelayanan.toUpperCase(),
      tanggalNoPelayanan,
      tanggalPenyelesaian: tanggalPenyelesaian || null,
      nop: nop.replace(/[.\-]/g, ''),
      noWhatsapp,
      namaPemilikLama: needDataLama ? namaPemilikLama.toUpperCase() : null,
      alamatPemilikLama: needDataLama ? alamatPemilikLama.toUpperCase() : null,
      kecamatanPemilikLama: needDataLama ? kecamatanPemilikLama.toUpperCase() : null,
      desaPemilikLama: needDataLama ? desaPemilikLama.toUpperCase() : null,
      alamatObjekLama: needDataLama ? alamatObjekLama.toUpperCase() : null,
      kecamatanObjekLama: needDataLama ? kecamatanObjekLama.toUpperCase() : null,
      desaObjekLama: needDataLama ? desaObjekLama.toUpperCase() : null,
      luasTanahLama: needDataLama && luasTanahLama !== '' ? Number(luasTanahLama) : null,
      luasBangunanLama: needDataLama && luasBangunanLama !== '' ? Number(luasBangunanLama) : null,
      sertifikatLama: needDataLama ? sertifikatLama.toUpperCase() : null,
      dataBaru: needDataBaru ? dataBaru.map(item => ({
        namaPemilikBaru: item.namaPemilikBaru.toUpperCase(),
        alamatPemilikBaru: item.alamatPemilikBaru.toUpperCase(),
        kecamatanPemilikBaru: item.kecamatanPemilikBaru.toUpperCase(),
        desaPemilikBaru: item.desaPemilikBaru.toUpperCase(),
        alamatObjekBaru: item.alamatObjekBaru.toUpperCase(),
        kecamatanObjekBaru: item.kecamatanObjekBaru.toUpperCase(),
        desaObjekBaru: item.desaObjekBaru.toUpperCase(),
        luasTanahBaru: item.luasTanahBaru !== '' ? Number(item.luasTanahBaru) : null,
        luasBangunanBaru: item.luasBangunanBaru !== '' ? Number(item.luasBangunanBaru) : null,
        sertifikatBaru: item.sertifikatBaru.toUpperCase()
      })) : []
    };

    const errors = validateFullForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Form kurang lengkap. Harap periksa detail isian merah di bawah.');

      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        const element = document.getElementById(`edit_${firstErrorKey}`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      return;
    }
    setFormErrors({});
    setStatusModalTitle('Mengupdate Permohonan');
    setStatusModalMessage('Sedang menyimpan perubahan permohonan ke server...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res = await updatePermohonan(editTarget.id, formData);
      if (res.success) {
        setStatusModalTitle('Pembaruan Berhasil');
        setStatusModalMessage('Perubahan data permohonan Anda berhasil disimpan!');
        setStatusModalStatus('success');
      } else {
        setStatusModalTitle('Pembaruan Gagal');
        setStatusModalMessage(res.error || 'Gagal menyimpan perubahan.');
        setStatusModalStatus('error');
      }
    } catch (err: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan perubahan.');
      setStatusModalStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.startsWith('62')) {
      val = val.slice(2);
    }
    if (val.startsWith('0')) {
      val = val.slice(1);
    }
    setNoWhatsapp(val ? '62' + val : '');
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!editTarget) return null;
  if (!mounted) return null;

  const currentStepLabel = steps[currentStep - 1]?.label;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden border border-slate-200/90 flex flex-col animate-scaleUp">

        {/* Header - Aligned with Sidebar & Header clean UI design system */}
        <div className="bg-[#f8fafc] px-6 py-4 flex items-center justify-between gap-4 select-none border-b border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#00a389]/10 border border-[#00a389]/20 p-2 rounded-xl shrink-0 flex items-center justify-center">
              <Edit className="w-4 h-4 text-[#00a389]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Edit Permohonan
              </span>
              <span className="text-sm font-black text-slate-800 font-mono tracking-tight truncate leading-none">
                {editTarget.nomorPelayanan || editTarget.nomorPermohonan}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Labeled Multi-Step Stepper Bar (Identical to CreateForm.tsx) */}
        {steps.length > 1 && (
          <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3 select-none">
            <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                  <React.Fragment key={step.label}>
                    {idx > 0 && (
                      <div className={`flex-1 h-0.5 transition-all ${isCompleted ? 'bg-[#00a389]' : 'bg-slate-200/80'}`} />
                    )}
                    <button
                      type="button"
                      disabled={stepNum > currentStep && !isCompleted}
                      onClick={() => {
                        if (stepNum < currentStep || isCompleted) setCurrentStep(stepNum);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer text-xs font-extrabold ${isActive
                          ? 'bg-[#00a389] text-white shadow-3xs'
                          : isCompleted
                            ? 'bg-[#e6f6f4] text-[#008f78] hover:bg-[#d8f2ee]'
                            : 'bg-white text-slate-400 border border-slate-200/90 cursor-not-allowed'
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-[#00a389] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isCompleted ? '✓' : stepNum}
                      </span>
                      <span>{step.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6 flex flex-col gap-4">

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-4">

            {/* Scrollable Form Body Container */}
            <div className="overflow-y-auto max-h-[50vh] pr-2 flex flex-col gap-6 scrollbar-thin">

              {/* STEP 1: DATA UTAMA */}
              {currentStepLabel === 'Data Utama' && (
                <div className="flex flex-col gap-5 bg-transparent animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">
                        Jenis Layanan Permohonan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={jenisPermohonan}
                        onChange={(e) => setJenisPermohonan(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 border border-slate-200/90 rounded-md px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer"
                      >
                        {JENIS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Nomor Pelayanan <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        id="edit_nomorPelayanan"
                        value={nomorPelayanan}
                        onChange={(e) => setNomorPelayanan(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-md px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 tracking-wide focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.nomorPelayanan ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.nomorPelayanan && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.nomorPelayanan}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide flex items-center justify-between">
                        <span>Nomor Objek Pajak (NOP) <span className="text-rose-500">*</span></span>
                        <span className={`text-[10px] font-mono font-bold pr-1 ${nop.replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>
                          {nop.replace(/[^\d]/g, '').length}/18 digit
                          {nop.replace(/[^\d]/g, '').length === 18 && ' ✓'}
                        </span>
                      </label>
                      <input
                        type="text"
                        id="edit_nop"
                        maxLength={24}
                        placeholder="Contoh: 36.19.xxx.xxx.xxx-xxxx.x"
                        value={nop}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 18);
                          let fmt = '';
                          if (raw.length <= 2) fmt = raw;
                          else if (raw.length <= 4) fmt = raw.slice(0, 2) + '.' + raw.slice(2);
                          else if (raw.length <= 7) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4);
                          else if (raw.length <= 10) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7);
                          else if (raw.length <= 13) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10);
                          else if (raw.length <= 17) fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13);
                          else fmt = raw.slice(0, 2) + '.' + raw.slice(2, 4) + '.' + raw.slice(4, 7) + '.' + raw.slice(7, 10) + '.' + raw.slice(10, 13) + '-' + raw.slice(13, 17) + '.' + raw.slice(17);
                          setNop(fmt);
                        }}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-md px-3.5 py-2.5 text-xs font-bold text-slate-900 font-sans tracking-wide focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.nop ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.nop && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.nop}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Nomor WhatsApp WP <span className="text-rose-500">*</span></label>
                      <div className={`flex items-center bg-slate-50 border rounded-md overflow-hidden transition-all focus-within:bg-white focus-within:border-[#00a389] focus-within:ring-2 focus-within:ring-[#00a389]/10 ${
                        formErrors.noWhatsapp ? 'border-rose-500' : 'border-slate-200/90'
                      }`}>
                        <span className="bg-slate-100/80 border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 select-none flex items-center gap-1 shrink-0">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>+62</span>
                        </span>
                        <input
                          type="text"
                          id="edit_noWhatsapp"
                          placeholder="81234567890"
                          value={noWhatsapp.startsWith('62') ? noWhatsapp.slice(2) : noWhatsapp}
                          onChange={handleWhatsappChange}
                          disabled={loading}
                          className="w-full px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none bg-transparent"
                        />
                      </div>
                      {formErrors.noWhatsapp && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.noWhatsapp}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Tanggal Nopel <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        id="edit_tanggalNoPelayanan"
                        value={tanggalNoPelayanan}
                        onChange={(e) => setTanggalNoPelayanan(e.target.value)}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.tanggalNoPelayanan ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.tanggalNoPelayanan && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.tanggalNoPelayanan}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Tanggal Selesai <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        id="edit_tanggalPenyelesaian"
                        value={tanggalPenyelesaian}
                        onChange={(e) => setTanggalPenyelesaian(e.target.value)}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.tanggalPenyelesaian ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.tanggalPenyelesaian && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.tanggalPenyelesaian}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATA LAMA */}
              {currentStepLabel === 'Data Lama (Asal)' && needDataLama && (
                <div className="flex flex-col gap-5 bg-transparent animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* 1. Nama pemilik lama (Full Width) */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Nama Pemilik <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        id="edit_namaPemilikLama"
                        value={namaPemilikLama}
                        onChange={(e) => setNamaPemilikLama(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.namaPemilikLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.namaPemilikLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.namaPemilikLama}</span>}
                    </div>

                    {/* KELOMPOK ALAMAT, KECAMATAN, DESA (Symmetry side-by-side) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                      {/* Kiri: Pemilik */}
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Pemilik <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            id="edit_alamatPemilikLama"
                            value={alamatPemilikLama}
                            onChange={(e) => setAlamatPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.alamatPemilikLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          {formErrors.alamatPemilikLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.alamatPemilikLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Pemilik <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            id="edit_kecamatanPemilikLama"
                            value={kecamatanPemilikLama}
                            onChange={(e) => setKecamatanPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.kecamatanPemilikLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          {formErrors.kecamatanPemilikLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.kecamatanPemilikLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Pemilik <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            id="edit_desaPemilikLama"
                            value={desaPemilikLama}
                            onChange={(e) => setDesaPemilikLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.desaPemilikLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          {formErrors.desaPemilikLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.desaPemilikLama}</span>}
                        </div>
                      </div>

                      {/* Kanan: Objek */}
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Objek Pajak <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            id="edit_alamatObjekLama"
                            value={alamatObjekLama}
                            onChange={(e) => setAlamatObjekLama(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.alamatObjekLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          {formErrors.alamatObjekLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.alamatObjekLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Objek <span className="text-rose-500">*</span></label>
                          <select
                            id="edit_kecamatanObjekLama"
                            value={kecamatanObjekLama}
                            onChange={(e) => {
                              setKecamatanObjekLama(e.target.value);
                              setDesaObjekLama('');
                            }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer ${formErrors.kecamatanObjekLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          >
                            <option value="">Pilih Kecamatan Objek</option>
                            {Object.keys(KECAMATAN_DATA).map(kec => (
                              <option key={kec} value={kec}>{kec}</option>
                            ))}
                          </select>
                          {formErrors.kecamatanObjekLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.kecamatanObjekLama}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Objek <span className="text-rose-500">*</span></label>
                          <select
                            id="edit_desaObjekLama"
                            value={desaObjekLama}
                            onChange={(e) => setDesaObjekLama(e.target.value)}
                            disabled={loading || !kecamatanObjekLama}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 cursor-pointer ${formErrors.desaObjekLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          >
                            <option value="">
                              {!kecamatanObjekLama ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                            </option>
                            {kecamatanObjekLama && KECAMATAN_DATA[kecamatanObjekLama]?.map(desa => (
                              <option key={desa} value={desa}>{desa}</option>
                            ))}
                          </select>
                          {formErrors.desaObjekLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.desaObjekLama}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Tanah Asal <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input
                            type="number"
                            id="edit_luasTanahLama"
                            value={luasTanahLama}
                            onChange={(e) => setLuasTanahLama(e.target.value)}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.luasTanahLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                            m²
                          </span>
                        </div>
                        {formErrors.luasTanahLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.luasTanahLama}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Bangunan Asal <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input
                            type="number"
                            id="edit_luasBangunanLama"
                            value={luasBangunanLama}
                            onChange={(e) => setLuasBangunanLama(e.target.value)}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.luasBangunanLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                          />
                          <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                            m²
                          </span>
                        </div>
                        {formErrors.luasBangunanLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.luasBangunanLama}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">No/Jenis Sertifikat <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        id="edit_sertifikatLama"
                        placeholder="Contoh: SHM NO. 12345"
                        value={sertifikatLama}
                        onChange={(e) => setSertifikatLama(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.sertifikatLama ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                      />
                      {formErrors.sertifikatLama && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors.sertifikatLama}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATA BARU */}
              {currentStepLabel === 'Data Baru' && needDataBaru && (
                <div className="flex flex-col gap-5 bg-transparent animate-fadeIn">
                  {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                    <div className="flex justify-end select-none mb-1">
                      <button
                        type="button"
                        onClick={handleAddOwner}
                        disabled={loading}
                        className="h-8 px-3.5 rounded-md bg-[#00a389] hover:bg-[#008f78] active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Tambah Pemilik Baru
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    {dataBaru.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-4 relative ${dataBaru.length > 1
                          ? 'p-5 border border-slate-200/80 rounded-2xl pt-10 shadow-3xs bg-white'
                          : ''
                          }`}
                      >
                        {dataBaru.length > 1 && (
                          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                            <span className="text-xs font-bold text-[#00a389] tracking-wide">Pemilik Baru #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOwner(idx)}
                              disabled={loading}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* 1. Nama pemilik baru (Full Width) */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700 tracking-wide">Nama Pemilik <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              id={`edit_dataBaru.${idx}.namaPemilikBaru`}
                              value={item.namaPemilikBaru}
                              onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.namaPemilikBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                            />
                            {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                          </div>

                          {/* KELOMPOK ALAMAT, KECAMATAN, DESA BARU (Symmetry side-by-side) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                            {/* Kiri: Pemilik Baru */}
                            <div className="flex flex-col gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Pemilik <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`edit_dataBaru.${idx}.alamatPemilikBaru`}
                                    value={item.alamatPemilikBaru}
                                    onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value.toUpperCase())}
                                    style={{ textTransform: 'uppercase' }}
                                    disabled={loading}
                                    className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-20 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.alamatPemilikBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                  />
                                  {needDataLama && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPemilikFromLama(idx)}
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${copiedAlamatPemilikIdx === idx
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'text-[#00a389] bg-emerald-50 hover:bg-emerald-100 border-emerald-200/60'
                                        }`}
                                      title="Salin alamat pemilik dari data lama"
                                    >
                                      {copiedAlamatPemilikIdx === idx ? 'Tersalin ✓' : 'Salin'}
                                    </button>
                                  )}
                                </div>
                                {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Pemilik <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  id={`edit_dataBaru.${idx}.kecamatanPemilikBaru`}
                                  value={item.kecamatanPemilikBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                />
                                {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Pemilik <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  id={`edit_dataBaru.${idx}.desaPemilikBaru`}
                                  value={item.desaPemilikBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.desaPemilikBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                />
                                {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                              </div>
                            </div>

                            {/* Kanan: Objek Baru */}
                            <div className="flex flex-col gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Objek <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`edit_dataBaru.${idx}.alamatObjekBaru`}
                                    value={item.alamatObjekBaru}
                                    onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value.toUpperCase())}
                                    style={{ textTransform: 'uppercase' }}
                                    disabled={loading}
                                    className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-20 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.alamatObjekBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                  />
                                  {needDataLama && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyFromLama(idx)}
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${copiedAlamatObjekIdx === idx
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'text-[#00a389] bg-emerald-50 hover:bg-emerald-100 border-emerald-200/60'
                                        }`}
                                      title="Salin alamat objek dari data lama"
                                    >
                                      {copiedAlamatObjekIdx === idx ? 'Tersalin ✓' : 'Salin'}
                                    </button>
                                  )}
                                </div>
                                {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Objek <span className="text-rose-500">*</span></label>
                                <select
                                  id={`edit_dataBaru.${idx}.kecamatanObjekBaru`}
                                  value={item.kecamatanObjekBaru}
                                  onChange={(e) => {
                                    handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value);
                                    handleOwnerChange(idx, 'desaObjekBaru', '');
                                  }}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer ${formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                >
                                  <option value="">Pilih Kecamatan Objek</option>
                                  {Object.keys(KECAMATAN_DATA).map(kec => (
                                    <option key={kec} value={kec}>{kec}</option>
                                  ))}
                                </select>
                                {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Objek <span className="text-rose-500">*</span></label>
                                <select
                                  id={`edit_dataBaru.${idx}.desaObjekBaru`}
                                  value={item.desaObjekBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                                  disabled={loading || !item.kecamatanObjekBaru}
                                  className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 cursor-pointer ${formErrors[`dataBaru.${idx}.desaObjekBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                >
                                  <option value="">
                                    {!item.kecamatanObjekBaru ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                                  </option>
                                  {item.kecamatanObjekBaru && KECAMATAN_DATA[item.kecamatanObjekBaru]?.map(desa => (
                                    <option key={desa} value={desa}>{desa}</option>
                                  ))}
                                </select>
                                {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Tanah <span className="text-rose-500">*</span></label>
                              <div className="relative">
                                <input
                                  type="number"
                                  id={`edit_dataBaru.${idx}.luasTanahBaru`}
                                  value={item.luasTanahBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.luasTanahBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                />
                                <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                                  m²
                                </span>
                              </div>
                              {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Bangunan <span className="text-rose-500">*</span></label>
                              <div className="relative">
                                <input
                                  type="number"
                                  id={`edit_dataBaru.${idx}.luasBangunanBaru`}
                                  value={item.luasBangunanBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.luasBangunanBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                                />
                                <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                                  m²
                                </span>
                              </div>
                              {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700 tracking-wide">No/Jenis Sertifikat <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              id={`edit_dataBaru.${idx}.sertifikatBaru`}
                              placeholder="Contoh: SHM NO. 12345"
                              value={item.sertifikatBaru}
                              onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.sertifikatBaru`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/90'}`}
                            />
                            {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-[11px] text-rose-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-slate-200/80 select-none">
              <div>
                {/* Visual feedback of completion */}
                {formProgress.filled === formProgress.total ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    ✓ 100% Lengkap
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/90 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a389] inline-block" />
                    {formProgress.percentage}% Terisi ({formProgress.filled}/{formProgress.total})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Back Button */}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-3xs"
                  >
                    Kembali
                  </button>
                )}

                {/* Cancel Button (step 1 only) */}
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-3xs"
                  >
                    Batal
                  </button>
                )}

                {/* Next or Save Button */}
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-98 text-white font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#00a389] hover:bg-[#008f78] active:scale-98 text-white font-extrabold text-xs rounded-lg shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center disabled:opacity-50 gap-1.5"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      'Simpan'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <ActionStatusModal
          isOpen={statusModalOpen}
          status={statusModalStatus}
          title={statusModalTitle}
          message={statusModalMessage}
          onClose={handleCloseStatusModal}
        />
      </div>
    </div>,
    document.body
  );
});

EditModal.displayName = 'EditModal';
