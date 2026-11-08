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

  // Auto focus on mount or date change
  useEffect(() => {
    inputRef.current?.focus();
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
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Target Date Context Banner */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" />
              Đang ghi cho Hôm nay ({formatDateLabel(selectedDate)})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
              <CalendarClock className="w-3.5 h-3.5" />
              {isPastDay ? 'Bổ sung ghi chú cho ngày cũ:' : 'Ghi chú cho ngày:'} {formatDateLabel(selectedDate)}
            </span>
          )}
        </div>

        {!isToday && (
          <button
            onClick={onResetToToday}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition text-xs font-medium py-1 px-2 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về hôm nay
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
            placeholder="Gõ nhanh ghi chú... (VD: 'Đổ xăng 80k', 'Ăn phở 45k', 'Tiền điện 450k')"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Live Parser Preview Indicator */}
      {inputText.trim() && (
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="text-slate-400">Phát hiện số tiền:</span>
          {parsed.hasAmount ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {formatVND(parsed.amount)}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
              Chưa có số tiền (lưu ghi chú thuần)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
