"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
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

export default function NotificationBell() {
  const { status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    if (status !== 'authenticated') return;
    const res = await getUnreadNotifications();
    if (res.success) setNotifications(res.notifications as Notification[]);
  }, [status]);

  // Subscribe ke event bus agar NotificationSystem bisa trigger re-fetch
  // saat ada notifikasi baru masuk — tidak perlu polling mandiri di sini.
  useEffect(() => {
    notifBus.subscribe(fetchNotifs);
    return () => notifBus.unsubscribe(fetchNotifs);
  }, [fetchNotifs]);

  // Fetch sekali saat mount untuk populate badge count awal.
  // Update selanjutnya ditangani oleh notifBus dari NotificationSystem.
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchNotifs();
  }, [status, fetchNotifs]);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await markAllNotificationsAsRead();
    setNotifications([]);
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
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-amber-50/30 border border-amber-200/40 opacity-60 cursor-not-allowed"
        >
          <Bell className="w-4 h-4 text-amber-500/50 animate-pulse" />
        </button>
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative shrink-0">
      {/* Bell Button */}
      <button
        onClick={() => setPanelOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-amber-50/50 border border-amber-200/60 hover:bg-amber-100/70 hover:border-amber-300/60 hover:shadow-xs hover:shadow-amber-200/30 transition-all duration-300"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <Bell className="w-4 h-4 text-amber-600 fill-amber-550/20" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setPanelOpen(false)} />
          <div
            ref={panelRef}
            className="absolute top-11 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fadeIn"
          >
            {/* Header Panel */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-indigo-50/50 transition-colors group"
                  >
                    <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{notif.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.pesan}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-indigo-100 text-indigo-500"
                      aria-label="Tandai dibaca"
                      title="Tandai dibaca"
                    >
                      <CheckCheck className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
