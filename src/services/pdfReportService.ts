import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AppointmentRecord, AppointmentStatus, PaymentStatus } from '@/types/admin';

export interface ExportReportOptions {
  branchId?: string;
  branchName?: string;
  appointments: AppointmentRecord[];
  dateRangeLabel?: string;
  generatedByEmail?: string;
}

// Arabic Branch Name Resolver
function resolveBranchName(branchId?: string, fallbackName?: string): string {
  if (!branchId || branchId === 'all') return 'جميع الفروع';
  switch (branchId) {
    case 'nasr-city':
      return 'مدينة نصر - البرج الطبي';
    case 'tagamoa':
      return 'التجمع الخامس (مكتب د. هشام)';
    case 'sheikh-zayed':
      return 'الشيخ زايد - الكارما';
    case 'heliopolis':
      return 'مصر الجديدة - الكوربة';
    default:
      return fallbackName || branchId;
  }
}

// Arabic Status Helpers
function getArabicStatus(status: AppointmentStatus): { label: string; bg: string; color: string; border: string } {
  switch (status) {
    case 'confirmed':
      return { label: 'مؤكد', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
    case 'completed':
      return { label: 'مكتمل', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
    case 'cancelled':
      return { label: 'ملغي', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
    case 'pending':
    default:
      return { label: 'قيد الانتظار', bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
  }
}

function getArabicPaymentStatus(paymentStatus: PaymentStatus): { label: string; bg: string; color: string; border: string } {
  switch (paymentStatus) {
    case 'paid':
      return { label: 'تم التحصيل', bg: '#ecfdf5', color: '#047857', border: '#6ee7b7' };
    case 'partial':
      return { label: 'سداد جزئي', bg: '#fffbeb', color: '#b45309', border: '#fcd34d' };
    case 'pending':
    case 'معلق':
      return { label: 'معلق', bg: '#f8fafc', color: '#475569', border: '#cbd5e1' };
    case 'unpaid':
    default:
      return { label: 'غير مدفوع', bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' };
  }
}

function getArabicPaymentMethod(method?: string): string {
  if (!method) return '-';
  const m = method.toLowerCase();
  if (m.includes('vodafone') || m.includes('cash_vodafone') || m.includes('فودافون')) return 'فودافون كاش';
  if (m.includes('insta') || m.includes('انستا')) return 'انستاباي';
  if (m.includes('cash') || m.includes('نقدا') || m.includes('كاش')) return 'نقداً بالعيادة';
  if (m.includes('card') || m.includes('فيزا') || m.includes('بطاقة')) return 'بطاقة بنكية';
  return method;
}

// Ensure Arabic Web Fonts are injected and ready
async function ensureArabicFontReady(): Promise<void> {
  if (!document.getElementById('androderma-arabic-font-link')) {
    const link = document.createElement('link');
    link.id = 'androderma-arabic-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
    document.head.appendChild(link);
  }
  if (document.fonts) {
    try {
      await document.fonts.ready;
      await Promise.allSettled([
        document.fonts.load('400 12px Cairo'),
        document.fonts.load('600 12px Cairo'),
        document.fonts.load('700 12px Cairo'),
        document.fonts.load('800 14px Cairo'),
        document.fonts.load('900 18px Cairo'),
        document.fonts.load('700 12px Tajawal'),
      ]);
      await document.fonts.ready;
    } catch {
      // Continue even if font ready promise fails
    }
  }
}

/**
 * Generates and downloads a fully localized, high-resolution Arabic PDF report
 * with proper Right-to-Left (RTL) layout, styled summary KPIs, and tabular format.
 */
export async function exportAppointmentsPdfReport({
  branchId = 'all',
  branchName = 'جميع الفروع',
  appointments,
  dateRangeLabel = 'كافة المواعيد المسجلة',
  generatedByEmail = 'مدير النظام',
}: ExportReportOptions): Promise<void> {
  // Filter appointments if specific branch selected
  const reportAppointments =
    branchId === 'all'
      ? appointments
      : appointments.filter((a) => a.branch_id === branchId);

  // Compute metrics
  const totalCount = reportAppointments.length;
  const confirmedCount = reportAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'completed'
  ).length;
  const paidAppointments = reportAppointments.filter((a) => a.payment_status === 'paid');
  const paidRevenue = paidAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const unpaidAppointments = reportAppointments.filter(
    (a) => a.payment_status === 'unpaid' || a.payment_status === 'pending' || a.payment_status === 'معلق'
  );
  const pendingRevenue = unpaidAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  const displayBranchName = resolveBranchName(branchId, branchName);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const generationTimestamp = `${dateFormatted} — ${timeFormatted}`;

  // Ensure Arabic Fonts are loaded
  await ensureArabicFontReady();

  // Create temporary container for HTML-to-Canvas rendering
  const container = document.createElement('div');
  container.id = 'androderma-pdf-report-render';
  container.setAttribute('dir', 'rtl');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '1180px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
  container.style.letterSpacing = '0px';
  container.style.textRendering = 'optimizeLegibility';
  container.style.padding = '28px 32px 36px 32px';
  container.style.boxSizing = 'border-box';
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';

  // Build Table Rows HTML
  const tableRowsHtml =
    reportAppointments.length > 0
      ? reportAppointments
          .map((apt, index) => {
            const statusInfo = getArabicStatus(apt.status);
            const paymentInfo = getArabicPaymentStatus(apt.payment_status);
            const branchLabel = resolveBranchName(apt.branch_id, apt.branch_name_ar);
            const feeFormatted = Number(apt.amount || 0).toLocaleString('ar-EG');
            const paymentMethodLabel = getArabicPaymentMethod(apt.payment_method);
            const notesText = apt.notes || apt.medical_notes || '-';
            const rowBg = index % 2 === 1 ? '#f8fafc' : '#ffffff';

            return `
              <tr style="background-color: ${rowBg}; border-bottom: 1px solid #e2e8f0; font-size: 11px; letter-spacing: 0px !important;">
                <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #475569; width: 32px;">${index + 1}</td>
                <td style="padding: 10px 8px; font-weight: 800; color: #0f172a; width: 140px;">${apt.patient_name || 'غير محدد'}</td>
                <td style="padding: 10px 8px; font-family: sans-serif !important; direction: ltr; text-align: right; color: #334155; font-weight: 600; width: 110px;">${apt.patient_phone || '-'}</td>
                <td style="padding: 10px 8px; color: #1e293b; font-weight: 600; width: 150px;">
                  <div>${apt.service_name || 'كشف واستشارة جلدية'}</div>
                  ${apt.visit_type ? `<div style="font-size: 9.5px; color: #008779; font-weight: 700; margin-top: 2px;">${apt.visit_type}</div>` : ''}
                </td>
                <td style="padding: 10px 8px; color: #475569; font-weight: 600; width: 120px;">${branchLabel}</td>
                <td style="padding: 10px 8px; color: #334155; width: 130px;">
                  <div style="font-weight: 700;">${apt.appointment_date}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${apt.appointment_time || ''}</div>
                </td>
                <td style="padding: 10px 8px; text-align: center; font-weight: 800; color: #0f172a; width: 95px; font-family: sans-serif !important;">${feeFormatted} ج.م</td>
                <td style="padding: 10px 6px; text-align: center; width: 90px;">
                  <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; background-color: ${statusInfo.bg}; color: ${statusInfo.color}; border: 1px solid ${statusInfo.border};">
                    ${statusInfo.label}
                  </span>
                </td>
                <td style="padding: 10px 6px; text-align: center; width: 95px;">
                  <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; background-color: ${paymentInfo.bg}; color: ${paymentInfo.color}; border: 1px solid ${paymentInfo.border};">
                    ${paymentInfo.label}
                  </span>
                  <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${paymentMethodLabel}</div>
                </td>
                <td style="padding: 10px 8px; color: #64748b; font-size: 10px; line-height: 1.4; max-width: 140px; word-break: break-word;">
                  ${notesText}
                </td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="10" style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 13px; font-weight: 700; background-color: #f8fafc; letter-spacing: 0px !important;">
            لا توجد سجلات حجوزات مطابقة لنطاق الفلتر المحدد
          </td>
        </tr>
      `;

  // HTML Template for the entire Arabic Report
  container.innerHTML = `
    <style>
      #androderma-pdf-report-render,
      #androderma-pdf-report-render * {
        letter-spacing: 0px !important;
        font-family: 'Cairo', 'Tajawal', sans-serif !important;
        text-rendering: optimizeLegibility !important;
        font-feature-settings: "liga" 1, "calt" 1 !important;
        -webkit-font-smoothing: antialiased !important;
        box-sizing: border-box;
      }
      #androderma-pdf-report-render .latin-font {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
    </style>
    <div style="width: 100%; box-sizing: border-box; letter-spacing: 0px !important;">
      <!-- TOP EXECUTIVE HEADER -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 22px 26px; color: #ffffff; margin-bottom: 20px; border-bottom: 4px solid #00B8A9; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
          <!-- Right: Title & Subtitle -->
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(0, 184, 169, 0.2); border: 1px solid #00B8A9; display: flex; align-items: center; justify-content: center; color: #00B8A9; font-weight: 900; font-size: 16px;">
                AD
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0px !important;">
                تقارير وحجوزات عيادات أندروديرما للجلدية والليزر
              </h1>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 12.5px; color: #00B8A9; font-weight: 700; letter-spacing: 0px !important;">
              بيان الحجوزات والإيرادات الإدارية الرسمية
            </p>
            <div style="display: flex; align-items: center; gap: 16px; font-size: 11px; color: #cbd5e1; letter-spacing: 0px !important;">
              <span><strong>الفرع المستهدف:</strong> ${displayBranchName}</span>
              <span>•</span>
              <span><strong>نطاق المواعيد:</strong> ${dateRangeLabel}</span>
            </div>
          </div>

          <!-- Left: Metadata Box -->
          <div style="background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 10px 16px; min-width: 220px; text-align: right; letter-spacing: 0px !important;">
            <div style="font-size: 10.5px; color: #94a3b8; margin-bottom: 3px;">تاريخ وتوقيت التقرير:</div>
            <div style="font-size: 11.5px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">${generationTimestamp}</div>
            <div style="font-size: 10.5px; color: #94a3b8; margin-bottom: 3px;">المسؤول / الإدارة:</div>
            <div style="font-size: 11.5px; font-weight: 700; color: #00B8A9;">${generatedByEmail}</div>
          </div>
        </div>
      </div>

      <!-- 4 EXECUTIVE SUMMARY KPI CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px;">
        <!-- Card 1: Total Bookings -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">إجمالي الحجوزات</div>
          <div style="font-size: 20px; font-weight: 900; color: #0f172a;" class="latin-font">${totalCount}</div>
          <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">سجل حجز مسجل</div>
        </div>

        <!-- Card 2: Confirmed Bookings -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">المؤكدة</div>
          <div style="font-size: 20px; font-weight: 900; color: #059669;" class="latin-font">${confirmedCount}</div>
          <div style="font-size: 9.5px; color: #059669; margin-top: 2px;">حجز معتمد ومكتمل</div>
        </div>

        <!-- Card 3: Collected Revenue -->
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #065f46; margin-bottom: 4px;">المبالغ المحصلة (ج.م)</div>
          <div style="font-size: 19px; font-weight: 900; color: #047857;" class="latin-font">${paidRevenue.toLocaleString('ar-EG')} ج.م</div>
          <div style="font-size: 9.5px; color: #065f46; margin-top: 2px;">${paidAppointments.length} عملية سداد ناجحة</div>
        </div>

        <!-- Card 4: Pending Revenue -->
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 16px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #92400e; margin-bottom: 4px;">المبالغ المعلقة</div>
          <div style="font-size: 19px; font-weight: 900; color: #b45309;" class="latin-font">${pendingRevenue.toLocaleString('ar-EG')} ج.م</div>
          <div style="font-size: 9.5px; color: #92400e; margin-top: 2px;">${unpaidAppointments.length} حجز بانتظار التحصيل</div>
        </div>
      </div>

      <!-- TABLE CONTAINER -->
      <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse; text-align: right; background-color: #ffffff;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-size: 11.5px; font-weight: 800; letter-spacing: 0px !important;">
              <th style="padding: 12px 8px; text-align: center; width: 32px; border-bottom: 2px solid #00B8A9;">#</th>
              <th style="padding: 12px 8px; width: 140px; border-bottom: 2px solid #00B8A9;">اسم المريض</th>
              <th style="padding: 12px 8px; width: 110px; border-bottom: 2px solid #00B8A9;">رقم الهاتف</th>
              <th style="padding: 12px 8px; width: 150px; border-bottom: 2px solid #00B8A9;">الخدمة / العلاج</th>
              <th style="padding: 12px 8px; width: 120px; border-bottom: 2px solid #00B8A9;">الفرع</th>
              <th style="padding: 12px 8px; width: 130px; border-bottom: 2px solid #00B8A9;">التاريخ والوقت</th>
              <th style="padding: 12px 8px; text-align: center; width: 95px; border-bottom: 2px solid #00B8A9;">الكشف (ج.م)</th>
              <th style="padding: 12px 8px; text-align: center; width: 90px; border-bottom: 2px solid #00B8A9;">حالة الحجز</th>
              <th style="padding: 12px 8px; text-align: center; width: 95px; border-bottom: 2px solid #00B8A9;">طريقة الدفع</th>
              <th style="padding: 12px 8px; width: 140px; border-bottom: 2px solid #00B8A9;">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- FOOTER -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 10.5px; color: #64748b; letter-spacing: 0px !important;">
        <div style="font-weight: 700; color: #334155;">
          منظومة أندروديرما الطبية • تقرير إداري سري ومحمي
        </div>
        <div>
          تم الإنشاء بواسطة نظام الإدارة الإلكتروني الموحد • صفحة 1 من 1
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Wait for fonts to be ready before rendering
    if (document.fonts) {
      await document.fonts.ready;
    }
    // Small delay to allow complete DOM layout settling with font metrics
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Render the container to high-res canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1180,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 297 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 210 mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    const sanitizedBranch = branchId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileDate = now.toISOString().split('T')[0];
    pdf.save(`Androderma_Report_${sanitizedBranch}_${fileDate}.pdf`);
  } finally {
    // Clean up temporary DOM element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// Aliases for seamless backwards compatibility and clean integration
export const generatePDF = exportAppointmentsPdfReport;
export const generateAppointmentsPDF = exportAppointmentsPdfReport;

