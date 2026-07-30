-- GigTrust Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('worker', 'employer', 'admin', 'moderator', 'finance')),
  phone text unique not null,
  email text unique not null,
  kyc_status text not null default 'pending' check (kyc_status in ('pending', 'bronze', 'silver', 'gold', 'rejected')),
  trust_score integer not null default 70 check (trust_score >= 0 and trust_score <= 100),
  wallet_balance numeric(10, 2) not null default 0.00 check (wallet_balance >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Worker Profiles Table
create table if not exists public.worker_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  dob date not null,
  gender text not null,
  base_location_lat numeric(9, 6) not null,
  base_location_lng numeric(9, 6) not null,
  id_doc_type text not null check (id_doc_type in ('Aadhaar', 'Driving Licence', 'Voter ID', 'Passport')),
  id_doc_url text not null,
  id_verified boolean not null default false,
  face_match_score numeric(5, 2) default 0.00,
  education jsonb not null default '[]'::jsonb, -- Array of {school, degree, year}
  work_experience jsonb not null default '[]'::jsonb, -- Array of {company, role, duration}
  current_employer text,
  cv_url text,
  linkedin_url text,
  driving_licence_url text,
  medical_conditions text, -- Private column (only admin/moderator can read)
  social_links jsonb not null default '[]'::jsonb,
  skills text[] not null default '{}'::text[],
  work_mode text not null default 'both' check (work_mode in ('online', 'offline', 'both')),
  police_verification_url text,
  police_verified boolean not null default false
);

-- 3. Guardians Table (Required 3 contacts for Worker safety)
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null,
  relation_type text not null check (relation_type in ('blood', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Employer Profiles Table
create table if not exists public.employer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  business_name text not null,
  gstin text not null,
  business_docs_url text not null,
  verified_location_lat numeric(9, 6) not null,
  verified_location_lng numeric(9, 6) not null
);

-- 5. Jobs Table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  skills text[] not null default '{}'::text[],
  photos text[] not null default '{}'::text[],
  videos text[] not null default '{}'::text[],
  location_lat numeric(9, 6),
  location_lng numeric(9, 6),
  mode text not null check (mode in ('online', 'offline')),
  price_type text not null check (price_type in ('hourly', 'fixed')),
  rate numeric(10, 2) not null check (rate > 0),
  recurrence text not null check (recurrence in ('one_off', 'recurring')),
  trial_minutes integer not null default 30 check (trial_minutes >= 0),
  min_workers integer not null default 1 check (min_workers >= 1),
  status text not null default 'open' check (status in ('open', 'active', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Job Applications Table
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'applied' check (status in ('applied', 'shortlisted', 'accepted', 'rejected', 'completed')),
  otp text,
  qr_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, worker_id)
);

-- 7. Sessions Table (Active check-in/timer)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid not null references public.job_applications(id) on delete cascade,
  check_in_time timestamp with time zone default timezone('utc'::text, now()) not null,
  check_out_time timestamp with time zone,
  geofence_ok boolean not null default false,
  selfie_url text,
  timer_status text not null default 'running' check (timer_status in ('running', 'paused', 'completed'))
);

-- 8. Wallet Transactions Table
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('credit', 'debit', 'hold', 'release')),
  amount numeric(10, 2) not null check (amount > 0),
  ref_id text not null, -- external payment reference or hold UUID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Disputes Table
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  raised_by uuid not null references public.users(id) on delete cascade,
  reason text not null,
  evidence_urls text[] not null default '{}'::text[],
  status text not null default 'open' check (status in ('open', 'under_investigation', 'resolved')),
  resolution text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Ratings Table (Bidirectional)
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  rated_by uuid not null references public.users(id) on delete cascade,
  rated_user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(session_id, rated_by)
);

-- 11. Strikes Table
create table if not exists public.strikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  count integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.sessions enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.disputes enable row level security;
alter table public.ratings enable row level security;
alter table public.strikes enable row level security;

-- Setup RLS Policies

-- Users policy
create policy "Users can view their own details" on public.users
  for select using (auth.uid() = id);

create policy "Admins can view all users" on public.users
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Worker Profiles policy
create policy "Anyone can view basic worker profile info" on public.worker_profiles
  for select using (true); -- Filtered at app-level (no PII returned to general public)

create policy "Workers can update their own profile" on public.worker_profiles
  for all using (auth.uid() = user_id);

-- Guardians Policy (Admins and owners only)
create policy "Workers can view/manage their own guardians" on public.guardians
  for all using (auth.uid() = worker_id);

create policy "Admins can view guardians" on public.guardians
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Jobs Policy
create policy "Anyone can view open jobs" on public.jobs
  for select using (status = 'open' or employer_id = auth.uid());

create policy "Employers can manage their own jobs" on public.jobs
  for all using (employer_id = auth.uid());
