/**
 * TypeScript types for Admin Dashboard modules and Supabase tables:
 * - branches
 * - weekly_schedule
 * - schedule_exceptions
 * - site_settings
 * - activity_logs
 */

export interface SiteSettingsRecord {
  id?: string;
  clinic_name_ar?: string;
  tagline_ar?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  accent_color?: string;
  whatsapp_number?: string;
  email_contact?: string;
  emergency_notice_ar?: string | null;
  is_maintenance_mode?: boolean;
  meta_title?: string;
  meta_description?: string;
  updated_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'pending' | 'معلق';
export type VisitType =
  | 'كشف جديد'
  | 'استشارة ومتابعة'
  | 'جلسة ليزر'
  | 'إجراء تجميلي'
  | 'كشف طارئ';

export interface AppointmentRecord {
  id: string;
  patient_name: string;
  patient_phone: string;
  service_name: string;
  visit_type?: VisitType | string;
  branch_id: string;
  branch_name_ar?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. '05:30 PM' or '17:30'
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  amount: number; // in EGP
  payment_screenshot_url?: string | null;
  payment_method?: 'vodafone_cash' | 'instapay' | 'cash' | string;
  notes?: string | null;
  medical_notes?: string | null; // Doctor's preliminary diagnosis, prescription, or clinical plan
  created_at: string;
  updated_at?: string;
}

export interface BroadcastMessagePayload {
  title: string;
  message: string;
  templateType: 'doctor_delay' | 'emergency_closure' | 'branch_relocation' | 'reminder' | 'custom';
  branchFilter: string; // 'all' or branchId
  dateFilter: 'today' | 'upcoming' | 'all';
  statusFilter: string; // 'all' or status
}

export type ActivityActionType =
  | 'holiday_created'
  | 'holiday_deleted'
  | 'branch_swapped'
  | 'branch_updated'
  | 'settings_updated'
  | 'schedule_updated'
  | 'booking_created'
  | 'booking_updated'
  | 'booking_deleted'
  | 'payment_updated'
  | 'system_sync';

export interface ActivityLogRecord {
  id: string;
  action_type: ActivityActionType | string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  admin_email?: string;
  performed_by?: string;
  device_info?: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

