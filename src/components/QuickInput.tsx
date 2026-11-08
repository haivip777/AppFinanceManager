import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, Zap, CalendarClock } from 'lucide-react';
import { parseFinancialText, formatVND } from '../utils/parser';
import { getTodayKey } from '../utils/storage';

interface QuickInputProps {
  selectedDate: string; // "YYYY-MM-DD"
  onAddEntry: (text: string, date: string) => void;
  onResetToToday: () => void;
}

export const QuickInput: React.FC<QuickInputProps> = ({
  selectedDate,
  onAddEntry,
  onResetToToday,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const todayKey = getTodayKey();
  const isPastDay = selectedDate < todayKey;
  const isToday = selectedDate === todayKey;

  const parsed = parseFinancialText(inputText);

  // Auto focus on mount or date change (only on larger screens to avoid mobile virtual keyboard jump)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, [selectedDate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onAddEntry(inputText, selectedDate);
    setInputText('');
  };

  const formatDateLabel = (dStr: string) => {
    const [y, m, d] = dStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col gap-2.5 sm:gap-3 transition-colors duration-200">
      {/* Target Date Context Banner */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isToday ? (
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[11px] sm:text-xs truncate">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Hôm nay ({formatDateLabel(selectedDate)})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-[11px] sm:text-xs truncate">
              <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isPastDay ? 'Bổ sung ngày cũ:' : 'Ghi cho ngày:'} {formatDateLabel(selectedDate)}</span>
            </span>
          )}
        </div>

        {!isToday && (
          <button
            onClick={onResetToToday}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-[11px] sm:text-xs font-semibold py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về hôm nay</span>
          </button>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Gõ nhanh ghi chú... (VD: 'Đổ xăng 80k', 'Ăn phở 45k')"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 text-xs sm:text-sm transition font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-1 text-xs sm:text-sm transition shadow-sm shadow-blue-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Live Parser Preview Indicator */}
      {inputText.trim() && (
        <div className="flex items-center gap-2 text-[11px] sm:text-xs pt-0.5">
          <span className="text-slate-500 dark:text-slate-400">Phát hiện:</span>
          {parsed.hasAmount ? (
            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-700">
              {formatVND(parsed.amount)}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Chưa có số tiền
            </span>
          )}
        </div>
      )}
    </div>
  );
};
