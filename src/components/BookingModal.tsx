import { useState } from 'react';
import { Check, ChevronLeft, Clock3, Sparkles } from 'lucide-react';
import { branches, services } from '@/data/clinicData';
import { Modal } from './ui/Modal';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const timeOptions = ['10:00 ص', '12:00 م', '2:00 م', '4:00 م', '6:00 م', '8:00 م'];

export function BookingModal({ open, onClose }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [service, setService] = useState('');
  const [branch, setBranch] = useState(branches[0]?.id || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="booking-title">
      {submitted ? (
        <div className="px-7 py-14 text-center sm:px-10">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-sage-100 text-sage-600">
            <Check className="h-7 w-7" />
          </div>
          <h2 id="booking-title" className="mb-3 text-2xl font-bold text-charcoal-950">
            تم استلام طلبك بنجاح
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-7 text-charcoal-800/65">
            سيتواصل معك فريق العيادة لتأكيد الموعد بالفرع المختار في أقرب وقت.
          </p>
          <button onClick={handleClose} className="btn-primary w-full">
            العودة للموقع
          </button>
        </div>
      ) : (
        <div className="max-h-[90vh] overflow-y-auto px-6 pb-7 pt-12 sm:px-8">
          <div className="mb-6">
            <span className="eyebrow">BOOK AN APPOINTMENT</span>
            <h2 id="booking-title" className="mt-2 text-2xl font-bold text-charcoal-950">
              احجز استشارتك
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-800/60">
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
                  <option key={b.id} value={b.id}>
                    {b.nameAr} ({b.cityAr})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="name" className="field-label">الاسم</label>
              <input id="name" required className="field-input" placeholder="اكتب اسمك بالكامل" />
            </div>
            <div>
              <label htmlFor="phone" className="field-label">رقم الهاتف</label>
              <input id="phone" required type="tel" className="field-input" placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div>
              <label htmlFor="service" className="field-label">نوع الخدمة</label>
              <select id="service" required value={service} onChange={(e) => setService(e.target.value)} className="field-input">
                <option value="">اختر الخدمة</option>
                {services.map((item) => <option key={item.id} value={item.id}>{item.titleAr}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className="field-label">التاريخ المفضل</label>
                <input id="date" required type="date" className="field-input" />
              </div>
              <div>
                <label htmlFor="time" className="field-label">الوقت المفضل</label>
                <select id="time" required className="field-input">
                  <option value="">اختر الوقت</option>
                  {timeOptions.map((time) => <option key={time}>{time}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="field-label">ملاحظات <span className="font-normal text-charcoal-800/40">(اختياري)</span></label>
              <textarea id="notes" rows={3} className="field-input resize-none" placeholder="هل لديك أي ملاحظات أو استفسار؟" />
            </div>
            <button type="submit" className="btn-primary mt-2 w-full py-3.5">
              إرسال طلب الحجز <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-charcoal-800/45">
              <Clock3 className="h-3 w-3" /> الطلب لا يُعد تأكيدًا نهائيًا للموعد
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}

export function BookingButton({ onClick, children = 'احجز موعدك' }: { onClick: () => void; children?: React.ReactNode }) {
  return <button onClick={onClick} className="btn-primary">{children}<ChevronLeft className="h-4 w-4" /></button>;
}

export function BookingIcon() {
  return <Sparkles className="h-4 w-4" />;
}


