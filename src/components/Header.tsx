import React, { useState, useRef, useEffect } from 'react';
import { Download, Bot, Wallet, BookOpen, CreditCard, Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface HeaderProps {
  currentMonthKey: string;
  activeTab: 'journal' | 'wallet';
  onTabChange: (tab: 'journal' | 'wallet') => void;
  onOpenExportModal: () => void;
  onCopyPrompt: () => void;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  activeTab,
  onTabChange,
  onOpenExportModal,
  onCopyPrompt,
  themeMode,
  onSelectTheme,
}) => {
  const [year, month] = currentMonthKey.split('-');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    if (themeMode === 'dark') return <Moon className="w-4 h-4 text-blue-400" />;
    if (themeMode === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    return <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'dark') return 'Tối';
    if (themeMode === 'light') return 'Sáng';
    return 'Hệ thống';
  };

  return (
    <header className="border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Wallet className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  VibeFinance
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Tech Blue
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Micro-Journal & Quản lý Ví tài chính</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => onTabChange('journal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nhật ký</span>
            </button>
            <button
              onClick={() => onTabChange('wallet')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Ví của tôi</span>
            </button>
          </div>
        </div>

        {/* Action Buttons & Theme Dropdown */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 transition shadow-xs"
              title="Đổi giao diện Sáng / Tối"
            >
              {getThemeIcon()}
              <span>{getThemeLabel()}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSelectTheme('light');
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    themeMode === 'light'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Giao diện Sáng</span>
                  </span>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>

                <button
                  onClick={() => {
                    onSelectTheme('dark');
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    themeMode === 'dark'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>Giao diện Tối</span>
                  </span>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>

                <button
                  onClick={() => {
                    onSelectTheme('system');
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    themeMode === 'system'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Theo Hệ thống</span>
                  </span>
                  {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onCopyPrompt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-xs"
            title="Sao chép mẫu Prompt để gửi kèm file JSON cho AI"
          >
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
