"use client";

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ActionStatusModalProps {
  isOpen: boolean;
  status: 'loading' | 'success' | 'error' | 'idle';
  title?: string;
  message?: string;
  onClose: () => void;
  confirmText?: string;
}

export const ActionStatusModal: React.FC<ActionStatusModalProps> = ({
  isOpen,
  status,
  title,
  message,
  onClose,
  confirmText = 'Tutup'
}) => {
  if (!isOpen || status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn select-none">
      {/* Backdrop overlay clicks blocked during loading */}
      <div 
        className="fixed inset-0" 
        onClick={() => {
          if (status !== 'loading') onClose();
        }} 
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100/80 flex flex-col items-center text-center gap-4 z-10 transform transition-all animate-scaleUp">
        {/* Status Graphic/Icon */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full">
          {status === 'loading' && (
            <div className="relative w-16 h-16">
              {/* Outer spinning ring with gradient */}
              <div className="absolute inset-0 w-full h-full rounded-full border-[3px] border-slate-100/60" />
              <div className="absolute inset-0 w-full h-full rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-violet-500 animate-spin" />
              
              {/* Animated Architax Logo inside the spinning ring */}
              <div className="absolute inset-1.5 bg-white rounded-full flex items-center justify-center shadow-3xs overflow-hidden">
                <svg viewBox="34 34 132 132" className="w-9 h-9">
                  <style>{`
                    @keyframes logoOrbit {
                      0% { transform: rotate(-8deg); }
                      100% { transform: rotate(352deg); }
                    }
                    @keyframes tilePulse {
                      0%, 100% { transform: scale(1); opacity: 1; }
                      50% { transform: scale(0.76); opacity: 0.45; }
                    }
                    .orbit-logo-group {
                      animation: logoOrbit 10s linear infinite;
                      transform-origin: 0 0;
                    }
                    .tile-pulse {
                      transform-box: fill-box;
                      transform-origin: center;
                      animation: tilePulse 2s ease-in-out infinite;
                    }
                    .tile-tl { animation-delay: 0s; }
                    .tile-tr { animation-delay: 0.35s; }
                    .tile-br { animation-delay: 0.7s; }
                    .tile-bl { animation-delay: 1.05s; }
                  `}</style>
                  <g transform="translate(100,100)">
                    <g className="orbit-logo-group">
                      {/* Top-left */}
                      <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6" className="tile-pulse tile-tl" />
                      {/* Top-right */}
                      <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4" className="tile-pulse tile-tr" />
                      {/* Bottom-left */}
                      <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355" className="tile-pulse tile-bl" />
                      {/* Bottom-right */}
                      <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC" className="tile-pulse tile-br" />
                    </g>
                  </g>
                  {/* Center connector dot */}
                  <circle cx="100" cy="100" r="6" fill="white" />
                </svg>
              </div>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 scale-in-center animate-scaleUp">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 scale-in-center animate-scaleUp">
              <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-1.5 mt-2">
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight capitalize">
            {title || (status === 'loading' ? 'Memproses Data...' : status === 'success' ? 'Berhasil' : 'Gagal')}
          </h4>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[280px]">
            {message}
          </p>
        </div>

        {/* Action Button */}
        {status !== 'loading' && (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2.5 bg-gradient-to-r from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] hover:brightness-[1.03] active:scale-95 text-[#2c333f] font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {confirmText}
          </button>
        )}
      </div>
    </div>
  );
};
