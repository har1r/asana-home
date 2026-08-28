"use client";

import React from "react";

interface EmptyDataAnimationProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  height?: string;
}

export const EmptyDataAnimation: React.FC<EmptyDataAnimationProps> = React.memo(({
  title = "Belum ada data permohonan",
  description = "Coba ubah kata kunci pencarian atau filter status.",
  action,
  children,
  className = "",
  height = "h-48 sm:h-56"
}) => {
  return (
    <div className={`flex flex-col items-center justify-center mx-auto font-sans select-none py-6 ${className}`}>
      <div className={`w-full max-w-[320px] sm:max-w-[380px] ${height} mx-auto flex items-center justify-center overflow-hidden select-none pointer-events-none`}>
        <iframe
          src="https://lottie.host/embed/3e579b32-f8c2-40f8-854f-d6375c7b361f/PpMBUyHb09.lottie"
          className="w-full h-full border-0 pointer-events-none scale-110"
          title="Empty Data Animation"
        />
      </div>
      {title && (
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mt-1 font-sans text-center">
          {title}
        </h3>
      )}
      {description && (
        <div className="text-xs text-slate-500 font-normal max-w-sm mx-auto mt-1 font-sans text-center leading-relaxed">
          {description}
        </div>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
      {children}
    </div>
  );
});

EmptyDataAnimation.displayName = "EmptyDataAnimation";
