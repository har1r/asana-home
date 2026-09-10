import { useState, useCallback, useMemo } from "react";
import { getDigitizationBundles, getBundleDetails } from "@/app/actions/archivist";

export function useArchivistBundleManagement() {
  const [bundlesList, setBundlesList] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [allPermohonanList, setAllPermohonanList] = useState<any[]>([]);
  const [permohonanList, setPermohonanList] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Search & Filters
  const [searchBundleQuery, setSearchBundleQuery] = useState("");
  const [isBundleSearchFocused, setIsBundleSearchFocused] = useState<boolean>(false);
  const [filterBundleJenisLayanan, setFilterBundleJenisLayanan] = useState<string>("ALL");
  const [filterBundleStatus, setFilterBundleStatus] = useState<string>("ALL");

  // Pagination
  const [currentBundlePage, setCurrentBundlePage] = useState(1);
  const [itemsPerBundlePage, setItemsPerBundlePage] = useState(8);

  // Helper to check if permohonan needs reupload
  const checkPermohonanNeedsReupload = useCallback(
    (p: any, targetDataBaruId?: string | null) => {
      if (p.status !== "BUNDLED") return false;
      const archives = p.arsipDigital || [];
      const koreksis = p.permintaanKoreksi || [];

      const hasApprovedKoreksi = koreksis.some(
        (pk: any) => pk.jenisKoreksi === "KEMBALIKAN_KE_PENGARSIP" && pk.status === "APPROVED"
      );

      if (targetDataBaruId) {
        const fractionArchives = archives.filter((ad: any) => ad.dataBaruId === targetDataBaruId);
        const hasInactive = fractionArchives.some(
          (ad: any) => ad.status === "SUPERSEDED" || ad.status === "INVALIDATED"
        );
        return hasInactive || (hasApprovedKoreksi && fractionArchives.length > 0);
      }

      const hasInactive = archives.some(
        (ad: any) => ad.status === "SUPERSEDED" || ad.status === "INVALIDATED"
      );
      return hasInactive || (hasApprovedKoreksi && archives.length > 0);
    },
    []
  );

  const bundleHasReupload = useCallback(
    (b: any) => {
      const apps = b.applications || b.permohonan || [];
      return apps.some((p: any) => checkPermohonanNeedsReupload(p));
    },
    [checkPermohonanNeedsReupload]
  );

  // Fetch Digitization Bundles
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setListLoading(true);
    setError("");

    try {
      const res = await getDigitizationBundles();
      if (res.success && "list" in res && res.list) {
        setBundlesList(res.list);
        if ("allPermohonan" in res && (res as any).allPermohonan) {
          setAllPermohonanList((res as any).allPermohonan);
        }
      } else {
        setError("error" in res && res.error ? res.error : "Gagal memuat daftar bundle.");
      }

      if (selectedBundle?.id) {
        const detailRes = await getBundleDetails(selectedBundle.id);
        if (detailRes.success && "bundle" in detailRes && detailRes.bundle) {
          setSelectedBundle(detailRes.bundle);
          setPermohonanList(
            (detailRes.bundle as any).applications || (detailRes.bundle as any).permohonan || []
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setListLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBundle?.id]);

  const fetchBundles = useCallback(
    async (isManualRefresh = false) => {
      await fetchData(isManualRefresh);
    },
    [fetchData]
  );

  // Fetch Bundle Details
  const fetchBundleDetail = useCallback(async (bundleId: string) => {
    try {
      const res = await getBundleDetails(bundleId);
      if (res.success && "bundle" in res && res.bundle) {
        setSelectedBundle(res.bundle);
        setPermohonanList(
          (res.bundle as any).applications || (res.bundle as any).permohonan || []
        );
      } else {
        setError("error" in res && res.error ? res.error : "Gagal memuat rincian bundle.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat rincian permohonan.");
    }
  }, []);

  const handleSelectBundle = useCallback((bundle: any) => {
    setSelectedBundle(bundle);
    setPermohonanList(bundle.applications || bundle.permohonan || []);
  }, []);

  // Filter Bundles List
  const filteredBundlesList = useMemo(() => {
    const q = searchBundleQuery.toLowerCase().trim();
    return bundlesList.filter((b) => {
      const bundleNo = b.nomorBundle || b.bundleNumber || "";
      const jenis = b.jenisPermohonan || b.applicationType || "";

      const matchSearch =
        !q ||
        bundleNo.toLowerCase().includes(q) ||
        jenis.toLowerCase().includes(q);

      const matchJenis =
        filterBundleJenisLayanan === "ALL" || jenis === filterBundleJenisLayanan;

      const matchStatus =
        filterBundleStatus === "ALL"
          ? true
          : filterBundleStatus === "REUPLOAD"
          ? bundleHasReupload(b)
          : b.status === filterBundleStatus;

      return matchSearch && matchJenis && matchStatus;
    });
  }, [
    bundlesList,
    searchBundleQuery,
    filterBundleJenisLayanan,
    filterBundleStatus,
    bundleHasReupload,
  ]);

  // Counts for Bundle Jenis Layanan Pills
  const bundleJenisCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bundlesList.length,
      MUTASI_SEBAGIAN: 0,
      MUTASI_HABIS_UPDATE: 0,
      MUTASI_HABIS_REGULER: 0,
      OBJEK_PAJAK_BARU: 0,
      PEMBETULAN: 0,
      PENGAKTIFAN: 0,
    };
    bundlesList.forEach((b) => {
      const jenis = b.jenisPermohonan || b.applicationType;
      if (jenis && counts[jenis] !== undefined) {
        counts[jenis]++;
      }
    });
    return counts;
  }, [bundlesList]);

  return {
    bundlesList,
    setBundlesList,
    selectedBundle,
    setSelectedBundle,
    allPermohonanList,
    setAllPermohonanList,
    permohonanList,
    setPermohonanList,
    loading,
    setLoading,
    listLoading,
    setListLoading,
    isRefreshing,
    setIsRefreshing,
    error,
    setError,
    success,
    setSuccess,
    searchBundleQuery,
    setSearchBundleQuery,
    isBundleSearchFocused,
    setIsBundleSearchFocused,
    filterBundleJenisLayanan,
    setFilterBundleJenisLayanan,
    filterBundleStatus,
    setFilterBundleStatus,
    currentBundlePage,
    setCurrentBundlePage,
    itemsPerBundlePage,
    setItemsPerBundlePage,
    fetchData,
    fetchBundles,
    fetchBundleDetail,
    handleSelectBundle,
    checkPermohonanNeedsReupload,
    bundleHasReupload,
    filteredBundlesList,
    bundleJenisCounts,
  };
}
