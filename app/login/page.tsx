"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2, FileText, Building2, X, Search, Activity, Shield, Users } from 'lucide-react';

const PRESET_ACCOUNTS = [
  {
    role: 'Penginput',
    email: 'penginput@architax.com',
    color: 'bg-emerald-50 text-[#008f78] border-emerald-200 hover:bg-emerald-100',
    badge: 'Fase 1',
    description: 'Penerimaan Data'
  },
  {
    role: 'Peneliti',
    email: 'peneliti@architax.com',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    badge: 'Fase 2',
    description: 'Verifikasi Berkas'
  },
  {
    role: 'Pengarsip',
    email: 'pengarsip@architax.com',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    badge: 'Fase 3',
    description: 'Digitalisasi PDF'
  },
  {
    role: 'Pengirim',
    email: 'pengirim@architax.com',
    color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    badge: 'Fase 4',
    description: 'Manifest Kirim'
  },
  {
    role: 'Pemantau',
    email: 'pemantau@architax.com',
    color: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
    badge: 'Fase 5',
    description: 'Pemantauan Status'
  },
  {
    role: 'Supervisor',
    email: 'supervisor@architax.com',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    badge: 'Lintas',
    description: 'Supervisori & Approval'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false
      });

      if (res?.error) {
        setError(res.error || 'Email atau password salah');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setLoading(true);
    setError('');
    setEmail(presetEmail);
    setPassword('password123');

    try {
      const res = await signIn('credentials', {
        email: presetEmail,
        password: 'password123',
        redirect: false
      });

      if (res?.error) {
        setError(res.error || 'Gagal masuk secara otomatis');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between antialiased select-none relative">
      
      {/* ========================================== */}
      {/* 1. TOP NAVBAR HEADER                       */}
      {/* ========================================== */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between shadow-3xs z-20 sticky top-0">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 transition-all duration-300 hover:scale-105">
            <svg viewBox="34 34 132 132" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g transform="translate(100,100) rotate(-8)">
                {/* Top-left */}
                <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6"/>
                {/* Top-right */}
                <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4"/>
                {/* Bottom-left */}
                <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355"/>
                {/* Bottom-right */}
                <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC"/>
              </g>
              {/* Center connector dot */}
              <circle cx="100" cy="100" r="6" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none font-sans">
              SIPETRA <span className="text-[#00a389] font-normal text-xs ml-1">Architax</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 font-sans mt-0.5">
              Badan Pendapatan Daerah Kabupaten Tangerang
            </span>
          </div>
        </div>

        {/* Center Navbar Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-normal text-slate-600 font-sans">
          <span className="text-[#00a389] font-semibold cursor-pointer">Beranda</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Layanan PBB</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Petunjuk Teknis</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Regulasi</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Bantuan</span>
        </nav>

        {/* Right Actions Button (Triggers Login Modal) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-md bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5 font-sans"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Portal</span>
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. LANDING PAGE HERO CONTENT               */}
      {/* ========================================== */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-12 py-12 sm:py-16 flex flex-col gap-12 flex-1">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 font-sans">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#008f78] text-[11px] font-bold w-fit font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Pengelolaan Pajak Daerah Terintegrasi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-sans">
              Cari Data & Pelayanan PBB <br />
              <span className="text-[#00a389]">Mudah, Cepat, dan Akurat</span>
            </h1>

            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-xl font-sans">
              Informasi data dan pelayanan resmi berkas PBB-P2 dari Badan Pendapatan Daerah Kabupaten Tangerang. Terintegrasi langsung dalam 5 fase pengarsipan digital.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-md bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 font-sans"
              >
                <span>Masuk ke Akun (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-3 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer font-sans shadow-3xs"
              >
                <span>Simulasi Quick Login</span>
              </button>
            </div>
          </div>

          {/* Right Hero Card Graphic */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-md p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00a389]" />
                <span className="text-xs font-bold text-slate-800">Statistik Real-time Sistem</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aktif 2026
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">75+</span>
                <span className="text-[11px] text-slate-500 font-medium capitalize">Total Pemohon</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">6</span>
                <span className="text-[11px] text-slate-500 font-medium capitalize">Jenis Layanan</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-[#00a389] font-mono">100%</span>
                <span className="text-[11px] text-slate-500 font-medium capitalize">Digitalisasi</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">5</span>
                <span className="text-[11px] text-slate-500 font-medium capitalize">Role Petugas</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-[11px] text-[#007361] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00a389] shrink-0" />
              <span>Semua data terverifikasi dan siap diakses secara real-time.</span>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/80">
          <div className="p-5 bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col gap-2">
            <FileText className="w-5 h-5 text-[#00a389]" />
            <h3 className="text-xs font-bold text-slate-900 capitalize">Verifikasi Berkas Presisi</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Penelitian berkas PBB dilakukan secara sistematis per bundle untuk meminimalisir kesalahan data.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col gap-2">
            <Shield className="w-5 h-5 text-[#00a389]" />
            <h3 className="text-xs font-bold text-slate-900 capitalize">Digitalisasi Scan PDF</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Setiap berkas diunggah secara aman dan diarsipkan langsung ke server cloud Bapenda.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col gap-2">
            <Users className="w-5 h-5 text-[#00a389]" />
            <h3 className="text-xs font-bold text-slate-900 capitalize">Tracking Manifest & Logistik</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Pemantauan pengiriman berkas antar fase pelayanan dapat dilacak secara real-time.
            </p>
          </div>
        </div>

      </main>

      {/* ========================================== */}
      {/* 3. LOGIN MODAL POP-UP (Form & Quick Login) */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          {/* Modal Container */}
          <div className="bg-white border border-slate-200/90 rounded-md max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 font-sans relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Tutup Modal Login"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 pr-8">
              <div className="w-8 h-8 shrink-0">
                <svg viewBox="34 34 132 132" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <g transform="translate(100,100) rotate(-8)">
                    <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6"/>
                    <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4"/>
                    <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355"/>
                    <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC"/>
                  </g>
                  <circle cx="100" cy="100" r="6" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">
                  Masuk ke Akun SIPETRA
                </h2>
                <p className="text-[11px] text-slate-500 font-normal font-sans">
                  Masukkan email & password atau pilih simulasi Quick Login di bawah.
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-md px-3.5 py-2.5 flex items-start gap-2 animate-fadeIn font-sans">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Login */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 font-sans">Email Karyawan</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="nama@architax.com"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 font-sans">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Masukkan password Anda"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-md text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 bg-[#00a389] hover:bg-[#008f78] active:scale-98 text-white text-[13px] font-bold rounded-md transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Masuk Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Presets Section */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-800 font-sans">Quick Login (Simulasi Peran)</span>
                <span className="text-[10px] font-semibold text-[#008f78] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans">
                  1-Klik Otomatis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-sans">
                {PRESET_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={loading}
                    className={`p-2 px-2.5 rounded-md border text-left flex flex-col gap-0.5 transition-all cursor-pointer shadow-3xs ${acc.color}`}
                    title={`Masuk sebagai ${acc.role}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold truncate">{acc.role}</span>
                      <span className="text-[8px] font-extrabold uppercase">{acc.badge}</span>
                    </div>
                    <span className="text-[9px] opacity-80 font-normal truncate">{acc.description}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. FOOTER                                  */}
      {/* ========================================== */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-6 sm:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-normal font-sans z-10 select-none">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#00a389]" />
          <span>Badan Pendapatan Daerah Kabupaten Tangerang © 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
          <span>SIPETRA Architax Module</span>
          <span>•</span>
          <span>PRD v2.9 Final Spec</span>
        </div>
      </footer>

    </div>
  );
}
