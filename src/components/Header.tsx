import React from 'react';
import { Download, Bot, Wallet, BookOpen, CreditCard } from 'lucide-react';

interface HeaderProps {
  currentMonthKey: string;
  activeTab: 'journal' | 'wallet';
  onTabChange: (tab: 'journal' | 'wallet') => void;
  onOpenExportModal: () => void;
  onCopyPrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  activeTab,
  onTabChange,
  onOpenExportModal,
  onCopyPrompt,
}) => {
  const [year, month] = currentMonthKey.split('-');

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Wallet className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  VibeFinance
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Tech Blue
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Micro-Journal & Quản lý Ví tài chính</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('journal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nhật ký</span>
            </button>
            <button
              onClick={() => onTabChange('wallet')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Ví của tôi</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onCopyPrompt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-xs"
            title="Sao chép mẫu Prompt để gửi kèm file JSON cho AI"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Copy Prompt AI</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20"
          >
            <Download className="w-4 h-4 stroke-[2.3]" />
            <span>Export JSON Tháng {month}/{year}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
