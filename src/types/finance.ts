export interface FinanceItem {
  id: string;
  rawText: string;
  parsedAmount: number;
  timeStr: string;
  createdAt: string;
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

