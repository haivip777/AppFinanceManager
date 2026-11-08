import { FinanceItem, DayRecord, FinanceStore, MonthSummary, WalletStore, WalletTransaction } from '../types/finance';
import { parseFinancialText } from './parser';

export const STORAGE_KEY = 'vibe_finance_data_v1';
export const WALLET_STORAGE_KEY = 'vibe_wallet_data_v1';

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

// --- WALLET STORAGE & OPERATIONS ---

const DEFAULT_WALLET: WalletStore = {
  savingsBalance: 0,
  spendingBalance: 0,
  transactions: [],
};

export function loadWalletStore(): WalletStore {
  try {
    const storageObj = typeof localStorage !== 'undefined' ? localStorage : null;
    const data = storageObj ? storageObj.getItem(WALLET_STORAGE_KEY) : null;
    if (!data) return DEFAULT_WALLET;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load wallet from localStorage', err);
    return DEFAULT_WALLET;
  }
}

export function saveWalletStore(wallet: WalletStore): void {
  try {
    const storageObj = typeof localStorage !== 'undefined' ? localStorage : null;
    if (storageObj) {
      storageObj.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    }
  } catch (err) {
    console.error('Failed to save wallet to localStorage', err);
  }
}

export function depositToWallet(target: 'savings' | 'spending', amount: number, note?: string): WalletStore {
  const wallet = loadWalletStore();
  const validAmount = Math.max(0, amount);
  if (validAmount === 0) return wallet;

  const tx: WalletTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: target === 'savings' ? 'deposit_savings' : 'deposit_spending',
    amount: validAmount,
    description: note || (target === 'savings' ? 'Nạp tiền vào Ví Tiết Kiệm' : 'Nạp tiền vào Ví Chi Tiêu'),
    createdAt: new Date().toISOString(),
  };

  const updated: WalletStore = {
    ...wallet,
    savingsBalance: target === 'savings' ? wallet.savingsBalance + validAmount : wallet.savingsBalance,
    spendingBalance: target === 'spending' ? wallet.spendingBalance + validAmount : wallet.spendingBalance,
    transactions: [tx, ...wallet.transactions],
  };

  saveWalletStore(updated);
  return updated;
}

export function transferBetweenWallets(from: 'savings' | 'spending', amount: number): WalletStore {
  const wallet = loadWalletStore();
  const validAmount = Math.max(0, amount);
  if (validAmount === 0) return wallet;

  if (from === 'savings') {
    if (wallet.savingsBalance < validAmount) return wallet;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'transfer_to_spending',
      amount: validAmount,
      description: 'Chuyển từ Tiết kiệm sang Chi tiêu',
      createdAt: new Date().toISOString(),
    };
    const updated: WalletStore = {
      ...wallet,
      savingsBalance: wallet.savingsBalance - validAmount,
      spendingBalance: wallet.spendingBalance + validAmount,
      transactions: [tx, ...wallet.transactions],
    };
    saveWalletStore(updated);
    return updated;
  } else {
    if (wallet.spendingBalance < validAmount) return wallet;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'transfer_to_savings',
      amount: validAmount,
      description: 'Chuyển từ Chi tiêu sang Tiết kiệm',
      createdAt: new Date().toISOString(),
    };
    const updated: WalletStore = {
      ...wallet,
      savingsBalance: wallet.savingsBalance + validAmount,
      spendingBalance: wallet.spendingBalance - validAmount,
      transactions: [tx, ...wallet.transactions],
    };
    saveWalletStore(updated);
    return updated;
  }
}

export function setWalletBalance(target: 'savings' | 'spending', newBalance: number): WalletStore {
  const wallet = loadWalletStore();
  const validBalance = Math.max(0, newBalance);

  const tx: WalletTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'manual_adjustment',
    amount: validBalance,
    description: `Thiết lập số dư ${target === 'savings' ? 'Ví Tiết Kiệm' : 'Ví Chi Tiêu'} thành ${validBalance}`,
    createdAt: new Date().toISOString(),
  };

  const updated: WalletStore = {
    ...wallet,
    savingsBalance: target === 'savings' ? validBalance : wallet.savingsBalance,
    spendingBalance: target === 'spending' ? validBalance : wallet.spendingBalance,
    transactions: [tx, ...wallet.transactions],
  };

  saveWalletStore(updated);
  return updated;
}

export function deductSpendingForExpense(amount: number, entryText: string): void {
  if (amount <= 0) return;
  const wallet = loadWalletStore();
  const tx: WalletTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'expense_auto_deduct',
    amount: amount,
    description: `Chi tiêu: "${entryText}"`,
    createdAt: new Date().toISOString(),
  };
  const updated: WalletStore = {
    ...wallet,
    spendingBalance: wallet.spendingBalance - amount,
    transactions: [tx, ...wallet.transactions],
  };
  saveWalletStore(updated);
}

export function refundSpendingForExpense(amount: number, entryText: string): void {
  if (amount <= 0) return;
  const wallet = loadWalletStore();
  const tx: WalletTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'expense_auto_refund',
    amount: amount,
    description: `Hoàn tiền / Hủy: "${entryText}"`,
    createdAt: new Date().toISOString(),
  };
  const updated: WalletStore = {
    ...wallet,
    spendingBalance: wallet.spendingBalance + amount,
    transactions: [tx, ...wallet.transactions],
  };
  saveWalletStore(updated);
}

// --- JOURNAL ENTRIES CRUD ---

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

  // Auto-deduct from spending wallet if amount > 0
  if (parsed.amount > 0) {
    deductSpendingForExpense(parsed.amount, rawText.trim());
  }

  return updatedStore;
}

export function deleteFinanceEntry(dateKey: string, itemId: string): FinanceStore {
  const store = loadStore();
  const day = store[dateKey];
  if (!day) return store;

  const itemToDelete = day.items.find((item) => item.id === itemId);

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

  // Refund back to spending wallet if deleted item had an amount
  if (itemToDelete && itemToDelete.parsedAmount > 0) {
    refundSpendingForExpense(itemToDelete.parsedAmount, itemToDelete.rawText);
  }

  return updatedStore;
}

export function updateFinanceEntry(dateKey: string, itemId: string, newRawText: string): FinanceStore {
  const store = loadStore();
  const day = store[dateKey];
  if (!day) return store;

  const existingItem = day.items.find((item) => item.id === itemId);
  const oldAmount = existingItem ? existingItem.parsedAmount : 0;

  const parsed = parseFinancialText(newRawText);
  const newAmount = parsed.amount;

  const updatedItems = day.items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      rawText: newRawText.trim(),
      parsedAmount: newAmount,
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

  // Rebalance difference in spending wallet
  const diff = newAmount - oldAmount;
  if (diff > 0) {
    deductSpendingForExpense(diff, `Chỉnh sửa: "${newRawText.trim()}"`);
  } else if (diff < 0) {
    refundSpendingForExpense(Math.abs(diff), `Giảm chi phí: "${newRawText.trim()}"`);
  }

  return updatedStore;
}

/**
 * Moves specified items from one date to another date
 */
export function moveFinanceEntries(
  itemIds: string[],
  fromDateKey: string,
  toDateKey: string
): FinanceStore {
  if (fromDateKey === toDateKey || itemIds.length === 0) return loadStore();

  const store = loadStore();
  const fromDay = store[fromDateKey];
  if (!fromDay) return store;

  const idsSet = new Set(itemIds);
  const itemsToMove = fromDay.items.filter((item) => idsSet.has(item.id));
  if (itemsToMove.length === 0) return store;

  // Remaining items in fromDay
  const remainingFromItems = fromDay.items.filter((item) => !idsSet.has(item.id));
  const updatedFromDay: DayRecord = {
    ...fromDay,
    items: remainingFromItems,
    totalAmount: recalculateDayTotal(remainingFromItems),
  };

  // Target day
  const toDay = store[toDateKey] || {
    date: toDateKey,
    isClosed: toDateKey < getTodayKey(),
    totalAmount: 0,
    items: [],
  };

  const updatedToItems = [...itemsToMove, ...toDay.items];
  const updatedToDay: DayRecord = {
    ...toDay,
    items: updatedToItems,
    totalAmount: recalculateDayTotal(updatedToItems),
  };

  const updatedStore: FinanceStore = {
    ...store,
    [fromDateKey]: updatedFromDay,
    [toDateKey]: updatedToDay,
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
