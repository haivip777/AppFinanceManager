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

