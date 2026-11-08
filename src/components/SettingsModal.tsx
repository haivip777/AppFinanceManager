import React, { useState } from 'react';
import { X, Mail, Send, Check, ShieldCheck, Key, Calendar } from 'lucide-react';
import { EmailSettings, FinanceStore } from '../types/finance';
import { sendMonthlyReportEmail, getPreviousMonthKey } from '../utils/emailService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmailSettings;
  onSaveSettings: (newSettings: EmailSettings) => void;
  store: FinanceStore;
  onToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  store,
  onToast,
}) => {
  const [emailInput, setEmailInput] = useState(settings.email);
  const [apiKeyInput, setApiKeyInput] = useState(settings.resendApiKey || '');
  const [isEnabled, setIsEnabled] = useState(settings.enabled);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  if (!isOpen) return null;

  const prevMonthKey = getPreviousMonthKey();
  const [prevYear, prevMonth] = prevMonthKey.split('-');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Cài Đặt Nhận Báo Cáo Tự Động
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xuất file JSON tháng trước gửi về Gmail định kỳ
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

        {/* Schedule Explanation Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-blue-950/40 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
              Cơ chế tự động gửi thông minh:
            </span>
            Chỉ cần trong khoảng từ ngày <strong className="text-slate-800 dark:text-white">mùng 4, 5, 6</strong> (hoặc lần đầu truy cập sau mùng 4) bạn mở trang web, hệ thống sẽ <strong>tự động đóng gói toàn bộ JSON từ ngày đầu tiên đến ngày cuối cùng của tháng trước</strong> và gửi về Gmail của bạn ngay lập tức!
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Target Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Địa chỉ Gmail / Email nhận file JSON:
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="VD: vi-du-cua-ban@gmail.com"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Bật tự động gửi định kỳ
              </span>
              <span className="text-[11px] text-slate-400">
                Tự động kích hoạt khi mở web vào mùng 4-6 hàng tháng
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
                Resend API Key (Dành cho gửi email thực):
              </label>
              <button
                type="button"
                onClick={() => setShowApiKeyHelp((prev) => !prev)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showApiKeyHelp ? 'Thu gọn' : 'Cách lấy key miễn phí?'}
              </button>
            </div>

            {showApiKeyHelp && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex flex-col gap-1">
                <span>1. Vào trang <strong>resend.com</strong> (đăng nhập miễn phí bằng GitHub hoặc Google).</span>
                <span>2. Vào mục <strong>API Keys</strong> $\rightarrow$ bấm <strong>Create API Key</strong>.</span>
                <span>3. Copy key có dạng <code>re_xxxxxxxxx</code> dán vào ô bên dưới.</span>
              </div>
            )}

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxx (tùy chọn)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Status info */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
            <span>
              Tháng gần nhất đã gửi:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {settings.lastSentMonth ? `Tháng ${settings.lastSentMonth}` : 'Chưa gửi tháng nào'}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật 100%
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSendTestNow}
              disabled={isSendingTest}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs transition"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
              <span>{isSendingTest ? 'Đang gửi...' : `Gửi test tháng ${prevMonth}/${prevYear} ngay`}</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs transition shadow-sm shadow-blue-500/20"
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
