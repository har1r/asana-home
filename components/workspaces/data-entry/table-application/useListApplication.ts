"use client";

import { useState, useMemo, useCallback, useDeferredValue, useEffect } from 'react';

export interface UseListApplicationOptions {
  list: any[];
}

export function useListApplication({ list }: UseListApplicationOptions) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJenisLayanan, setFilterJenisLayanan] = useState<string>('ALL');

  // Sorting State ('last_modified' | 'newest' | 'oldest' | 'a_z')
  const [sortBy, setSortBy] = useState<'last_modified' | 'newest' | 'oldest' | 'a_z'>('last_modified');

  // Display Mode Switcher State ('berkas' | 'pemohon')
  const [displayMode, setDisplayMode] = useState<'permohonan' | 'pemohon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('architax_table_display_mode');
      if (saved === 'permohonan' || saved === 'pemohon') return saved;
    }
    return 'permohonan';
  });

  const handleSwitchDisplayMode = useCallback((mode: 'permohonan' | 'pemohon') => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_table_display_mode', mode);
    }
  }, []);

  // Pagination & Copy State
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1000);
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterJenisLayanan, itemsPerPage]);

  // Full list transformed by displayMode ('permohonan' vs 'pemohon')
  const modeBaseList = useMemo(() => {
    if (displayMode === 'permohonan') return list;

    return list.flatMap((item) => {
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
  }, [list, displayMode]);

  // Count by jenis layanan
  const jenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: modeBaseList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_PENGGABUNGAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };

    modeBaseList.forEach((item) => {
      const type = item.applicationType || item.jenisPermohonan || '';
      if (type === 'PARTIAL_MUTATION' || type === 'MUTASI_SEBAGIAN') counts.MUTASI_SEBAGIAN++;
      else if (type === 'MERGER_MUTATION' || type === 'MUTASI_PENGGABUNGAN') counts.MUTASI_PENGGABUNGAN++;
      else if (type === 'EXPIRED_UPDATE' || type === 'MUTASI_HABIS_UPDATE') counts.MUTASI_HABIS_UPDATE++;
      else if (type === 'EXPIRED_REGULAR' || type === 'MUTASI_HABIS_REGULER') counts.MUTASI_HABIS_REGULER++;
      else if (type === 'NEW_TAX_OBJECT' || type === 'OBJEK_PAJAK_BARU') counts.OBJEK_PAJAK_BARU++;
      else if (type === 'CORRECTION' || type === 'PEMBETULAN') counts.PEMBETULAN++;
      else if (type === 'REACTIVATION' || type === 'PENGAKTIFAN') counts.PENGAKTIFAN++;
    });

    return counts;
  }, [modeBaseList]);

  // Search & Filter List
  const filteredList = useMemo(() => {
    return modeBaseList.filter((item) => {
      const q = deferredSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.ownerName && item.ownerName.toLowerCase().includes(q)) ||
        (item.displayOwnerName && item.displayOwnerName.toLowerCase().includes(q)) ||
        (item.nop && item.nop.includes(q)) ||
        (item.applicationNumber && item.applicationNumber.includes(q)) ||
        (item.targetData && item.targetData.some((td: any) => td.ownerName?.toLowerCase().includes(q)));

      const matchesStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'FAVORITE'
            ? item.isFavorite
            : item.status === filterStatus;

      const type = item.applicationType || item.jenisPermohonan || '';
      const matchesJenis =
        filterJenisLayanan === 'ALL'
          ? true
          : filterJenisLayanan === 'MUTASI_SEBAGIAN'
            ? type === 'PARTIAL_MUTATION' || type === 'MUTASI_SEBAGIAN'
            : filterJenisLayanan === 'MUTASI_PENGGABUNGAN'
              ? type === 'MERGER_MUTATION' || type === 'MUTASI_PENGGABUNGAN'
              : filterJenisLayanan === 'MUTASI_HABIS_UPDATE'
                ? type === 'EXPIRED_UPDATE' || type === 'MUTASI_HABIS_UPDATE'
                : filterJenisLayanan === 'MUTASI_HABIS_REGULER'
                  ? type === 'EXPIRED_REGULAR' || type === 'MUTASI_HABIS_REGULER'
                  : filterJenisLayanan === 'OBJEK_PAJAK_BARU'
                    ? type === 'NEW_TAX_OBJECT' || type === 'OBJEK_PAJAK_BARU'
                    : filterJenisLayanan === 'PEMBETULAN'
                      ? type === 'CORRECTION' || type === 'PEMBETULAN'
                      : filterJenisLayanan === 'PENGAKTIFAN'
                        ? type === 'REACTIVATION' || type === 'PENGAKTIFAN'
                        : true;

      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [modeBaseList, deferredSearchQuery, filterStatus, filterJenisLayanan]);

  // Sort List
  const filteredAndSortedList = useMemo(() => {
    const array = [...filteredList];
    switch (sortBy) {
      case 'last_modified':
        return array.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      case 'newest':
        return array.sort((a, b) => new Date(b.serviceNumberDate || b.createdAt).getTime() - new Date(a.serviceNumberDate || a.createdAt).getTime());
      case 'oldest':
        return array.sort((a, b) => new Date(a.serviceNumberDate || a.createdAt).getTime() - new Date(b.serviceNumberDate || b.createdAt).getTime());
      case 'a_z':
        return array.sort((a, b) => (a.ownerName || '').localeCompare(b.ownerName || ''));
      default:
        return array;
    }
  }, [filteredList, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedList.length / itemsPerPage));

  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedList.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedList, currentPage, itemsPerPage]);

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterJenisLayanan,
    setFilterJenisLayanan,
    sortBy,
    setSortBy,
    displayMode,
    setDisplayMode: handleSwitchDisplayMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    copiedText,
    handleCopy,
    modeBaseList,
    jenisCounts,
    filteredAndSortedList,
    paginatedList,
    totalPages,
  };
}
