export interface SkinZone {
  id: string;
  nameAr: string;
  nameEn: string;
  targetServiceId: string;
  position: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  treatments: string[];
  descriptionAr: string;
  tag: string;
  priceNote: string;
}

export const skinZones: SkinZone[] = [
  {
    id: 'forehead',
    nameAr: 'الجبهة وما بين الحاجبين',
    nameEn: 'Forehead & Glabella',
    targetServiceId: 'aging',
    position: [0, 0.95, 1.32],
    cameraPos: [0, 0.45, 4.3],
    cameraTarget: [0, 0.35, 0],
    treatments: ['حقن البوتوكس للتجاعيد التعبيرية', 'ميزوثيرابي تحفيز الكولاجين', 'سكين بوستر لترطيب الجبهة'],
    descriptionAr: 'علاج خطوط التعبير الأفقية وتجاعيد ما بين الحاجبين واستعادة المظهر الشاب المريح دون شلل تعبيري.',
    tag: 'بوتوكس وتجاعيد تعبيرية',
    priceNote: 'كشف استشاري + تحديد وحدات البوتوكس المناسبة',
  },
  {
    id: 'undereye',
    nameAr: 'محيط العينين والهالات',
    nameEn: 'Under-Eye & Tear Troughs',
    targetServiceId: 'dullness',
    position: [0.44, 0.38, 1.28],
    cameraPos: [0.25, 0.15, 4.2],
    cameraTarget: [0.2, 0.1, 0],
    treatments: ['فيلر الهالات المخصص لتجويف العين', 'جلسات ميزوثيرابي التفتيح', 'كاربوكسي لتنشيط الدورة الدموية'],
    descriptionAr: 'ملء تجويف تحت العين، إزالة الظلال الداكنة والانتفاخات الخفيفة لإطلالة منتعشة ومشرقة.',
    tag: 'فيلر هالات ونضارة',
    priceNote: 'جلسة واحدة أساسية + رتوش مراجعة',
  },
  {
    id: 'cheeks',
    nameAr: 'الخدود والمسام وآثار الحبوب',
    nameEn: 'Cheeks, Scars & Pores',
    targetServiceId: 'scars',
    position: [0.84, 0.05, 1.22],
    cameraPos: [0.75, 0.0, 4.2],
    cameraTarget: [0.35, 0.0, 0],
    treatments: ['فراكشنال ليزر Fractional CO2', 'حقن البلازما PRP المرممة', 'تقشير كيميائي لعلاج التصبغات'],
    descriptionAr: 'إعادة تسوية ملمس الجلد، إغلاق المسام الواسعة، وإزالة آثار الحبوب والندبات العميقة.',
    tag: 'فراكشنال ليزر وتجديد خلايا',
    priceNote: 'كورس جلسات علاجي من 3 إلى 5 جلسات',
  },
  {
    id: 'jawline',
    nameAr: 'خط الفك والذقن (تكساس)',
    nameEn: 'Jawline & Chin Contour',
    targetServiceId: 'aging',
    position: [0, -0.88, 1.18],
    cameraPos: [0, -0.45, 4.3],
    cameraTarget: [0, -0.35, 0],
    treatments: ['فيلر تحديد الفك والذقن (Texas)', 'خيوط الشد غير الجراحي', 'بوتوكس نفرتيتي لشد الرقبة'],
    descriptionAr: 'إبراز وتحديد خط الفك، شد ترهل الذقن وإعطاء الوجه ملامح أكثر تناسقاً وتحدداً وجاذبية.',
    tag: 'تحديد الفك ونفرتيتي',
    priceNote: 'جلسة فورية بنتائج تدوم حتى 18 شهراً',
  },
];
