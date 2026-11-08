import { useState, useEffect } from 'react';
import { Header, ThemeMode } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { QuickInput } from './components/QuickInput';
import { DailyList } from './components/DailyList';
import { SettingsModal } from './components/SettingsModal';
import { WhitelistModal } from './components/WhitelistModal';
import { ChangelogModal } from './components/ChangelogModal';
import { WalletView } from './components/WalletView';
import {
  loadStore,
  loadWalletStore,
  addFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
  moveFinanceEntries,
  toggleFavoriteEntry,
  getAllFavoriteEntries,
  getMonthSummary,
  getTodayKey,
  depositToWallet,
  transferBetweenWallets,
  setWalletBalance,
} from './utils/storage';
import {
  loadEmailSettings,
  saveEmailSettings,
  getPreviousMonthKey,
  isEligibleForAutoReport,
  sendMonthlyReportEmail,
} from './utils/emailService';
import { FinanceStore, WalletStore, EmailSettings } from './types/finance';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibe_theme_mode') as ThemeMode;
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const [activeTab, setActiveTab] = useState<'journal' | 'wallet'>('journal');
  const [store, setStore] = useState<FinanceStore>({});
  const [wallet, setWallet] = useState<WalletStore>(loadWalletStore());
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(loadEmailSettings());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const today = getTodayKey();
    return today.substring(0, 7); // "YYYY-MM"
  });

  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with document element and body
  useEffect(() => {
    const checkSystemDark = () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const updateTheme = () => {
      let active: 'light' | 'dark' = 'light';
      if (themeMode === 'system') {
        active = checkSystemDark() ? 'dark' : 'light';
      } else {
        active = themeMode;
      }

      setResolvedTheme(active);
      localStorage.setItem('vibe_theme_mode', themeMode);

      if (active === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#0b0f19';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#f8fafc';
      }
    };

    updateTheme();

    if (themeMode === 'system' && typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Load stores on mount
  useEffect(() => {
    setStore(loadStore());
    setWallet(loadWalletStore());
    setEmailSettings(loadEmailSettings());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-detect and send previous month report if in eligibility window (day 4-6 onwards)
  useEffect(() => {
    const emailCfg = loadEmailSettings();
    if (!emailCfg.email || !emailCfg.enabled) return;

    if (!isEligibleForAutoReport()) return;

    const prevMonth = getPreviousMonthKey();
    if (emailCfg.lastSentMonth !== prevMonth && Object.keys(store).length > 0) {
      sendMonthlyReportEmail(emailCfg.email, prevMonth, store, emailCfg.resendApiKey).then((res) => {
        if (res.success) {
          const updatedCfg: EmailSettings = {
            ...emailCfg,
            lastSentMonth: prevMonth,
            lastSentAt: new Date().toISOString(),
          };
          saveEmailSettings(updatedCfg);
          setEmailSettings(updatedCfg);
          const [, m] = prevMonth.split('-');
          showToast(`📧 Đã tự động gửi file JSON báo cáo tháng ${m} về ${emailCfg.email}!`);
        }
      });
    }
  }, [store]);

  const syncStores = (newStore: FinanceStore) => {
    setStore(newStore);
    setWallet(loadWalletStore());
  };

  const handleAddEntry = (text: string, date: string) => {
    const updated = addFinanceEntry(text, date);
    syncStores(updated);
    showToast('Đã thêm ghi chú thành công!');
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = deleteFinanceEntry(selectedDate, itemId);
    syncStores(updated);
    showToast('Đã xóa ghi chú');
  };

  const handleUpdateItem = (itemId: string, newText: string) => {
    const updated = updateFinanceEntry(selectedDate, itemId, newText);
    syncStores(updated);
    showToast('Đã cập nhật ghi chú');
  };

  const handleMoveItems = (itemIds: string[], fromDate: string, toDate: string) => {
    const updated = moveFinanceEntries(itemIds, fromDate, toDate);
    syncStores(updated);
    const [y, m, d] = toDate.split('-');
    showToast(`Đã chuyển ${itemIds.length} ghi chú sang ngày ${d}/${m}/${y}!`);
  };

  const handleToggleFavorite = (dateKey: string, itemId: string) => {
    const updated = toggleFavoriteEntry(dateKey, itemId);
    syncStores(updated);
  };

  // Wallet operations
  const handleDepositWallet = (target: 'savings' | 'spending', amount: number, note?: string) => {
    const updated = depositToWallet(target, amount, note);
    setWallet(updated);
    showToast(`Đã nạp ${amount.toLocaleString('vi-VN')} ₫ thành công!`);
  };

  const handleTransferWallet = (from: 'savings' | 'spending', amount: number) => {
    const updated = transferBetweenWallets(from, amount);
    setWallet(updated);
    showToast(`Đã chuyển tiền thành công!`);
  };

  const handleSetBalance = (target: 'savings' | 'spending', newBalance: number) => {
    const updated = setWalletBalance(target, newBalance);
    setWallet(updated);
    showToast(`Đã cập nhật số dư ví!`);
  };

  const handleSaveEmailSettings = (newSettings: EmailSettings) => {
    saveEmailSettings(newSettings);
    setEmailSettings(newSettings);
  };

  const summary = getMonthSummary(store, currentMonthKey);
  const currentDayData = store[selectedDate] || {
    date: selectedDate,
    isClosed: selectedDate < getTodayKey(),
    totalAmount: 0,
    items: [],
  };

  const favoriteNotes = getAllFavoriteEntries(store);

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''} bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenWhitelistModal={() => setIsWhitelistModalOpen(true)}
        onOpenChangelogModal={() => setIsChangelogModalOpen(true)}
        favoritesCount={favoriteNotes.length}
        themeMode={themeMode}
        onSelectTheme={setThemeMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'journal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Quick Input & Daily Activities: order-1 on mobile so users can type immediately */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-4 sm:gap-6">
              <QuickInput
                selectedDate={selectedDate}
                onAddEntry={handleAddEntry}
                onResetToToday={() => {
                  const today = getTodayKey();
                  setSelectedDate(today);
                  setCurrentMonthKey(today.substring(0, 7));
                }}
              />

              <DailyList
                selectedDate={selectedDate}
                items={currentDayData.items}
                totalAmount={currentDayData.totalAmount}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
                onMoveItems={handleMoveItems}
                onToggleFavorite={(itemId) => handleToggleFavorite(selectedDate, itemId)}
              />
            </div>

            {/* Calendar Sidebar: order-2 on mobile below the input */}
            <div className="lg:col-span-5 order-2 lg:order-1 lg:sticky lg:top-20">
              <CalendarView
                currentMonthKey={currentMonthKey}
                onMonthChange={(newMonth) => {
                  setCurrentMonthKey(newMonth);
                  setSelectedDate(`${newMonth}-01`);
                }}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  const monthOfDate = date.substring(0, 7);
                  if (monthOfDate !== currentMonthKey) {
                    setCurrentMonthKey(monthOfDate);
                  }
                }}
                store={store}
                summary={summary}
              />
            </div>
          </div>
        ) : (
          /* Wallet Management Tab */
          <div className="max-w-4xl mx-auto">
            <WalletView
              wallet={wallet}
              onDeposit={handleDepositWallet}
              onTransfer={handleTransferWallet}
              onSetBalance={handleSetBalance}
            />
          </div>
        )}
      </main>

      {/* Settings & Export JSON Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={emailSettings}
        onSaveSettings={handleSaveEmailSettings}
        store={store}
        currentMonthKey={currentMonthKey}
        onToast={showToast}
      />

      {/* Whitelist / Favorites Modal */}
      <WhitelistModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        favorites={favoriteNotes}
        onSelectDate={(date) => {
          setSelectedDate(date);
          const monthOfDate = date.substring(0, 7);
          if (monthOfDate !== currentMonthKey) {
            setCurrentMonthKey(monthOfDate);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Changelog / Release Updates Modal */}
      <ChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-blue-600 text-white font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
