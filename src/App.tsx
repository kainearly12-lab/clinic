import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Quote,
  Sparkles,
  Star,
  X,
  Facebook,
  Instagram,
  Building2,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { LogoMark } from '@/components/LogoMark';
import { BookingButton, BookingModal } from '@/components/BookingModal';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';
import { branches, clinic, faqs, galleryItems, reviews, services } from '@/data/clinicData';
import { useCountUp } from '@/hooks/useCountUp';

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

function TrustBar() {
  const [visible, setVisible] = useState(false);
  const reviewsValue = useCountUp(clinic.reviewsCount, 1100, visible);
  return (
    <section className="border-y border-ivory-300/80 bg-ivory-50">
      <div className="container-px grid grid-cols-2 divide-x divide-x-reverse divide-ivory-300/80 sm:grid-cols-4">
        {[
          { icon: Star, value: clinic.rating.toFixed(1), label: 'التقييم على Google', suffix: ' / 5' },
          { icon: Quote, value: Math.round(reviewsValue).toString(), label: 'تقييمات Google', suffix: '' },
          { icon: Building2, value: '4 فروع', label: 'القاهرة والجيزة', suffix: '' },
          { icon: Clock3, value: '11 PM', label: 'يغلق', suffix: '' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              ref={i === 1 ? () => setVisible(true) : undefined}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex min-h-[96px] flex-col justify-center gap-1 px-4 py-5 sm:px-7"
            >
              <div className="flex items-center gap-2 text-sage-600">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-lg font-bold text-charcoal-900">
                  {item.value}
                  <small className="text-xs font-medium">{item.suffix}</small>
                </span>
              </div>
              <span className="text-[11px] text-charcoal-800/55">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="home" className="relative min-h-[720px] overflow-hidden bg-ivory-100 pt-28 sm:min-h-[780px] sm:pt-36">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-sage-200/25 blur-3xl" />
      <div className="container-px relative grid items-center gap-12 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pb-28">
        <div className="relative z-10 max-w-xl lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-sage-500" />
            <span className="eyebrow">DERMATOLOGY & LASER CLINIC</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg text-[2.65rem] font-bold leading-[1.22] tracking-[-0.04em] text-charcoal-950 sm:text-6xl lg:text-[4.2rem]"
          >
            عناية متقدمة ببشرتك،<br />
            <span className="text-sage-600">تبدأ من التشخيص الصحيح</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-6 max-w-md text-[15px] leading-8 text-charcoal-800/65 sm:text-base"
          >
            تجربة متكاملة للعناية بالبشرة والليزر بأحدث الأجهزة الطبية في 4 فروع مجهزة لراحتك.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <BookingButton onClick={onBook} />
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-secondary">
              <MessageCircle className="h-4 w-4 text-sage-600" /> تواصل على واتساب
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4 text-xs text-charcoal-800/55 sm:gap-5"
          >
            <span className="flex items-center gap-1.5 font-medium text-charcoal-800">
              <MapPin className="h-3.5 w-3.5 text-sage-600" /> مدينة نصر • التجمع • المعادي • نيو جيزة
            </span>
            <span className="hidden h-3 w-px bg-ivory-400 sm:inline-block" />
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-champagne-400 text-champagne-400" /> 3.9 • 54 Google Reviews
            </span>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[550px] lg:order-1 lg:mx-0"
        >
          <div className="relative aspect-[0.82] overflow-hidden rounded-[2rem] bg-sage-200 shadow-lift sm:aspect-[0.9]">
            {/* Upgraded Hero Image: Luxurious, high-end medical clinic interior & aesthetic laser suite */}
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
              alt="أجواء فاخرة وتجهيزات طبية متطورة في Androderma"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/40 via-transparent to-ivory-50/10" />
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-dark absolute -right-3 bottom-8 max-w-[190px] rounded-2xl border border-ivory-50/20 px-4 py-3 text-ivory-50 shadow-lift sm:-right-8"
          >
            <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-sage-300/20">
              <Sparkles className="h-3.5 w-3.5 text-sage-200" />
            </span>
            <p className="text-xs leading-5 text-ivory-100/90">
              أحدث تقنيات الليزر<br />
              <span className="text-sage-200">بمعايير طبية عالمية</span>
            </p>
          </motion.div>
          <div className="absolute -left-4 top-8 hidden rounded-2xl border border-ivory-50/50 bg-ivory-50 px-4 py-3 shadow-soft sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-charcoal-900">4</span>
              <div>
                <span className="block text-[11px] font-bold text-charcoal-900">فروع معتمدة</span>
                <span className="text-[9px] text-charcoal-800/50">القاهرة & الجيزة</span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full border border-sage-300/50" />
        </motion.div>
      </div>
      <div className="container-px hidden items-center justify-between border-t border-ivory-300/70 py-4 text-[10px] tracking-[0.25em] text-charcoal-800/35 sm:flex">
        <span>SKIN / LASER / CARE</span>
        <span>SCROLL TO DISCOVER ↓</span>
      </div>
    </section>
  );
}

function Services({ onBook }: { onBook: () => void }) {
  return (
    <section id="services" className="bg-ivory-50 py-24 sm:py-32">
      <div className="container-px">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">WHAT WE DO</span>
              <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight sm:text-5xl">
                خدمات تضع <span className="text-sage-600">احتياجاتك</span> أولاً
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-7 text-charcoal-800/60">
              الخدمات المتاحة تُقدم بعناية واهتمام بالتفاصيل، وتبدأ دائمًا من فهم ما تحتاجه بشرتك.
            </p>
          </div>
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {services.map((service, i) => (
            <motion.article
              key={service.id}
              variants={staggerItem}
              whileHover={{ y: -7 }}
              className={`group relative overflow-hidden rounded-2xl bg-charcoal-900 ${
                i === 1 ? 'lg:translate-y-8' : ''
              }`}
            >
              <div className="aspect-[0.82] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.titleAr}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/35 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-ivory-50">
                <span className="mb-3 block text-xs font-medium text-sage-200">0{i + 1}</span>
                <h3 className="text-xl font-bold">{service.titleAr}</h3>
                <p className="mt-2 text-xs leading-6 text-ivory-100/70">{service.descriptionAr}</p>
                <button
                  onClick={onBook}
                  className="mt-4 flex items-center gap-2 text-xs font-semibold text-sage-200 transition-all group-hover:gap-3"
                >
                  {service.ctaAr}
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="overflow-hidden bg-charcoal-900 py-24 text-ivory-50 sm:py-32">
      <div className="container-px grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="aspect-[0.82] overflow-hidden rounded-[2rem] bg-sage-700">
              <img
                src="https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="مساحة هادئة للعناية"
                loading="lazy"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="absolute -bottom-6 -left-5 hidden w-44 rounded-2xl border border-ivory-50/15 bg-charcoal-800 p-4 sm:block">
              <span className="eyebrow text-sage-300">THE EXPERIENCE</span>
              <p className="mt-2 text-sm leading-6 text-ivory-100/80">احترافية تبدأ من أول لحظة.</p>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-sage-500/40" />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="order-1 lg:order-2">
          <span className="eyebrow text-sage-300">A DIFFERENT APPROACH</span>
          <h2 className="mt-4 max-w-lg text-3xl font-bold leading-[1.35] sm:text-5xl">
            لأن العناية الحقيقية<br />
            <span className="text-sage-300">تبدأ بالاستماع</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-8 text-ivory-100/60">
            في Androderma، نؤمن أن كل بشرة لها قصتها الخاصة. لذلك نمنحك مساحة هادئة لفهم احتياجاتك، ونعمل معك على تجربة عناية تناسبك في كافة فروعنا.
          </p>
          <div className="mt-9 grid max-w-md grid-cols-2 gap-5 border-t border-ivory-50/15 pt-6">
            <div>
              <span className="mb-2 block text-sage-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold">اهتمام بالتفاصيل</h3>
              <p className="mt-1 text-xs leading-5 text-ivory-100/50">كل خطوة محسوبة لراحتك.</p>
            </div>
            <div>
              <span className="mb-2 block text-sage-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold">تواصل أسهل</h3>
              <p className="mt-1 text-xs leading-5 text-ivory-100/50">نحن هنا للإجابة عن أسئلتك.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <section id="gallery" className="bg-ivory-100 py-24 sm:py-32">
      <div className="container-px">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="eyebrow">A GLIMPSE INSIDE</span>
              <h2 className="mt-3 text-3xl font-bold sm:text-5xl">
                من داخل <span className="text-sage-600">Androderma</span>
              </h2>
            </div>
            <span className="hidden text-xs text-charcoal-800/45 sm:block">اضغط على الصورة للتكبير</span>
          </div>
        </Reveal>
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-5">
          {galleryItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item.src)}
              whileHover={{ scale: 0.985 }}
              className={`group relative overflow-hidden rounded-2xl text-right ${
                item.span === 'tall' ? 'row-span-2' : item.span === 'wide' ? 'col-span-2' : ''
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover grayscale-[15%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-charcoal-950/0 transition group-hover:bg-charcoal-950/20" />
              <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-ivory-50/90 text-charcoal-900 opacity-0 shadow-soft transition group-hover:opacity-100">
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          ))}
          <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl">
            <img
              src="https://images.pexels.com/photos/6899554/pexels-photo-6899554.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="مساحة العيادة الداخلية"
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <ImageIcon className="mb-4 h-5 w-5 text-sage-200" />
              <span className="eyebrow text-sage-200">OUR SPACE</span>
              <p className="mt-3 text-lg font-semibold leading-8 text-ivory-50">
                مساحة صُممت لتشعر فيها بالراحة والثقة.
              </p>
              <a
                href={clinic.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 text-xs font-bold text-sage-200 transition-all hover:gap-3"
              >
                اكتشف فروعنا <ArrowLeft className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal-950/85 p-5"
            onClick={() => setSelected(null)}
          >
            <button
              aria-label="إغلاق"
              onClick={() => setSelected(null)}
              className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-ivory-50/10 text-ivory-50"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              src={selected}
              alt="صورة مكبرة من العيادة"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Reviews() {
  return (
    <section id="reviews" className="bg-ivory-50 py-24 sm:py-32">
      <div className="container-px">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">GOOGLE REVIEWS</span>
              <h2 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                تجارب حقيقية،<br />
                <span className="text-sage-600">بكلمات أصحابها</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-4xl font-bold text-charcoal-950">3.9</div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3 w-3 ${
                        n < 4 ? 'fill-champagne-400 text-champagne-400' : 'text-champagne-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-ivory-300" />
              <span className="max-w-[100px] text-xs leading-5 text-charcoal-800/55">54 تقييمًا على Google</span>
            </div>
          </div>
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-2" stagger={0.12}>
          {reviews.map((review) => (
            <motion.blockquote
              key={review.id}
              variants={staggerItem}
              className="relative rounded-2xl border border-ivory-300 bg-ivory-100 p-7 sm:p-9"
            >
              <Quote className="mb-5 h-7 w-7 text-sage-400" />
              <p className="text-base font-medium leading-8 text-charcoal-800 sm:text-lg">{review.text}</p>
              <footer className="mt-7 flex items-center justify-between border-t border-ivory-300 pt-5">
                <span className="text-xs text-charcoal-800/45">{review.author ?? 'مراجع Google'}</span>
                <span className="flex items-center gap-1 text-[10px] text-charcoal-800/45">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[9px] font-bold text-blue-500">
                    G
                  </span>{' '}
                  Google Reviews
                </span>
              </footer>
            </motion.blockquote>
          ))}
        </Stagger>
        <div className="mt-8 text-center">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Androderma+Laser+Clinic+Nasr+City"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            عرض جميع التقييمات <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-ivory-100 py-24 sm:py-32">
      <div className="container-px grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-24">
        <Reveal>
          <span className="eyebrow">NEED TO KNOW</span>
          <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight sm:text-5xl">
            أسئلة قد<br />
            <span className="text-sage-600">تخطر ببالك</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-7 text-charcoal-800/60">
            لم تجد إجابتك؟ تواصل معنا مباشرة وسيسعد فريقنا بمساعدتك في أي من فروعنا.
          </p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn-ghost mt-5 -mr-5 text-sage-700">
            اسألنا على واتساب <ArrowLeft className="h-4 w-4" />
          </a>
        </Reveal>
        <div>
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.06}>
              <div className="border-b border-ivory-300">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-right"
                >
                  <span className="text-sm font-semibold text-charcoal-900">{faq.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                      open === i ? 'bg-charcoal-900 text-ivory-50' : 'bg-ivory-200 text-charcoal-800'
                    }`}
                  >
                    {open === i ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pl-12 text-sm leading-7 text-charcoal-800/60">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Location({ onBook }: { onBook: () => void }) {
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0].id);
  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <section id="contact" className="bg-sage-100 py-24 sm:py-32">
      <div className="container-px">
        <div className="mb-10 text-center sm:text-right">
          <span className="eyebrow text-sage-700">OUR BRANCHES</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
            فروعنا <span className="text-sage-600">في خدمتك</span>
          </h2>
          <p className="mt-3 text-sm text-charcoal-800/70">
            اختر الفرع الأقرب إليك لعرض العنوان المباشر، أرقام التواصل، وخريطة الوصول التفاعلية
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div className="mb-8 flex flex-wrap gap-2.5 rounded-2xl border border-charcoal-900/10 bg-ivory-50/80 p-2 shadow-soft sm:gap-3">
          {branches.map((b) => {
            const isActive = b.id === currentBranch.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`relative flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold transition-all sm:text-sm ${
                  isActive
                    ? 'bg-charcoal-900 text-ivory-50 shadow-md'
                    : 'text-charcoal-800 hover:bg-ivory-200/80'
                }`}
              >
                <MapPin className={`h-4 w-4 shrink-0 ${isActive ? 'text-sage-300' : 'text-sage-600'}`} />
                <span>{b.nameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Main Branch Details & Interactive Map Card */}
        <div className="grid items-stretch overflow-hidden rounded-[2rem] bg-charcoal-900 text-ivory-50 shadow-lift lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-12 lg:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-sage-400/20" />

            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-sage-300">BRANCH DETAILS</span>
                <span className="rounded-full bg-sage-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-sage-300">
                  {currentBranch.cityAr}
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-bold leading-snug sm:text-4xl text-ivory-50">
                {currentBranch.nameAr}
              </h3>

              <div className="mt-8 space-y-5 border-t border-ivory-50/15 pt-7 text-xs sm:text-sm">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/40">
                      العنوان
                    </span>
                    <p className="leading-7 text-ivory-100/90 font-medium">
                      {currentBranch.addressAr}
                    </p>
                  </div>
                </div>

                {/* Clickable Phone(s) */}
                <div className="flex items-start gap-3.5">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/40">
                      أرقام الهاتف المباشرة (اضغط للاتصال)
                    </span>
                    <div className="flex flex-wrap gap-2.5 pt-0.5">
                      {currentBranch.phones.map((p) => (
                        <a
                          key={p.number}
                          href={`tel:${p.number}`}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sage-400/30 bg-charcoal-800/80 px-3 py-1.5 font-semibold text-ivory-100 transition hover:border-sage-300 hover:bg-sage-600 hover:text-white"
                        >
                          <Phone className="h-3 w-3 text-sage-300" />
                          <span>{p.display}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/40">
                      البريد الإلكتروني
                    </span>
                    <a
                      href={`mailto:${clinic.email}`}
                      className="inline-block font-medium text-sage-200 transition hover:underline hover:text-white"
                    >
                      Email Us: {clinic.email}
                    </a>
                  </div>
                </div>

                {/* Closing / Operating Hours */}
                <div className="flex items-center gap-3.5">
                  <Clock3 className="h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-0.5 block text-[10px] uppercase tracking-wider text-ivory-100/40">
                      مواعيد العمل
                    </span>
                    <p className="text-ivory-100/85">{clinic.closingNote}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3 pt-6 border-t border-ivory-50/15">
              <BookingButton onClick={onBook}>احجز في هذا الفرع</BookingButton>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary border-ivory-50/20 bg-transparent text-ivory-50 hover:bg-ivory-50/10"
              >
                <MessageCircle className="h-4 w-4 text-sage-300" /> واتساب
              </a>
            </div>
          </div>

          {/* Interactive Google Map with Dynamic Iframe */}
          <div className="relative min-h-[380px] bg-charcoal-950/60 p-3 sm:p-5 lg:min-h-full">
            <iframe
              key={currentBranch.id}
              title={`موقع ${currentBranch.nameAr} على الخريطة`}
              src={currentBranch.mapSrc || branches[0].mapSrc}
              className="w-full h-full rounded-2xl border-0 bg-gray-100 min-h-[350px] lg:min-h-full"
              allowFullScreen
              loading="lazy"
            />
            <a
              href={currentBranch.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-ivory-50/95 px-4 py-2.5 text-xs font-bold text-charcoal-950 shadow-lift transition hover:bg-white active:scale-95"
            >
              فتح الموقع على الخريطة <ExternalLink className="h-3.5 w-3.5 text-sage-700" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ivory-50 pb-24 pt-16 sm:pb-10">
      <div className="container-px">
        <div className="flex flex-col justify-between gap-10 border-b border-ivory-300 pb-10 sm:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size="md" />
              <div>
                <span className="block font-display text-lg font-bold leading-none text-charcoal-950">
                  Androderma
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-sage-600 uppercase">
                  Laser Clinic
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-[260px] text-xs leading-6 text-charcoal-800/65">
              {clinic.taglineAr} — متواجدون في 4 فروع (مدينة نصر، التجمع الخامس، المعادي، نيو جيزة).
            </p>
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-charcoal-800/70">
              <a
                href={`mailto:${clinic.email}`}
                className="inline-flex items-center gap-2 text-sage-700 hover:text-charcoal-950 font-medium"
              >
                <Mail className="h-3.5 w-3.5" />
                Email: {clinic.email}
              </a>
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex items-center gap-2 text-sage-700 hover:text-charcoal-950 font-medium"
              >
                <Phone className="h-3.5 w-3.5" />
                <span dir="ltr">{clinic.phoneDisplay}</span>
              </a>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://www.instagram.com/androdermaclinic/?hl=ar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-ivory-300 text-charcoal-800/70 transition-all hover:border-charcoal-900/30 hover:bg-ivory-200 hover:text-charcoal-950"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://web.facebook.com/androdermaclinic/?locale=ar_AR&_rdc=1&_rdr#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-ivory-300 text-charcoal-800/70 transition-all hover:border-charcoal-900/30 hover:bg-ivory-200 hover:text-charcoal-950"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs text-charcoal-800/60 sm:grid-cols-3">
            <a href="#services" className="hover:text-charcoal-950">
              خدماتنا
            </a>
            <a href="#about" className="hover:text-charcoal-950">
              عن العيادة
            </a>
            <a href="#gallery" className="hover:text-charcoal-950">
              المعرض
            </a>
            <a href="#reviews" className="hover:text-charcoal-950">
              التقييمات
            </a>
            <a href="#faq" className="hover:text-charcoal-950">
              الأسئلة الشائعة
            </a>
            <a href="#contact" className="hover:text-charcoal-950">
              فروعنا وتواصل معنا
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-6 text-[11px] text-charcoal-800/45 sm:flex-row">
          <span>© {new Date().getFullYear()} Androderma Laser Clinic — جميع الحقوق محفوظة</span>
          <span>العناية التي تبدأ من الفهم والتطور الطبي</span>
        </div>
      </div>
    </footer>
  );
}

function MobileBottomBar({ onBook }: { onBook: () => void }) {
  return (
    <div className="glass fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-ivory-300/80 p-2 shadow-lift sm:hidden">
      <button onClick={onBook} className="btn-primary flex-1 py-3 text-xs">
        <CalendarDays className="h-3.5 w-3.5" /> احجز موعدك
      </button>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="grid w-14 place-items-center rounded-xl bg-sage-600 text-ivory-50 transition hover:bg-sage-700"
        aria-label="واتساب"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <div className="overflow-hidden">
      <Header />
      <main>
        <Hero onBook={() => setBookingOpen(true)} />
        <TrustBar />
        <Services onBook={() => setBookingOpen(true)} />
        <About />
        <Gallery />
        <Reviews />
        <FAQ />
        <Location onBook={() => setBookingOpen(true)} />
      </main>
      <Footer />
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-sage-600 text-ivory-50 shadow-lift transition hover:scale-105 hover:bg-sage-700 sm:flex"
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <MobileBottomBar onBook={() => setBookingOpen(true)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

export default App;

