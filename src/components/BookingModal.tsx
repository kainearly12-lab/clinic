import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, ChevronLeft, Clock3, Sparkles } from 'lucide-react';
import { branches } from '@/data/clinicData';
import { Modal } from './ui/Modal';
import { MagneticButton } from './ui/MagneticButton';
import { generateWhatsAppBookingUrl, validateBookingDate } from '@/services/bookingValidationService';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  initialService?: string;
  initialBranch?: string;
}

export function BookingModal({ open, onClose, initialService = '', initialBranch = '' }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService);
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [branch, setBranch] = useState(initialBranch || branches[0]?.id || 'nasr-city');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Synchronize when initialService or initialBranch changes
  useEffect(() => {
    if (open) {
      if (initialService) setService(initialService);
      if (initialBranch) setBranch(initialBranch);
      setValidationError(null);
    }
  }, [open, initialService, initialBranch]);

  // Real-time validation when preferredDateTime changes
  useEffect(() => {
    if (!preferredDateTime.trim()) {
      setValidationError(null);
      return;
    }

    let isSubscribed = true;
    const timer = setTimeout(async () => {
      try {
        const validation = await validateBookingDate(preferredDateTime, branch);
        if (isSubscribed) {
          if (validation.isHoliday || !validation.isValid) {
            setValidationError(validation.errorMessageAr || 'عذراً، العيادة مغلقة في هذا اليوم');
          } else {
            setValidationError(null);
            // If branch swap detected, update branch selection automatically
            if (validation.isBranchSwapped && validation.targetBranch) {
              setBranch(validation.targetBranch.id);
            }
          }
        }
      } catch (err) {
        console.error('Validation check error:', err);
      }
    }, 400);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [preferredDateTime, branch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    setIsValidating(true);

    try {
      // Validate schedule exception and generate WhatsApp URL
      const result = await generateWhatsAppBookingUrl({
        name,
        phone,
        service,
        preferredDateTime,
        branchId: branch,
        notes,
      });

      // If date is marked as active holiday, strictly disable form submission and WhatsApp generation
      if (!result.success || result.isHoliday || !result.url) {
        setValidationError(result.errorMessageAr || 'عذراً، العيادة مغلقة في هذا اليوم');
        setIsValidating(false);
        return;
      }

      // If override_branch_id (branch swap) active, automatically route to replacement branch
      if (result.isBranchSwapped && result.targetBranch) {
        setBranch(result.targetBranch.id);
      }

      // Open WhatsApp in new tab
      window.open(result.url, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
    } catch (err) {
      console.error('Booking submission error:', err);
      setValidationError('عذراً، العيادة مغلقة في هذا اليوم');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setService('');
      setPreferredDateTime('');
      setNotes('');
      setValidationError(null);
    }, 300);
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="booking-title">
      {submitted ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-teal-500/20 text-[#00B8A9] border border-[#00B8A9]/40 shadow-[0_0_15px_rgba(0,184,169,0.25)]">
            <Check className="h-8 w-8" />
          </div>
          <h2 id="booking-title" className="mb-3 text-2xl font-bold text-white">
            تم استلام وتجهيز طلبك بنجاح
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-slate-300">
            تم تحويل تفاصيل الحجز إلى واتساب الفرع المختار مباشرة، وسيتواصل معك فريقنا لتأكيد الموعد فوراً.
          </p>
          <button onClick={handleClose} className="btn-primary w-full py-3.5">
            العودة للموقع
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <div className="mb-6">
            <span className="text-xs font-black tracking-widest text-[#00B8A9] uppercase">
              BOOK AN APPOINTMENT
            </span>
            <h2 id="booking-title" className="mt-1.5 text-2xl font-bold text-white">
              احجز استشارتك
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              اترك بياناتك وسيتواصل معك فريقنا لتأكيد الوقت والفرع الأنسب لك.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="branch" className="field-label text-slate-200">اختر الفرع</label>
              <select
                id="branch"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="field-input font-medium bg-slate-800/90 border-slate-700 text-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-800 text-white">
                    {b.nameAr} ({b.cityAr})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="name" className="field-label text-slate-200">الاسم</label>
              <input
                id="name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="اكتب اسمك بالكامل"
              />
            </div>
            <div>
              <label htmlFor="phone" className="field-label text-slate-200">رقم الهاتف</label>
              <input
                id="phone"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field-input bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="service" className="field-label text-slate-200">نوع الخدمة</label>
              <input
                id="service"
                required
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="field-input bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="مثال: ليزر إزالة الشعر، نضارة البشرة، علاج حب الشباب..."
              />
            </div>
            <div>
              <label htmlFor="datetime" className="field-label text-slate-200">التاريخ والوقت المفضل</label>
              <input
                id="datetime"
                required
                type="text"
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                className="field-input bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="مثال: غداً الساعة 5 مساءً، أو يوم السبت القادم"
              />
            </div>
            <div>
              <label htmlFor="notes" className="field-label text-slate-200">
                ملاحظات <span className="font-normal text-slate-400">(اختياري)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field-input resize-none bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="هل لديك أي ملاحظات أو استفسار؟"
              />
            </div>

            {/* Schedule Exception Holiday Alert */}
            {validationError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/50 bg-red-950/40 p-3.5 text-xs font-bold text-red-200 flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || Boolean(validationError)}
              className={`btn-primary mt-2 w-full py-3.5 shadow-md hover:shadow-[0_0_20px_rgba(0,184,169,0.35)] hover:-translate-y-0.5 transition-all duration-300 bg-teal-600 hover:bg-[#00B8A9] ${
                isValidating || Boolean(validationError) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isValidating ? (
                'جاري التحقق من المواعيد...'
              ) : (
                <>
                  إرسال طلب الحجز <ChevronLeft className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400">
              <Clock3 className="h-3.5 w-3.5 text-[#00B8A9]" /> الطلب يحولك مباشرة للفرع المختار عبر واتساب
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}

export function BookingButton({
  onClick,
  children = 'احجز موعدك',
  className = '',
}: {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <MagneticButton
      onClick={onClick}
      className={`btn-primary shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
      <ChevronLeft className="h-4 w-4" />
    </MagneticButton>
  );
}

export function BookingIcon() {
  return <Sparkles className="h-4 w-4" />;
}
