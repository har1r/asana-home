import { useState, useMemo, useCallback } from 'react';

export interface UseRecommendationPrintProps {
  selectedBundle: any | null;
}

export function useRecommendationPrint({ selectedBundle }: UseRecommendationPrintProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Display Mode Switcher State ('permohonan' | 'pemohon')
  const [displayMode, setDisplayMode] = useState<'permohonan' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('architax_recommendation_display_mode');
      if (saved === 'permohonan' || saved === 'pemohon') return saved;
    }
    return 'permohonan';
  });

  const handleSwitchDisplayMode = useCallback((mode: 'permohonan' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_recommendation_display_mode', mode);
    }
  }, []);

  const rawApplications = useMemo(() => {
    const list = selectedBundle?.applications || selectedBundle?.permohonan || [];
    return list.map((item: any) => {
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
  }, [selectedBundle]);

  // Transform list according to displayMode ('permohonan' vs 'pemohon')
  const modeBaseApplications = useMemo(() => {
    if (displayMode === 'permohonan') return rawApplications;

    return rawApplications.flatMap((item: any) => {
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
  }, [rawApplications, displayMode]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredApplications = useMemo(() => {
    let list = modeBaseApplications.map((item: any) => ({
      ...item,
      isFavorite: item.isFavorite ?? favorites.has(item.id),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item: any) => {
        const noPermohonan = (item.applicationNumber || '').toLowerCase();
        const nop = (item.nop || '').toLowerCase();
        const prevOwner = (item.previousData?.[0]?.ownerName || item.ownerName || '').toLowerCase();
        const targetOwner = (item.targetData?.[0]?.ownerName || '').toLowerCase();
        const displayOwner = (item.displayOwnerName || '').toLowerCase();

        return (
          noPermohonan.includes(q) ||
          nop.includes(q) ||
          prevOwner.includes(q) ||
          targetOwner.includes(q) ||
          displayOwner.includes(q)
        );
      });
    }

    return list;
  }, [modeBaseApplications, searchQuery, favorites]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  const handlePrintBundleCover = (bundleId: string) => {
    if (typeof window !== 'undefined') {
      window.open(`/api/pdf/bundle-cover-letter/${bundleId}`, '_blank');
    }
  };

  return {
    applications: rawApplications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    displayMode,
    setDisplayMode: handleSwitchDisplayMode,
    handleToggleFavorite,
    handlePrintBundleCover,
  };
}
