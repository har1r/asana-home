/**
 * SkeletonBase.tsx
 * Shared primitive components for skeleton/shimmer loading states.
 * All components use Tailwind's animate-pulse — no external dependencies.
 */

import React from 'react';

interface SkeletonBoxProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

/** Generic rectangular shimmer block */
export function SkeletonBox({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
}: SkeletonBoxProps) {
  return (
    <div
      className={`${width} ${height} ${rounded} bg-gray-200 animate-pulse ${className}`}
    />
  );
}

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

/** Circular shimmer (avatars, icons) */
export function SkeletonCircle({ size = 'w-8 h-8', className = '' }: SkeletonCircleProps) {
  return (
    <div className={`${size} rounded-full bg-gray-200 animate-pulse shrink-0 ${className}`} />
  );
}

interface SkeletonTextProps {
  width?: string;
  className?: string;
  height?: string;
}

/** Single line text shimmer */
export function SkeletonText({ width = 'w-1/2', height = 'h-3', className = '' }: SkeletonTextProps) {
  return (
    <div className={`${width} ${height} bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

interface SkeletonAvatarStackProps {
  count?: number;
  size?: string;
}

/** Stacked avatar shimmer (-space-x-1 style) */
export function SkeletonAvatarStack({ count = 3, size = 'w-5 h-5' }: SkeletonAvatarStackProps) {
  return (
    <div className="flex -space-x-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${size} rounded-full bg-gray-300 animate-pulse ring-2 ring-white`} />
      ))}
    </div>
  );
}

interface SkeletonBadgeProps {
  width?: string;
  className?: string;
}

/** Pill/badge shimmer */
export function SkeletonBadge({ width = 'w-16', className = '' }: SkeletonBadgeProps) {
  return (
    <div className={`${width} h-4 bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

interface SkeletonProgressBarProps {
  className?: string;
}

/** Progress bar shimmer */
export function SkeletonProgressBar({ className = '' }: SkeletonProgressBarProps) {
  return (
    <div className={`w-full h-1.5 bg-gray-200 animate-pulse rounded-full ${className}`} />
  );
}

/** Wrapper for a skeleton card (white bg, border, rounded) */
export function SkeletonCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 ${className}`}>
      {children}
    </div>
  );
}
