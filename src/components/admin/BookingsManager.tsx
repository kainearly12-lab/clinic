import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  RefreshCw,
  X,
  CreditCard,
  FileDown,
  Stethoscope,
  Megaphone,
  MessageCircle,
  Tag,
} from 'lucide-react';
import gsap from 'gsap';
import { AppointmentRecord, AppointmentStatus, PaymentStatus, VisitType } from '@/types/admin';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  togglePaymentStatus,
  updateConfirmationStatus,
} from '@/services/appointmentService';
import { exportAppointmentsPdfReport } from '@/services/pdfReportService';
import { branches as defaultBranches } from '@/data/clinicData';
import { QuickMedicalNotesModal } from '@/components/admin/QuickMedicalNotesModal';
import { WhatsAppTemplateModal } from '@/components/admin/WhatsAppTemplateModal';
import { EmergencyBroadcastModal } from '@/components/admin/EmergencyBroadcastModal';

interface BookingsManagerProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const BookingsManager = React.memo(function BookingsManager({ onNotify }: BookingsManagerProps) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // all, today, upcoming, past
  const [selectedVisitTypeFilter, setSelectedVisitTypeFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<AppointmentRecord | null>(null);
  const [quickPaymentModal, setQuickPaymentModal] = useState<{
    appointment: AppointmentRecord;
    amount: number;
    payment_status: PaymentStatus;
  } | null>(null);

  // New Medical Notes, WhatsApp and Broadcast Modal States
  const [quickNotesAppointment, setQuickNotesAppointment] = useState<AppointmentRecord | null>(null);
  const [whatsAppModalAppointment, setWhatsAppModalAppointment] = useState<AppointmentRecord | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  // Form State for Add / Edit
  const [formState, setFormState] = useState({
    patient_name: '',
    patient_phone: '',
    service_name: '',
    visit_type: 'كشف جديد' as VisitType,
    branch_id: 'nasr-city',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '05:00 مساءً',
    status: 'confirmed' as AppointmentStatus,
    payment_status: 'paid' as PaymentStatus,
    amount: 1200,
    notes: '',
    medical_notes: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Load appointments
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      onNotify('error', 'حدث خطأ أثناء تحميل الحجوزات');
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // GSAP animation on mount
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current.querySelectorAll('.animate-item'),
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
    );
  }, [isLoading]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return appointments.filter((apt) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        apt.patient_name.toLowerCase().includes(q) ||
        apt.patient_phone.includes(q) ||
        apt.service_name.toLowerCase().includes(q) ||
        (apt.visit_type && apt.visit_type.toLowerCase().includes(q)) ||
        (apt.medical_notes && apt.medical_notes.toLowerCase().includes(q)) ||
        (apt.branch_name_ar && apt.branch_name_ar.toLowerCase().includes(q));

      // Branch filter
      const matchBranch = selectedBranchFilter === 'all' || apt.branch_id === selectedBranchFilter;

      // Status filter
      const matchStatus = selectedStatusFilter === 'all' || apt.status === selectedStatusFilter;

      // Payment filter
      const matchPayment =
        selectedPaymentFilter === 'all' || apt.payment_status === selectedPaymentFilter;

      // Visit Type filter
      const matchVisitType =
        selectedVisitTypeFilter === 'all' || (apt.visit_type || 'كشف جديد') === selectedVisitTypeFilter;

      // Date filter
      let matchDate = true;
      if (selectedDateFilter === 'today') {
        matchDate = apt.appointment_date === todayStr;
      } else if (selectedDateFilter === 'upcoming') {
        matchDate = apt.appointment_date >= todayStr;
      } else if (selectedDateFilter === 'past') {
        matchDate = apt.appointment_date < todayStr;
      }

      return matchSearch && matchBranch && matchStatus && matchPayment && matchVisitType && matchDate;
    });
  }, [
    appointments,
    searchQuery,
    selectedBranchFilter,
    selectedStatusFilter,
    selectedPaymentFilter,
    selectedVisitTypeFilter,
    selectedDateFilter,
  ]);

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    const totalRev = appointments
      .filter((a) => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    const pendingRev = appointments
      .filter((a) => a.payment_status === 'unpaid')
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    const totalCount = appointments.length;
    const paidCount = appointments.filter((a) => a.payment_status === 'paid').length;
    const unpaidCount = appointments.filter((a) => a.payment_status === 'unpaid').length;
    const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

    return { totalRev, pendingRev, totalCount, paidCount, unpaidCount, confirmedCount };
  }, [appointments]);

  // Handle Save (Create / Update)
  const handleSaveAppointment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        // Update
        const res = await updateAppointment(editingAppointment.id, {
          patient_name: formState.patient_name,
          patient_phone: formState.patient_phone,
          service_name: formState.service_name,
          visit_type: formState.visit_type,
          branch_id: formState.branch_id,
          appointment_date: formState.appointment_date,
          appointment_time: formState.appointment_time,
          status: formState.status,
          payment_status: formState.payment_status,
          amount: Number(formState.amount),
          notes: formState.notes,
          medical_notes: formState.medical_notes,
        });

        if (res.success) {
          onNotify('success', `تم تحديث حجز ${formState.patient_name} بنجاح`);
          setEditingAppointment(null);
          await loadData();
        } else {
          onNotify('error', res.error || 'فشل تحديث الحجز');
        }
      } else {
        // Create New
        const res = await createAppointment({
          patient_name: formState.patient_name,
          patient_phone: formState.patient_phone,
          service_name: formState.service_name,
          visit_type: formState.visit_type,
          branch_id: formState.branch_id,
          appointment_date: formState.appointment_date,
          appointment_time: formState.appointment_time,
          status: formState.status,
          payment_status: formState.payment_status,
          amount: Number(formState.amount),
          notes: formState.notes,
          medical_notes: formState.medical_notes,
        });

        if (res.success) {
          onNotify('success', `تم تسجيل حجز جديد للمريض ${formState.patient_name} بنجاح`);
          setIsAddModalOpen(false);
          await loadData();
        } else {
          onNotify('error', res.error || 'فشل تسجيل الحجز');
        }
      }
    } catch {
      onNotify('error', 'حدث خطأ غير متوقع');
    }
  }, [editingAppointment, formState, loadData, onNotify]);

  // Open Edit Modal
  const openEditModal = useCallback((apt: AppointmentRecord) => {
    setEditingAppointment(apt);
    setFormState({
      patient_name: apt.patient_name,
      patient_phone: apt.patient_phone,
      service_name: apt.service_name,
      visit_type: (apt.visit_type as VisitType) || 'كشف جديد',
      branch_id: apt.branch_id,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      status: apt.status,
      payment_status: apt.payment_status,
      amount: apt.amount || 0,
      notes: apt.notes || '',
      medical_notes: apt.medical_notes || '',
    });
  }, []);

  // Delete Action
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingAppointment) return;
    try {
      const res = await deleteAppointment(deletingAppointment.id);
      if (res.success) {
        onNotify('success', `تم حذف حجز ${deletingAppointment.patient_name} بنجاح`);
        setDeletingAppointment(null);
        await loadData();
      } else {
        onNotify('error', res.error || 'فشل حذف الحجز');
      }
    } catch {
      onNotify('error', 'حدث خطأ أثناء الحذف');
    }
  }, [deletingAppointment, loadData, onNotify]);

  // Helper for Status Label
  const getStatusLabel = useCallback((status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد (Confirmed)';
      case 'pending':
        return 'قيد الانتظار (Pending)';
      case 'cancelled':
        return 'ملغي (Cancelled)';
      case 'completed':
        return 'مكتمل (Completed)';
      default:
        return status;
    }
  }, []);

  // Quick Status Toggle
  const handleQuickStatusChange = useCallback(async (apt: AppointmentRecord, newStatus: AppointmentStatus) => {
    try {
      const res = await updateConfirmationStatus(apt.id, newStatus);
      if (res.success) {
        onNotify('info', `تم تغيير حالة الحجز إلى: ${getStatusLabel(newStatus)}`);
        await loadData();
      }
    } catch {
      onNotify('error', 'فشل تغيير الحالة');
    }
  }, [getStatusLabel, loadData, onNotify]);

  // Quick Payment Toggle
  const handleTogglePayment = useCallback((apt: AppointmentRecord) => {
    const nextStatus: PaymentStatus = apt.payment_status === 'paid' ? 'unpaid' : 'paid';
    setQuickPaymentModal({
      appointment: apt,
      amount: apt.amount || 1000,
      payment_status: nextStatus,
    });
  }, []);

  const handleConfirmQuickPayment = useCallback(async () => {
    if (!quickPaymentModal) return;
    try {
      const res = await togglePaymentStatus(
        quickPaymentModal.appointment.id,
        quickPaymentModal.payment_status,
        quickPaymentModal.amount
      );
      if (res.success) {
        onNotify(
          'success',
          `تم تحديث حالة الدفع إلى (${quickPaymentModal.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}) بمبلغ ${quickPaymentModal.amount} ج.م`
        );
        setQuickPaymentModal(null);
        await loadData();
      }
    } catch {
      onNotify('error', 'فشل تحديث حالة الدفع');
    }
  }, [quickPaymentModal, loadData, onNotify]);

  // Export Branch-based PDF Report
  const handleExportPdf = useCallback(() => {
    try {
      const branchObj = defaultBranches.find((b) => b.id === selectedBranchFilter);
      const branchName = selectedBranchFilter === 'all' ? 'جميع الفروع' : (branchObj ? branchObj.nameAr : selectedBranchFilter);
      
      let dateRange = 'كافة المواعيد المسجلة';
      if (selectedDateFilter === 'today') dateRange = 'مواعيد اليوم';
      else if (selectedDateFilter === 'upcoming') dateRange = 'المواعيد القادمة';
      else if (selectedDateFilter === 'past') dateRange = 'السجلات والمواعيد السابقة';

      exportAppointmentsPdfReport({
        branchId: selectedBranchFilter,
        branchName,
        appointments: filteredAppointments,
        dateRangeLabel: dateRange,
      });

      onNotify('success', `تم تصدير تقرير PDF بنجاح لـ (${branchName})`);
    } catch (err) {
      console.error('PDF export error:', err);
      onNotify('error', 'حدث خطأ أثناء إنشاء وتصدير ملف الـ PDF');
    }
  }, [selectedBranchFilter, selectedDateFilter, filteredAppointments, onNotify]);

  // Helper for Status Badge
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            مؤكد
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            قيد الانتظار
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            ملغي
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            مكتمل
          </span>
        );
      default:
        return null;
    }
  };

  // Helper for Visit Type Badge
  const getVisitTypeBadge = (vType?: string) => {
    const t = vType || 'كشف جديد';
    let color = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    if (t.includes('استشارة') || t.includes('متابعة')) color = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    if (t.includes('ليزر')) color = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    if (t.includes('تجميل')) color = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (t.includes('طارئ')) color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${color}`}>
        {t}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="space-y-6" dir="rtl">
      {/* Top Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-item relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الحجوزات</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500/15 text-[#00B8A9] border border-teal-500/30">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalCount}</span>
            <span className="text-xs font-semibold text-emerald-400">({metrics.confirmedCount} مؤكد)</span>
          </div>
        </div>

        <div className="animate-item relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">المدفوعات المحصلة (Paid)</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{metrics.totalRev.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-300">ج.م ({metrics.paidCount} حجز)</span>
          </div>
        </div>

        <div className="animate-item relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">المبالغ المعلقة (Unpaid)</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{metrics.pendingRev.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-300">ج.م ({metrics.unpaidCount} حجز)</span>
          </div>
        </div>

        <div className="animate-item flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-lg">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white">إجراءات الحجوزات والتواصل</p>
            <p className="text-[10px] text-slate-400">إشعارات طوارئ جماعية وتقارير PDF</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full justify-end">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              title="أداة إرسال إشعارات الطوارئ ورسائل الواتساب الجماعية"
              className="flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/20 px-3 py-2 text-xs font-black text-teal-300 transition hover:bg-teal-500/30 hover:border-teal-300 shadow-sm"
            >
              <Megaphone className="h-3.5 w-3.5 text-[#00B8A9]" />
              <span>إشعار جماعي / طوارئ</span>
            </button>

            <button
              onClick={handleExportPdf}
              title="تصدير تقرير PDF للفرع المحدد"
              className="flex items-center gap-1 rounded-xl border border-white/15 bg-slate-800/80 px-2.5 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
            >
              <FileDown className="h-3.5 w-3.5 text-[#00B8A9]" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => {
                setEditingAppointment(null);
                setFormState({
                  patient_name: '',
                  patient_phone: '',
                  service_name: '',
                  visit_type: 'كشف جديد',
                  branch_id: selectedBranchFilter !== 'all' ? selectedBranchFilter : 'nasr-city',
                  appointment_date: new Date().toISOString().split('T')[0],
                  appointment_time: '05:00 مساءً',
                  status: 'confirmed',
                  payment_status: 'paid',
                  amount: 1000,
                  notes: '',
                  medical_notes: '',
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-xl bg-[#00B8A9] px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#00d6c4] hover:shadow-[0_0_15px_rgba(0,184,169,0.4)]"
            >
              <Plus className="h-3.5 w-3.5" /> حجز جديد
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="animate-item rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المريض، رقم الهاتف، التشخيص، أو الخدمة..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#00B8A9]" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">كل الفروع</option>
                {defaultBranches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Visit Type Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
              <Tag className="h-3.5 w-3.5 text-teal-400" />
              <select
                value={selectedVisitTypeFilter}
                onChange={(e) => setSelectedVisitTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">نوع الزيارة (الكل)</option>
                <option value="كشف جديد" className="bg-slate-900 text-white">كشف جديد</option>
                <option value="استشارة ومتابعة" className="bg-slate-900 text-white">استشارة ومتابعة</option>
                <option value="جلسة ليزر" className="bg-slate-900 text-white">جلسة ليزر</option>
                <option value="إجراء تجميلي" className="bg-slate-900 text-white">إجراء تجميلي</option>
                <option value="كشف طارئ" className="bg-slate-900 text-white">كشف طارئ</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">كل الحالات</option>
                <option value="confirmed" className="bg-slate-900 text-white">مؤكد</option>
                <option value="pending" className="bg-slate-900 text-white">قيد الانتظار</option>
                <option value="cancelled" className="bg-slate-900 text-white">ملغي</option>
                <option value="completed" className="bg-slate-900 text-white">مكتمل</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">حالة الدفع (الكل)</option>
                <option value="paid" className="bg-slate-900 text-white">مدفوع فقط (Paid)</option>
                <option value="unpaid" className="bg-slate-900 text-white">غير مدفوع (Unpaid)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">كل المواعيد</option>
                <option value="today" className="bg-slate-900 text-white">اليوم فقط</option>
                <option value="upcoming" className="bg-slate-900 text-white">المواعيد القادمة</option>
                <option value="past" className="bg-slate-900 text-white">السجلات السابقة</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={isLoading}
              title="تحديث البيانات"
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-slate-950/70 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#00B8A9]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="animate-item overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-bold">
                <th className="py-3.5 px-4">المريض</th>
                <th className="py-3.5 px-4">الهاتف & واتساب</th>
                <th className="py-3.5 px-4">الخدمة ونوع الزيارة</th>
                <th className="py-3.5 px-4">الملاحظات والتشخيص</th>
                <th className="py-3.5 px-4">الفرع</th>
                <th className="py-3.5 px-4">الموعد</th>
                <th className="py-3.5 px-4">حالة التأكيد</th>
                <th className="py-3.5 px-4">حالة الدفع</th>
                <th className="py-3.5 px-4">المبلغ</th>
                <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">لا توجد حجوزات مطابقة لمعايير البحث الحالية</p>
                    <p className="mt-1 text-xs text-slate-500">جرب تعديل الفلاتر أو اضغط على "حجز جديد" لإضافة مريض</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="group transition-colors hover:bg-slate-800/40"
                  >
                    {/* Patient Name */}
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-800 text-[#00B8A9] font-black text-xs border border-white/10">
                          {apt.patient_name.charAt(0)}
                        </div>
                        <div>
                          <span>{apt.patient_name}</span>
                          {apt.notes && (
                            <p className="text-[10px] font-normal text-slate-400 line-clamp-1 max-w-[130px]">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone & Interactive WhatsApp trigger */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300" dir="ltr">
                          {apt.patient_phone}
                        </span>
                        <button
                          onClick={() => setWhatsAppModalAppointment(apt)}
                          title="فتح نافذة إرسال قوالب واتساب الذكية (تأكيد، تذكير، تأخير، متابعة)"
                          className="grid h-6 w-6 place-items-center rounded-md bg-emerald-500/20 text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950 shadow-sm"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Service & Visit Type */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="space-y-1">
                        <span className="font-medium text-slate-200 block truncate" title={apt.service_name}>
                          {apt.service_name}
                        </span>
                        {getVisitTypeBadge(apt.visit_type)}
                      </div>
                    </td>

                    {/* Doctor's Medical Notes / Quick Diagnostic Tag */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQuickNotesAppointment(apt)}
                          title="تسجيل أو تعديل الملاحظات والتشخيص الطبي"
                          className="flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-950/40 px-2 py-1 text-[11px] text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 transition"
                        >
                          <Stethoscope className="h-3 w-3 text-[#00B8A9]" />
                          <span className="line-clamp-1 max-w-[110px] text-right">
                            {apt.medical_notes ? apt.medical_notes : '+ كتابة تشخيص'}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-[#00B8A9] border border-teal-500/20">
                        <MapPin className="h-3 w-3" />
                        {apt.branch_name_ar || apt.branch_id}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-white">{apt.appointment_date}</span>
                        <span className="mr-1.5 text-[11px] text-slate-400">{apt.appointment_time}</span>
                      </div>
                    </td>

                    {/* Confirmation Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(apt.status)}
                        {/* Quick status dropdown */}
                        <select
                          value={apt.status}
                          onChange={(e) => handleQuickStatusChange(apt, e.target.value as AppointmentStatus)}
                          className="rounded border border-white/10 bg-slate-950 py-0.5 px-1 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        >
                          <option value="confirmed">مؤكد</option>
                          <option value="pending">قيد الانتظار</option>
                          <option value="cancelled">ملغي</option>
                          <option value="completed">مكتمل</option>
                        </select>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePayment(apt)}
                        title="اضغط لتغيير حالة الدفع وتعديل المبلغ"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-transform active:scale-95 ${
                          apt.payment_status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        {apt.payment_status === 'paid' ? 'مدفوع (Paid)' : 'غير مدفوع (Unpaid)'}
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {Number(apt.amount).toLocaleString()} ج.م
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setQuickNotesAppointment(apt)}
                          title="الملاحظات الطبية والتشخيص"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-teal-300 transition hover:bg-teal-500 hover:text-slate-950"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setWhatsAppModalAppointment(apt)}
                          title="إرسال واتساب للمريض"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(apt)}
                          title="تعديل الحجز"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-[#00B8A9] hover:text-slate-950"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingAppointment(apt)}
                          title="حذف الحجز"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingAppointment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingAppointment ? 'تعديل بيانات الحجز والتشخيص' : 'إضافة حجز مريض جديد'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingAppointment
                    ? `تعديل تفاصيل حجز #${editingAppointment.id}`
                    : 'تسجيل حجز مباشر في جدول العيادة ومزامنة المدفوعات والتشخيص الطبي'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAppointment(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">اسم المريض *</label>
                  <input
                    type="text"
                    required
                    value={formState.patient_name}
                    onChange={(e) => setFormState({ ...formState, patient_name: e.target.value })}
                    placeholder="مثال: ياسمين عادل"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formState.patient_phone}
                    onChange={(e) => setFormState({ ...formState, patient_phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">الخدمة المطلوبة *</label>
                  <input
                    type="text"
                    required
                    value={formState.service_name}
                    onChange={(e) => setFormState({ ...formState, service_name: e.target.value })}
                    placeholder="مثال: جلسة ليزر كانديلا، هيدرافيشل..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">نوع الزيارة / الكشف *</label>
                  <select
                    value={formState.visit_type}
                    onChange={(e) => setFormState({ ...formState, visit_type: e.target.value as VisitType })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="كشف جديد">كشف جديد</option>
                    <option value="استشارة ومتابعة">استشارة ومتابعة</option>
                    <option value="جلسة ليزر">جلسة ليزر</option>
                    <option value="إجراء تجميلي">إجراء تجميلي</option>
                    <option value="كشف طارئ">كشف طارئ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">الفرع *</label>
                  <select
                    value={formState.branch_id}
                    onChange={(e) => setFormState({ ...formState, branch_id: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    {defaultBranches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.nameAr} ({b.cityAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">تاريخ الموعد *</label>
                  <input
                    type="date"
                    required
                    value={formState.appointment_date}
                    onChange={(e) => setFormState({ ...formState, appointment_date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">وقت الموعد</label>
                  <input
                    type="text"
                    value={formState.appointment_time}
                    onChange={(e) => setFormState({ ...formState, appointment_time: e.target.value })}
                    placeholder="05:30 مساءً"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">المبلغ المقدر (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formState.amount}
                    onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">حالة التأكيد</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as AppointmentStatus })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="confirmed">مؤكد (Confirmed)</option>
                    <option value="pending">قيد الانتظار (Pending)</option>
                    <option value="cancelled">ملغي (Cancelled)</option>
                    <option value="completed">مكتمل (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">حالة الدفع</label>
                  <select
                    value={formState.payment_status}
                    onChange={(e) => setFormState({ ...formState, payment_status: e.target.value as PaymentStatus })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="paid">مدفوع بالكامل (Paid)</option>
                    <option value="unpaid">غير مدفوع (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-[#00B8A9]" />
                  <span>الملاحظات الطبية والتشخيص المبدئي (Doctor's Notes)</span>
                </label>
                <textarea
                  rows={2}
                  value={formState.medical_notes}
                  onChange={(e) => setFormState({ ...formState, medical_notes: e.target.value })}
                  placeholder="التشخيص، نوع الليزر، عدد الجلسات، أو توصيات الطبيب..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">ملاحظات إدارية عامة</label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  placeholder="أي تفاصيل خاصة بالاستقبال أو طريقة الدفع..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none resize-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAppointment(null);
                  }}
                  className="rounded-xl px-4 py-2.5 text-slate-300 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#00B8A9] px-5 py-2.5 font-bold text-slate-950 transition hover:bg-[#00d6c4] shadow-lg hover:shadow-[0_0_15px_rgba(0,184,169,0.3)]"
                >
                  {editingAppointment ? 'حفظ التعديلات والتشخيص' : 'تأكيد وحفظ الحجز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">تأكيد حذف الحجز</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حجز المريض{' '}
              <strong className="text-white">({deletingAppointment.patient_name})</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingAppointment(null)}
                className="rounded-xl px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                تراجع
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 transition shadow-lg"
              >
                نعم، احذف الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {quickPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">تعديل حالة الدفع والمبلغ</h3>
              <button
                onClick={() => setQuickPaymentModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                المريض: <strong className="text-white">{quickPaymentModal.appointment.patient_name}</strong>
              </p>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">حالة الدفع</label>
                <select
                  value={quickPaymentModal.payment_status}
                  onChange={(e) =>
                    setQuickPaymentModal({
                      ...quickPaymentModal,
                      payment_status: e.target.value as PaymentStatus,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none"
                >
                  <option value="paid">مدفوع بالكامل (Paid)</option>
                  <option value="unpaid">غير مدفوع (Unpaid)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">المبلغ الإجمالي (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={quickPaymentModal.amount}
                  onChange={(e) =>
                    setQuickPaymentModal({
                      ...quickPaymentModal,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-white focus:border-[#00B8A9] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
              <button
                onClick={() => setQuickPaymentModal(null)}
                className="rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmQuickPayment}
                className="rounded-xl bg-[#00B8A9] px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#00d6c4]"
              >
                حفظ الحالة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Medical Notes Modal */}
      <QuickMedicalNotesModal
        appointment={quickNotesAppointment}
        onClose={() => setQuickNotesAppointment(null)}
        onSaved={(updatedApt) => {
          setAppointments((prev) =>
            prev.map((a) => (a.id === updatedApt.id ? updatedApt : a))
          );
        }}
        onNotify={onNotify}
      />

      {/* Single Patient WhatsApp Template Communicator */}
      <WhatsAppTemplateModal
        appointment={whatsAppModalAppointment}
        onClose={() => setWhatsAppModalAppointment(null)}
        onNotify={onNotify}
      />

      {/* Bulk Emergency Broadcast / Notification Tool */}
      <EmergencyBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        appointments={appointments}
        onNotify={onNotify}
      />
    </div>
  );
});
