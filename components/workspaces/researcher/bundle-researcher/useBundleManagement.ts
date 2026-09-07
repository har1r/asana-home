import { useState, useCallback, useMemo, useEffect } from 'react';
import { getBundles, createBundle, lockBundle, resetEmptyBundleType } from '@/app/actions/researcher';

export function useBundleManagement() {
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBundles();
      if (res.success && res.list) {
        setBundlesList(res.list);
        setSelectedBundle((prev) => {
          if (!prev) return null;
          const updated = res.list.find((b: any) => b.id === prev.id);
          return updated || prev;
        });
      } else {
        setError(res.error || 'Gagal mengambil data bundle.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat bundle.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateBundle = useCallback(async (jenisLayanan?: string) => {
    setLoading(true);
    try {
      const res = await createBundle(jenisLayanan);
      if (res.success && res.bundle) {
        setSuccess(`Bundle ${res.bundle.bundleNumber} berhasil dibuat.`);
        await fetchBundles();
        return res.bundle;
      } else {
        setError(res.error || 'Gagal membuat bundle baru.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat bundle.');
    } finally {
      setLoading(false);
    }
  }, [fetchBundles]);

  const handleLockBundleAction = useCallback(async (bundleId: string) => {
    setLoading(true);
    try {
      const res = await lockBundle(bundleId);
      if (res.success) {
        setSuccess('Bundle berhasil dikunci dan dikirim ke Pengarsip.');
        await fetchBundles();
      } else {
        setError(res.error || 'Gagal mengunci bundle.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunci bundle.');
    } finally {
      setLoading(false);
    }
  }, [fetchBundles]);

  const handleResetEmptyBundle = useCallback(async (bundleId: string) => {
    try {
      const res = await resetEmptyBundleType(bundleId);
      if (res.success) {
        await fetchBundles();
      }
    } catch (e) {
      console.error('Failed to reset bundle type:', e);
    }
  }, [fetchBundles]);

  const filteredBundles = useMemo(() => {
    return bundlesList.filter((b) => {
      const type = b.applicationType || b.jenisPermohonan || '';
      const apps = b.permohonan || b.applications || [];
      const isEmptyBundle = apps.length === 0;

      // Filter jenis layanan
      if (filterJenisLayanan !== 'ALL') {
        // Bundle kosong dapat menerima jenis permohonan apapun sehingga tetap tampil di filter
        if (!isEmptyBundle) {
          if (filterJenisLayanan === 'MUTASI_PENGGABUNGAN' || filterJenisLayanan === 'MERGER_MUTATION') {
            if (type !== 'MUTASI_PENGGABUNGAN' && type !== 'MERGER_MUTATION') return false;
          } else if (type !== filterJenisLayanan) {
            return false;
          }
        }
      }
      // Filter status
      if (filterBundleStatus !== 'ALL' && b.status !== filterBundleStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (b.bundleNumber || b.nomorBundle || '').toLowerCase();
        const typeStr = type.toLowerCase();
        return num.includes(q) || typeStr.includes(q);
      }
      return true;
    });
  }, [bundlesList, filterJenisLayanan, filterBundleStatus, searchQuery]);

  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_PENGGABUNGAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0
    };
    bundlesList.forEach(b => {
      const apps = b.permohonan || b.applications || [];
      // Bundle kosong (0 Pemohon) hanya dihitung pada total ALL
      if (apps.length === 0) return;

      let type = b.applicationType || b.jenisPermohonan;
      if (type === 'MERGER_MUTATION') type = 'MUTASI_PENGGABUNGAN';
      if (type === 'PARTIAL_MUTATION') type = 'MUTASI_SEBAGIAN';
      if (type === 'EXPIRED_UPDATE') type = 'MUTASI_HABIS_UPDATE';
      if (type === 'EXPIRED_REGULAR') type = 'MUTASI_HABIS_REGULER';
      if (type === 'NEW_TAX_OBJECT') type = 'OBJEK_PAJAK_BARU';
      if (type === 'CORRECTION') type = 'PEMBETULAN';
      if (type === 'REACTIVATION') type = 'PENGAKTIFAN';

      if (type && counts[type] !== undefined) {
        counts[type]++;
      }
    });
    return counts;
  }, [bundlesList]);

  const [visibleCount, setVisibleCount] = useState(8);

  // Reset visibleCount whenever search query or filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [searchQuery, filterJenisLayanan, filterBundleStatus]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 8, filteredBundles.length));
  }, [filteredBundles.length]);

  const hasMore = visibleCount < filteredBundles.length;
  const visibleBundles = useMemo(() => {
    return filteredBundles.slice(0, visibleCount);
  }, [filteredBundles, visibleCount]);

  return {
    bundlesList,
    setBundlesList,
    selectedBundle,
    setSelectedBundle,
    loading,
    error,
    setError,
    success,
    setSuccess,
    searchQuery,
    setSearchQuery,
    filterJenisLayanan,
    setFilterJenisLayanan,
    filterBundleStatus,
    setFilterBundleStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    visibleCount,
    setVisibleCount,
    loadMore,
    hasMore,
    visibleBundles,
    fetchBundles,
    filteredBundles,
    bundleJenisCounts,
    handleCreateBundle,
    handleLockBundleAction,
    handleResetEmptyBundle,
  };
}
