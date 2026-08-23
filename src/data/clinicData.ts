export interface Branch {
  id: string;
  nameAr: string;
  cityAr: string;
  addressAr: string;
  phones: { number: string; display: string }[];
  mapSrc: string;
  mapsUrl: string;
}

export interface Clinic {
  name: string;
  nameAr: string;
  taglineAr: string;
  email: string;
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

export const branches: Branch[] = [
  {
    id: 'nasr-city',
    nameAr: 'فرع مدينة نصر',
    cityAr: 'مدينة نصر',
    addressAr: '12 شارع أبو داوود الظاهري متفرع من شارع مكرم عبيد أمام البنك العربي الإفريقي الدولي الدور الأول',
    phones: [
      { number: '01154021247', display: '01154021247' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.649174092497!2d31.3392476!3d30.0469317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e6f9829dc77%3A0xc3f2b6040de2397!2sAndroderma%20Laser%20Clinic!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg',
    mapsUrl: 'https://maps.google.com/?q=12+Abu+Dawoud+Al+Zaheri+Nasr+City+Cairo',
  },
  {
    id: 'fifth-settlement',
    nameAr: 'فرع التجمع الخامس',
    cityAr: 'التجمع الخامس',
    addressAr: 'مجمع كايرو ميديكال (CMC) شارع التسعين الشمالي خلف المستشفى الجوي وبجوار محطة موبيل الدور الرابع عيادة 441',
    phones: [
      { number: '01223371075', display: '01223371075' },
      { number: '01015563395', display: '01015563395' },
    ],
    mapSrc: 'https://maps.google.com/maps?q=%D9%85%D8%AC%D9%85%D8%B9%20%D9%83%D8%A7%D9%8A%D8%B1%D9%88%20%D9%85%D9%8A%D8%AF%D9%8A%D9%83%D8%A7%D9%84%20CMC%20%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D9%86%20%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D9%84%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AC%D9%85%D8%B9%20%D8%A7%D9%84%D8%AE%D8%A7%D9%85%D8%B3&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapsUrl: 'https://maps.google.com/?q=Cairo+Medical+Center+CMC+North+90th+New+Cairo',
  },
  {
    id: 'maadi',
    nameAr: 'فرع المعادي',
    cityAr: 'المعادي',
    addressAr: '1/5 شارع اللاسلكي عمارة جوهرة الشمس الدور الأول',
    phones: [
      { number: '01154021249', display: '01154021249' },
    ],
    mapSrc: 'https://maps.google.com/maps?q=1%2F5+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D9%84%D8%A7%D8%B3%D9%84%D9%83%D9%8A+%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%D9%8A+%D8%B9%D9%85%D8%A7%D8%B1%D8%A9+%D8%AC%D9%88%D9%87%D8%B1%D8%A9+%D8%A7%D9%84%D8%B4%D9%85%D8%B3&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapsUrl: 'https://maps.google.com/?q=1%2F5+El+Laselky+St+Maadi+Cairo',
  },
  {
    id: 'new-giza',
    nameAr: 'فرع نيو جيزة',
    cityAr: 'نيو جيزة',
    addressAr: 'ميدي تاون - مبنى B1 عيادة 305 - الدور الثالث',
    phones: [
      { number: '01154021248', display: '01154021248' },
    ],
    mapSrc: 'https://maps.google.com/maps?q=Midi+Town+New+Giza+Egypt&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapsUrl: 'https://maps.google.com/?q=Midi+Town+Building+B1+New+Giza',
  },
];

export const clinic: Clinic = {
  name: 'Androderma Laser Clinic',
  nameAr: 'أندرودرما ليزر كلينك',
  taglineAr: 'عناية متقدمة بالجلدية والليزر وتجميل البشرة',
  email: 'info@andro-derma.com',
  phone: '01154021247',
  phoneDisplay: '01154021247',
  whatsapp: '201154021247',
  whatsappMessage: 'مرحبًا، أريد الاستفسار عن حجز موعد في عيادة Androderma.',
  addressAr: '12 شارع أبو داوود الظاهري متفرع من شارع مكرم عبيد، مدينة نصر، القاهرة',
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
