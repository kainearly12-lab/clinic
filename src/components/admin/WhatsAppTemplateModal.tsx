import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Copy,
  Check,
  Send,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  HeartHandshake,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { AppointmentRecord } from '@/types/admin';
import {
  WhatsAppTemplateKey,
  generateAppointmentWhatsAppMessage,
  formatPhoneForWhatsApp,
} from '@/services/appointmentService';

interface WhatsAppTemplateModalProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface TemplateOption {
  key: WhatsAppTemplateKey;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: 'confirmation',
    title: 'تأكيد الحجز',
    desc: 'رسالة رسمية لتثبيت الموعد في جدول العيادة',
    icon: Check,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15',
  },
  {
    key: 'reminder',
    title: 'تذكير بالموعد',
    desc: 'تنبيه لطيف قبل الموعد بـ 24 ساعة',
    icon: Clock,
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/15',
  },
  {
    key: 'delay',
    title: 'تنويه تأخير الطبيب',
    desc: 'إشعار باعتذار وتأخير 30 دقيقة لحالة طارئة',
    icon: AlertTriangle,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/15',
  },
  {
    key: 'followup',
    title: 'متابعة ما بعد الكشف',
    desc: 'سؤال عن الحالة الصحية والخطة العلاجية',
    icon: HeartHandshake,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/15',
  },
  {
    key: 'reschedule',
    title: 'تنسيق موعد بديل',
    desc: 'طلب اختيار وقت آخر مناسب للمريض',
    icon: RefreshCw,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/15',
  },
  {
    key: 'custom',
    title: 'رسالة مخصصة',
    desc: 'كتابة نص حر للمريض',
    icon: Edit3,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/15',
  },
];

export function WhatsAppTemplateModal({
  appointment,
  onClose,
  onNotify,
}: WhatsAppTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateKey>('confirmation');
  const [delayMinutes, setDelayMinutes] = useState<number>(30);
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync message template whenever selection or appointment changes
  useEffect(() => {
    if (!appointment) return;
    const generated = generateAppointmentWhatsAppMessage(appointment, selectedTemplate, {
      delayMinutes,
    });
    setMessageText(generated);
  }, [appointment, selectedTemplate, delayMinutes]);

  if (!appointment) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    onNotify('success', 'تم نسخ نص الرسالة إلى الحافظة');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const formattedPhone = formatPhoneForWhatsApp(appointment.patient_phone);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('info', `جاري فتح محادثة واتساب مع المريض ${appointment.patient_name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>إرسال إشعار واتساب للمريض</span>
                <span className="text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 border border-emerald-500/30">
                  Direct WhatsApp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                قوالب ذكية واحترافية لتأكيد المواعيد، التذكير، والمتابعة
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

        {/* Patient Summary Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{appointment.patient_name}</span>
            <span className="font-mono text-emerald-400" dir="ltr">
              {appointment.patient_phone}
            </span>
            <span className="text-slate-400">• {appointment.service_name}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-teal-400" />
              {appointment.branch_name_ar || appointment.branch_id}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-400" />
              {appointment.appointment_date}
            </span>
          </div>
        </div>

        {/* Template Selector Pills */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold text-slate-300">
            اختر قالب الرسالة المناسب:
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATE_OPTIONS.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selectedTemplate === tmpl.key;
              return (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.key)}
                  className={`flex flex-col items-start gap-1 rounded-2xl p-2.5 text-right transition-all border ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'border-white/10 bg-slate-950/50 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-xs font-bold text-white">{tmpl.title}</span>
                    <div className={`grid h-5 w-5 place-items-center rounded-lg ${tmpl.color}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{tmpl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Settings for Delay Template */}
        {selectedTemplate === 'delay' && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="flex items-center gap-2">
              <span>مدة التأخير المتوقعة:</span>
              <select
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                className="rounded-lg border border-amber-500/40 bg-slate-950 px-2 py-1 text-white font-bold"
              >
                <option value={15}>15 دقيقة</option>
                <option value={30}>30 دقيقة</option>
                <option value={45}>45 دقيقة</option>
                <option value={60}>ساعة واحدة</option>
                <option value={90}>ساعة ونصف</option>
              </select>
            </div>
          </div>
        )}

        {/* Live Message Preview & Editor */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">معاينة نص الرسالة قبل الإرسال:</label>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-[#0B141A] p-3.5 shadow-inner">
            {/* WhatsApp Chat Bubble Aesthetic */}
            <div className="rounded-2xl rounded-tr-none bg-[#005C4B] p-3 text-xs text-white shadow leading-relaxed whitespace-pre-wrap font-sans">
              {messageText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>نسخ النص</span>
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-400 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>فتح محادثة واتساب الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
