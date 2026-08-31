import { motion } from 'framer-motion';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  HeartPulse,
} from 'lucide-react';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';

export function MedicalPhilosophyBento() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white/80 dark:bg-[#0e1014] py-24 sm:py-32 transition-colors duration-300 border-y border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Soft Ambient Light Blobs */}
      <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 bottom-1/4 h-96 w-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          
          {/* Right Column (Visual Bento with Parallax & Floating Luxury Glass Badge) */}
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg">
              
              {/* Main Visual Frame */}
              <div className="group relative aspect-[0.88] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-slate-800 dark:to-slate-900 border border-emerald-900/10 dark:border-emerald-500/20 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="الرعاية الطبية والتعقيم في عيادات Androderma"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                
                {/* Visual Bottom Micro-Card */}
                <div className="absolute bottom-6 right-6 left-6 text-right">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-800/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-teal-100 shadow-xs mb-2">
                    <Award className="h-3.5 w-3.5 text-teal-300" />
                    <span>إشراف طبي واستشاري مباشر</span>
                  </div>
                  <h4 className="text-lg font-bold text-white leading-relaxed">
                    د. أحمد زغلول — استشاري الأمراض الجلدية والليزر
                  </h4>
                </div>
              </div>

              {/* Floating Top-Left Glass Badge: "معايير تعقيم وعناية فائقة" */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.7 }}
                whileHover={{ scale: 1.03 }}
                className="absolute -top-6 -left-4 sm:-left-6 max-w-[210px] rounded-2xl bg-white/95 dark:bg-[#161a22]/95 border border-emerald-900/15 dark:border-emerald-500/30 p-4 shadow-xl backdrop-blur-xl text-right"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    معايير صارمة
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-200 leading-snug">
                  معايير تعقيم وعناية فائقة وفق البروتوكولات الطبية
                </p>
              </motion.div>

              {/* Decorative Accent Circles */}
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 rounded-full border-2 border-teal-500/20 -z-10" />
            </div>
          </Reveal>

          {/* Left Column: Clinical Philosophy Bento Cards */}
          <div className="order-1 lg:order-2 text-right">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-4">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>A DIFFERENT CLINICAL APPROACH</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                لأن العناية الحقيقية <br />
                <span className="text-teal-700 dark:text-teal-400">تبدأ بالاستماع والتشخيص</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-gray-300 font-medium max-w-xl">
                في عيادات Androderma، لا نعتمد على الحلول السريعة أو القوالب الجاهزة. نمنحك وقتاً كاملاً لفهم طبيعة بشرتك، وبناء بروتوكول طبي فردي يحقق أقصى نتائج آمنة ومستدامة.
              </p>
            </Reveal>

            {/* 3 Interactive Bento Glass Cards */}
            <Stagger className="mt-8 space-y-3.5" stagger={0.1}>
              
              {/* Bento Card 1: Detailed Consultation */}
              <motion.div
                variants={staggerItem}
                whileHover={{ x: -6 }}
                className="group relative flex items-start gap-4 rounded-2xl bg-white/90 dark:bg-[#161a22]/90 border border-slate-200/90 dark:border-gray-800 p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md hover:bg-teal-50/20 dark:hover:bg-[#1a202c]/90"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    استشارة مفصلة وتشخيص سريري دقيق
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                    تقييم متعمق لتاريخ البشرة وعواملها الوراثية لتحديد السبب الجذري قبل البدء في أي إجراء.
                  </p>
                </div>
              </motion.div>

              {/* Bento Card 2: Advanced Technologies */}
              <motion.div
                variants={staggerItem}
                whileHover={{ x: -6 }}
                className="group relative flex items-start gap-4 rounded-2xl bg-white/90 dark:bg-[#161a22]/90 border border-slate-200/90 dark:border-gray-800 p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md hover:bg-teal-50/20 dark:hover:bg-[#1a202c]/90"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    أحدث التقنيات العالمية المعتمدة
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                    أجهزة ليزر وتبريد فائقة وتقنيات حقن أصلية معتمدة من FDA لضمان أمان تام وفاعلية مثبتة.
                  </p>
                </div>
              </motion.div>

              {/* Bento Card 3: Personalized Protocol */}
              <motion.div
                variants={staggerItem}
                whileHover={{ x: -6 }}
                className="group relative flex items-start gap-4 rounded-2xl bg-white/90 dark:bg-[#161a22]/90 border border-slate-200/90 dark:border-gray-800 p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md hover:bg-teal-50/20 dark:hover:bg-[#1a202c]/90"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    بروتوكول فردي ومتابعة مستمرة
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                    خطة علاجية مخصصة تجمع بين الجلسات والروتين المنزلي مع إشراف دائم حتى الوصول للنتيجة.
                  </p>
                </div>
              </motion.div>

            </Stagger>
          </div>

        </div>
      </div>
    </section>
  );
}
