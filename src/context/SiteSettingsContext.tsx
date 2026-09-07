/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SiteSettingsRecord } from '@/types/admin';
import { fetchSiteSettings, updateSiteSettings as updateSiteSettingsApi } from '@/services/adminService';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { updateBrowserFavicon } from '@/utils/favicon';

interface SiteSettingsContextType {
  settings: SiteSettingsRecord;
  logoUrl: string;
  clinicName: string;
  tagline: string;
  phone: string;
  contactPhone: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  vezeetaUrl: string;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<SiteSettingsRecord>) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettingsRecord = {
  id: '1',
  site_title: 'عيادات Androderma',
  tagline: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
  official_email: 'info@androderma.com',
  unified_hotline: '01154021247',
  contact_phone: '01154021247',
  phone_number: '01154021247',
  emergency_alert: null,
  logo_url: CLINIC_LOGO,
  favicon_url: CLINIC_LOGO,
  primary_color: '#00B8A9',
  secondary_color: '#0F766E',
  maintenance_mode: false,
  facebook_url: 'https://web.facebook.com/androdermaclinic/?locale=ar_AR&_rdc=1&_rdr#',
  instagram_url: 'https://www.instagram.com/androdermaclinic/?hl=ar',
  tiktok_url: '',
  youtube_url: '',
  vezeeta_url: 'https://www.vezeeta.com/en/dr/Clinic-Androderma-Laser-Clinic-Androderma-Laser-Clinic-Dermatology',

  // Compatibility aliases
  clinic_name_ar: 'عيادات Androderma',
  tagline_ar: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
  email_contact: 'info@androderma.com',
  whatsapp_number: '201154021247',
  emergency_notice_ar: null,
  accent_color: '#0F766E',
  is_maintenance_mode: false,
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  logoUrl: CLINIC_LOGO,
  clinicName: 'عيادات Androderma',
  tagline: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
  phone: '01154021247',
  contactPhone: '01154021247',
  email: 'info@androderma.com',
  facebookUrl: 'https://web.facebook.com/androdermaclinic/?locale=ar_AR&_rdc=1&_rdr#',
  instagramUrl: 'https://www.instagram.com/androdermaclinic/?hl=ar',
  tiktokUrl: '',
  youtubeUrl: '',
  vezeetaUrl: 'https://www.vezeeta.com/en/dr/Clinic-Androderma-Laser-Clinic-Androderma-Laser-Clinic-Dermatology',
  isLoading: false,
  updateSettings: async () => ({ success: true }),
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsRecord>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSiteSettings();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          logo_url: data.logo_url || prev.logo_url || CLINIC_LOGO,
          favicon_url: data.favicon_url || data.logo_url || prev.favicon_url || CLINIC_LOGO,
        }));

        // Dynamic Favicon and Title sync
        const activeLogo = data.logo_url || CLINIC_LOGO;
        updateBrowserFavicon(data.favicon_url || activeLogo);

        const currentTitle = data.site_title || data.clinic_name_ar;
        const currentTagline = data.tagline || data.tagline_ar;
        if (currentTitle) {
          document.title = `${currentTitle} | ${currentTagline || 'العناية بالجلدية والليزر'}`;
        }
      }
    } catch (err) {
      console.error('Error loading site settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSettings = async (
    newSettings: Partial<SiteSettingsRecord>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      // 1. Instantly update dynamic browser favicon
      const targetLogo = updated.logo_url || CLINIC_LOGO;
      updateBrowserFavicon(updated.favicon_url || targetLogo);

      // 2. Instantly update dynamic document title
      const activeTitle = updated.site_title || updated.clinic_name_ar;
      const activeTagline = updated.tagline || updated.tagline_ar;
      if (activeTitle) {
        document.title = `${activeTitle} | ${activeTagline || 'العناية بالجلدية والليزر'}`;
      }

      // 3. Persist to Supabase and Admin service
      const res = await updateSiteSettingsApi(newSettings);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  };

  const currentLogo = settings.logo_url && settings.logo_url.trim().length > 0
    ? settings.logo_url
    : CLINIC_LOGO;

  const clinicName = settings.site_title || settings.clinic_name_ar || 'عيادات Androderma';
  const tagline = settings.tagline || settings.tagline_ar || 'عناية متقدمة بالجلدية والليزر والتجميل الطبي';

  // Dynamic Contact Phone with fallback to main WhatsApp number if empty
  const fallbackWhatsApp = settings.whatsapp_number || settings.unified_hotline || '201154021247';
  const rawContactPhone = settings.contact_phone || settings.phone_number || settings.unified_hotline;
  const contactPhone = (rawContactPhone && rawContactPhone.trim().length > 0)
    ? rawContactPhone.trim()
    : fallbackWhatsApp;

  const phone = contactPhone;
  const email = settings.official_email || settings.email_contact || 'info@androderma.com';
  const facebookUrl = settings.facebook_url || 'https://web.facebook.com/androdermaclinic/?locale=ar_AR&_rdc=1&_rdr#';
  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/androdermaclinic/?hl=ar';
  const tiktokUrl = settings.tiktok_url || '';
  const youtubeUrl = settings.youtube_url || '';
  const vezeetaUrl = settings.vezeeta_url || 'https://www.vezeeta.com/en/dr/Clinic-Androderma-Laser-Clinic-Androderma-Laser-Clinic-Dermatology';

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        logoUrl: currentLogo,
        clinicName,
        tagline,
        phone,
        contactPhone,
        email,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        youtubeUrl,
        vezeetaUrl,
        isLoading,
        updateSettings: handleUpdateSettings,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
