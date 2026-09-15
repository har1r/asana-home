/**
 * lib/archiveHelpers.ts
 *
 * Utility functions for evaluating target data archiving completeness
 * and application status within bundles. Shared across server actions and UI components.
 */

export interface DigitalArchiveItem {
  idArchive: string;
  urlBlob: string;
  fileName?: string | null;
  status: "ACTIVE" | "SUPERSEDED" | string;
  uploadedBy?: string | null;
  createdAt: Date | string;
  revisionNote?: string | null;
  supersededBy?: string | null;
  supersededAt?: Date | string | null;
  versi?: number;
  dataBaruId?: string | null;
}

export interface TargetDataItem {
  idTargetData?: string;
  id?: string;
  ownerName: string;
  buildingArea?: number | null;
  isVerified?: boolean;
  isArchived?: boolean;
  digitalArchives?: DigitalArchiveItem[];
}

export interface ApplicationStatusItem {
  id: string;
  status: string;
  targetData?: TargetDataItem[];
}

/**
 * Checks if every target data item in an application is marked as archived.
 * Returns true if targetData is non-empty and EVERY item has isArchived === true.
 */
export function checkAllTargetDataArchived(targetData?: TargetDataItem[] | null): boolean {
  if (!targetData || targetData.length === 0) {
    return false;
  }
  return targetData.every((item) => item.isArchived === true);
}

/**
 * Checks if every application in a list has status === "ARCHIVED".
 * Returns true if applications is non-empty and EVERY item has status === "ARCHIVED".
 */
export function checkAllApplicationsArchived(applications?: ApplicationStatusItem[] | null): boolean {
  if (!applications || applications.length === 0) {
    return false;
  }
  return applications.every((app) => app.status === "ARCHIVED");
}
