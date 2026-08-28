"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, X, AlertTriangle, Info } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  judul: string;
  pesan: string;
  isRead: boolean;
  createdAt: Date;
}

// Singleton event bus sederhana agar NotificationSystem bisa trigger re-fetch
export const notifBus = {
  listeners: [] as Array<() => void>,
  subscribe(fn: () => void) { this.listeners.push(fn); },
  unsubscribe(fn: () => void) { this.listeners = this.listeners.filter(l => l !== fn); },
  emit() { this.listeners.forEach(fn => fn()); }
};

const playNotifSound = () => {
  try {
    const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.75, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
    };

    const now = audioContext.currentTime;
    playTone(659.25, now, 0.12);
    playTone(830.61, now + 0.1, 0.22);
  } catch (err) {
    // Ignore audio play errors if user hasn't interacted
  }
};

export default function NotificationBell() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [cachedUnreadCount, setCachedUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('architax_recent_notifications');
      if (cached) {
        try {
          setNotifications(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
      const cachedCountStr = localStorage.getItem('architax_unread_notif_count');
      if (cachedCountStr) {
        setCachedUnreadCount(parseInt(cachedCountStr, 10));
      }
    }
  }, []);

  const fetchNotifs = useCallback(async () => {
    if (status !== 'authenticated') return;
    const res = await getUnreadNotifications();
    if (res.success) {
      const newNotifs = res.notifications as Notification[];

      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('architax_recent_notifications', JSON.stringify(newNotifs));
        localStorage.setItem('architax_unread_notif_count', String(newNotifs.length));
      }
      setCachedUnreadCount(newNotifs.length);

      setNotifications(prev => {
        if (!isFirstLoad.current && newNotifs.length > prev.length) {
          setIsShaking(true);
          playNotifSound();
          setTimeout(() => setIsShaking(false), 600);
        }
        isFirstLoad.current = false;
        return newNotifs;
      });
    }
  }, [status]);

  useEffect(() => {
    notifBus.subscribe(fetchNotifs);
    return () => notifBus.unsubscribe(fetchNotifs);
  }, [fetchNotifs]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchNotifs();
  }, [status, fetchNotifs]);

  const handleTogglePanel = () => {
    if (!panelOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setPanelOpen(v => !v);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_recent_notifications', JSON.stringify(updated));
      localStorage.setItem('architax_unread_notif_count', String(updated.length));
    }
    setCachedUnreadCount(updated.length);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await markAllNotificationsAsRead();
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_recent_notifications', JSON.stringify([]));
      localStorage.setItem('architax_unread_notif_count', '0');
    }
    setCachedUnreadCount(0);
    setMarkingAll(false);
    setPanelOpen(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading') {
    return (
      <div className="relative shrink-0">
        <button
          disabled
          className="w-10 h-10 rounded-lg text-slate-400 opacity-70 cursor-not-allowed animate-pulse flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative shrink-0">
      {/* Bell Button (40px Height, Borderless) */}
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className={`w-10 h-10 rounded-lg hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center relative ${isShaking ? 'animate-bellShake' : ''}`}
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <Bell className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel - Mounted directly to document.body via Portal for ABSOLUTE HIGHEST LAYER z-[99999] */}
      {mounted && panelOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] animate-fadeIn select-none">
          {/* Clickable Backdrop */}
          <div className="fixed inset-0" onClick={() => setPanelOpen(false)} />
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: `${panelPos.top}px`,
              left: `${panelPos.left}px`,
            }}
            className="w-80 bg-white rounded-md shadow-2xl border border-slate-200/90 z-[100000] overflow-hidden animate-scaleUp"
          >
            {/* Header Panel */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="text-[11px] text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 font-sans">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 font-medium">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRevision = 
                    notif.judul?.toLowerCase().includes('revisi') || 
                    notif.pesan?.toLowerCase().includes('revisi') || 
                    notif.pesan?.toLowerCase().includes('dikembalikan');

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors flex items-start justify-between gap-3 group select-none ${
                        isRevision 
                          ? 'bg-rose-50/70 border-l-4 border-l-rose-500 hover:bg-rose-50' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Icon Indicator (Left) */}
                      <div className={`p-2 rounded-md shrink-0 mt-0.5 ${
                        isRevision 
                          ? 'bg-rose-100 text-rose-600 border border-rose-200/80' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}>
                        {isRevision ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-xs font-bold truncate ${
                            isRevision ? 'text-rose-950' : 'text-slate-800'
                          }`}>
                            {notif.judul}
                          </span>
                          {isRevision && (
                            <span className="px-1.5 py-0.25 bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-bold rounded-md shrink-0 font-mono">
                              Revisi
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] font-medium leading-normal line-clamp-2 ${
                          isRevision ? 'text-rose-900/80' : 'text-slate-600'
                        }`}>
                          {notif.pesan}
                        </p>
                        <span className={`text-[10px] font-semibold mt-1 ${
                          isRevision ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Mark Read Action Button */}
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className={`p-1.5 transition-colors shrink-0 rounded-md cursor-pointer ${
                          isRevision
                            ? 'text-rose-300 hover:text-rose-600 hover:bg-rose-100'
                            : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Tandai sudah dibaca"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes notifBellShake {
          0%, 100% { transform: rotate(0deg); }
          15%, 45%, 75% { transform: rotate(-12deg); }
          30%, 60%, 90% { transform: rotate(12deg); }
        }
        .animate-bellShake {
          animation: notifBellShake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
