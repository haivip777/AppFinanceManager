import React from 'react';
import { Download, Bot, Wallet } from 'lucide-react';

interface HeaderProps {
  currentMonthKey: string;
  onOpenExportModal: () => void;
  onCopyPrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onOpenExportModal,
  onCopyPrompt,
}) => {
  const [year, month] = currentMonthKey.split('-');

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              VibeFinance
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AI Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">Micro-Journal ghi chép tài chính siêu tốc</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopyPrompt}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition shadow-sm"
            title="Sao chép mẫu Prompt để gửi kèm file JSON cho AI"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Copy Prompt cho AI</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export JSON Tháng {month}/{year}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
