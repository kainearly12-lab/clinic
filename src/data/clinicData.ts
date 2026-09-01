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
  category: 'all' | 'clinic' | 'devices' | 'rooms';
  categoryLabelAr: string;
  titleAr: string;
  span: 'tall' | 'wide' | 'regular';
}

export interface Review {
  id: string;
  text: string;
  author: string;
  roleAr?: string;
  rating: number;
  dateAr: string;
  branchAr?: string;
}

export interface FAQItem {
  id: string;
  category: 'consultation' | 'laser' | 'booking';
  categoryLabelAr: string;
  q: string;
  a: string;
  isPopular?: boolean;
}

export interface NavLink {
  id: string;
  labelAr: string;
  labelEn: string;
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
    mapSrc: '',
    mapsUrl: 'https://maps.app.goo.gl/4RqWp38sa7P9zvji9',
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
    mapSrc: '',
    mapsUrl: 'https://maps.app.goo.gl/d9wMmUhogETcJzMW6',
  },
  {
    id: 'maadi',
    nameAr: 'فرع المعادي',
    cityAr: 'المعادي',
    addressAr: '1/5 شارع اللاسلكي عمارة جوهرة الشمس الدور الأول',
    phones: [
      { number: '01154021249', display: '01154021249' },
    ],
    mapSrc: '',
    mapsUrl: 'https://maps.app.goo.gl/x7igMWPDExcBsBuV8',
  },
  {
    id: 'new-giza',
    nameAr: 'فرع نيو جيزة',
    cityAr: 'نيو جيزة',
    addressAr: 'ميدي تاون - مبنى B1 عيادة 305 - الدور الثالث',
    phones: [
      { number: '01154021248', display: '01154021248' },
    ],
    mapSrc: '',
    mapsUrl: 'https://maps.app.goo.gl/yxDEgB8H1sSGom1c9',
  },
];

export const clinic: Clinic = {
  name: 'عيادات Androderma',
  nameAr: 'عيادات Androderma',
  taglineAr: 'عناية متقدمة بالجلدية والليزر وتجميل البشرة',
  email: 'info@andro-derma.com',
  phone: '01154021247',
  phoneDisplay: '01154021247',
  whatsapp: '201154021247',
  whatsappMessage: 'مرحبًا، أريد الاستفسار عن حجز موعد في عيادات Androderma.',
  addressAr: '12 شارع أبو داوود الظاهري متفرع من شارع مكرم عبيد، مدينة نصر، القاهرة',
  plusCode: '3962+GG',
  mapsUrl: 'https://maps.app.goo.gl/4RqWp38sa7P9zvji9',
  rating: 4.7,
  reviewsCount: 54,
  closingNote: 'مفتوح — يغلق 11 مساءً',
};

export const navLinks: NavLink[] = [
  { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', href: '#home' },
  { id: 'services', labelAr: 'الخدمات المتقدمة', labelEn: 'Advanced Services', href: '#services' },
  { id: 'treatment-journey', labelAr: 'رحلة العلاج', labelEn: 'Treatment Journey', href: '#treatment-journey' },
  { id: 'contact', labelAr: 'الفروع والمواعيد', labelEn: 'Branches & Schedule', href: '#contact' },
  { id: 'reviews', labelAr: 'التقييمات', labelEn: 'Reviews', href: '#reviews' },
  { id: 'diagnostic-quiz', labelAr: 'تقييم البشرة', labelEn: 'Skin Assessment', href: '#diagnostic-quiz' },
  { id: 'about', labelAr: 'من نحن', labelEn: 'About Us', href: '/about' },
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
    src: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'منطقة الاستقبال والراحة في عيادات Androderma',
    category: 'clinic',
    categoryLabelAr: 'العيادة والتعقيم',
    titleAr: 'صالة الاستقبال الفندقية الهادئة',
    span: 'tall',
  },
  {
    id: 'g2',
    src: 'https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'أحدث أجهزة الليزر الطبية المعتمدة',
    category: 'devices',
    categoryLabelAr: 'الأجهزة والتقنيات',
    titleAr: 'منظومة الليزر والتبريد الفائق FDA',
    span: 'wide',
  },
  {
    id: 'g3',
    src: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'جناح الفحص والاستشارة السريرية',
    category: 'rooms',
    categoryLabelAr: 'غرف الفحص والليزر',
    titleAr: 'عيادة الكشف والتشخيص الدقيق',
    span: 'regular',
  },
  {
    id: 'g4',
    src: 'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'معايير النظافة والتعقيم الشامل',
    category: 'clinic',
    categoryLabelAr: 'العيادة والتعقيم',
    titleAr: 'بروتوكولات التعقيم المستمر',
    span: 'regular',
  },
  {
    id: 'g5',
    src: 'https://images.pexels.com/photos/6899554/pexels-photo-6899554.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'أجنحة جلسات العناية والسكين بوستر',
    category: 'rooms',
    categoryLabelAr: 'غرف الفحص والليزر',
    titleAr: 'غرفة جلسات العناية المتكاملة',
    span: 'wide',
  },
  {
    id: 'g6',
    src: 'https://images.pexels.com/photos/3757654/pexels-photo-3757654.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'أجهزة الهيدرافيشيل والتقشير الطبي',
    category: 'devices',
    categoryLabelAr: 'الأجهزة والتقنيات',
    titleAr: 'تقنيات التجديد الخلوي والنضارة',
    span: 'tall',
  },
];

export const reviews: Review[] = [
  {
    id: 'r-gihad',
    text: 'لقد حظيت بتجربة رائعة في هذه العيادة. شرح الطبيب كل شيء بوضوح وجعلني أشعر بالراحة. أوصي بشدة بهذا المكان.',
    author: 'Gihad',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ 8 أشهر',
    branchAr: 'عيادات Androderma',
  },
  {
    id: 'r-shery',
    text: 'عيادة وموظفون موثوق بهم للغاية',
    author: 'Shery Safwat',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ 10 أشهر',
    branchAr: 'عيادات Androderma',
  },
  {
    id: 'r-aya',
    text: 'دكتور محترم جدا و اسلوب التعامل راقي جدا من افضل عيادات الجلدية و الليزر في مصر',
    author: 'Aya Mahmoud',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ 10 أشهر',
    branchAr: 'عيادات Androderma',
  },
  {
    id: 'r1',
    text: 'أشطر دكتور حرفياً والله بجد، وطريقته جميلة ومبسطة جداً لشرح كل تفاصيل الحالة وخطة العلاج بدون أي مبالغة. النتيجة ظهرت أسرع مما توقعت.',
    author: 'سارة عبد الرحمن',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ أسبوعين',
    branchAr: 'فرع مدينة نصر',
  },
  {
    id: 'r2',
    text: 'أ.د أحمد زغلول دكتور محترم وشاطر جداً ما شاء الله.. Very decent & very updated، بيشرح الحالة وخطة العلاج بشكل كامل ومفصل وشفت معاه نتائج ممتازة جداً في علاج آثار حب الشباب.',
    author: 'م. أحمد خالد',
    roleAr: 'مراجع موثق على Google',
    rating: 5,
    dateAr: 'منذ شهر',
    branchAr: 'فرع التجمع الخامس',
  },
  {
    id: 'r3',
    text: 'المكان مريح جداً وفريق الاستقبال في منتهى الذوق والاحترافية. جهاز الليزر عندهم حديث جداً مع تبريد قوي غير مؤلم نهائياً.',
    author: 'نورهان محمود',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ 3 أسابيع',
    branchAr: 'فرع المعادي',
  },
  {
    id: 'r4',
    text: 'تجربة ممتازة في فرع نيو جيزة، التزام تام بالمواعيد ونظافة وتعقيم لا غبار عليه. دكتور أحمد مخلص جداً وأمين في توجيه العلاج.',
    author: 'كريم المنشاوي',
    roleAr: 'مراجع موثق على Google',
    rating: 5,
    dateAr: 'منذ شهرين',
    branchAr: 'فرع نيو جيزة',
  },
  {
    id: 'r5',
    text: 'عملت جلسات سكين بوستر وبلازما للشعر، الفرق في الكثافة والنضارة واضح جداً من ثاني جلسة. شكراً د. أحمد زغلول وفريق العمل المتميز.',
    author: 'دينا الشريف',
    roleAr: 'مراجعة موثقة على Google',
    rating: 5,
    dateAr: 'منذ أسبوع',
    branchAr: 'فرع مدينة نصر',
  },
];

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'consultation',
    categoryLabelAr: 'الاستشارة الأولى والفحص',
    isPopular: true,
    q: 'ماذا تتضمن الاستشارة السريرية الأولى مع د. أحمد زغلول؟',
    a: 'تتضمن فحصاً سريرياً دقيقاً وشاملاً لحالة الجلد، المسام، وتاريخ البشرة الوراثي والدوائي، ثم وضع تشخيص طبي مؤكد وتصميم بروتوكول فردي يجمع بين الجلسات والروتين المنزلي.',
  },
  {
    id: 'faq-2',
    category: 'consultation',
    categoryLabelAr: 'الاستشارة الأولى والفحص',
    isPopular: false,
    q: 'هل الاستشارة تستلزم تحضيرات معينة قبل الحضور؟',
    a: 'يُفضل الحضور بدون مستحضرات تجميل على الوجه لتسهيل الفحص المباشر، مع إحضار أسماء المنتجات أو الأدوية الحالية التي تستخدمها لمراجعتها مع الطبيب.',
  },
  {
    id: 'faq-3',
    category: 'laser',
    categoryLabelAr: 'جلسات الليزر والعناية',
    isPopular: true,
    q: 'هل جلسات الليزر وإزالة الشعر مؤلمة ومناسبة لجميع أنواع البشرة؟',
    a: 'نستخدم منظومات ليزر عالمية معتمدة من FDA مزودة بنظام تبريد هوائي ديناميكي فائق يحمي سطح الجلد تماماً ويجعل الجلسة مريحة وآمنة لكافة درجات ألوان البشرة.',
  },
  {
    id: 'faq-4',
    category: 'laser',
    categoryLabelAr: 'جلسات الليزر والعناية',
    isPopular: false,
    q: 'كم عدد الجلسات اللازمة لرؤية نتائج ملموسة في علاج التصبغات أو الندبات؟',
    a: 'يختلف عدد الجلسات بحسب عمق التصبغ واستجابة الجلد، ولكن في العادة تبدأ النتائج الإيجابية بالظهور بعد الجلسة الثانية، وتكتمل الخطة عادة بين 3 إلى 5 جلسات.',
  },
  {
    id: 'faq-5',
    category: 'booking',
    categoryLabelAr: 'المواعيد والحجز والفروع',
    isPopular: true,
    q: 'كيف يمكنني حجز موعد في أقرب فرع لي؟',
    a: 'يمكنك الحجز بسهولة عبر نموذج الحجز الإلكتروني في الموقع باختيار الفرع المفضل، أو التواصل الفوري عبر الواتساب والهاتف وسيقوم فريق الاستقبال بتأكيد الموعد المناسب لك.',
  },
  {
    id: 'faq-6',
    category: 'booking',
    categoryLabelAr: 'المواعيد والحجز والفروع',
    isPopular: false,
    q: 'ما هي مواعيد العمل في فروع القاهرة والجيزة؟',
    a: 'فروعنا في مدينة نصر، التجمع الخامس، المعادي، ونيو جيزة تستقبل المراجعين يومياً حتى الساعة 11:00 مساءً بمواعيد مسبقة لتفادي الانتظار وتوفير أعلى درجات الخصوصية.',
  },
];
