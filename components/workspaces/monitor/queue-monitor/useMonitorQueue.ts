"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  completePermohonan,
  completePermohonans,
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

  // Auto-select first permohonan when selectedBundle changes
  useEffect(() => {
    if (selectedBundle && selectedBundle.permohonan && selectedBundle.permohonan.length > 0) {
      const existsInBundle = selectedBundle.permohonan.some((p: any) => p.id === selectedPermohonan?.id);
      if (!existsInBundle) {
        setSelectedPermohonan(selectedBundle.permohonan[0]);
      }
    } else if (!selectedBundle) {
      setSelectedPermohonan(null);
    }
  }, [selectedBundle]);

  // Sync checkedPecahanMap when selectedPermohonan changes
  useEffect(() => {
    if (!selectedPermohonan) {
      setCheckedPecahanMap({});
      return;
    }
    const targetDataList = Array.isArray(selectedPermohonan.targetData) && selectedPermohonan.targetData.length > 0
      ? selectedPermohonan.targetData
      : (Array.isArray(selectedPermohonan.dataBaru) ? selectedPermohonan.dataBaru : []);

    if (targetDataList.length > 0) {
      const initialMap: Record<string, boolean> = {};
      targetDataList.forEach((db: any, idx: number) => {
        const itemKey = db.idTargetData || db.id || `pecahan_${idx}`;
        initialMap[itemKey] = selectedPermohonan.status === "COMPLETED" || !!db.isVerified;
      });
      setCheckedPecahanMap(initialMap);
    } else {
      setCheckedPecahanMap({});
    }
  }, [selectedPermohonan?.id, selectedPermohonan?.status, selectedPermohonan?.targetData, selectedPermohonan?.dataBaru]);

  // Handler: Toggle individual DataBaru verification (persisted to Database)
  const handleTogglePecahanVerified = useCallback(
    async (permohonanId: string | undefined, dbId: string | undefined, itemKey: string, isChecked: boolean) => {
      const targetAppId = permohonanId || selectedPermohonan?.id;
      setCheckedPecahanMap((prev) => ({ ...prev, [itemKey]: isChecked }));

      setPermohonanList((prevList) =>
        prevList.map((p) => {
          if (p.id === targetAppId) {
            const list = Array.isArray(p.targetData) && p.targetData.length > 0 ? p.targetData : p.dataBaru;
            if (list) {
              const updated = list.map((db: any, idx: number) => {
                const key = db.idTargetData || db.id || `pecahan_${idx}`;
                return db.idTargetData === dbId || db.id === dbId || key === itemKey ? { ...db, isVerified: isChecked } : db;
              });
              return Array.isArray(p.targetData) && p.targetData.length > 0 ? { ...p, targetData: updated } : { ...p, dataBaru: updated };
            }
          }
          return p;
        })
      );

      if (selectedPermohonan && selectedPermohonan.id === targetAppId) {
        setSelectedPermohonan((prev: any) => {
          if (!prev) return prev;
          const list = Array.isArray(prev.targetData) && prev.targetData.length > 0 ? prev.targetData : prev.dataBaru;
          if (list) {
            const updated = list.map((db: any, idx: number) => {
              const key = db.idTargetData || db.id || `pecahan_${idx}`;
              return db.idTargetData === dbId || db.id === dbId || key === itemKey ? { ...db, isVerified: isChecked } : db;
            });
            return Array.isArray(prev.targetData) && prev.targetData.length > 0 ? { ...prev, targetData: updated } : { ...prev, dataBaru: updated };
          }
          return prev;
        });
      }

      const targetId = dbId || itemKey;
      if (targetAppId) {
        const res = await toggleVerifyDataBaru(targetAppId, targetId, isChecked);
        if (!res.success) {
          console.error("[TOGGLE-VERIFY-FAIL]", res.error);
        }
      }
    },
    [selectedPermohonan, setPermohonanList]
  );

  // Handler: Verify all DataBaru entries (persisted to Database)
  const handleVerifyAllPecahan = useCallback(async () => {
    if (!selectedPermohonan) return;
    const targetDataList = Array.isArray(selectedPermohonan.targetData) && selectedPermohonan.targetData.length > 0
      ? selectedPermohonan.targetData
      : (Array.isArray(selectedPermohonan.dataBaru) ? selectedPermohonan.dataBaru : []);
    if (targetDataList.length === 0) return;

    const allMap: Record<string, boolean> = {};
    targetDataList.forEach((db: any, idx: number) => {
      allMap[db.idTargetData || db.id || `pecahan_${idx}`] = true;
    });
    setCheckedPecahanMap(allMap);

    setPermohonanList((prevList) =>
      prevList.map((p) => {
        if (p.id === selectedPermohonan.id) {
          const list = Array.isArray(p.targetData) && p.targetData.length > 0 ? p.targetData : p.dataBaru;
          if (list) {
            const updated = list.map((db: any) => ({ ...db, isVerified: true }));
            return Array.isArray(p.targetData) && p.targetData.length > 0 ? { ...p, targetData: updated } : { ...p, dataBaru: updated };
          }
        }
        return p;
      })
    );

    setSelectedPermohonan((prev: any) => {
      if (!prev) return prev;
      const list = Array.isArray(prev.targetData) && prev.targetData.length > 0 ? prev.targetData : prev.dataBaru;
      if (list) {
        const updated = list.map((db: any) => ({ ...db, isVerified: true }));
        return Array.isArray(prev.targetData) && prev.targetData.length > 0 ? { ...prev, targetData: updated } : { ...prev, dataBaru: updated };
      }
      return prev;
    });

    await verifyAllDataBaru(selectedPermohonan.id);
  }, [selectedPermohonan, setPermohonanList]);

  // Filtered Pantau List inside selectedBundle
  const filteredPantauList = useMemo(() => {
    if (!selectedBundle) return [];
    const query = (searchQuery || "").toLowerCase();
    return (selectedBundle.permohonan || []).filter((p: any) => {
      if (!query) return true;
      const prev = Array.isArray(p?.previousData) && p.previousData.length > 0 ? p.previousData[0] : (Array.isArray(p?.dataLama) && p.dataLama.length > 0 ? p.dataLama[0] : null);
      const targ = Array.isArray(p?.targetData) && p.targetData.length > 0 ? p.targetData[0] : (Array.isArray(p?.dataBaru) && p.dataBaru.length > 0 ? p.dataBaru[0] : null);

      const nopStr = (p?.nop || prev?.nop || targ?.nopFinal || targ?.nopTemporary || p?.nomorPelayanan || p?.applicationNumber || "").toString().toLowerCase();
      const namaWpStr = (p?.namaWajibPajak || prev?.ownerName || prev?.namaPemilikLama || targ?.ownerName || p?.applicantName || "").toString().toLowerCase();
      const noPelStr = (p?.nomorPelayanan || p?.applicationNumber || "").toString().toLowerCase();

      return nopStr.includes(query) || namaWpStr.includes(query) || noPelStr.includes(query);
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

  // Complete Batch / Bundle Handler
  const handleCompleteBundle = useCallback(
    (bundle: any) => {
      if (!bundle || !bundle.permohonan || bundle.permohonan.length === 0) return;
      const uncompleted = bundle.permohonan.filter((p: any) => p.status !== "COMPLETED");
      if (uncompleted.length === 0) return;

      const ids = uncompleted.map((p: any) => p.id);
      const bundleNum = bundle.nomorBundle || bundle.bundleNumber || "Bundle";

      showConfirm({
        title: "Konfirmasi Penyelesaian Bundle",
        message: `Apakah Anda yakin ingin menandai seluruh (${uncompleted.length}) permohonan di ${bundleNum} SELESAI?`,
        onConfirm: async () => {
          setLoading(true);
          setError("");
          setSuccess("");
          try {
            const res: any = await completePermohonans(ids);
            if (res.success) {
              setSuccess(`Seluruh ${uncompleted.length} permohonan di ${bundleNum} berhasil ditandai selesai!`);
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
    handleCompleteBundle,
    handleRollback,
  };
}
