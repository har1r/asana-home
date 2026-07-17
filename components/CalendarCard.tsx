"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Calendar as CalendarIcon,
  Sparkles,
  Info
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface CalendarNote {
  id: string;
  text: string;
  category: 'kerja' | 'pribadi' | 'penting' | 'lainnya';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CATEGORIES = [
  { value: 'kerja', label: 'Kerja', color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-150', dot: 'bg-indigo-500' },
  { value: 'pribadi', label: 'Pribadi', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-150', dot: 'bg-emerald-500' },
  { value: 'penting', label: 'Penting', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-150', dot: 'bg-rose-500' },
  { value: 'lainnya', label: 'Lainnya', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-150', dot: 'bg-amber-500' },
];

export default function CalendarCard() {
  const { showConfirm } = useDashboard();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Format: "YYYY-MM-DD"
  const getFormattedDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayStr = getFormattedDateString(today.getFullYear(), today.getMonth(), today.getDate());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<Record<string, CalendarNote[]>>({});

  // Form state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'kerja' | 'pribadi' | 'penting' | 'lainnya'>('kerja');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState<'kerja' | 'pribadi' | 'penting' | 'lainnya'>('kerja');

  // Load notes from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('architax_calendar_notes');
      if (savedNotes) {
        try {
          const parsed = JSON.parse(savedNotes);
          if (typeof parsed === 'object' && parsed !== null) {
            // Migrate old string[] array format to new CalendarNote[] format
            const migrated: Record<string, CalendarNote[]> = {};
            Object.keys(parsed).forEach((dateKey) => {
              const items = parsed[dateKey];
              if (Array.isArray(items)) {
                migrated[dateKey] = items.map((item, index) => {
                  if (typeof item === 'string') {
                    return {
                      id: `migrated-${dateKey}-${index}-${Date.now()}`,
                      text: item,
                      category: 'lainnya'
                    };
                  }
                  // Standard note object
                  if (item && typeof item === 'object') {
                    return {
                      id: item.id || `note-${dateKey}-${index}-${Date.now()}`,
                      text: item.text || '',
                      category: item.category || 'lainnya'
                    };
                  }
                  return {
                    id: `migrated-${dateKey}-${index}-${Date.now()}`,
                    text: String(item),
                    category: 'lainnya'
                  };
                });
              }
            });
            setNotes(migrated);
          }
        } catch (e) {
          console.error('Failed to parse calendar notes', e);
        }
      }
    }
  }, []);

  // Save notes helper
  const saveNotes = (updatedNotes: Record<string, CalendarNote[]>) => {
    setNotes(updatedNotes);
    localStorage.setItem('architax_calendar_notes', JSON.stringify(updatedNotes));
  };

  // Helper date functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const handleJumpToToday = useCallback(() => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  }, [todayStr]);

  const handleAddNote = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: CalendarNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newNoteText.trim(),
      category: newNoteCategory
    };

    const dateNotes = notes[selectedDate] || [];
    const updatedNotes = {
      ...notes,
      [selectedDate]: [...dateNotes, newNote]
    };
    saveNotes(updatedNotes);
    setNewNoteText('');
    setNewNoteCategory('kerja');
    setIsAddingNote(false);
  }, [newNoteText, newNoteCategory, notes, selectedDate]);

  const startEditNote = useCallback((note: CalendarNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setEditingCategory(note.category);
  }, []);

  const handleSaveEdit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText.trim() || !editingNoteId) return;

    const dateNotes = notes[selectedDate] || [];
    const updated = dateNotes.map(note => {
      if (note.id === editingNoteId) {
        return {
          ...note,
          text: editingText.trim(),
          category: editingCategory
        };
      }
      return note;
    });

    const updatedNotes = {
      ...notes,
      [selectedDate]: updated
    };
    saveNotes(updatedNotes);
    setEditingNoteId(null);
  }, [editingText, editingNoteId, notes, selectedDate, editingCategory]);

  const handleCancelEdit = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  const handleDeleteNote = useCallback((noteId: string) => {
    const dateNotes = notes[selectedDate] || [];
    const filtered = dateNotes.filter(note => note.id !== noteId);

    const updatedNotes = { ...notes };
    if (filtered.length === 0) {
      delete updatedNotes[selectedDate];
    } else {
      updatedNotes[selectedDate] = filtered;
    }
    saveNotes(updatedNotes);
  }, [notes, selectedDate]);

  const handleClearAllNotes = useCallback(() => {
    showConfirm({
      title: "Hapus Semua Catatan",
      message: "Apakah Anda yakin ingin menghapus semua catatan pada tanggal ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      onConfirm: () => {
        const updatedNotes = { ...notes };
        delete updatedNotes[selectedDate];
        saveNotes(updatedNotes);
      }
    });
  }, [showConfirm, notes, selectedDate]);

  // Processing calendar grid cells (42 cells to complete the 6-row grid)
  const getGridCells = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

    const cells = [];

    // 1. Previous month trailing days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr: getFormattedDateString(prevYear, prevMonth, daysInPrevMonth - i)
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateStr: getFormattedDateString(currentYear, currentMonth, d)
      });
    }

    // 3. Next month leading days
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    let nextMonthDay = 1;
    while (cells.length < 42) {
      cells.push({
        day: nextMonthDay,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr: getFormattedDateString(nextYear, nextMonth, nextMonthDay)
      });
      nextMonthDay++;
    }

    return cells;
  };

  const handleDayClick = useCallback((cell: { day: number; month: number; year: number; dateStr: string; isCurrentMonth: boolean }) => {
    setSelectedDate(cell.dateStr);
    if (!cell.isCurrentMonth) {
      setCurrentMonth(cell.month);
      setCurrentYear(cell.year);
    }
  }, []);

  // Helper to determine the dot color based on the highest priority category
  const getDayDotClass = useCallback((dateStr: string) => {
    const dayNotes = notes[dateStr];
    if (!dayNotes || dayNotes.length === 0) return null;

    if (dayNotes.some(n => n.category === 'penting')) return 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)] animate-pulse';
    if (dayNotes.some(n => n.category === 'kerja')) return 'bg-indigo-500';
    if (dayNotes.some(n => n.category === 'pribadi')) return 'bg-emerald-500';
    return 'bg-amber-500';
  }, [notes]);

  // Memoized calendar grid cells — 42 cells, only recomputes on month/year change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gridCells = useMemo(() => getGridCells(), [currentYear, currentMonth]);

  // Selected date visual representation
  const selectedDateObject = useMemo(() => new Date(selectedDate), [selectedDate]);
  const selectedDateLabel = useMemo(() => selectedDateObject.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }), [selectedDateObject]);

  const activeDayNotes = useMemo(() => notes[selectedDate] || [], [notes, selectedDate]);
  const filteredNotes = useMemo(() => activeDayNotes.filter(note =>
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  ), [activeDayNotes, searchQuery]);

  return (
    <div id="calendar-agenda-card" className="w-full flex flex-col font-sans select-none animate-fadeIn">
      {/* 1. Header bar with rich styling matching other cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Kalender Kerja</h2>
          </div>
        </div>

        {/* Navigation month/year */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Today Button */}
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-205 transition-all cursor-pointer shadow-3xs"
            title="Lompat ke hari ini"
          >
            Hari Ini
          </button>

          <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-slate-200/80 shadow-3xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 rounded-md text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <span className="text-[11px] font-extrabold text-gray-700 px-2 min-w-[105px] text-center font-display">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-50 rounded-md text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Flex wrap/grid layout for layout split on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

        {/* Left column: Calendar Grid (Col span 6) */}
        <div className="md:col-span-6 flex flex-col gap-2 flex-1">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAY_NAMES.map((day) => (
              <span key={day} className="text-[10px] font-extrabold text-gray-400 py-1 capitalize tracking-wider font-display">
                {day}
              </span>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1.5">
            {gridCells.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateStr;
              const isToday = todayStr === cell.dateStr;
              const dotClass = getDayDotClass(cell.dateStr);

              return (
                <button
                  key={`day-${idx}`}
                  onClick={() => handleDayClick(cell)}
                  className={`rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer text-[11px] font-bold ${isSelected
                    ? 'bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] shadow-sm shadow-[#9cb4fe]/40 scale-105 z-10 font-extrabold'
                    : isToday
                      ? 'bg-indigo-50 border border-indigo-250 text-indigo-700 hover:bg-indigo-100/50 hover:scale-[1.03]'
                      : cell.isCurrentMonth
                        ? 'bg-white hover:bg-slate-50 border border-slate-200/60 text-gray-700 hover:scale-[1.03] shadow-3xs'
                        : 'bg-white/40 hover:bg-white/60 border border-slate-200/20 text-slate-350 hover:scale-[1.03]'
                    }`}
                >
                  <span className={!cell.isCurrentMonth && !isSelected ? 'opacity-50' : ''}>
                    {cell.day}
                  </span>

                  {/* Indikator titik untuk event/catatan */}
                  {dotClass && (
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 transition-all ${isSelected ? 'bg-[#1e2022]' : dotClass
                      }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Event Logger (Col span 6) */}
        <div className="md:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-4.5 flex flex-col gap-4 shadow-3xs">
          <div className="border-b border-slate-200/60 pb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider select-none font-display">
                Agenda & Catatan
              </span>
              <h3 className="text-xs font-bold text-gray-800 mt-0.5 truncate">{selectedDateLabel}</h3>
            </div>

            {activeDayNotes.length > 0 && (
              <button
                onClick={handleClearAllNotes}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 transition-colors"
                title="Hapus semua catatan untuk tanggal ini"
              >
                <Trash2 className="w-3 h-3" />
                Hapus Semua
              </button>
            )}
          </div>

          {/* Search box (only shows when there are notes) */}
          {activeDayNotes.length > 1 && (
            <div className="relative animate-fadeIn">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan hari ini..."
                className="w-full text-[10px] pl-7.5 pr-6 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-655 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* List of events — fixed height scrollable */}
          <div className="h-[220px] overflow-y-auto pr-0.5 flex flex-col gap-2 scrollbar-thin">
            {filteredNotes.length === 0 && !isAddingNote ? (
              /* Empty state: centered Add button */
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600">
                    {searchQuery ? 'Catatan tidak ditemukan' : 'Belum Ada Catatan'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] mx-auto leading-relaxed">
                    {searchQuery ? 'Coba kata kunci lain.' : 'Tambahkan agenda atau catatan untuk hari ini.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Catatan
                  </button>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const catConfig = CATEGORIES.find(c => c.value === note.category) || CATEGORIES[3];

                return (
                  <div
                    key={note.id}
                    className={`border rounded-xl p-3 flex flex-col gap-2 shadow-2xs group hover:shadow-xs transition-all duration-200 animate-fadeIn ${catConfig.bg}`}
                  >
                    {editingNoteId === note.id ? (
                      /* Inline editing form */
                      <form onSubmit={handleSaveEdit} className="w-full flex flex-col gap-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-lg text-gray-800 resize-none"
                          rows={2}
                          maxLength={100}
                          required
                          autoFocus
                        />

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          {/* Edit Category select */}
                          <div className="flex flex-wrap gap-1">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => setEditingCategory(cat.value as any)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${editingCategory === cat.value
                                  ? `${cat.bg} border-current ${cat.text} scale-105`
                                  : 'bg-white border-slate-200 text-slate-405 hover:text-slate-650'
                                  }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-end gap-1.5 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-slate-500 bg-white border border-slate-250 rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-2.5 py-1 bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-bold rounded-md cursor-pointer hover:opacity-90 active:scale-98 transition-all shadow-2xs"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* Standard view item */
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex gap-2 items-start min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${catConfig.color}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed break-words select-text">
                              {note.text}
                            </p>
                            <span className={`inline-block text-[9px] font-bold capitalize tracking-wider mt-1 px-1.5 py-0.5 rounded ${catConfig.text} bg-white/70 border border-slate-200/40`}>
                              {catConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0 opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditNote(note)}
                            className="text-gray-400 hover:text-indigo-650 transition-colors p-1 rounded hover:bg-white border border-transparent hover:border-slate-200/50 cursor-pointer"
                            title="Edit catatan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-400 hover:text-rose-655 transition-colors p-1 rounded hover:bg-white border border-transparent hover:border-slate-200/50 cursor-pointer"
                            title="Hapus catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          {isAddingNote && (
            <form onSubmit={handleAddNote} className="flex flex-col gap-2 border-t border-slate-200/60 pt-3 animate-fadeIn">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Tulis agenda penting hari ini..."
                rows={2}
                maxLength={100}
                required
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 hover:border-slate-350 focus:outline-none focus:border-indigo-500 rounded-xl transition-all text-gray-800 resize-none placeholder:text-gray-400 placeholder:font-normal"
              />

              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gray-400 font-extrabold capitalize tracking-wider">Kategori:</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewNoteCategory(cat.value as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${newNoteCategory === cat.value
                        ? `${cat.bg} border-current ${cat.text} scale-105 shadow-2xs`
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 text-[10px] font-bold mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNoteText('');
                    setNewNoteCategory('kerja');
                  }}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-750 bg-white border border-slate-250 rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gradient-to-br from-[#7dd4fc] via-[#9cb4fe] to-[#cab3fe] text-[#1e2022] font-bold rounded-lg cursor-pointer hover:opacity-90 active:scale-98 transition-all shadow-2xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          )}

          {/* Bottom Add button — only shown when notes already exist */}
          {!isAddingNote && filteredNotes.length > 0 && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full py-2 bg-indigo-50/70 hover:bg-indigo-100/50 border border-indigo-200/50 text-indigo-700 text-xs font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah catatan baru</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
