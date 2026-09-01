/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageContextType {
  language: Language;
  dir: Direction;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<string, string> = {
  // Navigation
  'nav.home': 'الرئيسية',
  'nav.services': 'الخدمات المتقدمة',
  'nav.journey': 'رحلة العلاج',
  'nav.branches': 'الفروع والمواعيد',
  'nav.reviews': 'التقييمات',
  'nav.quiz': 'تقييم البشرة',
  'nav.about': 'من نحن',
  'nav.tagline': 'عناية متقدمة بالجلدية والليزر',
  'nav.bookNow': 'احجز كشفك الآن',
  'nav.menu': 'القائمة الرئيسية',
  'nav.close': 'إغلاق',
  'nav.themeLight': 'الوضع النهاري (Light Mode)',
  'nav.themeDark': 'الوضع الليلي (Dark Mode)',
  'nav.switch': 'تبديل',

  // Hero Section
  'hero.eyebrow': 'ANDRODERMA DERMATOLOGY & LASER',
  'hero.title.part1': 'بشرتك تستحق خطة علاج تُبنى على',
  'hero.title.part2': 'تشخيص حقيقي.',
  'hero.subtitle': 'جلدية، ليزر وتجميل طبي — بخطة مخصصة لكل حالة، في فروعنا بالقاهرة والجيزة.',
  'hero.cta.book': 'احجز كشفك الآن',
  'hero.cta.quiz': '🧴 فحص البشرة 3D التفاعلي',
  'hero.badge.available': 'أماكن متاحة اليوم',
  'hero.trust.branches': 'مدينة نصر • التجمع • المعادي • نيو جيزة',
  'hero.trust.rating': '4.7 • 54 تقييم على Google',

  // Doctor 3D Card
  'doctor.role': 'استشاري الأمراض الجلدية والليزر وتجميل البشرة',
  'doctor.name': 'أ.د أحمد زغلول',
  'doctor.bio': 'خبرة إكلينيكية تمتد لأكثر من 15 عاماً في تشخيص وعلاج أدق أمراض الجلد وجلسات الليزر التخصصية.',
  'doctor.credential1': 'عضو الجمعية الأوروبية لأمراض الجلد والتناسلية (EADV)',
  'doctor.credential2': 'استشاري معتمد لأحدث أنظمة الليزر التبريدية الأمريكية (FDA)',
  'doctor.credential3': 'أكثر من 12,000 حالة علاجية ناجحة وموثقة إكلينيكياً',

  // Stats Bar
  'stats.cases': '+12,000',
  'stats.casesLabel': 'حالة علاجية وتجميلية ناجحة',
  'stats.rating': '4.7 / 5',
  'stats.ratingLabel': 'تقييم المراجعين على Google',
  'stats.experience': '+15 عاماً',
  'stats.experienceLabel': 'خبرة إكلينيكية متخصصة',
  'stats.branches': '4 فروع',
  'stats.branchesLabel': 'في أرقى مناطق القاهرة والجيزة',

  // Services Section
  'services.badge': 'الخدمات والإجراءات الطبية',
  'services.title': 'منظومة علاجية متكاملة لصحة وجمال بشرتك',
  'services.subtitle': 'بروتوكولات علاجية دقيقة تجمع بين الطب السريري وأحدث تقنيات الليزر المعتمدة دولياً.',
  'services.all': 'جميع الخدمات',
  'services.consultation': 'استشارة الجلدية',
  'services.consultationDesc': 'تشخيص دقيق لحالة البشرة وخطة علاج مخصصة تناسب احتياجاتك.',
  'services.laser': 'علاجات الليزر',
  'services.laserDesc': 'جلسات ليزر متقدمة للعناية بالبشرة في أجواء احترافية وآمنة بأنظمة تبريد ذكية.',
  'services.skincare': 'العناية بالبشرة',
  'services.skincareDesc': 'بروتوكولات عناية مصممة لتحسين مظهر وصحة بشرتك واستعادة النضارة تدريجيًا.',
  'services.aesthetic': 'الجلدية التجميلية',
  'services.aestheticDesc': 'حلول تجميلية متكاملة بمعايير طبية عالية ونتائج طبيعية ومستدامة.',
  'services.cta': 'احجز موعدك الآن',

  // Treatment Journey
  'journey.badge': 'خطوات رحلتك العلاجية',
  'journey.title': 'من الاستشارة الأولى حتى النتيجة المرجوة',
  'journey.subtitle': 'رحلة علاجية مصممة بعناية لضمان أفضل النتائج لجمال وصحة بشرتك.',
  'journey.step1.title': 'الكشف والتشخيص الدقيق',
  'journey.step1.desc': 'فحص سريري شامل لتحديد نوع البشرة والتشخيص الدقيق للمشكلة.',
  'journey.step2.title': 'خطة علاج مخصصة',
  'journey.step2.desc': 'تصميم بروتوكول علاجي متكامل يراعي حالتك وأهدافك.',
  'journey.step3.title': 'الجلسات والمتابعة الدورية',
  'journey.step3.desc': 'تنفيذ الجلسات بأحدث الأجهزة مع متابعة دقيقة ومستمرة للنتائج.',

  // Reviews
  'reviews.badge': 'آراء المراجعين الموثقة',
  'reviews.title': 'ثقة عملائنا هي سر تميزنا',
  'reviews.subtitle': 'تجارب حقيقية لمراجعي عيادات Androderma عبر فروعنا المختلفة.',

  // Branches & Contact
  'branches.badge': 'فروعنا المعتمدة',
  'branches.title': 'نحن بالقرب منك دائماً',
  'branches.subtitle': 'أربعة فروع مجهزة بأحدث التقنيات في أرقى مناطق القاهرة والجيزة.',
  'branches.nasrCity': 'فرع مدينة نصر',
  'branches.fifthSettlement': 'فرع التجمع الخامس',
  'branches.maadi': 'فرع المعادي',
  'branches.newGiza': 'فرع نيو جيزة',

  // About Page
  'about.badge': 'عن عيادات Androderma',
  'about.hero.title': 'بشرتك تستحق تجربة طبية مبنية على الدقة والتجميل الآمن.',
  'about.hero.desc': 'في عيادات Androderma، نؤمن بأن الجمال الطبيعي ينبع من صحة البشرة الحقيقية. نجمع بين التشخيص الإكلينيكي الدقيق وأحدث أنظمة الليزر المعتمدة عالمياً لتقديم خطط علاجية مخصصة ومستدامة دون مبالغة تجارية.',
  'about.hero.cta': 'احجز استشارتك التخصصية',
  'about.hero.explore': 'استكشف المنظومة العلاجية',

  // Footer
  'footer.tagline': 'عيادات Androderma — صرح طبي متكامل يجمع بين أحدث تقنيات الليزر والعناية بالبشرة تحت إشراف نخبة من كبار أطباء الجلدية والتجميل في مصر.',
  'footer.quickLinks': 'روابط سريعة',
  'footer.branchesTitle': 'فروعنا في القاهرة والجيزة',
  'footer.vezeeta': 'احجز كشفك عبر منصة فيزيتا (Vezeeta)',
  'footer.vezeetaSub': 'تقييمات معتمدة ومواعيد مؤكدة فورياً',
  'footer.motto': 'العناية التي تبدأ من الفهم والتطور الطبي',
  'footer.devCredit': 'Developed by',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Pure Arabic (RTL) mode permanently enforced
  const language: Language = 'ar';
  const dir: Direction = 'rtl';
  const isRTL = true;

  useEffect(() => {
    try {
      localStorage.setItem('androderma_lang', 'ar');
    } catch {
      // ignore
    }
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.classList.add('font-sans-ar');
    document.body.classList.remove('font-sans-en');
  }, []);

  const setLanguage = useCallback(() => {
    // Strictly locked to Arabic
  }, []);

  const toggleLanguage = useCallback(() => {
    // Strictly locked to Arabic
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (translations[key] !== undefined) {
        return translations[key];
      }
      return fallback || key;
    },
    []
  );

  const value = useMemo(
    () => ({
      language,
      dir,
      isRTL,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, dir, isRTL, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
