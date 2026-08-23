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
  Building2,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { LuxuryFooter } from '@/components/LuxuryFooter';
import { SplashScreen } from '@/components/SplashScreen';
import { BookingButton, BookingModal } from '@/components/BookingModal';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';
import { branches, clinic, faqs, galleryItems, reviews, services } from '@/data/clinicData';
import { useCountUp } from '@/hooks/useCountUp';

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

function TrustBar() {
  const [visible, setVisible] = useState(false);
  const reviewsValue = useCountUp(clinic.reviewsCount, 1100, visible);
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-y border-ivory-300/80 dark:border-gray-800/80 bg-ivory-50 dark:bg-[#121419]"
    >
      <div className="container-px grid grid-cols-2 divide-x divide-x-reverse divide-ivory-300/80 dark:divide-gray-800/80 sm:grid-cols-4">
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
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex min-h-[96px] flex-col justify-center gap-1 px-4 py-5 sm:px-7"
            >
              <div className="flex items-center gap-2 text-sage-600 dark:text-sage-400">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-lg font-bold text-charcoal-900 dark:text-white">
                  {item.value}
                  <small className="text-xs font-medium">{item.suffix}</small>
                </span>
              </div>
              <span className="text-[11px] text-charcoal-800/55 dark:text-gray-400">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <motion.section
      id="home"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative min-h-[720px] overflow-hidden bg-ivory-100 dark:bg-[#0c0e12] pt-32 sm:min-h-[800px] sm:pt-40"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-sage-200/25 dark:bg-sage-600/10 blur-3xl" />
      <div className="container-px relative grid items-center gap-12 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pb-28">
        <div className="relative z-10 max-w-xl lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-sage-500" />
            <span className="eyebrow">DERMATOLOGY & LASER CLINICS</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg text-[2.5rem] font-extrabold leading-[1.45] tracking-normal text-charcoal-950 dark:text-white sm:text-5xl sm:leading-[1.4] lg:text-[3.9rem] lg:leading-[1.35]"
          >
            عناية متقدمة ببشرتك،<br className="hidden sm:block" />
            <span className="text-sage-600 dark:text-sage-400 block mt-2 sm:mt-1">تبدأ من التشخيص الصحيح</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal-800/75 dark:text-gray-300 sm:text-base"
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
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 text-sage-600 dark:text-sage-400" /> تواصل على واتساب
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4 text-xs text-charcoal-800/55 dark:text-gray-400 sm:gap-5"
          >
            <span className="flex items-center gap-1.5 font-medium text-charcoal-800 dark:text-gray-200">
              <MapPin className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400" /> مدينة نصر • التجمع • المعادي • نيو جيزة
            </span>
            <span className="hidden h-3 w-px bg-ivory-400 dark:bg-gray-700 sm:inline-block" />
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
          <div className="relative aspect-[0.82] overflow-hidden rounded-[2rem] bg-sage-200 dark:bg-sage-950 shadow-lift sm:aspect-[0.9]">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
              alt="أجواء فاخرة وتجهيزات طبية متطورة في عيادات Androderma"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/40 via-transparent to-ivory-50/10 dark:to-transparent" />
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-dark absolute -right-3 bottom-8 max-w-[190px] rounded-2xl border border-ivory-50/20 px-4 py-3 text-ivory-50 shadow-lift sm:-right-8"
          >
            <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-sage-300/20">
              <Sparkles className="h-3.5 w-3.5 text-sage-200" />
            </span>
            <p className="text-xs leading-relaxed text-ivory-100/90">
              أحدث تقنيات الليزر<br />
              <span className="text-sage-200 font-semibold">بمعايير طبية عالمية</span>
            </p>
          </motion.div>
          <div className="absolute -left-4 top-8 hidden rounded-2xl border border-ivory-50/50 dark:border-gray-700/60 bg-ivory-50 dark:bg-[#181b22] px-4 py-3 shadow-soft sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-charcoal-900 dark:text-white">4</span>
              <div>
                <span className="block text-[11px] font-bold text-charcoal-900 dark:text-white">فروع معتمدة</span>
                <span className="text-[9px] text-charcoal-800/50 dark:text-gray-400">القاهرة & الجيزة</span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full border border-sage-300/50 dark:border-sage-700/50" />
        </motion.div>
      </div>
      <div className="container-px hidden items-center justify-between border-t border-ivory-300/70 dark:border-gray-800/80 py-4 text-[10px] tracking-[0.25em] text-charcoal-800/35 dark:text-gray-500 sm:flex">
        <span>SKIN / LASER / CARE</span>
        <span>SCROLL TO DISCOVER ↓</span>
      </div>
    </motion.section>
  );
}

function Services({ onBook }: { onBook: () => void }) {
  return (
    <motion.section
      id="services"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-ivory-50 dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">WHAT WE DO</span>
              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-[1.65] text-charcoal-950 dark:text-white sm:text-4xl lg:text-5xl sm:leading-[1.5]">
                خدمات تضع <span className="text-sage-600 dark:text-sage-400">احتياجاتك</span> أولاً
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-charcoal-800/70 dark:text-gray-300">
              الخدمات المتاحة تُقدم بعناية واهتمام بالتفاصيل، وتبدأ دائمًا من فهم ما تحتاجه بشرتك.
            </p>
          </div>
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {services.map((service, i) => (
            <motion.article
              key={service.id}
              variants={staggerItem}
              whileHover={{ y: -7 }}
              className={`group relative overflow-hidden rounded-2xl bg-charcoal-900 border border-transparent dark:border-gray-800/60 shadow-md ${
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
                <span className="mb-2 block text-xs font-medium text-sage-200">0{i + 1}</span>
                <h3 className="text-xl font-bold leading-relaxed">{service.titleAr}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory-100/70">{service.descriptionAr}</p>
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
    </motion.section>
  );
}

function About() {
  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden bg-charcoal-900 dark:bg-[#0e1014] py-24 text-ivory-50 sm:py-32 border-y border-transparent dark:border-gray-800/80"
    >
      <div className="container-px grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="aspect-[0.82] overflow-hidden rounded-[2rem] bg-sage-700">
              <img
                src="https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="مساحة هادئة للعناية في عيادات Androderma"
                loading="lazy"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="absolute -bottom-6 -left-5 hidden w-44 rounded-2xl border border-ivory-50/15 bg-charcoal-800 p-4 sm:block">
              <span className="eyebrow text-sage-300">THE EXPERIENCE</span>
              <p className="mt-2 text-sm leading-relaxed text-ivory-100/80">احترافية تبدأ من أول لحظة.</p>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-sage-500/40" />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="order-1 lg:order-2">
          <span className="eyebrow text-sage-300">A DIFFERENT APPROACH</span>
          <h2 className="mt-4 max-w-lg text-3xl font-bold leading-[1.65] text-ivory-50 sm:text-4xl lg:text-5xl sm:leading-[1.5]">
            لأن العناية الحقيقية<br className="hidden sm:block" />
            <span className="text-sage-300 block mt-2 sm:mt-1">تبدأ بالاستماع</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory-100/70">
            في عيادات Androderma، نؤمن أن كل بشرة لها قصتها الخاصة. لذلك نمنحك مساحة هادئة لفهم احتياجاتك، ونعمل معك على تجربة عناية تناسبك في كافة فروعنا.
          </p>
          <div className="mt-9 grid max-w-md grid-cols-2 gap-5 border-t border-ivory-50/15 pt-6">
            <div>
              <span className="mb-2 block text-sage-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold leading-relaxed">اهتمام بالتفاصيل</h3>
              <p className="mt-1 text-xs leading-relaxed text-ivory-100/60">كل خطوة محسوبة لراحتك.</p>
            </div>
            <div>
              <span className="mb-2 block text-sage-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold leading-relaxed">تواصل أسهل</h3>
              <p className="mt-1 text-xs leading-relaxed text-ivory-100/60">نحن هنا للإجابة عن أسئلتك.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </motion.section>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <motion.section
      id="gallery"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-ivory-100 dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="eyebrow">A GLIMPSE INSIDE</span>
              <h2 className="mt-4 text-3xl font-bold leading-[1.65] text-charcoal-950 dark:text-white sm:text-4xl lg:text-5xl sm:leading-[1.5]">
                من داخل <span className="text-sage-600 dark:text-sage-400">عيادات Androderma</span>
              </h2>
            </div>
            <span className="hidden text-xs text-charcoal-800/50 dark:text-gray-400 sm:block">اضغط على الصورة للتكبير</span>
          </div>
        </Reveal>
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-5">
          {galleryItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item.src)}
              whileHover={{ scale: 0.985 }}
              className={`group relative overflow-hidden rounded-2xl text-right border border-transparent dark:border-gray-800/50 ${
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
              <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-ivory-50/90 dark:bg-gray-800 text-charcoal-900 dark:text-white opacity-0 shadow-soft transition group-hover:opacity-100">
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          ))}
          <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl border border-transparent dark:border-gray-800/50">
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
              <p className="mt-3 text-lg font-semibold leading-relaxed text-ivory-50">
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
            className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal-950/85 backdrop-blur-sm p-5"
            onClick={() => setSelected(null)}
          >
            <button
              aria-label="إغلاق"
              onClick={() => setSelected(null)}
              className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-ivory-50/10 text-ivory-50 hover:bg-ivory-50/20"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              src={selected}
              alt="صورة مكبرة من العيادة"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Reviews() {
  return (
    <motion.section
      id="reviews"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-ivory-50 dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">GOOGLE REVIEWS</span>
              <h2 className="mt-4 max-w-lg text-3xl font-bold leading-[1.65] text-charcoal-950 dark:text-white sm:text-4xl lg:text-5xl sm:leading-[1.5]">
                تجارب حقيقية،<br className="hidden sm:block" />
                <span className="text-sage-600 dark:text-sage-400 block mt-2 sm:mt-1">بكلمات أصحابها</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-4xl font-bold text-charcoal-950 dark:text-white">3.9</div>
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
              <div className="h-10 w-px bg-ivory-300 dark:bg-gray-800" />
              <span className="max-w-[100px] text-xs leading-relaxed text-charcoal-800/60 dark:text-gray-400">54 تقييمًا على Google</span>
            </div>
          </div>
        </Reveal>
        <Stagger className="grid gap-6 md:grid-cols-2" stagger={0.12}>
          {reviews.map((review) => (
            <motion.blockquote
              key={review.id}
              variants={staggerItem}
              className="relative rounded-2xl border border-ivory-300 dark:border-gray-800 bg-ivory-100 dark:bg-[#181b22] p-7 shadow-soft sm:p-9 hover:shadow-md transition-all duration-300"
            >
              <Quote className="mb-5 h-7 w-7 text-sage-400" />
              <p className="text-base font-medium leading-relaxed text-charcoal-800 dark:text-gray-200 sm:text-lg">{review.text}</p>
              <footer className="mt-7 flex items-center justify-between border-t border-ivory-300 dark:border-gray-800 pt-5">
                <span className="text-xs text-charcoal-800/50 dark:text-gray-400">{review.author ?? 'مراجع Google'}</span>
                <span className="flex items-center gap-1 text-[10px] text-charcoal-800/50 dark:text-gray-400">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white dark:bg-gray-700 text-[9px] font-bold text-blue-500 dark:text-blue-400">
                    G
                  </span>{' '}
                  Google Reviews
                </span>
              </footer>
            </motion.blockquote>
          ))}
        </Stagger>
      </div>
    </motion.section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <motion.section
      id="faq"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-ivory-100 dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-24">
        <Reveal>
          <span className="eyebrow">NEED TO KNOW</span>
          <h2 className="mt-4 max-w-sm text-3xl font-bold leading-[1.65] text-charcoal-950 dark:text-white sm:text-4xl lg:text-5xl sm:leading-[1.5]">
            أسئلة قد<br className="hidden sm:block" />
            <span className="text-sage-600 dark:text-sage-400 block mt-2 sm:mt-1">تخطر ببالك</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-charcoal-800/70 dark:text-gray-300">
            لم تجد إجابتك؟ تواصل معنا مباشرة وسيسعد فريقنا بمساعدتك في أي من فروعنا.
          </p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn-ghost mt-6 -mr-5 text-sage-700 dark:text-sage-300">
            اسألنا على واتساب <ArrowLeft className="h-4 w-4" />
          </a>
        </Reveal>
        <div>
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.06}>
              <div className="border-b border-ivory-300 dark:border-gray-800">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-right"
                >
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-white leading-relaxed">{faq.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                      open === i
                        ? 'bg-charcoal-900 dark:bg-sage-600 text-ivory-50 dark:text-white'
                        : 'bg-ivory-200 dark:bg-gray-800 text-charcoal-800 dark:text-gray-200'
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
                      <p className="pb-5 pl-12 text-sm leading-relaxed text-charcoal-800/70 dark:text-gray-300">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function Location({ onBook }: { onBook: () => void }) {
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0].id);
  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-sage-100/70 dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <div className="mb-12 text-center sm:text-right">
          <span className="eyebrow text-sage-700 dark:text-sage-400">OUR BRANCHES</span>
          <h2 className="mt-3 text-3xl font-bold leading-[1.65] text-charcoal-950 dark:text-white sm:text-4xl lg:text-5xl sm:leading-[1.5]">
            فروعنا <span className="text-sage-600 dark:text-sage-400">في خدمتك</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-800/75 dark:text-gray-300 max-w-2xl">
            اختر الفرع الأقرب إليك لعرض العنوان المباشر، أرقام التواصل، وخريطة الوصول التفاعلية
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div className="mb-8 flex flex-wrap gap-2.5 rounded-2xl border border-charcoal-900/10 dark:border-gray-800 bg-ivory-50/80 dark:bg-[#181b22]/90 p-2 shadow-soft sm:gap-3">
          {branches.map((b) => {
            const isActive = b.id === currentBranch.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`relative flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold transition-all duration-300 sm:text-sm ${
                  isActive
                    ? 'bg-charcoal-900 dark:bg-sage-600 text-ivory-50 dark:text-white shadow-md scale-[1.02]'
                    : 'text-charcoal-800 dark:text-gray-300 hover:bg-ivory-200/90 dark:hover:bg-gray-800 hover:-translate-y-0.5'
                }`}
              >
                <MapPin className={`h-4 w-4 shrink-0 ${isActive ? 'text-sage-300 dark:text-white' : 'text-sage-600 dark:text-sage-400'}`} />
                <span>{b.nameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Main Branch Details & Interactive Map Card */}
        <div className="grid items-stretch overflow-hidden rounded-[2rem] bg-charcoal-900 dark:bg-[#161920] text-ivory-50 border border-transparent dark:border-gray-800 shadow-lift transition-all duration-300 hover:shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-12 lg:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-sage-400/20" />

            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-sage-300">BRANCH DETAILS</span>
                <span className="rounded-full bg-sage-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-sage-300">
                  {currentBranch.cityAr}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-bold leading-relaxed sm:text-3xl lg:text-4xl text-ivory-50">
                {currentBranch.nameAr}
              </h3>

              <div className="mt-8 space-y-5 border-t border-ivory-50/15 pt-7 text-xs sm:text-sm">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/50">
                      العنوان
                    </span>
                    <p className="leading-relaxed text-ivory-100/90 font-medium">
                      {currentBranch.addressAr}
                    </p>
                  </div>
                </div>

                {/* Clickable Phone(s) */}
                <div className="flex items-start gap-3.5">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-sage-300" />
                  <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/50">
                      أرقام الهاتف المباشرة (اضغط للاتصال)
                    </span>
                    <div className="flex flex-wrap gap-2.5 pt-1">
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
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-ivory-100/50">
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
                    <span className="mb-0.5 block text-[10px] uppercase tracking-wider text-ivory-100/50">
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

          {/* Luxury High-End Interactive Location & Directions Card */}
          <div className="relative flex flex-col justify-between overflow-hidden border-t border-ivory-50/10 bg-gradient-to-br from-charcoal-950 via-[#13161c] to-charcoal-900 p-7 sm:p-10 lg:border-r lg:border-t-0">
            {/* Background Aesthetic Grid Pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#5d7a6b_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-sage-500/10 blur-2xl" />

            <div className="relative z-10">
              {/* Header badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sage-300">
                  <Navigation className="h-4 w-4 animate-pulse text-sage-400" />
                  <span className="text-xs font-bold tracking-wider">الموقع الدقيق على الخريطة</span>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> موقع موثّق ومعتمد
                </span>
              </div>

              {/* Central Map Illustration Card */}
              <div className="mt-6 rounded-2xl border border-ivory-50/10 bg-charcoal-850/90 p-6 backdrop-blur-sm shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sage-600/20 border border-sage-400/30 text-sage-300 shadow-md">
                    <MapPin className="h-7 w-7 text-sage-300" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sage-500"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-ivory-50">{currentBranch.nameAr}</h4>
                    <p className="text-xs text-ivory-100/70 mt-0.5 line-clamp-2 leading-relaxed">
                      {currentBranch.addressAr}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ivory-50/10 pt-4 text-xs">
                  <div className="rounded-xl bg-charcoal-900/80 p-3 border border-ivory-50/5">
                    <span className="block text-[10px] text-ivory-100/50 mb-0.5">سهولة الوصول</span>
                    <span className="font-semibold text-ivory-100">موقع حيوي ومواقف متوفرة</span>
                  </div>
                  <div className="rounded-xl bg-charcoal-900/80 p-3 border border-ivory-50/5">
                    <span className="block text-[10px] text-ivory-100/50 mb-0.5">التوجيه المباشر</span>
                    <span className="font-semibold text-ivory-100">GPS دقيق خطوة بخطوة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button for Google Maps */}
            <div className="relative z-10 mt-8 space-y-3">
              <a
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-sage-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-sage-500 hover:shadow-sage-600/30 hover:scale-[1.02] active:scale-95"
              >
                <MapPin className="h-4 w-4 text-sage-100 transition-transform group-hover:scale-110" />
                <span>افتح على خرائط جوجل (Google Maps)</span>
                <ExternalLink className="h-4 w-4 text-sage-200 transition-transform group-hover:translate-x-[-3px]" />
              </a>
              <p className="text-center text-[11px] text-ivory-100/50">
                سيتم فتح اللوكيشن الرسمي المباشر للفرع في تطبيق خرائط Google لتوجيهك بدقة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function MobileBottomBar({ onBook }: { onBook: () => void }) {
  return (
    <div className="glass dark:bg-[#15181e]/90 fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-ivory-300/80 dark:border-gray-800 p-2 shadow-lift sm:hidden">
      <button onClick={onBook} className="btn-primary flex-1 py-3 text-xs font-bold">
        <CalendarDays className="h-3.5 w-3.5" /> احجز موعدك
      </button>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="grid w-14 place-items-center rounded-xl bg-sage-600 text-ivory-50 transition hover:bg-sage-700 shadow-sm"
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
    <div className="overflow-hidden bg-ivory-100 dark:bg-[#0c0e12] text-charcoal-900 dark:text-gray-100 min-h-screen">
      <SplashScreen />
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
      <LuxuryFooter />
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-sage-600 text-ivory-50 shadow-lift transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-sage-700 sm:flex"
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
