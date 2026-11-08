export interface FinanceItem {
  id: string;
  rawText: string;
  parsedAmount: number;
  timeStr: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface DayRecord {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  totalAmount: number;
  items: FinanceItem[];
}

export interface FinanceStore {
  [dateKey: string]: DayRecord;
}

export interface MonthSummary {
  monthKey: string; // "YYYY-MM"
  totalExpense: number;
  daysWithRecordsCount: number;
  totalItemsCount: number;
}

export type WalletTxType =
  | 'deposit_savings'
  | 'deposit_spending'
  | 'transfer_to_savings'
  | 'transfer_to_spending'
  | 'expense_auto_deduct'
  | 'expense_auto_refund'
  | 'manual_adjustment';

export interface WalletTransaction {
  id: string;
  type: WalletTxType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletStore {
  savingsBalance: number;
  spendingBalance: number;
  transactions: WalletTransaction[];
}

export interface EmailSettings {
  email: string;
  enabled: boolean;
  resendApiKey?: string;
  lastSentMonth: string | null; // "YYYY-MM"
  lastSentAt: string | null;
}

export interface FavoriteNote {
  id: string;
  date: string;
  rawText: string;
  parsedAmount: number;
}
