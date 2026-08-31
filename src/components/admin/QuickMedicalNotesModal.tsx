import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  X,
  Check,
  FileText,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { AppointmentRecord, VisitType } from '@/types/admin';
import { updateMedicalNotes } from '@/services/appointmentService';

interface QuickMedicalNotesModalProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onSaved: (updatedApt: AppointmentRecord) => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const VISIT_TYPE_OPTIONS: VisitType[] = [
  'كشف جديد',
  'استشارة ومتابعة',
  'جلسة ليزر',
  'إجراء تجميلي',
  'كشف طارئ',
];

const PRESET_CLINICAL_TAGS = [
  'حب شباب وآثار ندبات',
  'جلسة ليزر كانديلا جنتل برو',
  'هيدرافيشل وتنظيف عميق',
  'تصبغات وكلف وبقع شمسية',
  'تساقط شعر وبلازما PRP',
  'حقن بوتوكس / فيلر',
  'تقشير كيميائي / بارد',
  'متابعة روتين علاجي وواقي شمس',
  'أكزيما / حساسية جلدية',
];

export function QuickMedicalNotesModal({
  appointment,
  onClose,
  onSaved,
  onNotify,
}: QuickMedicalNotesModalProps) {
  const [visitType, setVisitType] = useState<string>('كشف جديد');
  const [medicalNotes, setMedicalNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (appointment) {
      setVisitType(appointment.visit_type || 'كشف جديد');
      setMedicalNotes(appointment.medical_notes || '');
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleAddTag = (tag: string) => {
    setMedicalNotes((prev) => {
      if (!prev.trim()) return `• ${tag}`;
      if (prev.includes(tag)) return prev;
      return `${prev}\n• ${tag}`;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateMedicalNotes(appointment.id, medicalNotes, visitType);
      if (res.success) {
        onNotify('success', `تم حفظ الملاحظات الطبية للمريض ${appointment.patient_name} بنجاح`);
        onSaved({
          ...appointment,
          visit_type: visitType,
          medical_notes: medicalNotes,
        });
        onClose();
      } else {
        onNotify('error', res.error || 'فشل حفظ الملاحظات الطبية');
      }
    } catch {
      onNotify('error', 'حدث خطأ أثناء حفظ البيانات الطبية');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border border-teal-500/30 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-500/20 text-[#00B8A9] border border-teal-500/40">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>سجل الملاحظات الطبية والتشخيص</span>
                <span className="text-[10px] font-black rounded-full bg-teal-500/20 text-[#00B8A9] px-2 py-0.5 border border-teal-500/30">
                  Doctor Notes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل التشخيص الأولي، نوع الزيارة، وخطة العلاج للمريض
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

        {/* Patient Summary Card */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-xs text-slate-300">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#00B8A9]" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">المريض:</span>
                <strong className="text-white font-bold">{appointment.patient_name}</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-400" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">الفرع:</span>
                <span className="font-semibold text-slate-200">{appointment.branch_name_ar || appointment.branch_id}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">الموعد:</span>
                <span className="font-mono text-slate-200">{appointment.appointment_date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">التوقيت:</span>
                <span className="font-semibold text-slate-200">{appointment.appointment_time}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Visit Type Select */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#00B8A9]" />
                <span>نوع الزيارة / الكشف الطبي *</span>
              </span>
              <span className="text-[10px] text-slate-400">حدد طبيعة الجلسة</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VISIT_TYPE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setVisitType(opt)}
                  className={`rounded-xl py-2 px-2.5 text-xs font-bold transition-all border text-center ${
                    visitType === opt
                      ? 'bg-teal-500/20 text-[#00B8A9] border-[#00B8A9] shadow-[0_0_12px_rgba(0,184,169,0.25)]'
                      : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Clinical Quick Tags */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>إدراج تشخيصات سريعة (اضغط للإضافة):</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {PRESET_CLINICAL_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 transition hover:border-[#00B8A9] hover:text-[#00B8A9] hover:bg-teal-950/30"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Notes Text Area */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-400" />
                <span>التشخيص والملاحظات الطبية للطبيب المعالج</span>
              </span>
              <span className="text-[10px] text-slate-400">تُحفظ مباشرة في ملف المريض</span>
            </label>
            <textarea
              rows={4}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="اكتب التشخيص الطبي، التوصيات العلاجية، الأدوية الموصوفة، أو عدد الجلسات المتبقية..."
              className="w-full rounded-2xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-[#00B8A9] px-5 py-2 font-bold text-slate-950 transition hover:bg-[#00d6c4] shadow-lg hover:shadow-[0_0_15px_rgba(0,184,169,0.3)] disabled:opacity-50"
            >
              {isSaving ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>حفظ الملاحظات الطبية</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
