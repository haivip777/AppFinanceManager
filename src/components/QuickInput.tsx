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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      {/* Target Date Context Banner */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Đang ghi cho Hôm nay ({formatDateLabel(selectedDate)})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
              <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
              {isPastDay ? 'Bổ sung ghi chú cho ngày cũ:' : 'Ghi chú cho ngày:'} {formatDateLabel(selectedDate)}
            </span>
          )}
        </div>

        {!isToday && (
          <button
            onClick={onResetToToday}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition text-xs font-semibold py-1 px-2 rounded-lg hover:bg-slate-100"
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
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 text-sm transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Live Parser Preview Indicator */}
      {inputText.trim() && (
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="text-slate-500">Phát hiện số tiền:</span>
          {parsed.hasAmount ? (
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-extrabold border border-blue-200">
              {formatVND(parsed.amount)}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
              Chưa có số tiền (lưu ghi chú thuần)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
