import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Save,
  Globe,
  Image as ImageIcon,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Facebook,
  Instagram,
} from 'lucide-react';
import { SiteSettingsRecord } from '@/types/admin';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { updateBrowserFavicon } from '@/utils/favicon';

interface SiteSettingsEditorProps {
  settings: SiteSettingsRecord;
  onUpdateSettings: (settings: Partial<SiteSettingsRecord>) => Promise<void>;
  isLoading?: boolean;
}

export const SiteSettingsEditor = React.memo(function SiteSettingsEditor({
  settings,
  onUpdateSettings,
}: SiteSettingsEditorProps) {
  const [clinicNameAr, setClinicNameAr] = useState<string>(settings.site_title || settings.clinic_name_ar || 'عيادات Androderma');
  const [taglineAr, setTaglineAr] = useState<string>(settings.tagline || settings.tagline_ar || 'عناية متقدمة بالجلدية والليزر والتجميل الطبي');
  const [logoUrl, setLogoUrl] = useState<string>(settings.logo_url || CLINIC_LOGO);
  const [faviconUrl, setFaviconUrl] = useState<string>(settings.favicon_url || settings.logo_url || CLINIC_LOGO);
  const [contactPhone, setContactPhone] = useState<string>(settings.contact_phone || settings.phone_number || settings.unified_hotline || '01154021247');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(settings.unified_hotline || settings.whatsapp_number || '201154021247');
  const [emailContact, setEmailContact] = useState<string>(settings.official_email || settings.email_contact || 'info@androderma.com');
  const [emergencyNotice, setEmergencyNotice] = useState<string>(settings.emergency_alert || settings.emergency_notice_ar || '');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(Boolean(settings.maintenance_mode !== undefined ? settings.maintenance_mode : settings.is_maintenance_mode));
  const [primaryColor, setPrimaryColor] = useState<string>(settings.primary_color || '#00B8A9');
  const [secondaryColor, setSecondaryColor] = useState<string>(settings.secondary_color || settings.accent_color || '#0F766E');
  const [facebookUrl, setFacebookUrl] = useState<string>(settings.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = useState<string>(settings.instagram_url || '');
  const [tiktokUrl, setTiktokUrl] = useState<string>(settings.tiktok_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState<string>(settings.youtube_url || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [faviconSynced, setFaviconSynced] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever settings are fetched or updated from Supabase
  useEffect(() => {
    if (settings) {
      if (settings.site_title || settings.clinic_name_ar) {
        setClinicNameAr(settings.site_title || settings.clinic_name_ar || '');
      }
      if (settings.tagline || settings.tagline_ar) {
        setTaglineAr(settings.tagline || settings.tagline_ar || '');
      }
      if (settings.logo_url) {
        setLogoUrl(settings.logo_url);
      }
      if (settings.favicon_url) {
        setFaviconUrl(settings.favicon_url);
      }
      if (settings.contact_phone || settings.phone_number || settings.unified_hotline) {
        setContactPhone(settings.contact_phone || settings.phone_number || settings.unified_hotline || '');
      }
      if (settings.unified_hotline || settings.whatsapp_number) {
        setWhatsappNumber(settings.unified_hotline || settings.whatsapp_number || '');
      }
      if (settings.official_email || settings.email_contact) {
        setEmailContact(settings.official_email || settings.email_contact || '');
      }
      if (settings.emergency_alert !== undefined || settings.emergency_notice_ar !== undefined) {
        setEmergencyNotice(settings.emergency_alert || settings.emergency_notice_ar || '');
      }
      if (settings.maintenance_mode !== undefined || settings.is_maintenance_mode !== undefined) {
        setIsMaintenanceMode(Boolean(settings.maintenance_mode !== undefined ? settings.maintenance_mode : settings.is_maintenance_mode));
      }
      if (settings.primary_color) {
        setPrimaryColor(settings.primary_color);
      }
      if (settings.secondary_color || settings.accent_color) {
        setSecondaryColor(settings.secondary_color || settings.accent_color || '#0F766E');
      }
      if (settings.facebook_url !== undefined) {
        setFacebookUrl(settings.facebook_url || '');
      }
      if (settings.instagram_url !== undefined) {
        setInstagramUrl(settings.instagram_url || '');
      }
      if (settings.tiktok_url !== undefined) {
        setTiktokUrl(settings.tiktok_url || '');
      }
      if (settings.youtube_url !== undefined) {
        setYoutubeUrl(settings.youtube_url || '');
      }
    }
  }, [settings]);

  // Handle local image file upload and conversion to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        setFaviconUrl(result);
        updateBrowserFavicon(result);
        setFaviconSynced(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestFavicon = () => {
    updateBrowserFavicon(faviconUrl || logoUrl);
    setFaviconSynced(true);
    setTimeout(() => setFaviconSynced(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const activeLogo = logoUrl.trim() || CLINIC_LOGO;
      const activeFavicon = faviconUrl.trim() || activeLogo;

      // Update browser head immediately
      updateBrowserFavicon(activeFavicon);

      await onUpdateSettings({
        id: settings.id,
        // Supabase direct database columns
        site_title: clinicNameAr.trim(),
        tagline: taglineAr.trim(),
        official_email: emailContact.trim(),
        unified_hotline: contactPhone.trim() || whatsappNumber.trim(),
        emergency_alert: emergencyNotice.trim() || null,
        logo_url: activeLogo,
        favicon_url: activeFavicon,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        maintenance_mode: isMaintenanceMode,
        facebook_url: facebookUrl.trim(),
        instagram_url: instagramUrl.trim(),
        tiktok_url: tiktokUrl.trim(),
        youtube_url: youtubeUrl.trim(),

        // Direct phone mapping & backwards-compatible aliases
        contact_phone: contactPhone.trim(),
        phone_number: contactPhone.trim(),
        clinic_name_ar: clinicNameAr.trim(),
        tagline_ar: taglineAr.trim(),
        email_contact: emailContact.trim(),
        whatsapp_number: whatsappNumber.trim(),
        emergency_notice_ar: emergencyNotice.trim() || null,
        accent_color: secondaryColor,
        is_maintenance_mode: isMaintenanceMode,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إعدادات الموقع وهوية الشعار والفافيكون</h2>
            <p className="text-xs text-slate-400">تخصيص اللوجو والشعار والـ Favicon والبيانات العامة وقنوات التواصل</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Logo & Favicon Sync Module */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#00B8A9]" />
              <div>
                <h3 className="text-sm font-black text-white">إدارة اللوجو والأيقونة المفضلة (Dynamic Logo & Favicon Sync)</h3>
                <p className="text-[11px] text-slate-400">
                  تحديث الشعار يغير تلقائياً أيقونة المتصفح (Favicon) وشعار شاشة التحميل (Splash Screen) والـ Header!
                </p>
              </div>
            </div>
            {faviconSynced && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> تم تحديث الفافيكون
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Logo URL Input & File Upload */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط الشعار المباشر (Logo Image URL)
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    if (!faviconUrl || faviconUrl === logoUrl) {
                      setFaviconUrl(e.target.value);
                    }
                  }}
                  placeholder="https://... أو مسار الصورة"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00B8A9]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  أو رفع صورة الشعار من جهازك مباشرة
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 bg-slate-950/40 hover:bg-slate-950/80 hover:border-[#00B8A9] text-xs font-semibold text-slate-300 transition-all"
                >
                  <Upload className="w-4 h-4 text-[#00B8A9]" />
                  <span>انقر لاختيار ملف صورة (PNG, SVG, JPG, WebP)</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl(CLINIC_LOGO);
                    setFaviconUrl(CLINIC_LOGO);
                  }}
                  className="text-[11px] text-teal-400 hover:text-teal-300 underline font-medium"
                >
                  استعادة الشعار الملكي الأصلي لـ Androderma
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleTestFavicon}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/10"
                >
                  <RefreshCw className="w-3 h-3 text-[#00B8A9]" /> تجربة تحديث Favicon المتصفح الآن
                </button>
              </div>
            </div>

            {/* Live Logo Preview Box */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-slate-950/80 p-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 block">معاينة الشعار والـ Favicon:</span>
              <div className="flex items-center justify-around gap-3 p-3 rounded-xl bg-slate-900 border border-white/5">
                {/* Dark Preview */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/10 p-2 flex items-center justify-center overflow-hidden mx-auto shadow-inner">
                    <img
                      src={logoUrl || CLINIC_LOGO}
                      alt="Logo Dark Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CLINIC_LOGO;
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">على الخلفية الداكنة</span>
                </div>

                {/* Light Preview */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-2 flex items-center justify-center overflow-hidden mx-auto shadow-inner">
                    <img
                      src={logoUrl || CLINIC_LOGO}
                      alt="Logo Light Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CLINIC_LOGO;
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">على الخلفية الفاتحة</span>
                </div>

                {/* Favicon Simulation */}
                <div className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 p-1 flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                    <img
                      src={faviconUrl || logoUrl || CLINIC_LOGO}
                      alt="Favicon Simulation"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CLINIC_LOGO;
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-teal-400 mt-1 block font-bold">Favicon (16x16)</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                ✨ الشعار يتزامن تلقائياً عبر صفحات الموقع، شاشة البداية، الفوتر، وأيقونة تبويب المتصفح.
              </p>
            </div>
          </div>
        </div>

        {/* General Site Data */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Globe className="w-4 h-4 text-[#00B8A9]" />
            <h3 className="text-sm font-black text-white">البيانات العامة وقنوات التواصل</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العيادات</label>
              <input
                type="text"
                value={clinicNameAr}
                onChange={(e) => setClinicNameAr(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الشعار / الوصف المختصر (Tagline)</label>
              <input
                type="text"
                value={taglineAr}
                onChange={(e) => setTaglineAr(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الاتصال المباشر</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="01154021247"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                dir="ltr"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                مربوط بـ contact_phone لأزرار الاتصال الهاتفي الفوري
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">واتساب الإدارة الموحد</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="201154021247"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                dir="ltr"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                الرقم المخصص للمحادثات والاستشارات عبر واتساب
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={emailContact}
                onChange={(e) => setEmailContact(e.target.value)}
                placeholder="info@androderma.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                dir="ltr"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                بريد التواصل الرسمي واستقبال الاستفسارات
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">شريط تنبيهات الطوارئ العام (اختياري)</label>
            <input
              type="text"
              value={emergencyNotice}
              onChange={(e) => setEmergencyNotice(e.target.value)}
              placeholder="مثال: يرجى العلم بأنه تم نقل عيادة ليزر المعادي للدور الأول مؤقتاً..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
            />
          </div>

          {/* Social Media Links: Facebook, Instagram, TikTok & YouTube */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-black text-slate-200">روابط منصات التواصل الاجتماعي (Social Media Links)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Facebook className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>Facebook URL (رابط صفحة الفيسبوك)</span>
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يتم إظهار أيقونة فيسبوك تلقائياً في فوتر الموقع عند حفظ الرابط
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Instagram className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>Instagram URL (رابط حساب الإنستجرام)</span>
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يتم إظهار أيقونة إنستجرام تلقائياً في فوتر الموقع عند حفظ الرابط
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  TikTok URL (رابط تيك توك)
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يتم إظهار أيقونة تيك توك تلقائياً في فوتر الموقع عند حفظ الرابط
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  YouTube URL (رابط يوتيوب)
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يتم إظهار أيقونة يوتيوب تلقائياً في فوتر الموقع عند حفظ الرابط
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
          <button
            type="submit"
            disabled={isSaving}
            className={`btn-primary py-3 px-8 rounded-xl font-black text-xs transition-all flex items-center gap-2 bg-[#00B8A9] hover:bg-teal-400 text-slate-950 shadow-[0_0_20px_rgba(0,184,169,0.3)] ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              'جاري حفظ وتطبيق الإعدادات...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                <Sparkles className="w-3.5 h-3.5" />
                <span>حفظ وتطبيق إعدادات الموقع والشعار</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

