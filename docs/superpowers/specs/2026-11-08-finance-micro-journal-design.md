# Design Specification: Vibe Finance Micro-Journal

**Date:** 2026-11-08  
**Topic:** Web-based Personal Finance Micro-Journal with Calendar Filter & Monthly JSON Export for AI Analysis

---

## 1. Overview & Purpose
Một ứng dụng web tinh gọn ("vibe coding"), tối ưu cho việc ghi chép chi tiêu siêu tốc hàng ngày theo luồng suy nghĩ tự nhiên (VD: *"Đổ xăng hết 80k"*, *"Ăn sáng phở bò 40k"*). 

Ứng dụng tự động nhóm chi tiêu theo từng ngày, đóng gói các ngày cũ vào dạng tóm tắt lịch sử, tích hợp bộ lọc Calendar theo tháng, cho phép bổ sung/chỉnh sửa cho các ngày cũ bất cứ lúc nào, và cung cấp nút **Export JSON cả tháng** kèm prompt chuẩn hóa để người dùng đưa thẳng vào AI (ChatGPT/Claude/Gemini) phân tích chi tiêu sâu sắc.

---

## 2. Core User Flows & Requirements

### 2.1. Nhập liệu nhanh (Quick Input Flow)
- Người dùng vào ứng dụng, con trỏ tự động focus vào ô nhập ghi chú.
- Người dùng gõ text tự nhiên (hỗ trợ tiếng Việt) và nhấn `Enter` hoặc click `Thêm`.
- Hệ thống tự động thêm bản ghi vào ngày đang được chọn (mặc định là **Hôm nay**).
- Có thanh preview thời gian thực nhận diện số tiền (VD: gõ *"Đổ xăng 80k"* -> hiển thị badge *"Phát hiện: 80,000 đ"*).

### 2.2. Ghi chú & Bổ sung cho các ngày cũ (Past Days Logging & Editing)
- Người dùng có thể click vào bất kỳ ngày nào trong quá khứ trên Calendar:
  - Thanh nhập liệu sẽ chuyển ngữ cảnh: *"Đang thêm ghi chú bổ sung cho ngày [DD/MM/YYYY]"* kèm nút *"Quay về hôm nay"*.
  - Người dùng nhập text và nhấn Enter -> ghi chú được gán vào ngày quá khứ đó ngay lập tức.
  - Cho phép sửa trực tiếp (inline edit) hoặc xóa ghi chú trên ngày cũ nếu ghi nhầm.

### 2.3. Quản lý trạng thái Ngày (Active vs Closed Days)
- **Hôm nay (Today)**: Trạng thái Active, mở rộng toàn bộ, hỗ trợ nhập liệu tức thì.
- **Các ngày trước (Past Days)**: Mặc định ở dạng card tóm tắt (Closed/Collapsed: hiển thị Ngày, tổng tiền, số lượng khoản chi). Khi người dùng click chọn hoặc click mở rộng thì xem toàn bộ danh sách chi tiết của ngày đó.

### 2.4. Bộ lọc Calendar theo Tháng (Month Calendar Navigation)
- Hiển thị lịch tháng dạng Grid (Thứ 2 đến Chủ Nhật).
- Nút chuyển tháng trước/sau (`< Tháng 11/2026 >`).
- Ngày hôm nay có viền highlight đặc biệt.
- Ngày có ghi chép chi tiêu có chấm hiển thị màu sắc và tổng chi nhỏ bên dưới.
- Hiển thị thống kê tổng quan cả tháng: Tổng chi tiêu ước tính, tổng số khoản ghi chép.

### 2.5. Export JSON cho AI & Prompt Companion
- Nút **"Export JSON Tháng [MM/YYYY]"**: Tải về file `finance_notes_YYYY_MM.json` chứa dữ liệu toàn bộ các ngày trong tháng đó.
- Nút **"Copy Prompt cho AI"**: Copy nhanh mẫu prompt phân tích tài chính chuyên sâu để người dùng đính kèm file JSON gửi cho AI.

---

## 3. Data Architecture & Schema

### 3.1. LocalStorage Schema
Lưu trữ toàn bộ dữ liệu ở key `vibe_finance_data_v1` theo cấu trúc Map ngày:
```typescript
export interface FinanceItem {
  id: string; // uuid hoặc timestamp string (VD: "item_1731057600000")
  rawText: string; // "Đổ xăng hết 80k"
  parsedAmount: number; // 80000 (0 nếu không tìm thấy số tiền)
  createdAt: string; // ISO 8601 string (VD: "2026-11-08T08:15:00.000Z")
  timeStr: string; // "08:15"
}

export interface DayRecord {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  totalAmount: number;
  items: FinanceItem[];
}

export interface FinanceDataStore {
  [dateKey: string]: DayRecord; // dateKey: "YYYY-MM-DD"
}
```

### 3.2. Vietnamese Currency NLP Parser
Bộ bóc tách số tiền thông minh regex nhận diện:
- Đuôi `k`, `K`: `80k` -> 80,000; `150.5k` -> 150,500
- Đuôi `tr`, `triệu`: `1.5tr` -> 1,500,000; `2 triệu` -> 2,000,000
- Đuôi `củ`, `lít`: `2 củ` -> 2,000,000; `5 lít` -> 500,000
- Số phân cách dấu chấm/phẩy: `80.000`, `80,000`, `80000` -> 80,000
- Nếu không tìm thấy số tiền: trả về `0` (vẫn lưu lại dưới dạng text note thông thường).

### 3.3. JSON Export Format (Ready for AI)
```json
{
  "exportInfo": {
    "appName": "VibeFinance",
    "version": "1.0",
    "month": "2026-11",
    "exportedAt": "2026-11-08T18:30:00.000Z",
    "totalDaysLogged": 12,
    "totalEstimatedExpense": 4850000,
    "currency": "VND"
  },
  "dailyRecords": [
    {
      "date": "2026-11-07",
      "dayOfWeek": "Thứ Bảy",
      "dayTotal": 125000,
      "entries": [
        {
          "time": "08:30",
          "content": "Đổ xăng hết 80k",
          "amount": 80000
        },
        {
          "time": "12:15",
          "content": "Ăn trưa cơm tấm 45k",
          "amount": 45000
        }
      ]
    }
  ]
}
```

---

## 4. UI Layout & Component Architecture

### 4.1. Công nghệ (Tech Stack)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React (`lucide-react`)
- **Date Handling**: date-fns hoặc pure JS native Date (đơn giản, nhẹ nhàng, không phình bundle)
- **Local Storage**: Đồng bộ an toàn qua Custom Hook `useFinanceStore`

### 4.2. Component Breakdown
1. `App`: Root layout (Split-view trên màn hình lớn, Tabs/Stack trên màn hình di động).
2. `Header`: Tên ứng dụng, widget đồng hồ/ngày, nút Export JSON tháng & Copy AI Prompt, nút Reset/Dữ liệu mẫu (nếu cần test).
3. `CalendarSidebar`:
   - Thanh điều hướng Tháng (`< Tháng MM/YYYY >`).
   - Month Calendar Grid hiển thị các ngày trong tháng, badge trạng thái, chấm indicator.
   - Month Summary Card (Tổng chi tiêu tháng, số ngày hoạt động).
4. `QuickInputBar`:
   - Thanh input lớn, thông báo ngày đang nhận dữ liệu (Hôm nay hay Bổ sung ngày cũ).
   - Nút "Quay về hôm nay" nếu đang chọn ngày cũ.
   - Live badge xem trước số tiền bóc tách được.
5. `DailyLogView`:
   - Header ngày được chọn + tổng tiền ngày.
   - Danh sách các item trong ngày: hiển thị giờ, nội dung, badge tiền, nút chỉnh sửa/xóa.
   - Trạng thái rỗng (Empty state) thân thiện nếu ngày chưa có ghi chép.
6. `ExportModal` / Quick Toast: Thông báo khi xuất file JSON thành công và clipboard copy prompt.

---

## 5. Error Handling & Edge Cases
- **Nhập rỗng hoặc chỉ có dấu cách**: Bỏ qua không thêm, giữ focus ô input.
- **Ngày chuyển giao qua 00:00 đêm**: Tự động nhận diện ngày mới theo giờ hệ thống của máy người dùng, giữ an toàn dữ liệu ngày cũ.
- **LocalStorage Quota**: Ứng dụng chỉ lưu text gọn nhẹ (dữ liệu 1 năm chỉ tốn < 1MB), hỗ trợ Backup toàn bộ / Khôi phục file JSON nếu người dùng muốn dọn dẹp hoặc chuyển máy.

---

## 6. Verification & Testing Strategy
1. **Kiểm thử Parser Regex**: Kiểm tra các mẫu câu thực tế (`Đổ xăng 80k`, `Tiền trọ 2.5tr`, `Cafe 35k`, `Gặp bạn ăn nhậu 350.000đ`, `Đi dạo công viên`).
2. **Kiểm thử Thêm vào ngày cũ**: Chọn ngày hôm qua trên calendar -> thêm note -> kiểm tra dữ liệu đã lưu chính xác vào ngày hôm qua.
3. **Kiểm thử Export JSON**: Kiểm tra file JSON xuất ra mở được, đúng tháng, đúng tổng tiền và cấu trúc chuẩn cho AI.
4. **Kiểm thử Responsive UI**: Đảm bảo layout hiển thị đẹp trên cả màn hình Desktop và Mobile.
