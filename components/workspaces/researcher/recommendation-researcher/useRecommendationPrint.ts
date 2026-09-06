import { useState, useMemo } from 'react';

export interface UseRecommendationPrintProps {
  selectedBundle: any | null;
}

export function useRecommendationPrint({ selectedBundle }: UseRecommendationPrintProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const applications = useMemo(() => {
    return selectedBundle?.applications || [];
  }, [selectedBundle]);

  const totalPages = Math.ceil(applications.length / itemsPerPage) || 1;

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return applications.slice(start, start + itemsPerPage);
  }, [applications, currentPage, itemsPerPage]);

  const handlePrintBundleCover = (bundleId: string) => {
    if (typeof window !== 'undefined') {
      window.open(`/api/pdf/bundle-cover-letter/${bundleId}`, '_blank');
    }
  };

  return {
    applications,
    paginatedApplications,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handlePrintBundleCover,
  };
}
