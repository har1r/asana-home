"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronLeft, AlertTriangle, CheckCircle, Phone, Plus, Trash2, Check } from 'lucide-react';
import { createPermohonan } from '@/app/actions/penginput';
import { ActionStatusModal } from './ActionStatusModal';

interface CreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
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

export const CreateForm: React.FC<CreateFormProps> = React.memo(({ onSuccess, onCancel, initialData }) => {
  const [jenisPermohonan, setJenisPermohonan] = useState<string>('MUTASI_SEBAGIAN');
  const [nomorPelayanan, setNomorPelayanan] = useState('');
  const [tanggalNoPelayanan, setTanggalNoPelayanan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
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

  const [draftLoaded, setDraftLoaded] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');

  // Draft Restored Popup State
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftModalMessage, setDraftModalMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setStatusModalOpen(false);
    if (statusModalStatus === 'success') {
      onSuccess();
      onCancel();
    }
  }, [statusModalStatus, onSuccess, onCancel]);

  // Restore draft on mount or duplicate initialData
  useEffect(() => {
    if (initialData) {
      try {
        if (initialData.jenisPermohonan) setJenisPermohonan(initialData.jenisPermohonan);
        if (initialData.nomorPelayanan) setNomorPelayanan(initialData.nomorPelayanan.toUpperCase());

        const rawDate = initialData.tanggalNoPelayanan ? new Date(initialData.tanggalNoPelayanan) : null;
        setTanggalNoPelayanan(rawDate && !isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');

        const rawSelesaiDate = initialData.tanggalPenyelesaian ? new Date(initialData.tanggalPenyelesaian) : null;
        setTanggalPenyelesaian(rawSelesaiDate && !isNaN(rawSelesaiDate.getTime()) ? rawSelesaiDate.toISOString().split('T')[0] : '');

        if (initialData.nop) {
          const raw = initialData.nop.replace(/[^\d]/g, '');
          if (raw.length === 18) {
            setNop(`${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4, 7)}.${raw.slice(7, 10)}.${raw.slice(10, 13)}-${raw.slice(13, 17)}.${raw.slice(17)}`);
          } else {
            setNop(initialData.nop);
          }
        }
        if (initialData.noWhatsapp) setNoWhatsapp(initialData.noWhatsapp);

        if (initialData.namaPemilikLama) setNamaPemilikLama(initialData.namaPemilikLama.toUpperCase());
        if (initialData.alamatPemilikLama) setAlamatPemilikLama(initialData.alamatPemilikLama.toUpperCase());
        if (initialData.kecamatanPemilikLama) setKecamatanPemilikLama(initialData.kecamatanPemilikLama.toUpperCase());
        if (initialData.desaPemilikLama) setDesaPemilikLama(initialData.desaPemilikLama.toUpperCase());
        if (initialData.alamatObjekLama) setAlamatObjekLama(initialData.alamatObjekLama.toUpperCase());
        if (initialData.kecamatanObjekLama) setKecamatanObjekLama(initialData.kecamatanObjekLama.toUpperCase());
        if (initialData.desaObjekLama) setDesaObjekLama(initialData.desaObjekLama.toUpperCase());
        setLuasTanahLama(initialData.luasTanahLama !== null && initialData.luasTanahLama !== undefined ? String(initialData.luasTanahLama) : '');
        setLuasBangunanLama(initialData.luasBangunanLama !== null && initialData.luasBangunanLama !== undefined ? String(initialData.luasBangunanLama) : '');
        if (initialData.sertifikatLama) setSertifikatLama(initialData.sertifikatLama.toUpperCase());

        if (initialData.dataBaru && initialData.dataBaru.length > 0) {
          setDataBaru(initialData.dataBaru.map((item: any) => ({
            namaPemilikBaru: (item.namaPemilikBaru || '').toUpperCase(),
            alamatPemilikBaru: (item.alamatPemilikBaru || '').toUpperCase(),
            kecamatanPemilikBaru: (item.kecamatanPemilikBaru || '').toUpperCase(),
            desaPemilikBaru: (item.desaPemilikBaru || '').toUpperCase(),
            alamatObjekBaru: (item.alamatObjekBaru || '').toUpperCase(),
            kecamatanObjekBaru: (item.kecamatanObjekBaru || '').toUpperCase(),
            desaObjekBaru: (item.desaObjekBaru || '').toUpperCase(),
            luasTanahBaru: item.luasTanahBaru !== null && item.luasTanahBaru !== undefined ? String(item.luasTanahBaru) : '',
            luasBangunanBaru: item.luasBangunanBaru !== null && item.luasBangunanBaru !== undefined ? String(item.luasBangunanBaru) : '',
            sertifikatBaru: (item.sertifikatBaru || '').toUpperCase()
          })));
        } else {
          setDataBaru([createEmptyDataBaruItem()]);
        }

        setDraftModalMessage('Draf permohonan berhasil diduplikat untuk formulir baru!');
        setDraftModalOpen(true);
      } catch (e) {
        console.error('Failed to duplicate initialData', e);
      } finally {
        setDraftLoaded(true);
      }
      return;
    }

    try {
      const stored = localStorage.getItem('permohonan_form_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.jenisPermohonan) setJenisPermohonan(parsed.jenisPermohonan);
        if (parsed.nomorPelayanan) setNomorPelayanan(parsed.nomorPelayanan.toUpperCase());
        if (parsed.tanggalNoPelayanan) setTanggalNoPelayanan(parsed.tanggalNoPelayanan);
        if (parsed.tanggalPenyelesaian) setTanggalPenyelesaian(parsed.tanggalPenyelesaian);
        if (parsed.nop) setNop(parsed.nop);
        if (parsed.noWhatsapp) setNoWhatsapp(parsed.noWhatsapp);

        if (parsed.namaPemilikLama) setNamaPemilikLama(parsed.namaPemilikLama.toUpperCase());
        if (parsed.alamatPemilikLama) setAlamatPemilikLama(parsed.alamatPemilikLama.toUpperCase());
        if (parsed.kecamatanPemilikLama) setKecamatanPemilikLama(parsed.kecamatanPemilikLama.toUpperCase());
        if (parsed.desaPemilikLama) setDesaPemilikLama(parsed.desaPemilikLama.toUpperCase());
        if (parsed.alamatObjekLama) setAlamatObjekLama(parsed.alamatObjekLama.toUpperCase());
        if (parsed.kecamatanObjekLama) setKecamatanObjekLama(parsed.kecamatanObjekLama.toUpperCase());
        if (parsed.desaObjekLama) setDesaObjekLama(parsed.desaObjekLama.toUpperCase());
        if (parsed.luasTanahLama) setLuasTanahLama(parsed.luasTanahLama);
        if (parsed.luasBangunanLama) setLuasBangunanLama(parsed.luasBangunanLama);
        if (parsed.sertifikatLama) setSertifikatLama(parsed.sertifikatLama.toUpperCase());

        if (parsed.dataBaru && parsed.dataBaru.length > 0) {
          setDataBaru(parsed.dataBaru.map((item: any) => ({
            namaPemilikBaru: (item.namaPemilikBaru || '').toUpperCase(),
            alamatPemilikBaru: (item.alamatPemilikBaru || '').toUpperCase(),
            kecamatanPemilikBaru: (item.kecamatanPemilikBaru || '').toUpperCase(),
            desaPemilikBaru: (item.desaPemilikBaru || '').toUpperCase(),
            alamatObjekBaru: (item.alamatObjekBaru || '').toUpperCase(),
            kecamatanObjekBaru: (item.kecamatanObjekBaru || '').toUpperCase(),
            desaObjekBaru: (item.desaObjekBaru || '').toUpperCase(),
            luasTanahBaru: item.luasTanahBaru,
            luasBangunanBaru: item.luasBangunanBaru,
            sertifikatBaru: (item.sertifikatBaru || '').toUpperCase()
          })));
        }

        setDraftModalMessage('Draf pengisian permohonan Anda sebelumnya telah otomatis dipulihkan ke formulir ini.');
        setDraftModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to load form draft', e);
    } finally {
      setDraftLoaded(true);
    }
  }, [initialData]);

  // Save draft to localStorage on state changes
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const draft = {
        jenisPermohonan,
        nomorPelayanan: nomorPelayanan.toUpperCase(),
        tanggalNoPelayanan,
        tanggalPenyelesaian,
        nop,
        noWhatsapp,
        namaPemilikLama: namaPemilikLama.toUpperCase(),
        alamatPemilikLama: alamatPemilikLama.toUpperCase(),
        kecamatanPemilikLama: kecamatanPemilikLama.toUpperCase(),
        desaPemilikLama: desaPemilikLama.toUpperCase(),
        alamatObjekLama: alamatObjekLama.toUpperCase(),
        kecamatanObjekLama: kecamatanObjekLama.toUpperCase(),
        desaObjekLama: desaObjekLama.toUpperCase(),
        luasTanahLama,
        luasBangunanLama,
        sertifikatLama: sertifikatLama.toUpperCase(),
        dataBaru: dataBaru.map(item => ({
          namaPemilikBaru: item.namaPemilikBaru.toUpperCase(),
          alamatPemilikBaru: item.alamatPemilikBaru.toUpperCase(),
          kecamatanPemilikBaru: item.kecamatanPemilikBaru.toUpperCase(),
          desaPemilikBaru: item.desaPemilikBaru.toUpperCase(),
          alamatObjekBaru: item.alamatObjekBaru.toUpperCase(),
          kecamatanObjekBaru: item.kecamatanObjekBaru.toUpperCase(),
          desaObjekBaru: item.desaObjekBaru.toUpperCase(),
          luasTanahBaru: item.luasTanahBaru,
          luasBangunanBaru: item.luasBangunanBaru,
          sertifikatBaru: item.sertifikatBaru.toUpperCase()
        }))
      };
      localStorage.setItem('permohonan_form_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save form draft', e);
    }
  }, [
    draftLoaded, jenisPermohonan, nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    dataBaru
  ]);

  // Auto-fill kecamatan and desa objek based on NOP
  useEffect(() => {
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

  // Conditional Logic Rules
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

  // Reset step to 1 when service type changes
  useEffect(() => {
    setCurrentStep(1);
    setFormErrors({});
  }, [jenisPermohonan]);

  // Auto-calculate Tanggal Penyelesaian based on Jenis Permohonan and Tanggal Pelayanan
  useEffect(() => {
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

  // Keep Data Baru length to 1 if not MUTASI_SEBAGIAN
  useEffect(() => {
    if (jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      if (dataBaru.length > 1) {
        setDataBaru(prev => prev.slice(0, 1));
      }
    }
  }, [jenisPermohonan, dataBaru.length]);

  // Initialize dataBaru with 1 item if needed
  useEffect(() => {
    if (!draftLoaded) return;
    if (needDataBaru && dataBaru.length === 0) {
      setDataBaru([createEmptyDataBaruItem()]);
    }
  }, [needDataBaru, dataBaru, draftLoaded]);

  // Auto-clear field errors as soon as user types valid inputs
  useEffect(() => {
    setFormErrors(prev => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;

      if (nomorPelayanan.trim() && next.nomorPelayanan) {
        delete next.nomorPelayanan;
        changed = true;
      }
      if (tanggalNoPelayanan.trim() && next.tanggalNoPelayanan) {
        delete next.tanggalNoPelayanan;
        changed = true;
      }
      if (tanggalPenyelesaian.trim() && next.tanggalPenyelesaian) {
        delete next.tanggalPenyelesaian;
        changed = true;
      }
      if (nop.replace(/[.\-]/g, '').length === 18 && next.nop) {
        delete next.nop;
        changed = true;
      }
      if (/^(628)\d{8,12}$/.test(noWhatsapp) && next.noWhatsapp) {
        delete next.noWhatsapp;
        changed = true;
      }

      if (needDataLama) {
        if (namaPemilikLama.trim() && next.namaPemilikLama) { delete next.namaPemilikLama; changed = true; }
        if (alamatPemilikLama.trim() && next.alamatPemilikLama) { delete next.alamatPemilikLama; changed = true; }
        if (kecamatanPemilikLama.trim() && next.kecamatanPemilikLama) { delete next.kecamatanPemilikLama; changed = true; }
        if (desaPemilikLama.trim() && next.desaPemilikLama) { delete next.desaPemilikLama; changed = true; }
        if (alamatObjekLama.trim() && next.alamatObjekLama) { delete next.alamatObjekLama; changed = true; }
        if (kecamatanObjekLama.trim() && next.kecamatanObjekLama) { delete next.kecamatanObjekLama; changed = true; }
        if (desaObjekLama.trim() && next.desaObjekLama) { delete next.desaObjekLama; changed = true; }
        if (luasTanahLama.trim() !== '' && Number(luasTanahLama) >= 0 && next.luasTanahLama) { delete next.luasTanahLama; changed = true; }
        if (luasBangunanLama.trim() !== '' && Number(luasBangunanLama) >= 0 && next.luasBangunanLama) { delete next.luasBangunanLama; changed = true; }
        if (sertifikatLama.trim() && next.sertifikatLama) { delete next.sertifikatLama; changed = true; }
      }

      if (needDataBaru) {
        dataBaru.forEach((item, idx) => {
          if (item.namaPemilikBaru?.trim() && next[`dataBaru.${idx}.namaPemilikBaru`]) {
            delete next[`dataBaru.${idx}.namaPemilikBaru`];
            changed = true;
          }
          if (item.alamatPemilikBaru?.trim() && next[`dataBaru.${idx}.alamatPemilikBaru`]) {
            delete next[`dataBaru.${idx}.alamatPemilikBaru`];
            changed = true;
          }
          if (item.kecamatanPemilikBaru?.trim() && next[`dataBaru.${idx}.kecamatanPemilikBaru`]) {
            delete next[`dataBaru.${idx}.kecamatanPemilikBaru`];
            changed = true;
          }
          if (item.desaPemilikBaru?.trim() && next[`dataBaru.${idx}.desaPemilikBaru`]) {
            delete next[`dataBaru.${idx}.desaPemilikBaru`];
            changed = true;
          }
          if (item.alamatObjekBaru?.trim() && next[`dataBaru.${idx}.alamatObjekBaru`]) {
            delete next[`dataBaru.${idx}.alamatObjekBaru`];
            changed = true;
          }
          if (item.kecamatanObjekBaru?.trim() && next[`dataBaru.${idx}.kecamatanObjekBaru`]) {
            delete next[`dataBaru.${idx}.kecamatanObjekBaru`];
            changed = true;
          }
          if (item.desaObjekBaru?.trim() && next[`dataBaru.${idx}.desaObjekBaru`]) {
            delete next[`dataBaru.${idx}.desaObjekBaru`];
            changed = true;
          }
          if (item.luasTanahBaru !== '' && Number(item.luasTanahBaru) >= 0 && next[`dataBaru.${idx}.luasTanahBaru`]) {
            delete next[`dataBaru.${idx}.luasTanahBaru`];
            changed = true;
          }
          if (item.luasBangunanBaru !== '' && Number(item.luasBangunanBaru) >= 0 && next[`dataBaru.${idx}.luasBangunanBaru`]) {
            delete next[`dataBaru.${idx}.luasBangunanBaru`];
            changed = true;
          }
          if (item.sertifikatBaru?.trim() && next[`dataBaru.${idx}.sertifikatBaru`]) {
            delete next[`dataBaru.${idx}.sertifikatBaru`];
            changed = true;
          }
        });
      }

      if (changed && Object.keys(next).length === 0) {
        setError('');
      }

      return changed ? next : prev;
    });
  }, [
    nomorPelayanan, tanggalNoPelayanan, tanggalPenyelesaian, nop, noWhatsapp,
    namaPemilikLama, alamatPemilikLama, kecamatanPemilikLama, desaPemilikLama,
    alamatObjekLama, kecamatanObjekLama, desaObjekLama, luasTanahLama, luasBangunanLama, sertifikatLama,
    needDataLama, needDataBaru, dataBaru
  ]);

  const handleAddOwner = useCallback(() => {
    setDataBaru(prev => [...prev, createEmptyDataBaruItem()]);
  }, []);

  const handleRemoveOwner = useCallback((index: number) => {
    setDataBaru(prev => prev.filter((_, i) => i !== index));
  }, []);

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
        const element = document.getElementById(firstErrorKey);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      return;
    }
    setFormErrors({});
    setStatusModalTitle('Menyimpan Permohonan');
    setStatusModalMessage('Sedang memproses dan menyimpan data permohonan ke server...');
    setStatusModalStatus('loading');
    setStatusModalOpen(true);
    setLoading(true);

    try {
      const res = await createPermohonan(formData);
      if (res.success) {
        setStatusModalTitle('Penyimpanan Berhasil');
        setStatusModalMessage('Data permohonan Anda berhasil disimpan dan didaftarkan ke sistem!');
        setStatusModalStatus('success');
        try {
          localStorage.removeItem('permohonan_form_draft');
        } catch (e) {
          console.error(e);
        }
      } else {
        setStatusModalTitle('Penyimpanan Gagal');
        setStatusModalMessage(res.error || 'Gagal menyimpan data permohonan.');
        setStatusModalStatus('error');
      }
    } catch (err: any) {
      setStatusModalTitle('Terjadi Kesalahan');
      setStatusModalMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan permohonan.');
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

  const currentStepLabel = steps[currentStep - 1]?.label;

  return (
    <div className="w-full bg-transparent animate-fadeIn">
      {/* Full-width Stepper Card Container */}
      <div className="w-full bg-white rounded-lg border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">

        {/* Top Header Bar: Back Button + Live Completion Widget + Auto-Save */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 px-3.5 rounded-md border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-3xs flex items-center gap-2 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Labeled Multi-Step Stepper Bar */}
        {steps.length > 1 && (
          <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3 select-none">
            <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
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
                        if (stepNum < currentStep) setCurrentStep(stepNum);
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

        {/* Form Body Container */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">

          {error && (
            <div className="bg-red-50/80 border border-red-200/65 text-red-750 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50/80 border border-emerald-200/65 text-emerald-800 text-xs font-bold rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn shrink-0">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-6">

            {/* STEP 1: DATA UTAMA */}
            {currentStepLabel === 'Data Utama' && (
              <div className="flex flex-col gap-5 bg-transparent animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">
                      Jenis Layanan Permohonan <span className="text-red-500">*</span>
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
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Nomor Pelayanan <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="nomorPelayanan"
                      value={nomorPelayanan}
                      onChange={(e) => setNomorPelayanan(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                      disabled={loading}
                      className={`w-full bg-slate-50 border rounded-md px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 tracking-wide focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.nomorPelayanan ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                    />
                    {formErrors.nomorPelayanan && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.nomorPelayanan}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide flex items-center justify-between">
                      <span>Nomor Objek Pajak (NOP) <span className="text-red-500">*</span></span>
                      <span className={`text-[10px] font-mono font-bold pr-1 ${nop.replace(/[^\d]/g, '').length === 18 ? 'text-[#00a389]' : 'text-slate-400'}`}>
                        {nop.replace(/[^\d]/g, '').length}/18 digit
                        {nop.replace(/[^\d]/g, '').length === 18 && ' ✓'}
                      </span>
                    </label>
                    <input
                      type="text"
                      id="nop"
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
                      className={`w-full bg-slate-50 border rounded-md px-3.5 py-2.5 text-xs font-bold text-slate-900 font-mono tracking-wide focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.nop ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                    />
                    {formErrors.nop && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.nop}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Nomor WhatsApp WP <span className="text-red-500">*</span></label>
                    <div className={`flex items-center bg-slate-50 border rounded-md overflow-hidden transition-all focus-within:bg-white focus-within:border-[#00a389] focus-within:ring-2 focus-within:ring-[#00a389]/10 ${formErrors.noWhatsapp ? 'border-red-500' : 'border-slate-200/90'
                      }`}>
                      <span className="bg-slate-100/80 border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 select-none flex items-center gap-1 shrink-0">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+62</span>
                      </span>
                      <input
                        type="text"
                        id="noWhatsapp"
                        placeholder="81234567890"
                        value={noWhatsapp.startsWith('62') ? noWhatsapp.slice(2) : noWhatsapp}
                        onChange={handleWhatsappChange}
                        disabled={loading}
                        className="w-full px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>
                    {formErrors.noWhatsapp && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.noWhatsapp}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Tanggal Pelayanan <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      id="tanggalNoPelayanan"
                      value={tanggalNoPelayanan}
                      onChange={(e) => setTanggalNoPelayanan(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.tanggalNoPelayanan ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                    />
                    {formErrors.tanggalNoPelayanan && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.tanggalNoPelayanan}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Tanggal Selesai <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      id="tanggalPenyelesaian"
                      value={tanggalPenyelesaian}
                      onChange={(e) => setTanggalPenyelesaian(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.tanggalPenyelesaian ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                    />
                    {formErrors.tanggalPenyelesaian && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.tanggalPenyelesaian}</span>}
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
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Nama Pemilik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="namaPemilikLama"
                      value={namaPemilikLama}
                      onChange={(e) => setNamaPemilikLama(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                      disabled={loading}
                      className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.namaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                    />
                    {formErrors.namaPemilikLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.namaPemilikLama}</span>}
                  </div>

                  {/* KELOMPOK ALAMAT, KECAMATAN, DESA (Symmetry side-by-side on desktop, sequential on mobile) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                    {/* Kiri: Pemilik */}
                    <div className="flex flex-col gap-5">
                      {/* 2. Alamat pemilik lama */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Pemilik <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="alamatPemilikLama"
                          value={alamatPemilikLama}
                          onChange={(e) => setAlamatPemilikLama(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          disabled={loading}
                          className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.alamatPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        />
                        {formErrors.alamatPemilikLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.alamatPemilikLama}</span>}
                      </div>

                      {/* 3. Kecamatan pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Pemilik <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="kecamatanPemilikLama"
                          value={kecamatanPemilikLama}
                          onChange={(e) => setKecamatanPemilikLama(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          disabled={loading}
                          className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.kecamatanPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        />
                        {formErrors.kecamatanPemilikLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.kecamatanPemilikLama}</span>}
                      </div>

                      {/* 4. Desa pemilik */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Pemilik <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="desaPemilikLama"
                          value={desaPemilikLama}
                          onChange={(e) => setDesaPemilikLama(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          disabled={loading}
                          className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.desaPemilikLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        />
                        {formErrors.desaPemilikLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.desaPemilikLama}</span>}
                      </div>
                    </div>

                    {/* Kanan: Objek */}
                    <div className="flex flex-col gap-5">
                      {/* 5. Alamat objek pajak */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Objek Pajak <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="alamatObjekLama"
                          value={alamatObjekLama}
                          onChange={(e) => setAlamatObjekLama(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          disabled={loading}
                          className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.alamatObjekLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        />
                        {formErrors.alamatObjekLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.alamatObjekLama}</span>}
                      </div>

                      {/* 7. Kecamatan objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Objek <span className="text-red-500">*</span></label>
                        <select
                          id="kecamatanObjekLama"
                          value={kecamatanObjekLama}
                          onChange={(e) => {
                            setKecamatanObjekLama(e.target.value);
                            setDesaObjekLama(''); // Reset desa
                          }}
                          disabled={loading}
                          className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer ${formErrors.kecamatanObjekLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        >
                          <option value="">Pilih Kecamatan Objek</option>
                          {Object.keys(KECAMATAN_DATA).map(kec => (
                            <option key={kec} value={kec}>{kec}</option>
                          ))}
                        </select>
                        {formErrors.kecamatanObjekLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.kecamatanObjekLama}</span>}
                      </div>

                      {/* 8. Desa objek */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Objek <span className="text-red-500">*</span></label>
                        <select
                          id="desaObjekLama"
                          value={desaObjekLama}
                          onChange={(e) => setDesaObjekLama(e.target.value)}
                          disabled={loading || !kecamatanObjekLama}
                          className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 cursor-pointer ${formErrors.desaObjekLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                        >
                          <option value="">
                            {!kecamatanObjekLama ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                          </option>
                          {kecamatanObjekLama && KECAMATAN_DATA[kecamatanObjekLama]?.map(desa => (
                            <option key={desa} value={desa}>{desa}</option>
                          ))}
                        </select>
                        {formErrors.desaObjekLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.desaObjekLama}</span>}
                      </div>
                    </div>
                  </div>

                  {/* 9. Luas tanah asal (Kiri) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Tanah Asal <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        id="luasTanahLama"
                        value={luasTanahLama}
                        onChange={(e) => setLuasTanahLama(e.target.value)}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.luasTanahLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                      />
                      <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                        m²
                      </span>
                    </div>
                    {formErrors.luasTanahLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.luasTanahLama}</span>}
                  </div>

                  {/* 10. Luas bangunan asal (Kanan) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Bangunan Asal <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        id="luasBangunanLama"
                        value={luasBangunanLama}
                        onChange={(e) => setLuasBangunanLama(e.target.value)}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.luasBangunanLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                      />
                      <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                        m²
                      </span>
                    </div>
                    {formErrors.luasBangunanLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.luasBangunanLama}</span>}
                  </div>

                  {/* 6. Nomor/Jenis sertifikat lama (Full Width, Paling Akhir) */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">No/Jenis Sertifikat <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        id="sertifikatLama"
                        placeholder="Contoh: SHM NO. 12345"
                        value={sertifikatLama}
                        onChange={(e) => setSertifikatLama(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                        disabled={loading}
                        className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors.sertifikatLama ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                      />

                    </div>
                    {formErrors.sertifikatLama && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors.sertifikatLama}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DATA BARU */}
            {currentStepLabel === 'Data Baru' && needDataBaru && (
              <div className="flex flex-col gap-4 bg-transparent animate-fadeIn">
                {jenisPermohonan === 'MUTASI_SEBAGIAN' && (
                  <div className="flex justify-end select-none mb-1">
                    <button
                      type="button"
                      onClick={handleAddOwner}
                      disabled={loading}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-indigo-200/60"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pemilik Baru
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {dataBaru.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-4 relative ${dataBaru.length > 1
                        ? 'p-5 border border-slate-200/80 rounded-2xl pt-10 shadow-3xs bg-transparent'
                        : ''
                        }`}
                    >
                      {dataBaru.length > 1 && (
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between select-none border-b border-slate-100 pb-1">
                          <span className="text-xs font-bold text-indigo-600 tracking-wide">Pemilik Baru #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOwner(idx)}
                            disabled={loading}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* 1. Nama pemilik baru (Full Width) */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Nama Pemilik <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id={`dataBaru.${idx}.namaPemilikBaru`}
                            value={item.namaPemilikBaru}
                            onChange={(e) => handleOwnerChange(idx, 'namaPemilikBaru', e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                            disabled={loading}
                            className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.namaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                          />
                          {formErrors[`dataBaru.${idx}.namaPemilikBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.namaPemilikBaru`]}</span>}
                        </div>

                        {/* KELOMPOK ALAMAT, KECAMATAN, DESA BARU (Symmetry side-by-side on desktop, sequential on mobile) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:col-span-2">
                          {/* Kiri: Pemilik Baru */}
                          <div className="flex flex-col gap-5">
                            {/* 2. Alamat pemilik baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Pemilik <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input
                                  type="text"
                                  id={`dataBaru.${idx}.alamatPemilikBaru`}
                                  value={item.alamatPemilikBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'alamatPemilikBaru', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-20 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.alamatPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                                />
                                {needDataLama && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPemilikFromLama(idx)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${copiedAlamatPemilikIdx === idx
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200/60'
                                      }`}
                                    title="Salin alamat pemilik dari data lama"
                                  >
                                    {copiedAlamatPemilikIdx === idx ? 'Tersalin ✓' : 'Salin'}
                                  </button>
                                )}
                              </div>
                              {formErrors[`dataBaru.${idx}.alamatPemilikBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatPemilikBaru`]}</span>}
                            </div>

                            {/* 3. Kecamatan pemilik baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Pemilik <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                id={`dataBaru.${idx}.kecamatanPemilikBaru`}
                                value={item.kecamatanPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'kecamatanPemilikBaru', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                              />
                              {formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanPemilikBaru`]}</span>}
                            </div>

                            {/* 4. Desa pemilik baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Pemilik <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                id={`dataBaru.${idx}.desaPemilikBaru`}
                                value={item.desaPemilikBaru}
                                onChange={(e) => handleOwnerChange(idx, 'desaPemilikBaru', e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                                disabled={loading}
                                className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.desaPemilikBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                              />
                              {formErrors[`dataBaru.${idx}.desaPemilikBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaPemilikBaru`]}</span>}
                            </div>
                          </div>

                          {/* Kanan: Objek Baru */}
                          <div className="flex flex-col gap-5">
                            {/* 5. Alamat objek baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Alamat Objek <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input
                                  type="text"
                                  id={`dataBaru.${idx}.alamatObjekBaru`}
                                  value={item.alamatObjekBaru}
                                  onChange={(e) => handleOwnerChange(idx, 'alamatObjekBaru', e.target.value.toUpperCase())}
                                  style={{ textTransform: 'uppercase' }}
                                  disabled={loading}
                                  className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-20 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.alamatObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                                />
                                {needDataLama && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyFromLama(idx)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${copiedAlamatObjekIdx === idx
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200/60'
                                      }`}
                                    title="Salin alamat objek dari data lama"
                                  >
                                    {copiedAlamatObjekIdx === idx ? 'Tersalin ✓' : 'Salin'}
                                  </button>
                                )}
                              </div>
                              {formErrors[`dataBaru.${idx}.alamatObjekBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.alamatObjekBaru`]}</span>}
                            </div>

                            {/* 7. Kecamatan Objek Baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Kecamatan Objek <span className="text-red-500">*</span></label>
                              <select
                                id={`dataBaru.${idx}.kecamatanObjekBaru`}
                                value={item.kecamatanObjekBaru}
                                onChange={(e) => {
                                  handleOwnerChange(idx, 'kecamatanObjekBaru', e.target.value);
                                  handleOwnerChange(idx, 'desaObjekBaru', ''); // Reset desa
                                }}
                                disabled={loading}
                                className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all cursor-pointer ${formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                              >
                                <option value="">Pilih Kecamatan Objek</option>
                                {Object.keys(KECAMATAN_DATA).map(kec => (
                                  <option key={kec} value={kec}>{kec}</option>
                                ))}
                              </select>
                              {formErrors[`dataBaru.${idx}.kecamatanObjekBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.kecamatanObjekBaru`]}</span>}
                            </div>

                            {/* 8. Desa Objek Baru */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-700 tracking-wide">Desa Objek <span className="text-red-500">*</span></label>
                              <select
                                id={`dataBaru.${idx}.desaObjekBaru`}
                                value={item.desaObjekBaru}
                                onChange={(e) => handleOwnerChange(idx, 'desaObjekBaru', e.target.value)}
                                disabled={loading || !item.kecamatanObjekBaru}
                                className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 cursor-pointer ${formErrors[`dataBaru.${idx}.desaObjekBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                              >
                                <option value="">
                                  {!item.kecamatanObjekBaru ? 'Pilih Kecamatan Terlebih Dahulu' : 'Pilih Desa/Kelurahan Objek'}
                                </option>
                                {item.kecamatanObjekBaru && KECAMATAN_DATA[item.kecamatanObjekBaru]?.map(desa => (
                                  <option key={desa} value={desa}>{desa}</option>
                                ))}
                              </select>
                              {formErrors[`dataBaru.${idx}.desaObjekBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.desaObjekBaru`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* 9. Luas Tanah */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Tanah <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="number"
                              id={`dataBaru.${idx}.luasTanahBaru`}
                              value={item.luasTanahBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasTanahBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.luasTanahBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                            />
                            <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                              m²
                            </span>
                          </div>
                          {formErrors[`dataBaru.${idx}.luasTanahBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasTanahBaru`]}</span>}
                        </div>

                        {/* 10. Luas Bangunan */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">Luas Bangunan <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="number"
                              id={`dataBaru.${idx}.luasBangunanBaru`}
                              value={item.luasBangunanBaru}
                              onChange={(e) => handleOwnerChange(idx, 'luasBangunanBaru', e.target.value)}
                              disabled={loading}
                              className={`w-full bg-slate-50 border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.luasBangunanBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                            />
                            <span className="text-slate-500 text-xs font-bold absolute right-3.5 top-1/2 -translate-y-1/2 select-none">
                              m²
                            </span>
                          </div>
                          {formErrors[`dataBaru.${idx}.luasBangunanBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.luasBangunanBaru`]}</span>}
                        </div>

                        {/* 6. Nomor/Jenis Sertifikat Baru (Full Width, Paling Akhir) */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700 tracking-wide">No/Jenis Sertifikat <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="text"
                              id={`dataBaru.${idx}.sertifikatBaru`}
                              placeholder="Contoh: SHM NO. 12345"
                              value={item.sertifikatBaru}
                              onChange={(e) => handleOwnerChange(idx, 'sertifikatBaru', e.target.value.toUpperCase())}
                              style={{ textTransform: 'uppercase' }}
                              disabled={loading}
                              className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 transition-all ${formErrors[`dataBaru.${idx}.sertifikatBaru`] ? 'border-red-500 focus:border-red-500' : 'border-slate-200/90'}`}
                            />

                          </div>
                          {formErrors[`dataBaru.${idx}.sertifikatBaru`] && <span className="text-[11px] text-red-600 font-bold pl-1 mt-0.5">{formErrors[`dataBaru.${idx}.sertifikatBaru`]}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Footer Action Buttons */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 select-none">
              <div className="flex items-center gap-3">
                {/* Back Step Button */}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Kembali
                  </button>
                )}

                {/* Cancel Button (step 1 only) */}
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem('permohonan_form_draft');
                      } catch (e) {
                        console.error(e);
                      }
                      onCancel();
                    }}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                )}

                {/* Next Step or Submit Button */}
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 bg-[#00a389] hover:bg-[#008f78] text-white font-bold text-xs rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#00a389] hover:bg-[#008f78] text-white font-bold text-xs capitalize tracking-wider py-2.5 px-6 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span>Simpan Permohonan</span>
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

        {/* Draft Restored Popup Modal with Embedded Lottie Animation (Full Screen Viewport Backdrop via Portal) */}
        {mounted && draftModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none">
            {/* Clickable Backdrop Overlay */}
            <div
              className="fixed inset-0"
              onClick={() => setDraftModalOpen(false)}
            />
            <div className="relative z-10 bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-slate-200/90 flex flex-col items-center text-center animate-scaleUp">
              {/* Lottie Animation iframe */}
              <div className="w-36 h-36 flex items-center justify-center overflow-hidden mb-2 pointer-events-none">
                <iframe
                  src="https://lottie.host/embed/3a4ef8c0-cad0-4d84-a7ba-ea8fee7383b3/YsqMpnjOdj.lottie"
                  className="w-full h-full border-0"
                  title="Draft Restored Animation"
                />
              </div>

              <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-1.5">
                Draf Berhasil Dipulihkan!
              </h3>
              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                {draftModalMessage}
              </p>

              <button
                type="button"
                onClick={() => setDraftModalOpen(false)}
                className="w-full py-2.5 bg-[#00a389] hover:bg-[#008f78] text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Lanjutkan Pengisian
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
});

CreateForm.displayName = 'CreateForm';
