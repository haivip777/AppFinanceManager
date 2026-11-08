import { EmailSettings, FinanceStore } from '../types/finance';
import { generateMonthlyExportData } from './exportUtils';
import { formatVND } from './parser';

export const EMAIL_SETTINGS_KEY = 'vibe_email_settings_v1';

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  email: '',
  enabled: true,
  resendApiKey: '',
  lastSentMonth: null,
  lastSentAt: null,
};

export function loadEmailSettings(): EmailSettings {
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(EMAIL_SETTINGS_KEY) : null;
    if (!data) return DEFAULT_EMAIL_SETTINGS;
    return { ...DEFAULT_EMAIL_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    console.error('Failed to load email settings', err);
    return DEFAULT_EMAIL_SETTINGS;
  }
}

export function saveEmailSettings(settings: EmailSettings): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
    }
  } catch (err) {
    console.error('Failed to save email settings', err);
  }
}

/**
 * Calculates previous month string in "YYYY-MM" format.
 * E.g., if date is 2026-11-05, returns "2026-10".
 * If date is 2027-01-04, returns "2026-12".
 */
export function getPreviousMonthKey(referenceDate?: Date): string {
  const d = referenceDate || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  let prevYear = year;
  let prevMonth = month - 1;

  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }

  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

/**
 * Checks whether current day is in or after the auto-report window (from day 4 onwards).
 */
export function isEligibleForAutoReport(referenceDate?: Date): boolean {
  const d = referenceDate || new Date();
  const day = d.getDate();
  // Eligible starting from the 4th of the month onwards
  return day >= 4;
}

export interface SendEmailResult {
  success: boolean;
  message: string;
}

/**
 * Sends or dispatches the monthly report to the recipient's email.
 */
export async function sendMonthlyReportEmail(
  targetEmail: string,
  monthKey: string,
  store: FinanceStore,
  resendApiKey?: string
): Promise<SendEmailResult> {
  const email = targetEmail.trim();
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Địa chỉ email không hợp lệ.' };
  }

  const exportData = generateMonthlyExportData(store, monthKey);
  const [year, month] = monthKey.split('-');
  const subject = `[VibeFinance] Báo cáo chi tiêu tháng ${month}/${year} (Từ 01 đến ngày cuối tháng)`;

  const jsonContent = JSON.stringify(exportData, null, 2);
  const totalAmountFormatted = formatVND(exportData.exportInfo.totalEstimatedExpense);

  const emailBodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px; border-radius: 12px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">📊 Báo Cáo Tài Chính Tháng ${month}/${year}</h2>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Tự động xuất từ VibeFinance Micro-Journal</p>
      </div>

      <div style="padding: 20px 0;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">Tổng chi tiêu ước tính:</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2563eb;">${totalAmountFormatted}</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">Số ngày có ghi chép: <strong>${exportData.exportInfo.totalDaysLogged} ngày</strong></p>
        </div>

        <p style="font-size: 14px; line-height: 1.6;">
          Dữ liệu JSON toàn bộ các khoản chi tiêu từ ngày đầu tiên đến ngày cuối cùng của tháng ${month}/${year} đã được đính kèm bên dưới.
          Bạn có thể tải hoặc copy đoạn JSON này gửi cho ChatGPT, Claude hoặc Gemini để phân tích chi tiết.
        </p>

        <div style="margin-top: 20px;">
          <p style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px;">Dữ liệu JSON:</p>
          <pre style="background: #0f172a; color: #38bdf8; padding: 14px; border-radius: 8px; font-size: 11px; overflow-x: auto; max-height: 300px;">${jsonContent}</pre>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Email này được gửi tự động định kỳ từ VibeFinance.
      </div>
    </div>
  `;

  try {
    // Attempt 1: Call Vercel Serverless Function /api/send-report if available
    const apiResponse = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject,
        html: emailBodyHtml,
        jsonData: jsonContent,
        filename: `vibe_finance_${monthKey.replace('-', '_')}.json`,
        resendApiKey: resendApiKey || undefined,
      }),
    });

    if (apiResponse.ok) {
      return { success: true, message: `Đã gửi báo cáo thành công về ${email}!` };
    }
  } catch {
    // If running purely on local static dev without /api route or serverless, continue to client Resend direct or mock fallback
  }

  // Attempt 2: Direct call to Resend API if user entered their Resend API Key
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VibeFinance <onboarding@resend.dev>',
          to: [email],
          subject,
          html: emailBodyHtml,
          attachments: [
            {
              filename: `vibe_finance_${monthKey.replace('-', '_')}.json`,
              content: btoa(unescape(encodeURIComponent(jsonContent))),
            },
          ],
        }),
      });

      if (res.ok) {
        return { success: true, message: `Đã gửi báo cáo thành công qua Resend về ${email}!` };
      } else {
        const errData = await res.json().catch(() => null);
        return { success: false, message: `Lỗi từ Resend: ${errData?.message || res.statusText}` };
      }
    } catch (err: unknown) {
      return { success: false, message: `Không thể kết nối đến máy chủ gửi email: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  // Fallback / Demonstration mode when no external API key is configured yet
  return {
    success: true,
    message: `Đã xuất báo cáo tháng ${month}/${year}. (Lưu ý: Để gửi email thực tế vào hòm thư, bạn hãy nhập Resend API Key miễn phí trong phần Cài đặt).`,
  };
}
