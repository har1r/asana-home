import { useState, useCallback, useMemo } from 'react';
import { getSubmittedPermohonan, addPermohonanToBundle, resubmitResearcherApplication } from '@/app/actions/researcher';
import { toggleFavoriteApplication } from '@/app/actions/data-entry';

export function useApplicationQueue() {
  const [submittedList, setSubmittedList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');
  const [filterRevisionSource, setFilterRevisionSource] = useState<'ALL' | 'PENGARSIP'>('ALL');
  const [sortBy, setSortBy] = useState<'last_modified' | 'newest' | 'oldest' | 'a_z'>('last_modified');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Display Mode Switcher State ('permohonan' | 'pemohon')
  const [displayMode, setDisplayMode] = useState<'permohonan' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('architax_queue_display_mode');
      if (saved === 'permohonan' || saved === 'pemohon') return saved;
    }
    return 'permohonan';
  });

  const handleSwitchDisplayMode = useCallback((mode: 'permohonan' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_queue_display_mode', mode);
    }
  }, []);

  const fetchSubmittedQueue = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getSubmittedPermohonan();
      if (res.success && res.list) {
        const rawList = res.list || [];
        const normalized = rawList.map((item: any) => {
          const previousData = Array.isArray(item.previousData) ? item.previousData : (Array.isArray(item.dataLama) ? item.dataLama : []);
          const targetData = Array.isArray(item.targetData) ? item.targetData : (Array.isArray(item.dataBaru) ? item.dataBaru : []);
          const firstPrev = previousData[0] || {};
          const firstTarget = targetData[0] || {};
          const appType = item.applicationType || item.jenisPermohonan || '';

          const isPartialMutation = appType === 'PARTIAL_MUTATION' || appType === 'MUTASI_SEBAGIAN';
          const isReactivation = appType === 'REACTIVATION' || appType === 'PENGAKTIFAN';

          let calculatedNop = item.nop || '';
          if (appType === 'NEW_TAX_OBJECT' || appType === 'OBJEK_PAJAK_BARU') {
            calculatedNop = firstTarget.nopTemporary || firstTarget.nop || item.nop || '-';
          } else {
            calculatedNop = firstPrev.nop || item.nop || '-';
          }

          let calculatedOwnerName = '';
          if (isReactivation) {
            calculatedOwnerName = firstPrev.ownerName || firstPrev.namaPemilikLama || '-';
          } else if (isPartialMutation) {
            const firstName = firstTarget.ownerName || firstTarget.namaPemilikBaru || '';
            const totalCount = targetData.length;
            if (firstName && totalCount > 1) {
              calculatedOwnerName = `${firstName} (${totalCount})`;
            } else {
              calculatedOwnerName = firstName || '-';
            }
          } else {
            if (targetData.length > 0) {
              calculatedOwnerName = targetData
                .map((t: any) => t.ownerName || t.namaPemilikBaru)
                .filter(Boolean)
                .join(', ');
            }
            if (!calculatedOwnerName) {
              calculatedOwnerName = firstPrev.ownerName || '-';
            }
          }

          return {
            ...item,
            applicationType: appType,
            applicationNumber: item.applicationNumber || item.nomorPelayanan || '-',
            serviceNumberDate: item.serviceNumberDate || item.tanggalNoPelayanan || item.createdAt,
            completionDate: item.completionDate || item.tanggalPenyelesaian,
            nop: calculatedNop,
            ownerName: calculatedOwnerName,
            previousData,
            targetData,
          };
        });
        setSubmittedList(normalized);
      } else {
        setError(res.error || 'Gagal mengambil antrean permohonan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat antrean.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (id: string) => {
    let originalList: any[] = [];
    setSubmittedList((prev) => {
      originalList = [...prev];
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
    });

    try {
      const res = await toggleFavoriteApplication(id);
      if (!res.success) {
        setSubmittedList(originalList); // Revert
      }
    } catch (err) {
      setSubmittedList(originalList); // Revert
    }
  }, []);

  const handleAddToBundle = useCallback(async (bundleId: string, permohonanId: string, onSuccessCallback?: () => void) => {
    try {
      const res = await addPermohonanToBundle(bundleId, permohonanId);
      if (res.success) {
        if (!onSuccessCallback) {
          setSuccess('Permohonan berhasil dimasukkan ke dalam bundle.');
        }
        await fetchSubmittedQueue();
        if (onSuccessCallback) {
          await onSuccessCallback();
        }
      } else {
        setError(res.error || 'Gagal memasukkan permohonan ke bundle.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memasukkan ke bundle.');
    }
  }, [fetchSubmittedQueue]);

  const handleResubmitRevision = useCallback(async (id: string, note?: string) => {
    try {
      const res = await resubmitResearcherApplication(id, note);
      if (res.success) {
        setSuccess('Permohonan berhasil di-resubmit ke antrean.');
        await fetchSubmittedQueue();
      } else {
        setError(res.error || 'Gagal melakukan resubmit permohonan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat resubmit permohonan.');
    }
  }, [fetchSubmittedQueue]);

  // Full queue transformed by displayMode ('permohonan' vs 'pemohon')
  const modeBaseQueue = useMemo(() => {
    if (displayMode === 'permohonan') return submittedList;

    return submittedList.flatMap((item) => {
      const isPartial = item.applicationType === 'PARTIAL_MUTATION' || item.applicationType === 'MUTASI_SEBAGIAN';
      const targets = (item.targetData && item.targetData.length > 0) ? item.targetData : (item.dataBaru || []);

      if (isPartial && targets.length > 0) {
        return targets.map((td: any, idx: number) => ({
          ...item,
          uniqueRowKey: `${item.id}-pecahan-${idx}`,
          displayOwnerName: td.ownerName || td.namaPemilikBaru || item.ownerName,
          isPecahanRow: true,
          pecahanIndex: idx + 1,
          totalPecahan: targets.length,
        }));
      }
      return [{ ...item, uniqueRowKey: item.id }];
    });
  }, [submittedList, displayMode]);

  const filteredQueue = useMemo(() => {
    let result = [...modeBaseQueue];

    // Filter Service Type
    if (filterJenisLayanan !== 'ALL') {
      result = result.filter((item) => {
        const type = item.applicationType;
        if (filterJenisLayanan === 'MUTASI_SEBAGIAN') return type === 'MUTASI_SEBAGIAN' || type === 'PARTIAL_MUTATION';
        if (filterJenisLayanan === 'MUTASI_PENGGABUNGAN') return type === 'MUTASI_PENGGABUNGAN' || type === 'MERGER_MUTATION';
        if (filterJenisLayanan === 'MUTASI_HABIS_UPDATE') return type === 'MUTASI_HABIS_UPDATE' || type === 'EXPIRED_UPDATE';
        if (filterJenisLayanan === 'MUTASI_HABIS_REGULER') return type === 'MUTASI_HABIS_REGULER' || type === 'EXPIRED_REGULAR';
        if (filterJenisLayanan === 'OBJEK_PAJAK_BARU') return type === 'OBJEK_PAJAK_BARU' || type === 'NEW_TAX_OBJECT';
        if (filterJenisLayanan === 'PEMBETULAN') return type === 'PEMBETULAN' || type === 'CORRECTION';
        if (filterJenisLayanan === 'PENGAKTIFAN') return type === 'PENGAKTIFAN' || type === 'REACTIVATION';
        return type === filterJenisLayanan;
      });
    }

    // Filter Revision Source
    if (filterRevisionSource !== 'ALL') {
      result = result.filter((item) => item.revisionSource === filterRevisionSource);
    }

    // Search Query
    if (searchSubmittedQuery.trim()) {
      const q = searchSubmittedQuery.toLowerCase();
      result = result.filter((item) => {
        const appNum = (item.applicationNumber || '').toLowerCase();
        const nop = (item.nop || item.previousData?.[0]?.nop || '').toLowerCase();
        const owner = (item.displayOwnerName || item.ownerName || item.previousData?.[0]?.ownerName || '').toLowerCase();
        const targetOwner = (item.targetData?.[0]?.ownerName || '').toLowerCase();
        return appNum.includes(q) || nop.includes(q) || owner.includes(q) || targetOwner.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'a_z') {
        const nameA = a.displayOwnerName || a.ownerName || a.targetData?.[0]?.ownerName || a.previousData?.[0]?.ownerName || '';
        const nameB = b.displayOwnerName || b.ownerName || b.targetData?.[0]?.ownerName || b.previousData?.[0]?.ownerName || '';
        return nameA.localeCompare(nameB);
      }
      // default: last_modified
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return result;
  }, [modeBaseQueue, filterJenisLayanan, filterRevisionSource, searchSubmittedQuery, sortBy]);

  const jenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: modeBaseQueue.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_PENGGABUNGAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };

    modeBaseQueue.forEach((item) => {
      let type = item.applicationType;
      if (type === 'PARTIAL_MUTATION') type = 'MUTASI_SEBAGIAN';
      if (type === 'MERGER_MUTATION') type = 'MUTASI_PENGGABUNGAN';
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
  }, [modeBaseQueue]);

  return {
    submittedList,
    setSubmittedList,
    listLoading,
    error,
    setError,
    success,
    setSuccess,
    searchSubmittedQuery,
    setSearchSubmittedQuery,
    filterJenisLayanan,
    setFilterJenisLayanan,
    filterRevisionSource,
    setFilterRevisionSource,
    sortBy,
    setSortBy,
    displayMode,
    setDisplayMode: handleSwitchDisplayMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    fetchSubmittedQueue,
    handleToggleFavorite,
    handleAddToBundle,
    handleResubmitRevision,
    filteredQueue,
    jenisCounts,
  };
}
