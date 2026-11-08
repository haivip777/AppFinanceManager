import React from 'react';
import { X, Sparkles, CheckCircle2, Rocket } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const updates = [
    {
      title: 'Danh sách Yêu thích (Whitelist)',
      badge: 'Mới',
      desc: 'Bấm biểu tượng trái tim ❤️ ở bất kỳ ghi chú nào để lưu vào Whitelist. Nút trái tim trên thanh công cụ cho phép xem toàn bộ ghi chú đã lưu kèm ngày ghi.',
    },
    {
      title: 'Chuyển ghi chú sang ngày khác',
      badge: 'Mới',
      desc: 'Tick chọn 1 hoặc nhiều ghi chú và bấm "Chuyển sang ngày khác" nếu lỡ nhập nhầm ngày. Hỗ trợ chọn nhanh Hôm qua / Hôm nay / Ngày mai.',
    },
    {
      title: 'Dropdown Đổi Giao Diện Sáng / Tối',
      badge: 'Cải tiến',
      desc: 'Bấm vào menu chọn giao diện để chuyển đổi tức thì giữa Theme Sáng (Tech Blue), Theme Tối, hoặc Tự động theo hệ thống máy tính.',
    },
    {
      title: 'Quản lý 2 Ví Tài Chính (Tiết Kiệm & Chi Tiêu)',
      badge: 'Tính năng',
      desc: 'Thêm tab Ví của tôi: Phân chia Tiết kiệm & Chi tiêu. Ví chi tiêu sẽ tự động trừ khi bạn thêm ghi chú ở tab Nhật ký.',
    },
    {
      title: 'Tự động gửi báo cáo JSON về Gmail mùng 4-6',
      badge: 'Tính năng',
      desc: 'Cứ mỗi khi mở web vào khoảng mùng 4-6 hàng tháng, hệ thống sẽ tự động xuất JSON tháng trước gửi thẳng về Gmail của bạn.',
    },
    {
      title: 'Tinh chỉnh UI/UX gọn gàng',
      badge: 'Tối ưu',
      desc: 'Ẩn bớt giờ ghi chú cho thoáng mắt, hover cả dòng là cursor pointer, di chuyển Export JSON vào trong phần Cài đặt cho gọn thanh header.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Nhật Ký Cập Nhật Phiên Bản
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  v1.3.0 Mới Nhất
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Những tính năng mới vừa được triển khai trong lần deploy này
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Updates List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {updates.map((up, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {up.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                    {up.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {up.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Tự động triển khai bởi Vercel
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
