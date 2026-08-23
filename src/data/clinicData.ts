export interface Clinic {
  name: string;
  nameAr: string;
  taglineAr: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappMessage: string;
  addressAr: string;
  plusCode: string;
  mapsUrl: string;
  rating: number;
  reviewsCount: number;
  closingNote: string;
}

export interface Service {
  id: string;
  titleAr: string;
  descriptionAr: string;
  image: string;
  ctaAr: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  span: 'tall' | 'wide' | 'regular';
}

export interface Review {
  id: string;
  text: string;
  author?: string;
}

export interface NavLink {
  id: string;
  labelAr: string;
  href: string;
}

export const clinic: Clinic = {
  name: 'Androderma Laser Clinic',
  nameAr: 'أندرودرما ليزر كلينك',
  taglineAr: 'العناية بالبشرة والجلدية والليزر',
  phone: '01154021247',
  phoneDisplay: '01154021247',
  whatsapp: '201154021247',
  whatsappMessage: 'مرحبًا، أريد الاستفسار عن حجز موعد في عيادة Androderma.',
  addressAr: 'أبو داوود الظاهري، المنطقة السادسة، مدينة نصر، القاهرة',
  plusCode: '3962+GG',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=3962%2BGG+Nasr+City+Cairo',
  rating: 3.9,
  reviewsCount: 54,
  closingNote: 'مفتوح — يغلق 11 مساءً',
};

export const navLinks: NavLink[] = [
  { id: 'home', labelAr: 'الرئيسية', href: '#home' },
  { id: 'services', labelAr: 'خدماتنا', href: '#services' },
  { id: 'about', labelAr: 'عن العيادة', href: '#about' },
  { id: 'gallery', labelAr: 'المعرض', href: '#gallery' },
  { id: 'reviews', labelAr: 'التقييمات', href: '#reviews' },
  { id: 'faq', labelAr: 'الأسئلة الشائعة', href: '#faq' },
  { id: 'contact', labelAr: 'تواصل معنا', href: '#contact' },
];

export const services: Service[] = [
  {
    id: 'consultation',
    titleAr: 'استشارة الجلدية',
    descriptionAr: 'تشخيص دقيق لحالة البشرة وخطة علاج مخصصة تناسب احتياجاتك.',
    image:
      'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=900',
    ctaAr: 'احجز استشارة',
  },
  {
    id: 'laser',
    titleAr: 'علاجات الليزر',
    descriptionAr: 'جلسات ليزر متقدمة للعناية بالبشرة في أجواء احترافية وآمنة.',
    image:
      'https://images.pexels.com/photos/3757654/pexels-photo-3757654.jpeg?auto=compress&cs=tinysrgb&w=900',
    ctaAr: 'احجز جلسة',
  },
  {
    id: 'skincare',
    titleAr: 'العناية بالبشرة',
    descriptionAr: 'بروتوكولات عناية مصممة لتحسين مظهر وصحة بشرتك تدريجيًا.',
    image:
      'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=900',
    ctaAr: 'تعرف على البرامج',
  },
  {
    id: 'aesthetic',
    titleAr: 'الجلدية التجميلية',
    descriptionAr: 'حلول تجميلية متكاملة بمعايير طبية عالية ونتائج طبيعية.',
    image:
      'https://images.pexels.com/photos/6492385/pexels-photo-6492385.jpeg?auto=compress&cs=tinysrgb&w=900',
    ctaAr: 'احجز موعد',
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    src: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlN-pOrF0gZSH_KXlNognj63fFn2Hsz7QxLDYEHr6Rb4d1JFepKn9rewooO0PfnmM0iWAmKmJFK79pu6m1z-fTRJB7dMcq3Y31UnfVi0Zb28lf-r4ymg8vSMxNrwOiEiDPG038D=w298-h298-k-no',
    alt: 'واجهة العيادة',
    span: 'tall',
  },
  {
    id: 'g2',
    src: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn7wnOGN_Wz1AOqx8ohCKQlsWMasqkBkuz2cWXbYZh7oFeke-UBx3tUKZj6o9xj6n6NMmVQ4EWFpPLLmSF2tXQIM4b5-yjJGVhPvKgrB6Z3Dcp9qyfDJ04QcDGrbV5g5PrUz2Y=w298-h298-k-no',
    alt: 'داخل العيادة',
    span: 'wide',
  },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    text: 'اشطر دكتور حرفيا والله بجد وطريقته جميل ومبسط جداااا لشرح التفاصيل♥️',
  },
  {
    id: 'r2',
    text: 'أ.د احمد زغلول دكتور محترم وشاطر جدا ماشاء الله .. very decent very updated بيشرح الحالة و خطة العلاج بشكل كامل ومفصل وشفت معاه نتايج ممتازة جدا في العلاج …',
    author: 'مراجع Google',
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: 'كيف يمكنني حجز موعد؟',
    a: 'يمكنك الحجز عبر نموذج الحجز في الموقع، أو التواصل معنا مباشرة على واتساب أو الهاتف، وسيتواصل معك فريق العيادة لتأكيد الموعد.',
  },
  {
    q: 'هل الاستشارة الأولى تستلزم تحضيرات معينة؟',
    a: 'لا توجد تحضيرات خاصة عادةً. يُفضّل القدوم بدون مكياج على المنطقة المراد استشارها ليتمكن الطبيب من تقييم البشرة بدقة.',
  },
  {
    q: 'ما هي مواعيد العمل؟',
    a: 'العيادة مفتوحة حتى 11 مساءً. لتفاصيل أيام الأسبوع، يُرجى التواصل معنا مباشرة لتأكيد المواعيد المتاحة.',
  },
  {
    q: 'هل توجد متابعة بعد الجلسات؟',
    a: 'نعم، يتم تحديد خطة متابعة مناسبة لحالتك خلال الاستشارة لضمان أفضل تجربة علاجية.',
  },
];
