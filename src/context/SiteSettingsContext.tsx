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
  isLoading: boolean;
  updateSettings: (newSettings: Partial<SiteSettingsRecord>) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettingsRecord = {
  id: 'main-settings',
  clinic_name_ar: 'عيادات Androderma',
  tagline_ar: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
  logo_url: CLINIC_LOGO,
  favicon_url: CLINIC_LOGO,
  primary_color: '#00B8A9',
  accent_color: '#0F766E',
  whatsapp_number: '201154021247',
  email_contact: 'info@androderma.com',
  emergency_notice_ar: null,
  is_maintenance_mode: false,
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  logoUrl: CLINIC_LOGO,
  clinicName: 'عيادات Androderma',
  tagline: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
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

        if (data.clinic_name_ar) {
          document.title = `${data.clinic_name_ar} | ${data.tagline_ar || 'العناية بالجلدية والليزر'}`;
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
      if (updated.clinic_name_ar) {
        document.title = `${updated.clinic_name_ar} | ${updated.tagline_ar || 'العناية بالجلدية والليزر'}`;
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

  const clinicName = settings.clinic_name_ar || 'عيادات Androderma';
  const tagline = settings.tagline_ar || 'عناية متقدمة بالجلدية والليزر والتجميل الطبي';

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        logoUrl: currentLogo,
        clinicName,
        tagline,
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
