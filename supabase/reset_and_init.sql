-- DANGER: This script will drop the existing tables to clean up the old/incompatible database schema.
-- Copy and execute this script inside your Supabase project SQL Editor.

-- 1. Drop existing tables (with CASCADE to handle foreign key dependencies)
DROP TABLE IF EXISTS public.strikes CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.disputes CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.employer_profiles CASCADE;
DROP TABLE IF EXISTS public.guardians CASCADE;
DROP TABLE IF EXISTS public.worker_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Also drop other leftover tables from previous setups if they exist
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('worker', 'employer', 'admin', 'moderator', 'finance')),
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'bronze', 'silver', 'gold', 'rejected')),
  trust_score integer NOT NULL DEFAULT 70 CHECK (trust_score >= 0 AND trust_score <= 100),
  wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Worker Profiles Table
CREATE TABLE public.worker_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  dob date NOT NULL,
  gender text NOT NULL,
  base_location_lat numeric(9, 6) NOT NULL,
  base_location_lng numeric(9, 6) NOT NULL,
  id_doc_type text NOT NULL CHECK (id_doc_type IN ('Aadhaar', 'Driving Licence', 'Voter ID', 'Passport')),
  id_doc_url text NOT NULL,
  id_verified boolean NOT NULL DEFAULT false,
  face_match_score numeric(5, 2) DEFAULT 0.00,
  education jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of {school, degree, year}
  work_experience jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of {company, role, duration}
  current_employer text,
  cv_url text,
  linkedin_url text,
  driving_licence_url text,
  medical_conditions text, -- Private column (only admin/moderator can read)
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills text[] NOT NULL DEFAULT '{}'::text[],
  work_mode text NOT NULL DEFAULT 'both' CHECK (work_mode IN ('online', 'offline', 'both')),
  police_verification_url text,
  police_verified boolean NOT NULL DEFAULT false
);

-- 4. Create Guardians Table (Required 3 contacts for Worker safety)
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  relation_type text NOT NULL CHECK (relation_type IN ('blood', 'other')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Employer Profiles Table
CREATE TABLE public.employer_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  gstin text NOT NULL,
  business_docs_url text NOT NULL,
  verified_location_lat numeric(9, 6) NOT NULL,
  verified_location_lng numeric(9, 6) NOT NULL
);

-- 6. Create Jobs Table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}'::text[],
  photos text[] NOT NULL DEFAULT '{}'::text[],
  videos text[] NOT NULL DEFAULT '{}'::text[],
  location_lat numeric(9, 6),
  location_lng numeric(9, 6),
  mode text NOT NULL CHECK (mode IN ('online', 'offline')),
  price_type text NOT NULL CHECK (price_type IN ('hourly', 'fixed')),
  rate numeric(10, 2) NOT NULL CHECK (rate > 0),
  recurrence text NOT NULL CHECK (recurrence IN ('one_off', 'recurring')),
  trial_minutes integer NOT NULL DEFAULT 30 CHECK (trial_minutes >= 0),
  min_workers integer NOT NULL DEFAULT 1 CHECK (min_workers >= 1),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'active', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Job Applications Table
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected', 'completed')),
  otp text,
  qr_token text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, worker_id)
);

-- 8. Create Sessions Table (Active check-in/timer)
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_application_id uuid NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  check_in_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  check_out_time timestamp with time zone,
  geofence_ok boolean NOT NULL DEFAULT false,
  selfie_url text,
  timer_status text NOT NULL DEFAULT 'running' CHECK (timer_status IN ('running', 'paused', 'completed'))
);

-- 9. Create Wallet Transactions Table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'hold', 'release')),
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  ref_id text NOT NULL, -- external payment reference or hold UUID
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Disputes Table
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  evidence_urls text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved')),
  resolution text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Ratings Table (Bidirectional)
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  rated_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rated_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, rated_by)
);

-- 12. Create Strikes Table
CREATE TABLE public.strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strikes ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies

-- Users policy
CREATE POLICY "Users can view their own details" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Worker Profiles policy
CREATE POLICY "Anyone can view basic worker profile info" ON public.worker_profiles
  FOR SELECT USING (true);

CREATE POLICY "Workers can update their own profile" ON public.worker_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Guardians Policy (Admins and owners only)
CREATE POLICY "Workers can view/manage their own guardians" ON public.guardians
  FOR ALL USING (auth.uid() = worker_id);

CREATE POLICY "Admins can view guardians" ON public.guardians
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Jobs Policy
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT USING (status = 'open' OR employer_id = auth.uid());

CREATE POLICY "Employers can manage their own jobs" ON public.jobs
  FOR ALL USING (employer_id = auth.uid());
