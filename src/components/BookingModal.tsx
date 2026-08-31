import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, Clock3, Sparkles } from 'lucide-react';
import { branches } from '@/data/clinicData';
import { Modal } from './ui/Modal';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  initialService?: string;
  initialBranch?: string;
}

// Branch WhatsApp routing configuration
const branchWhatsAppNumbers: Record<string, string> = {
  'nasr-city': '201154021247',
  'fifth-settlement': '201223371075',
  'maadi': '201154021249',
  'new-giza': '201154021248',
};

export function BookingModal({ open, onClose, initialService = '', initialBranch = '' }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService);
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [branch, setBranch] = useState(initialBranch || branches[0]?.id || 'nasr-city');

  // Synchronize when initialService or initialBranch changes
  useEffect(() => {
    if (open) {
      if (initialService) setService(initialService);
      if (initialBranch) setBranch(initialBranch);
    }
  }, [open, initialService, initialBranch]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedBranchObj = branches.find((b) => b.id === branch) || branches[0];
    const targetWhatsAppNumber = branchWhatsAppNumbers[branch] || '201154021247';

    // Construct clean Arabic WhatsApp message
    const messageLines = [
      'مرحبًا عيادات Androderma، أرغب في حجز موعد استشارة:',
      `📍 الفرع المطلوب: ${selectedBranchObj.nameAr} (${selectedBranchObj.cityAr})`,
      `👤 الاسم: ${name.trim()}`,
      `📞 الهاتف: ${phone.trim()}`,
      `✨ نوع الخدمة: ${service.trim() || 'استشارة عامة'}`,
      `🗓️ الموعد المفضل: ${preferredDateTime.trim() || 'أقرب موعد متاح'}`,
    ];

    if (notes.trim()) {
      messageLines.push(`📝 ملاحظات إضافية: ${notes.trim()}`);
    }

    const fullMessage = messageLines.join('\n');
    const waUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(fullMessage)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
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
    }, 300);
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="booking-title">
      {submitted ? (
        <div className="px-7 py-14 text-center sm:px-10">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-600 dark:text-sage-300">
            <Check className="h-7 w-7" />
          </div>
          <h2 id="booking-title" className="mb-3 text-2xl font-bold text-charcoal-950 dark:text-white">
            تم استلام وتجهيز طلبك بنجاح
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-charcoal-800/70 dark:text-gray-300">
            تم تحويل تفاصيل الحجز إلى واتساب الفرع المختار مباشرة، وسيتواصل معك فريقنا لتأكيد الموعد فوراً.
          </p>
          <button onClick={handleClose} className="btn-primary w-full">
            العودة للموقع
          </button>
        </div>
      ) : (
        <div className="max-h-[90vh] overflow-y-auto px-6 pb-7 pt-12 sm:px-8">
          <div className="mb-6">
            <span className="eyebrow dark:text-sage-400">BOOK AN APPOINTMENT</span>
            <h2 id="booking-title" className="mt-2 text-2xl font-bold text-charcoal-950 dark:text-white">
              احجز استشارتك
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-800/70 dark:text-gray-300">
              اترك بياناتك وسيتواصل معك فريقنا لتأكيد الوقت والفرع الأنسب لك.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="branch" className="field-label">اختر الفرع</label>
              <select
                id="branch"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="field-input font-medium"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-gray-800 dark:text-white">
                    {b.nameAr} ({b.cityAr})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="name" className="field-label">الاسم</label>
              <input
                id="name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="اكتب اسمك بالكامل"
              />
            </div>
            <div>
              <label htmlFor="phone" className="field-label">رقم الهاتف</label>
              <input
                id="phone"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field-input"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="service" className="field-label">نوع الخدمة</label>
              <input
                id="service"
                required
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="field-input"
                placeholder="مثال: ليزر إزالة الشعر، نضارة البشرة، علاج حب الشباب..."
              />
            </div>
            <div>
              <label htmlFor="datetime" className="field-label">التاريخ والوقت المفضل</label>
              <input
                id="datetime"
                required
                type="text"
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                className="field-input"
                placeholder="مثال: غداً الساعة 5 مساءً، أو يوم السبت القادم"
              />
            </div>
            <div>
              <label htmlFor="notes" className="field-label">
                ملاحظات <span className="font-normal text-charcoal-800/40 dark:text-gray-400">(اختياري)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field-input resize-none"
                placeholder="هل لديك أي ملاحظات أو استفسار؟"
              />
            </div>
            <button
              type="submit"
              className="btn-primary mt-2 w-full py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              إرسال طلب الحجز <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-charcoal-800/50 dark:text-gray-400">
              <Clock3 className="h-3 w-3" /> الطلب يحولك مباشرة للفرع المختار عبر واتساب
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
    <button
      onClick={onClick}
      className={`btn-primary shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {children}
      <ChevronLeft className="h-4 w-4" />
    </button>
  );
}

export function BookingIcon() {
  return <Sparkles className="h-4 w-4" />;
}
