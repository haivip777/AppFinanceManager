import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  BookOpen,
  CreditCard,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Check,
  Settings,
  Heart,
  Bell,
} from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface HeaderProps {
  activeTab: 'journal' | 'wallet';
  onTabChange: (tab: 'journal' | 'wallet') => void;
  onOpenSettingsModal: () => void;
  onOpenWhitelistModal: () => void;
  onOpenChangelogModal: () => void;
  favoritesCount: number;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettingsModal,
  onOpenWhitelistModal,
  onOpenChangelogModal,
  favoritesCount,
  themeMode,
  onSelectTheme,
}) => {
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

        {/* Action Buttons: Whitelist, Changelog, Settings, Theme */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Whitelist / Favorites Button */}
          <button
            onClick={onOpenWhitelistModal}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Danh sách ghi chú yêu thích (Whitelist)"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Changelog / Release Updates Bell */}
          <button
            onClick={onOpenChangelogModal}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Thông báo cập nhật phiên bản mới"
          >
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </button>

          {/* Settings Button (includes Export JSON & Email Schedule) */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Cài đặt & Xuất file JSON"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 transition shadow-xs cursor-pointer"
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
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
        </div>
      </div>
    </header>
  );
};
