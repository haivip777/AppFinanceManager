import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Check,
  ShieldCheck,
  Key,
  Calendar,
  Download,
  FileJson,
} from 'lucide-react';
import { EmailSettings, FinanceStore } from '../types/finance';
import { sendMonthlyReportEmail, getPreviousMonthKey } from '../utils/emailService';
import { generateMonthlyExportData, downloadMonthlyJSON } from '../utils/exportUtils';
import { formatVND } from '../utils/parser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmailSettings;
  onSaveSettings: (newSettings: EmailSettings) => void;
  store: FinanceStore;
  currentMonthKey: string;
  onToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  store,
  currentMonthKey,
  onToast,
}) => {
  const [emailInput, setEmailInput] = useState(settings.email);
  const [apiKeyInput, setApiKeyInput] = useState(settings.resendApiKey || '');
  const [isEnabled, setIsEnabled] = useState(settings.enabled);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  // Export Month selection inside Settings
  const [exportMonth, setExportMonth] = useState(currentMonthKey);

  if (!isOpen) return null;

  const prevMonthKey = getPreviousMonthKey();
  const [prevYear, prevMonth] = prevMonthKey.split('-');

  // Export data preview
  const exportData = generateMonthlyExportData(store, exportMonth);
  const [expYear, expMonth] = exportMonth.split('-');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EmailSettings = {
      ...settings,
      email: emailInput.trim(),
      resendApiKey: apiKeyInput.trim(),
      enabled: isEnabled,
    };
    onSaveSettings(updated);
    onToast('Đã lưu cấu hình Email thành công!');
    onClose();
  };

  const handleSendTestNow = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      onToast('Vui lòng nhập email hợp lệ trước khi gửi test!');
      return;
    }

    setIsSendingTest(true);
    const result = await sendMonthlyReportEmail(
      emailInput.trim(),
      prevMonthKey,
      store,
      apiKeyInput.trim() || undefined
    );
    setIsSendingTest(false);

    if (result.success) {
      onToast(result.message);
    } else {
      onToast(`Lỗi: ${result.message}`);
    }
  };

  const handleDownloadExport = () => {
    downloadMonthlyJSON(store, exportMonth);
    onToast(`Đã tải file JSON tháng ${expMonth}/${expYear} về máy!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Cài Đặt & Xuất Dữ Liệu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý xuất JSON và lịch gửi email tự động định kỳ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: EXPORT JSON TỔNG HỢP CẢ THÁNG */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <FileJson className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Xuất File JSON Cả Tháng
              </span>
            </div>

            {/* Month Picker */}
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px]">Tổng chi tháng {expMonth}:</span>
              <div className="font-extrabold text-blue-600 dark:text-blue-400">
                {formatVND(exportData.exportInfo.totalEstimatedExpense)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Số ngày ghi chép:</span>
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {exportData.exportInfo.totalDaysLogged} ngày
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadExport}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.3]" />
            <span>Tải File JSON Tháng {expMonth}/{expYear}</span>
          </button>
        </div>

        {/* SECTION 2: GỬI EMAIL TỰ ĐỘNG MÙNG 4-6 */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Tự Động Gửi Email Định Kỳ (Mùng 4-6)
            </h4>
          </div>

          {/* Schedule explanation banner */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-blue-950/40 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Vào khoảng <strong className="text-slate-800 dark:text-white">mùng 4, 5, 6</strong> hàng tháng, khi bạn mở web, hệ thống sẽ tự động xuất JSON tháng trước gửi thẳng về Gmail của bạn!
            </div>
          </div>

          {/* Target Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Địa chỉ Gmail nhận file JSON:
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="VD: vi-du-cua-ban@gmail.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Bật tự động gửi định kỳ
              </span>
              <span className="text-[11px] text-slate-400">
                Kích hoạt khi mở web vào mùng 4-6 hàng tháng
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Resend API Key (Optional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-500" />
                Resend API Key (Tùy chọn):
              </label>
              <button
                type="button"
                onClick={() => setShowApiKeyHelp((prev) => !prev)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {showApiKeyHelp ? 'Thu gọn' : 'Cách lấy key miễn phí?'}
              </button>
            </div>

            {showApiKeyHelp && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex flex-col gap-1">
                <span>1. Đăng ký miễn phí tại <strong>resend.com</strong>.</span>
                <span>2. Tạo key có dạng <code>re_xxxxxxxxx</code> dán vào ô bên dưới để email gửi thẳng vào Inbox.</span>
              </div>
            )}

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxx (tùy chọn)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Status info */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
            <span>
              Tháng gần nhất đã gửi:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {settings.lastSentMonth ? `Tháng ${settings.lastSentMonth}` : 'Chưa gửi'}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật trên máy bạn
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSendTestNow}
              disabled={isSendingTest}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs transition cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
              <span>{isSendingTest ? 'Đang gửi...' : `Gửi test tháng ${prevMonth}/${prevYear}`}</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs transition shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
