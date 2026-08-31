import React, { useState, useMemo, useEffect } from 'react';
import {
  Megaphone,
  X,
  Copy,
  Check,
  Send,
  Users,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit3,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppointmentRecord } from '@/types/admin';
import { branches as defaultBranches } from '@/data/clinicData';
import { formatPhoneForWhatsApp } from '@/services/appointmentService';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentRecord[];
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

type BroadcastTemplateType =
  | 'doctor_delay'
  | 'emergency_closure'
  | 'branch_relocation'
  | 'daily_reminder'
  | 'custom';

interface TemplatePreset {
  id: BroadcastTemplateType;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultText: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'doctor_delay',
    title: 'تأخير عيادة الطبيب',
    badge: 'تأخير طارئ',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Clock,
    defaultTitle: 'تنويه هام بشأن تأخر مواعيد العيادة اليوم',
    defaultText: `مرضانا الأعزاء في عيادات Androderma 🌸
نحيط سيادتكم علماً بحدوث تأخير طارئ في بدء استقبال كشوفات اليوم لمدة تقارب (30 دقيقة) نظراً لحالة طبية عاجلة تستدعي التدخل الفوري.
نعتذر بشدة عن أي إزعاج ونعمل بأقصى طاقتنا لتقديم أعلى مستويات الرعاية الطبية لكم.
شاكرين حسن تفهمكم وتعاونكم الدائم 🙏`,
  },
  {
    id: 'emergency_closure',
    title: 'إغلاق طارئ / عطلة استثنائية',
    badge: 'إغلاق فوري',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: AlertTriangle,
    defaultTitle: 'تنويه طارئ: تعليق العمل بالعيادة اليوم',
    defaultText: `تنويه عاجل لمرضانا الكرام ⚠️
نظراً لظروف طارئة خارجة عن إرادتنا، نود إبلاغكم بتعليق العمل واستقبال الكشوفات بالفرع اليوم.
سيقوم فريق خدمة العملاء بالتواصل معكم هاتفياً لإعادة جدولة مواعيدكم في أقرب وقت متاح يناسبكم.
نرجو منكم قبول وافر الاعتذار والتقدير 🙏`,
  },
  {
    id: 'branch_relocation',
    title: 'تحويل الفرع المناوب',
    badge: 'تغيير الفرع',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: RefreshCw,
    defaultTitle: 'تنويه: تحويل استقبال الكشوفات إلى الفرع المناوب',
    defaultText: `مرضانا الأعزاء 🌿
يرجى العلم بأنه تم تحويل استقبال كشوفات وجلسات اليوم إلى الفرع المناوب لعيادات Androderma، مع الحفاظ على مواعيدكم وساعات الحجز المحددة دون تغيير.
فريق الاستقبال في انتظاركم للترحيب بكم وتقديم أفضل تجربة علاجية ✨`,
  },
  {
    id: 'daily_reminder',
    title: 'تذكير جماعي بمواعيد اليوم',
    badge: 'تذكير',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    icon: Megaphone,
    defaultTitle: 'تذكير بمواعيد الكشوفات اليوم في عيادات Androderma',
    defaultText: `صباح الخير من عيادات Androderma للجلدية والليزر والتجميل الطبي 🌿
نذكر مرضانا الكرام بمواعيد كشوفاتكم وجلساتكم المسجلة لليوم.
فريقنا الطبي والاستشاري جاهز لاستقبالكم على مدار ساعات العمل الرسمية. نتمنى لكم يوماً سعيداً ودوام الصحة والعافية! 💫`,
  },
  {
    id: 'custom',
    title: 'رسالة جماعية مخصصة',
    badge: 'مخصص',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Edit3,
    defaultTitle: 'إشعار خاص من عيادات Androderma',
    defaultText: `مرضانا الكرام في عيادات Androderma 🤍
نتمنى لكم دوام الصحة والعافية ونود إبلاغكم بما يلي:
[اكتب تفاصيل الرسالة هنا]`,
  },
];

export function EmergencyBroadcastModal({
  isOpen,
  onClose,
  appointments,
  onNotify,
}: EmergencyBroadcastModalProps) {
  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('confirmed');

  // Message States
  const [selectedTemplate, setSelectedTemplate] = useState<BroadcastTemplateType>('doctor_delay');
  const [broadcastTitle, setBroadcastTitle] = useState<string>(TEMPLATE_PRESETS[0].defaultTitle);
  const [broadcastMessage, setBroadcastMessage] = useState<string>(TEMPLATE_PRESETS[0].defaultText);

  // Recipient Selection State (IDs of checked appointments)
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());

  // Interactive Queue Sending State
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const [copiedNumbers, setCopiedNumbers] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Compute filtered appointments
  const matchedRecipients = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter((apt) => {
      // Branch filter
      const matchBranch = selectedBranch === 'all' || apt.branch_id === selectedBranch;

      // Status filter
      const matchStatus = selectedStatusFilter === 'all' || apt.status === selectedStatusFilter;

      // Date filter
      let matchDate = true;
      if (selectedDateFilter === 'today') {
        matchDate = apt.appointment_date === todayStr;
      } else if (selectedDateFilter === 'upcoming') {
        matchDate = apt.appointment_date >= todayStr;
      }

      return matchBranch && matchStatus && matchDate;
    });
  }, [appointments, selectedBranch, selectedDateFilter, selectedStatusFilter]);

  // Sync selected recipients whenever matchedRecipients change
  useEffect(() => {
    const allIds = new Set(matchedRecipients.map((r) => r.id));
    setSelectedRecipientIds(allIds);
  }, [matchedRecipients]);

  const activeRecipients = useMemo(() => {
    return matchedRecipients.filter((r) => selectedRecipientIds.has(r.id));
  }, [matchedRecipients, selectedRecipientIds]);

  if (!isOpen) return null;

  // Handle template selection
  const handleSelectTemplate = (preset: TemplatePreset) => {
    setSelectedTemplate(preset.id);
    setBroadcastTitle(preset.defaultTitle);
    setBroadcastMessage(preset.defaultText);
  };

  // Toggle recipient checkbox
  const handleToggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle All Checkboxes
  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedRecipientIds(new Set(matchedRecipients.map((r) => r.id)));
    } else {
      setSelectedRecipientIds(new Set());
    }
  };

  // Copy All Phone Numbers
  const handleCopyPhoneNumbers = () => {
    if (activeRecipients.length === 0) {
      onNotify('error', 'لا يوجد مرضى محددين للنسخ');
      return;
    }
    const numbersList = activeRecipients
      .map((r) => r.patient_phone.trim())
      .filter(Boolean)
      .join(', ');

    navigator.clipboard.writeText(numbersList);
    setCopiedNumbers(true);
    onNotify('success', `تم نسخ ${activeRecipients.length} رقم هاتف إلى الحافظة`);
    setTimeout(() => setCopiedNumbers(false), 2500);
  };

  // Copy Broadcast Text
  const handleCopyText = () => {
    const fullText = `*${broadcastTitle}*\n\n${broadcastMessage}`;
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    onNotify('success', 'تم نسخ نص الرسالة الجماعية');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Export CSV of Recipients
  const handleExportCsv = () => {
    if (activeRecipients.length === 0) {
      onNotify('error', 'لا يوجد مرضى لتصديرهم');
      return;
    }

    const headers = ['اسم المريض', 'رقم الهاتف', 'الفرع', 'تاريخ الموعد', 'الوقت', 'الخدمة', 'الحالة'];
    const rows = activeRecipients.map((r) => [
      `"${r.patient_name.replace(/"/g, '""')}"`,
      `"${r.patient_phone}"`,
      `"${r.branch_name_ar || r.branch_id}"`,
      `"${r.appointment_date}"`,
      `"${r.appointment_time}"`,
      `"${r.service_name}"`,
      `"${r.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `broadcast-recipients-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('success', 'تم تحميل ملف بيانات المستهدفين CSV');
  };

  // Send single WhatsApp in queue
  const handleSendCurrentInQueue = () => {
    if (activeRecipients.length === 0) return;
    const currentApt = activeRecipients[queueIndex];
    if (!currentApt) return;

    const personalized = `أهلاً أستاذ/ة *${currentApt.patient_name}* 🌸
*${broadcastTitle}*

${broadcastMessage}

📍 *الفرع:* ${currentApt.branch_name_ar || 'عيادات Androderma'}
🗓️ *الموعد المسجل:* ${currentApt.appointment_date} (${currentApt.appointment_time})`;

    const formattedPhone = formatPhoneForWhatsApp(currentApt.patient_phone);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(personalized)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    onNotify('info', `تم فتح واتساب للمريض (${currentApt.patient_name}) [${queueIndex + 1} من ${activeRecipients.length}]`);

    if (queueIndex < activeRecipients.length - 1) {
      setQueueIndex(queueIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-500/30 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/20 text-[#00B8A9] border border-teal-500/40 shadow-[0_0_20px_rgba(0,184,169,0.25)]">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>أداة الإشعارات الجماعية ورسائل الطوارئ</span>
                <span className="text-[10px] font-black rounded-full bg-teal-500/20 text-[#00B8A9] px-2.5 py-0.5 border border-teal-500/30">
                  Emergency Broadcast
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                إرسال تنبيهات تأخير الطبيب، الإغلاق الطارئ، أو التذكير الجماعي للمرضى دفعة واحدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Message Drafting & Templates */}
          <div className="space-y-4">
            {/* Step 1: Choose Scenario Preset */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-200">
                1. اختر نوع الإشعار / سيناريو الطوارئ:
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TEMPLATE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedTemplate === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectTemplate(preset)}
                      className={`flex flex-col items-start gap-1 rounded-2xl p-2.5 text-right transition-all border ${
                        isSelected
                          ? 'border-[#00B8A9] bg-teal-500/15 shadow-[0_0_15px_rgba(0,184,169,0.25)]'
                          : 'border-white/10 bg-slate-950/50 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white line-clamp-1">{preset.title}</span>
                        <Icon className="h-3.5 w-3.5 text-[#00B8A9]" />
                      </div>
                      <span className={`text-[10px] font-bold rounded-md px-1.5 py-0.5 border ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Message Content */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">عنوان الإشعار</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white focus:border-[#00B8A9] focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">نص الرسالة المرسلة</label>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedText ? <Check className="h-3 w-3 text-teal-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedText ? 'تم النسخ' : 'نسخ النص'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* WhatsApp Queue Launcher Widget */}
            <div className="rounded-2xl border border-teal-500/30 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#00B8A9]" />
                  <span className="text-xs font-bold text-white">إرسال متتابع عبر واتساب ويب</span>
                </div>
                <span className="text-[11px] font-mono text-teal-400">
                  {activeRecipients.length > 0 ? `${queueIndex + 1} / ${activeRecipients.length}` : '0 مريض'}
                </span>
              </div>

              {activeRecipients.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-900 p-2.5 text-xs">
                    <span className="text-slate-300">المريض الحالي في الطابور:</span>
                    <strong className="text-white font-bold">
                      {activeRecipients[queueIndex]?.patient_name || '-'} (
                      <span className="font-mono text-emerald-400" dir="ltr">
                        {activeRecipients[queueIndex]?.patient_phone}
                      </span>
                      )
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={queueIndex === 0}
                        onClick={() => setQueueIndex((i) => Math.max(0, i - 1))}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={queueIndex >= activeRecipients.length - 1}
                        onClick={() => setQueueIndex((i) => Math.min(activeRecipients.length - 1, i + 1))}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendCurrentInQueue}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-400 shadow-md"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>إرسال وتخطي للمريض التالي</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400">لا يوجد مرضى محددين في الطابور حالياً</p>
              )}
            </div>
          </div>

          {/* Right Column: Recipient Target Filters & Interactive Table */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-200">
                2. تحديد فئة المرضى المستهدفين:
              </label>

              {/* Target Filters */}
              <div className="grid grid-cols-3 gap-2">
                {/* Branch */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-slate-400">الفرع</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="all">كل الفروع</option>
                    {defaultBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-slate-400">الموعد</label>
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value as 'today' | 'upcoming' | 'all')}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="today">اليوم فقط</option>
                    <option value="upcoming">المواعيد القادمة</option>
                    <option value="all">كافة السجلات</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-slate-400">الحالة</label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-white focus:border-[#00B8A9] focus:outline-none"
                  >
                    <option value="all">الكل</option>
                    <option value="confirmed">مؤكد فقط</option>
                    <option value="pending">قيد الانتظار</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recipient Count & Bulk Select Tools */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#00B8A9]" />
                <span className="font-bold text-white">
                  المستهدفون: ({activeRecipients.length} من {matchedRecipients.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  تحديد الكل
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-[11px] text-slate-400 hover:underline"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            {/* Interactive Recipient List Box */}
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 divide-y divide-white/5">
              {matchedRecipients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  لا توجد حجوزات مطابقة للفلاتر المختارة
                </div>
              ) : (
                matchedRecipients.map((apt) => {
                  const isChecked = selectedRecipientIds.has(apt.id);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleToggleRecipient(apt.id)}
                      className={`flex items-center justify-between p-2.5 text-xs transition-colors cursor-pointer ${
                        isChecked ? 'bg-teal-500/10' : 'hover:bg-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-white/20 bg-slate-900 text-[#00B8A9] focus:ring-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{apt.patient_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {apt.patient_phone}
                          </span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-teal-300 block">
                          {apt.branch_name_ar || apt.branch_id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {apt.appointment_date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bulk Export & Copy Tools */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyPhoneNumbers}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800"
              >
                {copiedNumbers ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedNumbers ? 'تم نسخ الأرقام' : 'نسخ أرقام الهواتف'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs font-bold text-teal-300 transition hover:bg-slate-800"
              >
                <FileDown className="h-3.5 w-3.5 text-[#00B8A9]" />
                <span>تصدير كشف المستلمين (CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            إغلاق النافذة
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 rounded-xl bg-teal-900/60 border border-teal-500/40 px-4 py-2 text-xs font-bold text-teal-200 hover:bg-teal-800/80"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>نسخ الرسالة</span>
          </button>
          <button
            type="button"
            onClick={handleCopyPhoneNumbers}
            className="flex items-center gap-1.5 rounded-xl bg-[#00B8A9] px-5 py-2 text-xs font-black text-slate-950 hover:bg-[#00d6c4] shadow-lg shadow-[0_0_15px_rgba(0,184,169,0.3)]"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>نسخ كافة الأرقام المحددة ({activeRecipients.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
