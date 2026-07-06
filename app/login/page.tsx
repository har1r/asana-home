"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

const PRESET_ACCOUNTS = [
  {
    role: 'Penginput',
    email: 'penginput@architax.com',
    color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400/30 text-white',
    badge: 'Fase 1',
    description: 'Penerimaan Data'
  },
  {
    role: 'Peneliti',
    email: 'peneliti@architax.com',
    color: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400/30 text-white',
    badge: 'Fase 2',
    description: 'Verifikasi & Pengelompokan'
  },
  {
    role: 'Pengarsip',
    email: 'pengarsip@architax.com',
    color: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400/30 text-white',
    badge: 'Fase 3',
    description: 'Digitalisasi (Scan PDF)'
  },
  {
    role: 'Pengirim',
    email: 'pengirim@architax.com',
    color: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400/30 text-white',
    badge: 'Fase 4',
    description: 'Logistik & Manifest'
  },
  {
    role: 'Pemantau',
    email: 'pemantau@architax.com',
    color: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400/30 text-white',
    badge: 'Fase 5',
    description: 'Pemantauan Status'
  },
  {
    role: 'Supervisor',
    email: 'supervisor@architax.com',
    color: 'bg-fuchsia-500 hover:bg-fuchsia-600 focus:ring-fuchsia-400/30 text-white',
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
    <div className="flex bg-gradient-to-tr from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] min-h-screen text-gray-800 font-sans items-center justify-center p-4 relative overflow-hidden select-none antialiased">
      {/* Dynamic Background Blurs */}
      <div className="absolute w-[40rem] h-[40rem] rounded-full bg-white/20 blur-3xl -top-40 -left-40 animate-pulse duration-10000 pointer-events-none" />
      <div className="absolute w-[35rem] h-[35rem] rounded-full bg-[#f06e5b]/10 blur-3xl -bottom-40 -right-40 animate-pulse duration-[12000ms] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-stretch">
        
        {/* Glassmorphic Login Card */}
        <main className="lg:col-span-6 bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between transition-all duration-300">
          <div>
            {/* Logo Section */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f06e5b] inline-block shadow-sm animate-ping" />
                <div className="flex flex-col gap-0.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#f06e5b] inline-block shadow-sm" />
                  <span className="w-2 h-2 rounded-full bg-[#f06e5b] inline-block shadow-sm" />
                </div>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#1e2022] font-display">Architax</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">Selamat Datang Kembali</h2>
            <p className="text-xs text-gray-600 font-semibold mb-6">Silakan masukkan kredensial Sipetra Anda untuk mengakses sistem pengarsipan.</p>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-6 bg-red-50/80 border border-red-200 text-red-700 text-xs font-bold rounded-2xl px-4 py-3.5 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 capitalize tracking-widest pl-1">Email Karyawan</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="nama@architax.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs font-bold bg-white/70 border border-slate-200/80 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-3.5 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-700 capitalize tracking-widest pl-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs font-bold bg-white/70 border border-slate-200/80 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-3.5 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-[#1e2022] hover:bg-[#2e3135] active:scale-98 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4.5 h-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <span className="text-[10px] font-bold text-gray-500 capitalize tracking-wider">
              Sistem Pengelolaan Permohonan PBB Sipetra © 2026
            </span>
          </div>
        </main>

        {/* Quick Demo Accounts Grid */}
        <section className="lg:col-span-6 bg-white/30 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <h3 className="text-md font-bold text-gray-900 tracking-tight capitalize">Quick Login (Akun Uji Coba)</h3>
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-6">Pilih salah satu peran di bawah ini untuk mensimulasikan login secara otomatis tanpa mengetik kata sandi.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_ACCOUNTS.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={loading}
                  className="flex flex-col text-left p-4 bg-white/50 hover:bg-white/80 active:scale-95 border border-white/40 hover:border-white rounded-2xl shadow-sm transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-xs font-bold text-gray-800 group-hover:text-indigo-800 transition-colors">{acc.role}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize tracking-wider ${acc.color}`}>
                      {acc.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full mb-0.5">{acc.email}</span>
                  <span className="text-[9px] text-gray-400 font-semibold italic">{acc.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#eef2f6]/60 border border-[#e2e8f0]/40 rounded-2xl space-y-1.5 select-none">
            <h4 className="text-[10px] font-bold text-indigo-700 capitalize tracking-widest">Catatan Uji Coba:</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Semua preset akun menggunakan kata sandi default <strong>password123</strong>. Peran ini sesuai dengan skema Prisma UserRole di PRD v2.9.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
