"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  completePermohonan,
  ajukanBatalSelesai,
  toggleVerifyDataBaru,
  verifyAllDataBaru,
} from "@/app/actions/monitor";

export function useMonitorQueue(
  selectedBundle: any | null,
  setPermohonanList: React.Dispatch<React.SetStateAction<any[]>>,
  fetchData: (isManualRefresh?: boolean) => Promise<void>,
  showConfirm: (opts: any) => void
) {
  const [selectedPermohonan, setSelectedPermohonan] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rollback Modal State
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  // Pecahan verification map for Mutasi Sebagian
  const [checkedPecahanMap, setCheckedPecahanMap] = useState<Record<string, boolean>>({});

  // Pagination for Pantau List
  const [currentPantauPage, setCurrentPantauPage] = useState(1);

  // Sync checkedPecahanMap when selectedPermohonan changes
  useEffect(() => {
    if (!selectedPermohonan) {
      setCheckedPecahanMap({});
      return;
    }
    if (selectedPermohonan.dataBaru && selectedPermohonan.dataBaru.length > 0) {
      const initialMap: Record<string, boolean> = {};
      selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
        const itemKey = db.id || `pecahan_${idx}`;
        initialMap[itemKey] = selectedPermohonan.status === "COMPLETED" || !!db.isVerified;
      });
      setCheckedPecahanMap(initialMap);
    } else {
      setCheckedPecahanMap({});
    }
  }, [selectedPermohonan?.id, selectedPermohonan?.status, selectedPermohonan?.dataBaru]);

  // Handler: Toggle individual DataBaru verification (persisted to Database)
  const handleTogglePecahanVerified = useCallback(
    async (dbId: string | undefined, itemKey: string, isChecked: boolean) => {
      setCheckedPecahanMap((prev) => ({ ...prev, [itemKey]: isChecked }));

      setPermohonanList((prevList) =>
        prevList.map((p) => {
          if (p.id === selectedPermohonan?.id && p.dataBaru) {
            const updatedDataBaru = p.dataBaru.map((db: any, idx: number) => {
              const key = db.id || `pecahan_${idx}`;
              return db.id === dbId || key === itemKey ? { ...db, isVerified: isChecked } : db;
            });
            return { ...p, dataBaru: updatedDataBaru };
          }
          return p;
        })
      );

      if (selectedPermohonan && selectedPermohonan.dataBaru) {
        setSelectedPermohonan((prev: any) => {
          if (!prev) return prev;
          const updatedDataBaru = prev.dataBaru.map((db: any, idx: number) => {
            const key = db.id || `pecahan_${idx}`;
            return db.id === dbId || key === itemKey ? { ...db, isVerified: isChecked } : db;
          });
          return { ...prev, dataBaru: updatedDataBaru };
        });
      }

      const targetId = dbId || itemKey;
      if (targetId && !targetId.startsWith("pecahan_")) {
        const res = await toggleVerifyDataBaru(targetId, isChecked);
        if (!res.success) {
          console.error("[TOGGLE-VERIFY-FAIL]", res.error);
        }
      }
    },
    [selectedPermohonan, setPermohonanList]
  );

  // Handler: Verify all DataBaru entries (persisted to Database)
  const handleVerifyAllPecahan = useCallback(async () => {
    if (!selectedPermohonan || !selectedPermohonan.dataBaru) return;

    const allMap: Record<string, boolean> = {};
    selectedPermohonan.dataBaru.forEach((db: any, idx: number) => {
      allMap[db.id || `pecahan_${idx}`] = true;
    });
    setCheckedPecahanMap(allMap);

    setPermohonanList((prevList) =>
      prevList.map((p) => {
        if (p.id === selectedPermohonan.id && p.dataBaru) {
          const updatedDataBaru = p.dataBaru.map((db: any) => ({ ...db, isVerified: true }));
          return { ...p, dataBaru: updatedDataBaru };
        }
        return p;
      })
    );

    setSelectedPermohonan((prev: any) => {
      if (!prev) return prev;
      const updatedDataBaru = (prev.dataBaru || []).map((db: any) => ({ ...db, isVerified: true }));
      return { ...prev, dataBaru: updatedDataBaru };
    });

    await verifyAllDataBaru(selectedPermohonan.id);
  }, [selectedPermohonan, setPermohonanList]);

  // Filtered Pantau List inside selectedBundle
  const filteredPantauList = useMemo(() => {
    if (!selectedBundle) return [];
    return (selectedBundle.permohonan || []).filter((p: any) => {
      const matchesSearch =
        p.nop.includes(searchQuery) ||
        p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nomorPelayanan && p.nomorPelayanan.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [selectedBundle, searchQuery]);

  const totalPantauPages = Math.ceil(filteredPantauList.length / 10) || 1;
  const activePantauPage = currentPantauPage > totalPantauPages ? 1 : currentPantauPage;

  const paginatedPantau = useMemo(() => {
    return filteredPantauList.slice((activePantauPage - 1) * 10, activePantauPage * 10);
  }, [filteredPantauList, activePantauPage]);

  // Complete Permohonan Handler
  const handleComplete = useCallback(
    (id: string, nomorPermohonan: string) => {
      showConfirm({
        title: "Konfirmasi Penyelesaian",
        message: `Apakah Anda yakin ingin menandai permohonan ${nomorPermohonan} SELESAI?`,
        onConfirm: async () => {
          setLoading(true);
          setError("");
          setSuccess("");
          try {
            const res: any = await completePermohonan(id);
            if (res.success) {
              setSuccess(`Permohonan ${nomorPermohonan} berhasil ditandai selesai!`);
              await fetchData(true);
              setTimeout(() => setSuccess(""), 5000);
            } else {
              setError(res.error || "Gagal menyelesaikan permohonan.");
            }
          } catch (err: any) {
            setError(err.message || "Sistem error.");
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [showConfirm, fetchData]
  );

  // Submit Rollback Request: Batal Selesai
  const handleRollback = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPermohonan || !rollbackReason.trim()) return;

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const res: any = await ajukanBatalSelesai(selectedPermohonan.id, rollbackReason);
        if (res.success) {
          setSuccess("Permintaan rollback 'Batal Selesai' berhasil diajukan dan sedang menunggu keputusan Supervisor.");
          setShowRollbackModal(false);
          setRollbackReason("");
          await fetchData(true);
          setTimeout(() => setSuccess(""), 5000);
        } else {
          setError(res.error || "Gagal mengajukan rollback.");
        }
      } catch (err: any) {
        setError(err.message || "Sistem error.");
      } finally {
        setLoading(false);
      }
    },
    [selectedPermohonan, rollbackReason, fetchData]
  );

  return {
    selectedPermohonan,
    setSelectedPermohonan,
    searchQuery,
    setSearchQuery,
    checkedPecahanMap,
    loading,
    error,
    setError,
    success,
    setSuccess,
    showRollbackModal,
    setShowRollbackModal,
    rollbackReason,
    setRollbackReason,
    currentPantauPage: activePantauPage,
    setCurrentPantauPage,
    totalPantauPages,
    filteredPantauList,
    paginatedPantau,
    handleTogglePecahanVerified,
    handleVerifyAllPecahan,
    handleComplete,
    handleRollback,
  };
}
