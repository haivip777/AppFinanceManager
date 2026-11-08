import React, { useState } from 'react';
import {
  Wallet,
  PiggyBank,
  ArrowRightLeft,
  PlusCircle,
  Settings2,
  TrendingDown,
  TrendingUp,
  History,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { WalletStore, WalletTransaction } from '../types/finance';
import { formatVND } from '../utils/parser';

interface WalletViewProps {
  wallet: WalletStore;
  onDeposit: (target: 'savings' | 'spending', amount: number, note?: string) => void;
  onTransfer: (from: 'savings' | 'spending', amount: number) => void;
  onSetBalance: (target: 'savings' | 'spending', newBalance: number) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  onDeposit,
  onTransfer,
  onSetBalance,
}) => {
  // Modal states
  const [activeModal, setActiveModal] = useState<'deposit' | 'transfer' | 'set_balance' | null>(null);
  const [modalTarget, setModalTarget] = useState<'savings' | 'spending'>('spending');
  const [inputAmountStr, setInputAmountStr] = useState('');
  const [noteStr, setNoteStr] = useState('');

  const totalAssets = wallet.savingsBalance + wallet.spendingBalance;

  const openDepositModal = (target: 'savings' | 'spending') => {
    setModalTarget(target);
    setInputAmountStr('');
    setNoteStr('');
    setActiveModal('deposit');
  };

  const openTransferModal = (from: 'savings' | 'spending') => {
    setModalTarget(from);
    setInputAmountStr('');
    setActiveModal('transfer');
  };

  const openSetBalanceModal = (target: 'savings' | 'spending') => {
    setModalTarget(target);
    setInputAmountStr('');
    setActiveModal('set_balance');
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = parseInt(inputAmountStr.replace(/\D/g, ''), 10);
    if (isNaN(rawNum) || rawNum <= 0) return;

    if (activeModal === 'deposit') {
      onDeposit(modalTarget, rawNum, noteStr);
    } else if (activeModal === 'transfer') {
      onTransfer(modalTarget, rawNum);
    } else if (activeModal === 'set_balance') {
      onSetBalance(modalTarget, rawNum);
    }

    setActiveModal(null);
  };

  const renderTxIcon = (tx: WalletTransaction) => {
    if (tx.type === 'deposit_savings' || tx.type === 'deposit_spending') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
      );
    }
    if (tx.type === 'expense_auto_deduct') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <TrendingDown className="w-4 h-4" />
        </div>
      );
    }
    if (tx.type === 'transfer_to_savings' || tx.type === 'transfer_to_spending') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <Settings2 className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Total Net Worth Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 p-6 md:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-100 dark:text-blue-200 text-xs font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Tổng Tài Sản Quản Lý
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              {formatVND(totalAssets)}
            </div>
            <p className="text-blue-200/90 text-xs mt-1">
              Bao gồm Ví Tiết Kiệm & Khoản Dành Để Chi Tiêu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openDepositModal('spending')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Nạp tiền nhanh
            </button>
          </div>
        </div>
      </div>

      {/* Two Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet 1: Tiết kiệm */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <PiggyBank className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                Tích Lũy Dài Hạn
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ví Tiết Kiệm</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Khoản tích lũy bảo vệ tài chính</p>
            </div>

            <div className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 tracking-tight pt-1">
              {formatVND(wallet.savingsBalance)}
            </div>
          </div>

          {/* Actions for Savings */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => openDepositModal('savings')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nạp tiền</span>
            </button>
            <button
              onClick={() => openTransferModal('savings')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Sang Chi tiêu</span>
            </button>
            <button
              onClick={() => openSetBalanceModal('savings')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-medium transition"
              title="Đặt lại số dư"
            >
              <Settings2 className="w-4 h-4" />
              <span>Sửa số dư</span>
            </button>
          </div>
        </div>

        {/* Wallet 2: Dành để chi tiêu */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 ring-1 ring-blue-500/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <Wallet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Ngân Sách Sẵn Sàng
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ví Dành Để Chi Tiêu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tự động trừ khi thêm ghi chép ở tab Nhật ký</p>
            </div>

            <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight pt-1">
              {formatVND(wallet.spendingBalance)}
            </div>
          </div>

          {/* Actions for Spending */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => openDepositModal('spending')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nạp ngân sách</span>
            </button>
            <button
              onClick={() => openTransferModal('spending')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Cất Tiết kiệm</span>
            </button>
            <button
              onClick={() => openSetBalanceModal('spending')}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-medium transition"
              title="Đặt lại số dư"
            >
              <Settings2 className="w-4 h-4" />
              <span>Sửa số dư</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Lịch Sử Biến Động Ví</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {wallet.transactions.length} giao dịch gần nhất
          </span>
        </div>

        {wallet.transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
            Chưa có biến động số dư nào. Khi bạn nạp tiền hoặc ghi chú chi tiêu, lịch sử sẽ hiện ở đây.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {wallet.transactions.slice(0, 15).map((tx) => {
              const isExpense = tx.type === 'expense_auto_deduct';
              const isDeposit = tx.type === 'deposit_savings' || tx.type === 'deposit_spending';
              const isRefund = tx.type === 'expense_auto_refund';

              const dateObj = new Date(tx.createdAt);
              const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {renderTxIcon(tx)}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{timeFormatted}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isDeposit || isRefund
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExpense ? '-' : isDeposit || isRefund ? '+' : ''}
                      {formatVND(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Dialog / Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              {activeModal === 'deposit'
                ? `Nạp tiền vào ${modalTarget === 'savings' ? 'Ví Tiết Kiệm' : 'Ví Chi Tiêu'}`
                : activeModal === 'transfer'
                ? `Chuyển từ ${modalTarget === 'savings' ? 'Tiết Kiệm sang Chi Tiêu' : 'Chi Tiêu sang Tiết Kiệm'}`
                : `Thiết lập số dư ${modalTarget === 'savings' ? 'Ví Tiết Kiệm' : 'Ví Chi Tiêu'}`}
            </h4>

            <form onSubmit={handleSubmitModal} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  {activeModal === 'set_balance' ? 'Số dư mới (VNĐ):' : 'Số tiền (VNĐ):'}
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 500000 hoặc 500.000"
                  value={inputAmountStr}
                  onChange={(e) => setInputAmountStr(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {activeModal === 'deposit' && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                    Ghi chú nguồn tiền (tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lương tháng, thưởng, tiền chuyển khoản..."
                    value={noteStr}
                    onChange={(e) => setNoteStr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!inputAmountStr.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
