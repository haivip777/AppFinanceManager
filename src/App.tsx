import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { QuickInput } from './components/QuickInput';
import { DailyList } from './components/DailyList';
import { ExportModal } from './components/ExportModal';
import {
  loadStore,
  addFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
  getMonthSummary,
  getTodayKey,
} from './utils/storage';
import { getAIPromptTemplate } from './utils/exportUtils';
import { FinanceStore } from './types/finance';

export default function App() {
  const [store, setStore] = useState<FinanceStore>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const today = getTodayKey();
    return today.substring(0, 7); // "YYYY-MM"
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load store on mount
  useEffect(() => {
    setStore(loadStore());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddEntry = (text: string, date: string) => {
    const updated = addFinanceEntry(text, date);
    setStore(updated);
    showToast('Đã thêm ghi chú thành công!');
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = deleteFinanceEntry(selectedDate, itemId);
    setStore(updated);
    showToast('Đã xóa ghi chú');
  };

  const handleUpdateItem = (itemId: string, newText: string) => {
    const updated = updateFinanceEntry(selectedDate, itemId, newText);
    setStore(updated);
    showToast('Đã cập nhật ghi chú');
  };

  const handleCopyPrompt = () => {
    const prompt = getAIPromptTemplate(currentMonthKey);
    navigator.clipboard.writeText(prompt);
    showToast('Đã copy Prompt AI vào bộ nhớ tạm!');
  };

  const summary = getMonthSummary(store, currentMonthKey);
  const currentDayData = store[selectedDate] || {
    date: selectedDate,
    isClosed: selectedDate < getTodayKey(),
    totalAmount: 0,
    items: [],
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        currentMonthKey={currentMonthKey}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onCopyPrompt={handleCopyPrompt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Sidebar (5 columns on desktop) */}
        <div className="lg:col-span-5 sticky top-24">
          <CalendarView
            currentMonthKey={currentMonthKey}
            onMonthChange={(newMonth) => {
              setCurrentMonthKey(newMonth);
              // auto select 1st day of month
              setSelectedDate(`${newMonth}-01`);
            }}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              // Sync month view if selecting a different month
              const monthOfDate = date.substring(0, 7);
              if (monthOfDate !== currentMonthKey) {
                setCurrentMonthKey(monthOfDate);
              }
            }}
            store={store}
            summary={summary}
          />
        </div>

        {/* Right Column: Quick Input & Daily Activities (7 columns on desktop) */}
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
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
