-- =========================================================================
-- Supabase Atomic Dynamic Queue Numbering & Branch Sync Schema
-- Project: Androderma Clinic
-- =========================================================================

-- 1. Ensure `branches` table exists and populated with dynamic branch records
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text DEFAULT 'القاهرة',
  address text,
  contact_number text,
  google_maps_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed / Update initial branches with official verified data
INSERT INTO public.branches (id, name, city, address, contact_number, google_maps_url, is_active)
VALUES 
  (
    'ced08c5c-3f0d-49c1-b8c0-5856961909e4',
    'فرع مدينة نصر',
    'مدينة نصر',
    '12 شارع أبو داوود الظاهري متفرع من شارع مكرم عبيد أمام البنك العربي الإفريقي الدولي الدور الأول',
    '01154021247',
    'https://maps.app.goo.gl/4RqWp38sa7P9zvji9',
    true
  ),
  (
    '55306d12-9d6d-401a-9785-b118ee60b45f',
    'فرع التجمع الخامس',
    'التجمع الخامس',
    'مجمع كايرو ميديكال (CMC) شارع التسعين الشمالي خلف المستشفى الجوي وبجوار محطة موبيل الدور الرابع عيادة 441',
    '01223371075',
    'https://maps.app.goo.gl/d9wMmUhogETcJzMW6',
    true
  ),
  (
    '38d81efd-c175-47e2-97b5-9666fab10bd2',
    'فرع المعادي',
    'المعادي',
    '1/5 شارع اللاسلكي عمارة جوهرة الشمس الدور الأول',
    '01015563395',
    'https://maps.app.goo.gl/x7igMWPDExcBsBuV8',
    true
  ),
  (
    'a8aadd71-7ab9-4001-bf10-b0e93012b9b0',
    'فرع نيو جيزة',
    'نيو جيزة',
    'ميدي تاون - مبنى B1 عيادة 305 - الدور الثالث',
    '01154021248',
    'https://maps.app.goo.gl/yxDEgB8H1sSGom1c9',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  contact_number = EXCLUDED.contact_number,
  google_maps_url = EXCLUDED.google_maps_url,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Add queue_number to appointments if not already present
ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS queue_number integer;

ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS sender_account text;

ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS payment_screenshot_url text;

-- 3. Atomic daily queue counter table to guarantee race-condition-free sequences
CREATE TABLE IF NOT EXISTS public.daily_branch_queue_counters (
  branch_id uuid NOT NULL,
  queue_date date NOT NULL,
  last_queue_number integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (branch_id, queue_date)
);

-- 4. Atomic Stored Procedure / RPC function for next sequential queue number
-- This guarantees two concurrent requests never receive the same queue position.
CREATE OR REPLACE FUNCTION public.get_next_queue_number(
  p_branch_id uuid,
  p_date date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_num integer;
BEGIN
  -- Atomically upsert & increment the counter for this branch + date in a single transaction
  INSERT INTO public.daily_branch_queue_counters (branch_id, queue_date, last_queue_number, updated_at)
  VALUES (p_branch_id, p_date, 1, now())
  ON CONFLICT (branch_id, queue_date)
  DO UPDATE SET
    last_queue_number = public.daily_branch_queue_counters.last_queue_number + 1,
    updated_at = now()
  RETURNING last_queue_number INTO v_next_num;

  RETURN v_next_num;
END;
$$;

-- Grant permissions to call the RPC function
GRANT EXECUTE ON FUNCTION public.get_next_queue_number(uuid, date) TO anon, authenticated, service_role;
