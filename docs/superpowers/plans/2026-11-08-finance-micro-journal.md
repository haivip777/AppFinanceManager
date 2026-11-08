# Vibe Finance Micro-Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web ghi chép tài chính cá nhân siêu tốc ("vibe micro-journal") với khả năng nhận diện số tiền tiếng Việt, lọc theo Calendar tháng, thêm/sửa ghi chú cho ngày cũ, và nút xuất JSON chuẩn hoá cho AI phân tích.

**Architecture:** Single Page Application (React 18 + TypeScript + Vite + Tailwind CSS) chạy trực tiếp trên client, lưu trữ an toàn qua LocalStorage. Hệ thống tách bạch thành các module độc lập: Bộ phân tích tiền NLP regex (`parser.ts`), Quản lý dữ liệu LocalStorage (`storage.ts`), Thành phần Calendar (`CalendarView.tsx`), Thanh nhập liệu siêu tốc (`QuickInput.tsx`), Danh sách chi tiêu (`DailyList.tsx`), và Bộ xuất file JSON + AI Prompt (`exportUtils.ts`).

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React (`lucide-react`), Vitest (kiểm thử đơn vị).

---

## File Structure Map
- `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`: Project configuration and dependencies.
- `src/types/finance.ts`: Core data structures (`FinanceItem`, `DayRecord`, `FinanceStore`, `MonthlyExportData`).
- `src/utils/parser.ts` & `src/utils/parser.test.ts`: Regex parser for Vietnamese financial phrases (`80k`, `1.5tr`, `2 củ`, `80.000`...) and currency formatter.
- `src/utils/storage.ts` & `src/utils/storage.test.ts`: LocalStorage management, CRUD operations for any date, monthly data querying.
- `src/utils/exportUtils.ts`: JSON generator formatted for AI prompts and prompt copy helper.
- `src/components/Header.tsx`: Top bar with month switcher, Export JSON button, Copy AI Prompt button.
- `src/components/CalendarView.tsx`: Mini calendar grid with expense dots, today badge, and day selector.
- `src/components/QuickInput.tsx`: Natural language input with live parsed amount preview and past-day indicator.
- `src/components/DailyList.tsx`: List of entries for the active day with edit/delete actions and totals.
- `src/components/ExportModal.tsx`: Modal displaying export summary and previewing JSON / AI prompt.
- `src/App.tsx`: Main application integrating calendar sidebar and activity feed.
- `src/main.tsx`, `src/index.css`: Tailwind directives and React DOM entry.

---

### Task 1: Scaffold Project with Vite, React, TypeScript, Tailwind CSS & Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/index.css`, `src/App.tsx`

- [ ] **Step 1: Create package.json with dependencies**

```json
{
  "name": "app-finance-manager",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create Vite and TypeScript configurations**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
});
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Create Tailwind CSS and PostCSS configurations**

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Create index.html, index.css, and main.tsx entry points**

Create `index.html`:
```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vibe Finance - Ghi Chép Tài Chính Siêu Tốc</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
  background-color: #0b0f19;
  color: #f1f5f9;
}
```

Create `src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Create temporary `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-emerald-400">Vibe Finance</h1>
      <p className="text-slate-400 mt-2">Ghi chép tài chính siêu tốc cho AI phân tích</p>
    </div>
  )
}
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully, `node_modules` generated.

- [ ] **Step 6: Verify build and test runner**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold project with React, Vite, Tailwind CSS and Vitest"
```

---

### Task 2: Vietnamese Financial Text Parser & Formatter (TDD)

**Files:**
- Create: `src/types/finance.ts`
- Create: `src/utils/parser.ts`
- Test: `src/utils/parser.test.ts`

- [ ] **Step 1: Define core finance types**

Create `src/types/finance.ts`:
```typescript
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
```

- [ ] **Step 2: Write failing unit test for parser**

Create `src/utils/parser.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parseFinancialText, formatVND } from './parser';

describe('Financial Text NLP Parser', () => {
  it('parses "k" and "K" suffixes correctly', () => {
    expect(parseFinancialText('Đổ xăng 80k').amount).toBe(80000);
    expect(parseFinancialText('Ăn sáng 35K').amount).toBe(35000);
    expect(parseFinancialText('Mua trà sữa 55.5k').amount).toBe(55500);
  });

  it('parses "tr", "triệu" suffixes correctly', () => {
    expect(parseFinancialText('Tiền trọ 2.5tr').amount).toBe(2500000);
    expect(parseFinancialText('Mua màn hình 3.2 triệu').amount).toBe(3200000);
    expect(parseFinancialText('Lương về 15tr').amount).toBe(15000000);
  });

  it('parses informal Vietnamese slang "củ", "lít"', () => {
    expect(parseFinancialText('Cho bạn vay 2 củ').amount).toBe(2000000);
    expect(parseFinancialText('Thay lốp xe 5 lít').amount).toBe(500000);
  });

  it('parses standard numbers with dots or commas', () => {
    expect(parseFinancialText('Đi siêu thị hết 150.000đ').amount).toBe(150000);
    expect(parseFinancialText('Mua bánh 45,000').amount).toBe(45000);
    expect(parseFinancialText('Grab 75000').amount).toBe(75000);
  });

  it('handles notes without any amount gracefully', () => {
    const res = parseFinancialText('Hôm nay đi dạo không tiêu gì');
    expect(res.amount).toBe(0);
    expect(res.hasAmount).toBe(false);
  });

  it('formats numbers into readable VND strings', () => {
    expect(formatVND(80000)).toBe('80.000 ₫');
    expect(formatVND(2500000)).toBe('2.500.000 ₫');
    expect(formatVND(0)).toBe('0 ₫');
  });
});
```

- [ ] **Step 3: Run test to verify failure**

Run: `npm run test`
Expected: FAIL with "Cannot find module './parser'"

- [ ] **Step 4: Implement parser and currency formatter**

Create `src/utils/parser.ts`:
```typescript
export interface ParseResult {
  amount: number;
  hasAmount: boolean;
  cleanText: string;
}

/**
 * Extracts estimated monetary amount from natural language Vietnamese notes.
 * Supports: 80k, 35K, 2.5tr, 15 triệu, 2 củ, 5 lít, 150.000, 45,000, etc.
 */
export function parseFinancialText(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { amount: 0, hasAmount: false, cleanText: '' };
  }

  // Pattern 1: Triệu / tr / củ (e.g. 2.5tr, 2 triệu, 1.2 củ)
  const trRegex = /(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|củ)\b/i;
  const trMatch = trimmed.match(trRegex);
  if (trMatch) {
    const num = parseFloat(trMatch[1].replace(',', '.'));
    const amount = Math.round(num * 1_000_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 2: Lít (informal 100k, e.g. 5 lít = 500k)
  const litRegex = /(\d+(?:[.,]\d+)?)\s*lít\b/i;
  const litMatch = trimmed.match(litRegex);
  if (litMatch) {
    const num = parseFloat(litMatch[1].replace(',', '.'));
    const amount = Math.round(num * 100_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 3: K suffix (e.g. 80k, 55.5k, 30 k)
  const kRegex = /(\d+(?:[.,]\d+)?)\s*k\b/i;
  const kMatch = trimmed.match(kRegex);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    const amount = Math.round(num * 1_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 4: Thousands formatted with dot or comma (e.g. 150.000, 45,000 or 150.000đ)
  const dotNumberRegex = /(\d{1,3}(?:[.,]\d{3})+)\s*(?:đ|vnd|đồng)?\b/i;
  const dotMatch = trimmed.match(dotNumberRegex);
  if (dotMatch) {
    const normalized = dotMatch[1].replace(/[.,]/g, '');
    const amount = parseInt(normalized, 10);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 5: Plain continuous digits >= 1000 (e.g. 75000, 20000)
  const plainNumRegex = /\b(\d{4,10})\b/;
  const plainMatch = trimmed.match(plainNumRegex);
  if (plainMatch) {
    const amount = parseInt(plainMatch[1], 10);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  return { amount: 0, hasAmount: false, cleanText: trimmed };
}

/**
 * Formats a number to Vietnamese standard currency string (e.g., 80.000 ₫)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', '₫');
}
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npm run test`
Expected: PASS with 6 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/types/finance.ts src/utils/parser.ts src/utils/parser.test.ts
git commit -m "feat: implement Vietnamese financial text parser and currency formatter with unit tests"
```

---

### Task 3: LocalStorage Management & Store Operations

**Files:**
- Create: `src/utils/storage.ts`
- Test: `src/utils/storage.test.ts`

- [ ] **Step 1: Write test for storage operations**

Create `src/utils/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStore,
  saveStore,
  addFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
  getMonthSummary,
  getEntriesForDate,
  STORAGE_KEY
} from './storage';

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
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test`
Expected: FAIL with "Cannot find module './storage'"

- [ ] **Step 3: Implement storage module**

Create `src/utils/storage.ts`:
```typescript
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
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load store from localStorage', err);
    return {};
  }
}

export function saveStore(store: FinanceStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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
```

- [ ] **Step 4: Run tests and verify all pass**

Run: `npm run test`
Expected: PASS with 11 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.ts src/utils/storage.test.ts
git commit -m "feat: implement storage module with CRUD operations and unit tests"
```

---

### Task 4: Export JSON & AI Prompt Companion Generator

**Files:**
- Create: `src/utils/exportUtils.ts`
- Test: `src/utils/exportUtils.test.ts`

- [ ] **Step 1: Write test for Export JSON and Prompt generation**

Create `src/utils/exportUtils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateMonthlyExportData, getAIPromptTemplate } from './exportUtils';
import { FinanceStore } from '../types/finance';

describe('Export JSON and AI Prompt Utils', () => {
  const mockStore: FinanceStore = {
    '2026-11-07': {
      date: '2026-11-07',
      isClosed: true,
      totalAmount: 125000,
      items: [
        { id: '1', rawText: 'Đổ xăng 80k', parsedAmount: 80000, timeStr: '08:30', createdAt: '2026-11-07T08:30:00Z' },
        { id: '2', rawText: 'Cơm tấm 45k', parsedAmount: 45000, timeStr: '12:00', createdAt: '2026-11-07T12:00:00Z' },
      ],
    },
    '2026-10-30': {
      date: '2026-10-30',
      isClosed: true,
      totalAmount: 50000,
      items: [{ id: '3', rawText: 'Cafe 50k', parsedAmount: 50000, timeStr: '09:00', createdAt: '2026-10-30T09:00:00Z' }],
    },
  };

  it('generates accurate monthly export JSON filtered by month', () => {
    const exportData = generateMonthlyExportData(mockStore, '2026-11');
    expect(exportData.exportInfo.month).toBe('2026-11');
    expect(exportData.exportInfo.totalEstimatedExpense).toBe(125000);
    expect(exportData.exportInfo.totalDaysLogged).toBe(1);
    expect(exportData.dailyRecords.length).toBe(1);
    expect(exportData.dailyRecords[0].date).toBe('2026-11-07');
    expect(exportData.dailyRecords[0].entries.length).toBe(2);
  });

  it('provides comprehensive AI prompt containing analysis instructions', () => {
    const prompt = getAIPromptTemplate('2026-11');
    expect(prompt).toContain('tháng 11/2026');
    expect(prompt).toContain('Phân loại các nhóm chi tiêu');
    expect(prompt).toContain('cắt giảm');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test`
Expected: FAIL with "Cannot find module './exportUtils'"

- [ ] **Step 3: Implement exportUtils**

Create `src/utils/exportUtils.ts`:
```typescript
import { FinanceStore } from '../types/finance';

export interface MonthlyExportData {
  exportInfo: {
    appName: string;
    version: string;
    month: string; // YYYY-MM
    exportedAt: string;
    totalDaysLogged: number;
    totalEstimatedExpense: number;
    currency: string;
  };
  dailyRecords: Array<{
    date: string;
    dayOfWeek: string;
    dayTotal: number;
    entries: Array<{
      time: string;
      content: string;
      amount: number;
    }>;
  }>;
}

const DAYS_OF_WEEK_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function getDayOfWeekVi(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS_OF_WEEK_VI[d.getDay()] || '';
}

export function generateMonthlyExportData(store: FinanceStore, monthKey: string): MonthlyExportData {
  const filteredDates = Object.keys(store)
    .filter((d) => d.startsWith(monthKey) && store[d].items.length > 0)
    .sort();

  let totalExpense = 0;

  const dailyRecords = filteredDates.map((dateStr) => {
    const day = store[dateStr];
    totalExpense += day.totalAmount;

    return {
      date: dateStr,
      dayOfWeek: getDayOfWeekVi(dateStr),
      dayTotal: day.totalAmount,
      entries: day.items.map((item) => ({
        time: item.timeStr,
        content: item.rawText,
        amount: item.parsedAmount,
      })),
    };
  });

  return {
    exportInfo: {
      appName: 'VibeFinance',
      version: '1.0',
      month: monthKey,
      exportedAt: new Date().toISOString(),
      totalDaysLogged: dailyRecords.length,
      totalEstimatedExpense: totalExpense,
      currency: 'VND',
    },
    dailyRecords,
  };
}

export function downloadMonthlyJSON(store: FinanceStore, monthKey: string): void {
  const data = generateMonthlyExportData(store, monthKey);
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `vibe_finance_${monthKey.replace('-', '_')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function getAIPromptTemplate(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `Tôi gửi bạn file JSON đính kèm chứa toàn bộ nhật ký chi tiêu tài chính cá nhân trong tháng ${month}/${year}.

Hãy đóng vai trò là một Cố Vấn Tài Chính Cá Nhân & Chuyên Gia Phân Tích Dữ Liệu chuyên nghiệp, giúp tôi thực hiện các bước sau:

1. 📊 TỔNG HỢP & PHÂN LOẠI CHI TIÊU:
- Bóc tách toàn bộ các khoản chi tiêu và phân loại vào các nhóm hợp lý (ví dụ: Ăn uống, Di chuyển/Xăng xe, Mua sắm cá nhân, Nhà cửa & Hóa đơn, Giao lưu bạn bè, Phát sinh khác).
- Tính tổng số tiền và tỷ lệ % cho từng danh mục.
- Tìm ra 3 ngày có mức chi tiêu cao nhất và giải thích nguyên nhân.

2. 🔍 ĐÁNH GIÁ SỰ HỢP LÝ & CẢNH BÁO LÃNG PHÍ:
- Chỉ ra các khoản chi lặt vặt (latte factor) nhưng tích tiểu thành đại.
- Khoản chi nào có dấu hiệu bất thường hoặc lãng phí có thể cắt giảm?

3. 💡 KẾ HOẠCH HÀNH ĐỘNG CHO THÁNG TỚI:
- Đề xuất hạn mức ngân sách hợp lý theo quy tắc (ví dụ: 50/30/20).
- Đưa ra 3 lời khuyên tài chính cụ thể, thực tế nhất để tôi tiết kiệm tốt hơn trong tháng tiếp theo.

Vui lòng trình bày bằng bảng biểu rõ ràng và giọng văn súc tích, thân thiện!`;
}
```

- [ ] **Step 4: Run test and verify all pass**

Run: `npm run test`
Expected: PASS with 13 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/utils/exportUtils.ts src/utils/exportUtils.test.ts
git commit -m "feat: implement monthly JSON export and AI analysis prompt generator"
```

---

### Task 5: Calendar Sidebar Component (Month Grid & Day Selection)

**Files:**
- Create: `src/components/CalendarView.tsx`

- [ ] **Step 1: Implement CalendarView component**

Create `src/components/CalendarView.tsx`:
```tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { FinanceStore, MonthSummary } from '../types/finance';
import { formatVND } from '../utils/parser';
import { getTodayKey } from '../utils/storage';

interface CalendarViewProps {
  currentMonthKey: string; // "YYYY-MM"
  onMonthChange: (newMonthKey: string) => void;
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  store: FinanceStore;
  summary: MonthSummary;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonthKey,
  onMonthChange,
  selectedDate,
  onSelectDate,
  store,
  summary,
}) => {
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const todayKey = getTodayKey();

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const daysArray: Array<{ dateKey: string; dayNum: number } | null> = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    daysArray.push({
      dateKey: `${yearStr}-${monthStr}-${dayStr}`,
      dayNum: d,
    });
  }

  const weekHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-5 backdrop-blur-md">
      {/* Month Switcher Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-lg">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <span>Tháng {month}/{year}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Tháng sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
        {weekHeaders.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysArray.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const { dateKey, dayNum } = cell;
          const dayData = store[dateKey];
          const hasEntries = dayData && dayData.items.length > 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          let btnClass = "h-11 rounded-xl flex flex-col items-center justify-center text-xs relative transition-all duration-150 ";

          if (isSelected) {
            btnClass += "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 ";
          } else if (isToday) {
            btnClass += "bg-slate-800 text-emerald-400 font-bold border border-emerald-500/50 hover:bg-slate-700 ";
          } else if (hasEntries) {
            btnClass += "bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-medium ";
          } else {
            btnClass += "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 ";
          }

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={btnClass}
            >
              <span>{dayNum}</span>
              {hasEntries && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly Summary Card */}
      <div className="mt-2 bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tổng chi tiêu tháng {month}
          </span>
          <span className="text-slate-500">{summary.daysWithRecordsCount} ngày ghi</span>
        </div>
        <div className="text-2xl font-extrabold text-emerald-400">
          {formatVND(summary.totalExpense)}
        </div>
        <div className="text-xs text-slate-500">
          {summary.totalItemsCount} khoản giao dịch đã lưu
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CalendarView.tsx
git commit -m "feat: implement interactive calendar sidebar component with monthly stats"
```

---

### Task 6: Quick Input & Live Parser Preview Component

**Files:**
- Create: `src/components/QuickInput.tsx`

- [ ] **Step 1: Implement QuickInput component**

Create `src/components/QuickInput.tsx`:
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, Zap, CalendarClock } from 'lucide-react';
import { parseFinancialText, formatVND } from '../utils/parser';
import { getTodayKey } from '../utils/storage';

interface QuickInputProps {
  selectedDate: string; // "YYYY-MM-DD"
  onAddEntry: (text: string, date: string) => void;
  onResetToToday: () => void;
}

export const QuickInput: React.FC<QuickInputProps> = ({
  selectedDate,
  onAddEntry,
  onResetToToday,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const todayKey = getTodayKey();
  const isPastDay = selectedDate < todayKey;
  const isFutureDay = selectedDate > todayKey;
  const isToday = selectedDate === todayKey;

  const parsed = parseFinancialText(inputText);

  // Auto focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedDate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onAddEntry(inputText, selectedDate);
    setInputText('');
  };

  const formatDateLabel = (dStr: string) => {
    const [y, m, d] = dStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Target Date Context Banner */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" />
              Đang ghi cho Hôm nay ({formatDateLabel(selectedDate)})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
              <CalendarClock className="w-3.5 h-3.5" />
              {isPastDay ? 'Bổ sung ghi chú cho ngày cũ:' : 'Ghi chú cho ngày:'} {formatDateLabel(selectedDate)}
            </span>
          )}
        </div>

        {!isToday && (
          <button
            onClick={onResetToToday}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition text-xs font-medium py-1 px-2 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về hôm nay
          </button>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Gõ nhanh ghi chú... (VD: 'Đổ xăng 80k', 'Ăn phở 45k', 'Tiền điện 450k')"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm</span>
        </button>
      </form>

      {/* Live Parser Preview Indicator */}
      {inputText.trim() && (
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="text-slate-400">Phát hiện số tiền:</span>
          {parsed.hasAmount ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {formatVND(parsed.amount)}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
              Chưa có số tiền (lưu ghi chú thuần)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QuickInput.tsx
git commit -m "feat: implement QuickInput component with live parsing and past-day indicator"
```

---

### Task 7: Daily Log List & Entry Actions Component

**Files:**
- Create: `src/components/DailyList.tsx`

- [ ] **Step 1: Implement DailyList component**

Create `src/components/DailyList.tsx`:
```tsx
import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Clock, AlertCircle } from 'lucide-react';
import { FinanceItem } from '../types/finance';
import { formatVND } from '../utils/parser';
import { getDayOfWeekVi } from '../utils/exportUtils';
import { getTodayKey } from '../utils/storage';

interface DailyListProps {
  selectedDate: string;
  items: FinanceItem[];
  totalAmount: number;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, newText: string) => void;
}

export const DailyList: React.FC<DailyListProps> = ({
  selectedDate,
  items,
  totalAmount,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const todayKey = getTodayKey();
  const isToday = selectedDate === todayKey;
  const isPastDay = selectedDate < todayKey;
  const dayOfWeek = getDayOfWeekVi(selectedDate);

  const [y, m, d] = selectedDate.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  const startEdit = (item: FinanceItem) => {
    setEditingId(item.id);
    setEditText(item.rawText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (itemId: string) => {
    if (!editText.trim()) return;
    onUpdateItem(itemId, editText);
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Day Header with Status and Daily Total */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">
              {isToday ? 'Hôm nay' : dayOfWeek}, {formattedDate}
            </h2>
            {isPastDay && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Đã đóng lịch sử
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length > 0 ? `${items.length} khoản ghi chú` : 'Chưa có ghi chép nào'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Tổng ngày:</div>
          <div className="text-xl font-extrabold text-emerald-400">
            {formatVND(totalAmount)}
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
          <AlertCircle className="w-8 h-8 text-slate-600" />
          <p className="text-sm">Chưa có khoản chi tiêu nào trong ngày này.</p>
          <p className="text-xs text-slate-600">Gõ vào ô bên trên để thêm ghi chép bất kỳ lúc nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="group bg-slate-950/70 border border-slate-800/70 hover:border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-150"
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(item.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                      title="Lưu"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Hủy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-slate-500 text-xs shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeStr}</span>
                      </div>
                      <div className="text-sm text-slate-200 font-medium truncate">
                        {item.rawText}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.parsedAmount > 0 && (
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          {formatVND(item.parsedAmount)}
                        </span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DailyList.tsx
git commit -m "feat: implement DailyList component with inline editing and delete"
```

---

### Task 8: Header, Export Modal, App Integration & Verification

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/ExportModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Header component**

Create `src/components/Header.tsx`:
```tsx
import React from 'react';
import { Download, Bot, Wallet } from 'lucide-react';

interface HeaderProps {
  currentMonthKey: string;
  onOpenExportModal: () => void;
  onCopyPrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onOpenExportModal,
  onCopyPrompt,
}) => {
  const [year, month] = currentMonthKey.split('-');

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              VibeFinance
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AI Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">Micro-Journal ghi chép tài chính siêu tốc</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopyPrompt}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition shadow-sm"
            title="Sao chép mẫu Prompt để gửi kèm file JSON cho AI"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Copy Prompt cho AI</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export JSON Tháng {month}/{year}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Implement ExportModal component**

Create `src/components/ExportModal.tsx`:
```tsx
import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson } from 'lucide-react';
import { FinanceStore } from '../types/finance';
import { generateMonthlyExportData, downloadMonthlyJSON, getAIPromptTemplate } from '../utils/exportUtils';
import { formatVND } from '../utils/parser';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: FinanceStore;
  currentMonthKey: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  store,
  currentMonthKey,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const exportData = generateMonthlyExportData(store, currentMonthKey);
  const prompt = getAIPromptTemplate(currentMonthKey);
  const [year, month] = currentMonthKey.split('-');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    downloadMonthlyJSON(store, currentMonthKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Export Dữ Liệu Tháng {month}/{year}
              </h3>
              <p className="text-xs text-slate-400">File JSON chuẩn hóa sẵn sàng gửi cho AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Tổng chi tiêu ước tính:</span>
            <div className="text-emerald-400 font-extrabold text-base mt-0.5">
              {formatVND(exportData.exportInfo.totalEstimatedExpense)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Số ngày có ghi chép:</span>
            <div className="text-slate-200 font-bold text-base mt-0.5">
              {exportData.exportInfo.totalDaysLogged} ngày
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Tải File .JSON Về Máy</span>
          </button>

          <button
            onClick={handleCopyPrompt}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Đã copy prompt vào clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Prompt hướng dẫn AI phân tích</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Integrate components into App.tsx**

Update `src/App.tsx`:
```tsx
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
```

- [ ] **Step 4: Run build and unit tests to verify integration**

Run: `npm run test`
Expected: All tests pass.

Run: `npm run build`
Expected: TypeScript and Vite build complete with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/ExportModal.tsx src/App.tsx
git commit -m "feat: complete app integration with header, export modal, and responsive layout"
```

