import { useState, useEffect } from 'react';
import { Header, ThemeMode } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { QuickInput } from './components/QuickInput';
import { DailyList } from './components/DailyList';
import { ExportModal } from './components/ExportModal';
import { WalletView } from './components/WalletView';
import {
  loadStore,
  loadWalletStore,
  addFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
  getMonthSummary,
  getTodayKey,
  depositToWallet,
  transferBetweenWallets,
  setWalletBalance,
} from './utils/storage';
import { getAIPromptTemplate } from './utils/exportUtils';
import { FinanceStore, WalletStore } from './types/finance';

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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const today = getTodayKey();
    return today.substring(0, 7); // "YYYY-MM"
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const handleCopyPrompt = () => {
    const prompt = getAIPromptTemplate(currentMonthKey);
    navigator.clipboard.writeText(prompt);
    showToast('Đã copy Prompt AI vào bộ nhớ tạm!');
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

  const summary = getMonthSummary(store, currentMonthKey);
  const currentDayData = store[selectedDate] || {
    date: selectedDate,
    isClosed: selectedDate < getTodayKey(),
    totalAmount: 0,
    items: [],
  };

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''} bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      <Header
        currentMonthKey={currentMonthKey}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onCopyPrompt={handleCopyPrompt}
        themeMode={themeMode}
        onSelectTheme={setThemeMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'journal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Calendar Sidebar */}
            <div className="lg:col-span-5 sticky top-20">
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

            {/* Right Column: Quick Input & Daily Activities */}
            <div className="lg:col-span-7 flex flex-col gap-6">
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

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        store={store}
        currentMonthKey={currentMonthKey}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
