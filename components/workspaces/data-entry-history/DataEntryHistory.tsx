"use client";

import React from 'react';
import { History, Sparkles } from 'lucide-react';

export default function DataEntryHistory() {
  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn font-sans">
      {/* HEADER SECTION */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <History className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Pengajuan</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full">
                Data Entry
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Daftar arsip dan histori permohonan yang telah diproses atau diselesaikan.
            </p>
          </div>
        </div>
      </div>

      {/* PLACEHOLDER EMPTY STATE CONTAINER */}
      <div className="p-12 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col items-center justify-center text-center min-h-[380px]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mb-4 shadow-3xs">
          <History className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Halaman Riwayat Pengajuan Siap
        </h3>
        <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6 font-normal">
          Menu navigasi riwayat pengajuan telah berhasil ditambahkan. Halaman ini siap untuk diintegrasikan dengan fitur tabel riwayat berkas dan filter status.
        </p>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-600 text-xs font-normal">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Status: Menu Navigasi Aktif</span>
        </div>
      </div>
    </div>
  );
}
