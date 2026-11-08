import React, { useState } from 'react';
import {
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  AlertCircle,
  CalendarDays,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';
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
  onMoveItems: (itemIds: string[], fromDate: string, toDate: string) => void;
}

export const DailyList: React.FC<DailyListProps> = ({
  selectedDate,
  items,
  totalAmount,
  onDeleteItem,
  onUpdateItem,
  onMoveItems,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Move Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetDateInput, setTargetDateInput] = useState('');
  const [itemsToMove, setItemsToMove] = useState<string[]>([]);

  const todayKey = getTodayKey();
  const isToday = selectedDate === todayKey;
  const isPastDay = selectedDate < todayKey;
  const dayOfWeek = getDayOfWeekVi(selectedDate);

  const [y, m, d] = selectedDate.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  // Selection handlers
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it.id));
    }
  };

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

  // Open move modal for multiple selected items
  const openMoveModalForSelected = () => {
    if (selectedIds.length === 0) return;
    setItemsToMove(selectedIds);
    setTargetDateInput(selectedDate);
    setIsMoveModalOpen(true);
  };

  // Open move modal for single item
  const openMoveModalForSingle = (id: string) => {
    setItemsToMove([id]);
    setTargetDateInput(selectedDate);
    setIsMoveModalOpen(true);
  };

  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDateInput || targetDateInput === selectedDate) return;
    onMoveItems(itemsToMove, selectedDate, targetDateInput);
    setIsMoveModalOpen(false);
    setSelectedIds([]);
  };

  // Quick date pickers for moving
  const getYesterdayKey = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mn = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mn}-${dy}`;
  };

  const getTomorrowKey = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mn = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mn}-${dy}`;
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

      {/* Bulk Action Toolbar when items are selected */}
      {items.length > 0 && (
        <div className="flex items-center justify-between text-xs py-1">
          <button
            onClick={selectAll}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
          >
            {selectedIds.length === items.length ? (
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>
              {selectedIds.length === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Đã tick chọn: {selectedIds.length}
              </span>
              <button
                onClick={openMoveModalForSelected}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Chuyển sang ngày khác</span>
              </button>
            </div>
          )}
        </div>
      )}

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
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`group border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/20'
                }`}
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
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0"
                        title={isSelected ? 'Bỏ chọn' : 'Chọn ghi chú này'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeStr}</span>
                      </div>
                      <div className="text-sm text-slate-800 dark:text-slate-200 font-semibold truncate">
                        {item.rawText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {item.parsedAmount > 0 && (
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg">
                          {formatVND(item.parsedAmount)}
                        </span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                        {/* Move Single Item button */}
                        <button
                          onClick={() => openMoveModalForSingle(item.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Chuyển sang ngày khác"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </button>
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

      {/* Modal Chuyển Ngày */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Chuyển {itemsToMove.length} ghi chú sang ngày khác
                </h4>
              </div>
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmMove} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Chọn ngày muốn chuyển đến:
                </label>
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Quick shortcut buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setTargetDateInput(getYesterdayKey())}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Hôm qua
                </button>
                <button
                  type="button"
                  onClick={() => setTargetDateInput(todayKey)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setTargetDateInput(getTomorrowKey())}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Ngày mai
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!targetDateInput || targetDateInput === selectedDate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Xác nhận chuyển</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
