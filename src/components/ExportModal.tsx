import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson } from 'lucide-react';
import { FinanceStore } from '../types/finance';
import { generateMonthlyExportData, downloadMonthlyJSON, getAIPromptTemplate } from '../utils/exportUtils';
import { formatVND } from '../utils/parser';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: FinanceStore;
  currentMonthKey: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  store,
  currentMonthKey,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const exportData = generateMonthlyExportData(store, currentMonthKey);
  const prompt = getAIPromptTemplate(currentMonthKey);
  const [year, month] = currentMonthKey.split('-');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    downloadMonthlyJSON(store, currentMonthKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Export Dữ Liệu Tháng {month}/{year}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">File JSON chuẩn hóa sẵn sàng gửi cho AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Tổng chi tiêu ước tính:</span>
            <div className="text-blue-700 dark:text-blue-400 font-extrabold text-base mt-0.5">
              {formatVND(exportData.exportInfo.totalEstimatedExpense)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Số ngày có ghi chép:</span>
            <div className="text-slate-800 dark:text-slate-200 font-bold text-base mt-0.5">
              {exportData.exportInfo.totalDaysLogged} ngày
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20 text-sm"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Tải File .JSON Về Máy</span>
          </button>

          <button
            onClick={handleCopyPrompt}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs transition"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã copy prompt vào clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Copy Prompt hướng dẫn AI phân tích</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
