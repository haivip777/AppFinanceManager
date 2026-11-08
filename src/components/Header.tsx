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
    if (themeMode === 'dark') return <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />;
    if (themeMode === 'light') return <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />;
    return <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'dark') return 'Tối';
    if (themeMode === 'light') return 'Sáng';
    return 'Hệ thống';
  };

  return (
    <header className="border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-sm transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Top bar on Mobile / Left Section on Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  VibeFinance
                </span>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Tech Blue
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">Micro-Journal & Quản lý Ví tài chính</p>
            </div>
          </div>

          {/* Quick Actions on Mobile (Visible when < md) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenWhitelistModal}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition"
              title="Whitelist"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenChangelogModal}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Thông báo"
            >
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Cài đặt"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Centered & clean on mobile) */}
        <div className="flex items-center justify-center w-full md:w-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-full sm:w-auto">
            <button
              onClick={() => onTabChange('journal')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

        {/* Desktop Actions & Theme Dropdown */}
        <div className="hidden md:flex items-center gap-2">
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

          {/* Settings Button */}
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

        {/* Mobile Theme Toggle (Compact switch on phone) */}
        <div className="flex md:hidden items-center justify-between w-full pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-[11px] text-slate-400">Giao diện:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onSelectTheme('light')}
              className={`p-1.5 rounded-md text-xs font-medium ${themeMode === 'light' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-400'}`}
              title="Sáng"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              onClick={() => onSelectTheme('dark')}
              className={`p-1.5 rounded-md text-xs font-medium ${themeMode === 'dark' ? 'bg-slate-700 text-blue-300 shadow-xs' : 'text-slate-400'}`}
              title="Tối"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            </button>
            <button
              onClick={() => onSelectTheme('system')}
              className={`p-1.5 rounded-md text-xs font-medium ${themeMode === 'system' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs' : 'text-slate-400'}`}
              title="Hệ thống"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
