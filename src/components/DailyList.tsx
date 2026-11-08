import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Clock, AlertCircle } from 'lucide-react';
import { FinanceItem } from '../types/finance';
import { formatVND } from '../utils/parser';
import { getDayOfWeekVi } from '../utils/exportUtils';
import { getTodayKey } from '../utils/storage';

interface DailyListProps {
  selectedDate: string;
  items: FinanceItem[];
  totalAmount: number;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, newText: string) => void;
}

export const DailyList: React.FC<DailyListProps> = ({
  selectedDate,
  items,
  totalAmount,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const todayKey = getTodayKey();
  const isToday = selectedDate === todayKey;
  const isPastDay = selectedDate < todayKey;
  const dayOfWeek = getDayOfWeekVi(selectedDate);

  const [y, m, d] = selectedDate.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  const startEdit = (item: FinanceItem) => {
    setEditingId(item.id);
    setEditText(item.rawText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (itemId: string) => {
    if (!editText.trim()) return;
    onUpdateItem(itemId, editText);
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-colors duration-200">
      {/* Day Header with Status and Daily Total */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {isToday ? 'Hôm nay' : dayOfWeek}, {formattedDate}
            </h2>
            {isPastDay && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Đã đóng lịch sử
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {items.length > 0 ? `${items.length} khoản ghi chú` : 'Chưa có ghi chép nào'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tổng ngày:</div>
          <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
            {formatVND(totalAmount)}
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600 gap-2">
          <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-medium">Chưa có khoản chi tiêu nào trong ngày này.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Gõ vào ô bên trên để thêm ghi chép bất kỳ lúc nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="group bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-150"
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-blue-500 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none ring-2 ring-blue-500/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(item.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      title="Lưu"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                      title="Hủy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeStr}</span>
                      </div>
                      <div className="text-sm text-slate-800 dark:text-slate-200 font-semibold truncate">
                        {item.rawText}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.parsedAmount > 0 && (
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg">
                          {formatVND(item.parsedAmount)}
                        </span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
