"use client";

import React from "react";

interface EmptyDataAnimationProps {
  title?: string;
  description?: string;
}

export const EmptyDataAnimation: React.FC<EmptyDataAnimationProps> = React.memo(({
  title = "Belum ada data permohonan",
  description = "Coba ubah kata kunci pencarian atau filter status."
}) => {
  return (
    <div className="flex flex-col items-center justify-center mx-auto font-sans select-none py-6">
      <div className="w-80 h-60 sm:w-[420px] sm:h-[300px] mx-auto flex items-center justify-center overflow-hidden select-none pointer-events-none">
        <iframe
          src="https://lottie.host/embed/3e579b32-f8c2-40f8-854f-d6375c7b361f/PpMBUyHb09.lottie"
          className="w-full h-full border-0 pointer-events-none scale-110"
          title="Empty Data Animation"
        />
      </div>
      {title && (
        <p className="text-[13px] font-normal text-slate-800 mt-1 font-sans capitalize">
          {title}
        </p>
      )}
      {description && (
        <p className="text-[12px] text-slate-500 font-normal max-w-sm mx-auto mt-1 font-sans text-center">
          {description}
        </p>
      )}
    </div>
  );
});

EmptyDataAnimation.displayName = "EmptyDataAnimation";
