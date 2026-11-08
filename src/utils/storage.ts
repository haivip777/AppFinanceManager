import { FinanceItem, DayRecord, FinanceStore, MonthSummary } from '../types/finance';
import { parseFinancialText } from './parser';

export const STORAGE_KEY = 'vibe_finance_data_v1';

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function loadStore(): FinanceStore {
  try {
    const storageObj = typeof localStorage !== 'undefined' ? localStorage : null;
    const data = storageObj ? storageObj.getItem(STORAGE_KEY) : null;
    if (!data) return {};
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load store from localStorage', err);
    return {};
  }
}

export function saveStore(store: FinanceStore): void {
  try {
    const storageObj = typeof localStorage !== 'undefined' ? localStorage : null;
    if (storageObj) {
      storageObj.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch (err) {
    console.error('Failed to save store to localStorage', err);
  }
}

export function recalculateDayTotal(items: FinanceItem[]): number {
  return items.reduce((sum, item) => sum + (item.parsedAmount || 0), 0);
}

export function addFinanceEntry(rawText: string, dateKey?: string): FinanceStore {
  const store = loadStore();
  const targetDate = dateKey || getTodayKey();
  const parsed = parseFinancialText(rawText);

  const newItem: FinanceItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rawText: rawText.trim(),
    parsedAmount: parsed.amount,
    timeStr: getCurrentTimeStr(),
    createdAt: new Date().toISOString(),
  };

  const existingDay = store[targetDate] || {
    date: targetDate,
    isClosed: targetDate < getTodayKey(),
    totalAmount: 0,
    items: [],
  };

  const updatedItems = [newItem, ...existingDay.items];
  const updatedDay: DayRecord = {
    ...existingDay,
    items: updatedItems,
    totalAmount: recalculateDayTotal(updatedItems),
  };

  const updatedStore: FinanceStore = {
    ...store,
    [targetDate]: updatedDay,
  };

  saveStore(updatedStore);
  return updatedStore;
}

export function deleteFinanceEntry(dateKey: string, itemId: string): FinanceStore {
  const store = loadStore();
  const day = store[dateKey];
  if (!day) return store;

  const updatedItems = day.items.filter((item) => item.id !== itemId);
  const updatedDay: DayRecord = {
    ...day,
    items: updatedItems,
    totalAmount: recalculateDayTotal(updatedItems),
  };

  const updatedStore: FinanceStore = {
    ...store,
    [dateKey]: updatedDay,
  };

  saveStore(updatedStore);
  return updatedStore;
}

export function updateFinanceEntry(dateKey: string, itemId: string, newRawText: string): FinanceStore {
  const store = loadStore();
  const day = store[dateKey];
  if (!day) return store;

  const parsed = parseFinancialText(newRawText);
  const updatedItems = day.items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      rawText: newRawText.trim(),
      parsedAmount: parsed.amount,
    };
  });

  const updatedDay: DayRecord = {
    ...day,
    items: updatedItems,
    totalAmount: recalculateDayTotal(updatedItems),
  };

  const updatedStore: FinanceStore = {
    ...store,
    [dateKey]: updatedDay,
  };

  saveStore(updatedStore);
  return updatedStore;
}

export function getEntriesForDate(store: FinanceStore, dateKey: string): FinanceItem[] {
  return store[dateKey]?.items || [];
}

export function getMonthSummary(store: FinanceStore, monthKey: string): MonthSummary {
  let totalExpense = 0;
  let daysWithRecordsCount = 0;
  let totalItemsCount = 0;

  Object.entries(store).forEach(([date, dayRecord]) => {
    if (date.startsWith(monthKey) && dayRecord.items.length > 0) {
      totalExpense += dayRecord.totalAmount;
      daysWithRecordsCount += 1;
      totalItemsCount += dayRecord.items.length;
    }
  });

  return {
    monthKey,
    totalExpense,
    daysWithRecordsCount,
    totalItemsCount,
  };
}
