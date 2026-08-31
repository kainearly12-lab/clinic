import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppointmentRecord } from '@/types/admin';

interface ExportReportOptions {
  branchId?: string;
  branchName?: string;
  appointments: AppointmentRecord[];
  dateRangeLabel?: string;
  generatedByEmail?: string;
}

export function exportAppointmentsPdfReport({
  branchId = 'all',
  branchName = 'جميع الفروع',
  appointments,
  dateRangeLabel = 'كافة المواعيد المسجلة',
  generatedByEmail = 'admin@androderma.com',
}: ExportReportOptions): void {
  // Filter appointments if specific branch selected
  const reportAppointments =
    branchId === 'all'
      ? appointments
      : appointments.filter((a) => a.branch_id === branchId);

  // Compute metrics
  const totalCount = reportAppointments.length;
  const paidAppointments = reportAppointments.filter((a) => a.payment_status === 'paid');
  const paidCount = paidAppointments.length;
  const unpaidCount = reportAppointments.filter((a) => a.payment_status === 'unpaid').length;
  const totalRevenue = paidAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const confirmedCount = reportAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'completed'
  ).length;

  // Initialize PDF in landscape orientation for clean tabular readability
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top luxury header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent line
  doc.setFillColor(0, 184, 169); // #00B8A9 teal
  doc.rect(0, 27, pageWidth, 1.5, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANDRODERMA DERMATOLOGY & LASER CLINICS', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 184, 169);
  doc.text('Official Administrative Patient & Revenue Statement', 14, 19);

  // Date & User meta on right side of header
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  const now = new Date();
  const generatedAtStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(`Generated: ${generatedAtStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Staff / Admin: ${generatedByEmail}`, pageWidth - 14, 19, { align: 'right' });

  // Report Scope Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 34, pageWidth - 28, 22, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Branch Target: ${branchName} (${branchId.toUpperCase()})`, 18, 41);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Scope / Time Range: ${dateRangeLabel}`, 18, 47);

  // Metric pills inside header
  const metricXStart = pageWidth - 160;
  const metrics = [
    { label: 'Total Bookings', value: `${totalCount}` },
    { label: 'Confirmed', value: `${confirmedCount}` },
    { label: `Paid (${paidCount})`, value: `${totalRevenue.toLocaleString()} EGP` },
    { label: 'Unpaid / Pending', value: `${unpaidCount}` },
  ];

  metrics.forEach((m, idx) => {
    const xPos = metricXStart + idx * 35;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(xPos, 37, 32, 16, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos + 16, 42, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, xPos + 16, 48.5, { align: 'center' });
  });

  // Table Data Mapping
  const tableRows = reportAppointments.map((apt, index) => {
    const statusLabel =
      apt.status === 'confirmed'
        ? 'Confirmed'
        : apt.status === 'completed'
        ? 'Completed'
        : apt.status === 'cancelled'
        ? 'Cancelled'
        : 'Pending';

    const paymentLabel = apt.payment_status === 'paid' ? 'PAID' : 'UNPAID';
    const amountStr = `${Number(apt.amount || 0).toLocaleString()} EGP`;

    return [
      String(index + 1),
      apt.patient_name || 'N/A',
      apt.patient_phone || 'N/A',
      apt.service_name || 'Dermatology Consultation',
      apt.branch_name_ar || apt.branch_id || 'N/A',
      `${apt.appointment_date} (${apt.appointment_time || ''})`,
      amountStr,
      statusLabel,
      paymentLabel,
      apt.notes || '-',
    ];
  });

  // Generate Table using autoTable
  autoTable(doc, {
    startY: 61,
    head: [
      [
        '#',
        'Patient Name',
        'Phone',
        'Service / Treatment',
        'Branch',
        'Date & Time',
        'Fee (EGP)',
        'Status',
        'Payment',
        'Notes / Clinical',
      ],
    ],
    body: tableRows.length > 0 ? tableRows : [['-', 'No appointment records found for this branch filter', '', '', '', '', '', '', '', '']],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // #
      1: { cellWidth: 35, fontStyle: 'bold' }, // Patient
      2: { cellWidth: 26 }, // Phone
      3: { cellWidth: 48 }, // Service
      4: { cellWidth: 28 }, // Branch
      5: { cellWidth: 34 }, // Date Time
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, // Fee
      7: { cellWidth: 22, halign: 'center' }, // Status
      8: { cellWidth: 20, halign: 'center' }, // Payment
      9: { cellWidth: 'auto' }, // Notes
    },
    didDrawCell: (data) => {
      // Color highlight payment status cells
      if (data.section === 'body' && data.column.index === 8) {
        const text = String(data.cell.raw);
        if (text === 'PAID') {
          doc.setTextColor(16, 185, 129); // green
        } else if (text === 'UNPAID') {
          doc.setTextColor(239, 68, 68); // red
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 18 },
  });

  // Footer for each page
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      'Androderma Medical Suite • Confidential & Proprietary Clinical Data',
      14,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Save the PDF
  const sanitizedBranch = branchId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileDate = now.toISOString().split('T')[0];
  doc.save(`Androderma_Report_${sanitizedBranch}_${fileDate}.pdf`);
}
