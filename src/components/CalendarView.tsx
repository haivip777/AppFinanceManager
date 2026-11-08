import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { FinanceStore, MonthSummary } from '../types/finance';
import { formatVND } from '../utils/parser';
import { getTodayKey } from '../utils/storage';

interface CalendarViewProps {
  currentMonthKey: string; // "YYYY-MM"
  onMonthChange: (newMonthKey: string) => void;
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  store: FinanceStore;
  summary: MonthSummary;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonthKey,
  onMonthChange,
  selectedDate,
  onSelectDate,
  store,
  summary,
}) => {
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const todayKey = getTodayKey();

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const daysArray: Array<{ dateKey: string; dayNum: number } | null> = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    daysArray.push({
      dateKey: `${yearStr}-${monthStr}-${dayStr}`,
      dayNum: d,
    });
  }

  const weekHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
      {/* Month Switcher Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span>Tháng {month}/{year}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            title="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            title="Tháng sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400">
        {weekHeaders.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysArray.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const { dateKey, dayNum } = cell;
          const dayData = store[dateKey];
          const hasEntries = dayData && dayData.items.length > 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          let btnClass = "h-11 rounded-xl flex flex-col items-center justify-center text-xs relative transition-all duration-150 ";

          if (isSelected) {
            btnClass += "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 ring-2 ring-blue-500 ";
          } else if (isToday) {
            btnClass += "bg-blue-50 text-blue-700 font-bold border border-blue-300 hover:bg-blue-100 ";
          } else if (hasEntries) {
            btnClass += "bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200/60 font-semibold ";
          } else {
            btnClass += "text-slate-500 hover:bg-slate-50 hover:text-slate-900 ";
          }

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={btnClass}
            >
              <span>{dayNum}</span>
              {hasEntries && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-blue-600'
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly Summary Card */}
      <div className="mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-blue-700 font-semibold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Tổng chi tiêu tháng {month}
          </span>
          <span className="text-slate-500">{summary.daysWithRecordsCount} ngày ghi</span>
        </div>
        <div className="text-2xl font-extrabold text-blue-700">
          {formatVND(summary.totalExpense)}
        </div>
        <div className="text-xs text-slate-500">
          {summary.totalItemsCount} khoản giao dịch đã lưu
        </div>
      </div>
    </div>
  );
};
