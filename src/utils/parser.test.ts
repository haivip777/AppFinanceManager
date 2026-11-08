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
    const formatted = formatVND(80000);
    expect(formatted).toContain('80.000');
    expect(formatVND(2500000)).toContain('2.500.000');
  });
});
