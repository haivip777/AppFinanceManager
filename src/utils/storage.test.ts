import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStore,
  addFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
  getMonthSummary,
} from './storage';

// In-memory localStorage mock for node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage & Store operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes empty store if nothing in localStorage', () => {
    const store = loadStore();
    expect(store).toEqual({});
  });

  it('adds an entry to today or any specified date', () => {
    const dateKey = '2026-11-07'; // past date
    const updatedStore = addFinanceEntry('Đổ xăng 80k', dateKey);
    
    expect(updatedStore[dateKey]).toBeDefined();
    expect(updatedStore[dateKey].items.length).toBe(1);
    expect(updatedStore[dateKey].items[0].rawText).toBe('Đổ xăng 80k');
    expect(updatedStore[dateKey].items[0].parsedAmount).toBe(80000);
    expect(updatedStore[dateKey].totalAmount).toBe(80000);
  });

  it('accumulates multiple entries and updates day total', () => {
    const dateKey = '2026-11-08';
    addFinanceEntry('Ăn sáng 35k', dateKey);
    const store = addFinanceEntry('Ăn trưa 50k', dateKey);
    
    expect(store[dateKey].items.length).toBe(2);
    expect(store[dateKey].totalAmount).toBe(85000);
  });

  it('deletes an entry and recalculates day total', () => {
    const dateKey = '2026-11-08';
    const store1 = addFinanceEntry('Ăn sáng 35k', dateKey);
    const itemId = store1[dateKey].items[0].id;
    
    const store2 = deleteFinanceEntry(dateKey, itemId);
    expect(store2[dateKey].items.length).toBe(0);
    expect(store2[dateKey].totalAmount).toBe(0);
  });

  it('updates an existing entry and recalculates total', () => {
    const dateKey = '2026-11-08';
    const store1 = addFinanceEntry('Ăn sáng 35k', dateKey);
    const itemId = store1[dateKey].items[0].id;

    const store2 = updateFinanceEntry(dateKey, itemId, 'Ăn sáng phở đặc biệt 50k');
    expect(store2[dateKey].items[0].rawText).toBe('Ăn sáng phở đặc biệt 50k');
    expect(store2[dateKey].items[0].parsedAmount).toBe(50000);
    expect(store2[dateKey].totalAmount).toBe(50000);
  });

  it('calculates monthly summary accurately', () => {
    addFinanceEntry('Mua sách 120k', '2026-11-01');
    addFinanceEntry('Xem phim 150k', '2026-11-05');
    addFinanceEntry('Trà sữa 40k', '2026-10-25'); // different month

    const store = loadStore();
    const summaryNov = getMonthSummary(store, '2026-11');
    expect(summaryNov.totalExpense).toBe(270000);
    expect(summaryNov.daysWithRecordsCount).toBe(2);
    expect(summaryNov.totalItemsCount).toBe(2);
  });
});
