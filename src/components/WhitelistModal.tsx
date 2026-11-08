import React from 'react';
import { X, Heart, Calendar, ArrowUpRight } from 'lucide-react';
import { FavoriteNote } from '../types/finance';
import { formatVND } from '../utils/parser';

interface WhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteNote[];
  onSelectDate: (date: string) => void;
  onToggleFavorite: (date: string, itemId: string) => void;
}

export const WhitelistModal: React.FC<WhitelistModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectDate,
  onToggleFavorite,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Ghi Chú Yêu Thích (Whitelist)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {favorites.length} ghi chú quan trọng đã đánh dấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {favorites.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
              <Heart className="w-8 h-8 text-slate-300 dark:text-slate-700 stroke-1" />
              <p>Chưa có ghi chú nào được thêm vào Whitelist.</p>
              <p className="text-[11px] text-slate-400">
                Bấm vào biểu tượng trái tim ❤️ ở bất kỳ ghi chú nào để lưu vào đây.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="group p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-rose-300 dark:hover:border-rose-900/60 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {fav.rawText}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ngày: {formatDate(fav.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {fav.parsedAmount > 0 && (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
                      {formatVND(fav.parsedAmount)}
                    </span>
                  )}

                  {/* Jump to date button */}
                  <button
                    onClick={() => {
                      onSelectDate(fav.date);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    title="Xem ngày này"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove favorite button */}
                  <button
                    onClick={() => onToggleFavorite(fav.date, fav.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                    title="Bỏ khỏi Whitelist"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
