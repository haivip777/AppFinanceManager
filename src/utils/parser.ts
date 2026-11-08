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
  const trRegex = /(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|trieu|củ|cu)(?![a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9])/iu;
  const trMatch = trimmed.match(trRegex);
  if (trMatch) {
    const num = parseFloat(trMatch[1].replace(',', '.'));
    const amount = Math.round(num * 1_000_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 2: Lít (informal 100k, e.g. 5 lít = 500k)
  const litRegex = /(\d+(?:[.,]\d+)?)\s*(?:lít|lit)(?![a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9])/iu;
  const litMatch = trimmed.match(litRegex);
  if (litMatch) {
    const num = parseFloat(litMatch[1].replace(',', '.'));
    const amount = Math.round(num * 100_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 3: K suffix (e.g. 80k, 55.5k, 30 k)
  const kRegex = /(\d+(?:[.,]\d+)?)\s*k(?![a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9])/iu;
  const kMatch = trimmed.match(kRegex);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    const amount = Math.round(num * 1_000);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 4: Thousands formatted with dot or comma (e.g. 150.000, 45,000 or 150.000đ)
  const dotNumberRegex = /(\d{1,3}(?:[.,]\d{3})+)\s*(?:đ|vnd|đồng)?(?![a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9])/iu;
  const dotMatch = trimmed.match(dotNumberRegex);
  if (dotMatch) {
    const normalized = dotMatch[1].replace(/[.,]/g, '');
    const amount = parseInt(normalized, 10);
    return { amount, hasAmount: true, cleanText: trimmed };
  }

  // Pattern 5: Plain continuous digits >= 1000 (e.g. 75000, 20000)
  const plainNumRegex = /(?<!\d)(\d{4,10})(?!\d)/;
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
  }).format(amount);
}
