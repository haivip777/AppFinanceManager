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
    expect(prompt).toContain('PHÂN LOẠI CHI TIÊU');
    expect(prompt).toContain('cắt giảm');
  });
});
