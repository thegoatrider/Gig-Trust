import { supabase } from './supabaseClient';

// Prevent client-side bundler errors by checking the environment
export const isServer = typeof window === 'undefined';

// Define DB entity interfaces (must match supabase schema)
export interface User {
  id: string;
  role: 'worker' | 'employer' | 'admin' | 'moderator' | 'finance';
  phone: string;
  email: string;
  kyc_status: 'pending' | 'bronze' | 'silver' | 'gold' | 'rejected';
  trust_score: number;
  wallet_balance: number;
  created_at: string;
}

export interface WorkerProfile {
  user_id: string;
  dob: string;
  gender: string;
  base_location_lat: number;
  base_location_lng: number;
  id_doc_type: 'Aadhaar' | 'Driving Licence' | 'Voter ID' | 'Passport';
  id_doc_url: string;
  id_verified: boolean;
  face_match_score: number;
  education: Array<{ school: string; degree: string; year: string }>;
  work_experience: Array<{ company: string; role: string; duration: string }>;
  current_employer?: string;
  cv_url?: string;
  linkedin_url?: string;
  driving_licence_url?: string;
  medical_conditions?: string;
  social_links: Array<{ name: string; url: string }>;
  skills: string[];
  work_mode: 'online' | 'offline' | 'both';
  police_verification_url?: string;
  police_verified: boolean;
}

export interface Guardian {
  id: string;
  worker_id: string;
  name: string;
  phone: string;
  address: string;
  relation_type: 'blood' | 'other';
}

export interface EmployerProfile {
  user_id: string;
  business_name: string;
  gstin: string;
  business_docs_url: string;
  verified_location_lat: number;
  verified_location_lng: number;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  photos: string[];
  videos: string[];
  location_lat: number;
  location_lng: number;
  mode: 'online' | 'offline';
  price_type: 'hourly' | 'fixed';
  rate: number;
  recurrence: 'one_off' | 'recurring';
  trial_minutes: number;
  min_workers: number;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'completed';
  otp?: string;
  qr_token?: string;
  created_at: string;
}

export interface Session {
  id: string;
  job_application_id: string;
  check_in_time: string;
  check_out_time?: string;
  geofence_ok: boolean;
  selfie_url?: string;
  timer_status: 'running' | 'paused' | 'completed';
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'hold' | 'release';
  amount: number;
  ref_id: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  session_id: string;
  raised_by: string;
  reason: string;
  evidence_urls: string[];
  status: 'open' | 'under_investigation' | 'resolved';
  resolution?: string;
  created_at: string;
}

export interface Rating {
  id: string;
  session_id: string;
  rated_by: string;
  rated_user_id: string;
  score: number;
  comment: string;
  created_at: string;
}

export interface Strike {
  id: string;
  user_id: string;
  reason: string;
  count: number;
  created_at: string;
}

// In-Memory store stub for backwards compatibility / local references (deprecated)
export const getDb = () => {
  if (!isServer) throw new Error("Database can only be accessed on the server-side");
  return null;
};

// Database CRUD/Query adapter pointing to live Supabase
export const db = {
  users: {
    findMany: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data || [];
    },
    findById: async (id: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    findByPhone: async (phone: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    findByEmail: async (email: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    create: async (data: Omit<User, 'id' | 'created_at'>): Promise<User> => {
      const { data: newUser, error } = await supabase.from('users').insert(data).select().single();
      if (error) throw error;
      return newUser;
    },
    update: async (id: string, data: Partial<User>): Promise<User | undefined> => {
      const { data: updatedUser, error } = await supabase.from('users').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updatedUser || undefined;
    }
  },
  workerProfiles: {
    findById: async (userId: string): Promise<WorkerProfile | undefined> => {
      const { data, error } = await supabase.from('worker_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    upsert: async (userId: string, data: Partial<WorkerProfile>): Promise<WorkerProfile> => {
      const existing = await db.workerProfiles.findById(userId);
      if (!existing) {
        const insertData = {
          user_id: userId,
          dob: data.dob || "2000-01-01",
          gender: data.gender || "Not Specified",
          base_location_lat: data.base_location_lat || 12.9716,
          base_location_lng: data.base_location_lng || 77.5946,
          id_doc_type: data.id_doc_type || "Aadhaar",
          id_doc_url: data.id_doc_url || "",
          id_verified: data.id_verified || false,
          face_match_score: data.face_match_score || 0,
          education: data.education || [],
          work_experience: data.work_experience || [],
          social_links: data.social_links || [],
          skills: data.skills || [],
          work_mode: data.work_mode || "both",
          police_verified: data.police_verified || false
        };
        const { data: newProfile, error } = await supabase.from('worker_profiles').insert(insertData).select().single();
        if (error) throw error;
        return newProfile;
      } else {
        const { data: updatedProfile, error } = await supabase.from('worker_profiles').update(data).eq('user_id', userId).select().single();
        if (error) throw error;
        return updatedProfile;
      }
    }
  },
  employerProfiles: {
    findById: async (userId: string): Promise<EmployerProfile | undefined> => {
      const { data, error } = await supabase.from('employer_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    upsert: async (userId: string, data: Partial<EmployerProfile>): Promise<EmployerProfile> => {
      const existing = await db.employerProfiles.findById(userId);
      if (!existing) {
        const insertData = {
          user_id: userId,
          business_name: data.business_name || "",
          gstin: data.gstin || "",
          business_docs_url: data.business_docs_url || "",
          verified_location_lat: data.verified_location_lat || 12.9716,
          verified_location_lng: data.verified_location_lng || 77.5946
        };
        const { data: newProfile, error } = await supabase.from('employer_profiles').insert(insertData).select().single();
        if (error) throw error;
        return newProfile;
      } else {
        const { data: updatedProfile, error } = await supabase.from('employer_profiles').update(data).eq('user_id', userId).select().single();
        if (error) throw error;
        return updatedProfile;
      }
    }
  },
  guardians: {
    findManyByWorker: async (workerId: string): Promise<Guardian[]> => {
      const { data, error } = await supabase.from('guardians').select('*').eq('worker_id', workerId);
      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<Guardian, 'id'>): Promise<Guardian> => {
      const { data: newGuardian, error } = await supabase.from('guardians').insert(data).select().single();
      if (error) throw error;
      return newGuardian;
    },
    deleteByWorker: async (workerId: string): Promise<void> => {
      const { error } = await supabase.from('guardians').delete().eq('worker_id', workerId);
      if (error) throw error;
    }
  },
  jobs: {
    findMany: async (): Promise<Job[]> => {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    findById: async (id: string): Promise<Job | undefined> => {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    create: async (data: Omit<Job, 'id' | 'created_at' | 'status'>): Promise<Job> => {
      const { data: newJob, error } = await supabase.from('jobs').insert({ ...data, status: 'open' }).select().single();
      if (error) throw error;
      return newJob;
    },
    update: async (id: string, data: Partial<Job>): Promise<Job | undefined> => {
      const { data: updatedJob, error } = await supabase.from('jobs').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updatedJob || undefined;
    }
  },
  applications: {
    findMany: async (): Promise<JobApplication[]> => {
      const { data, error } = await supabase.from('job_applications').select('*');
      if (error) throw error;
      return data || [];
    },
    findManyByWorker: async (workerId: string): Promise<JobApplication[]> => {
      const { data, error } = await supabase.from('job_applications').select('*').eq('worker_id', workerId);
      if (error) throw error;
      return data || [];
    },
    findManyByJob: async (jobId: string): Promise<JobApplication[]> => {
      const { data, error } = await supabase.from('job_applications').select('*').eq('job_id', jobId);
      if (error) throw error;
      return data || [];
    },
    findById: async (id: string): Promise<JobApplication | undefined> => {
      const { data, error } = await supabase.from('job_applications').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    create: async (data: Omit<JobApplication, 'id' | 'created_at' | 'status'>): Promise<JobApplication> => {
      // Check for existing application first
      const { data: existing, error: existingError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', data.job_id)
        .eq('worker_id', data.worker_id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return existing;

      const { data: newApp, error } = await supabase.from('job_applications').insert({ ...data, status: 'applied' }).select().single();
      if (error) throw error;
      return newApp;
    },
    update: async (id: string, data: Partial<JobApplication>): Promise<JobApplication | undefined> => {
      const { data: updatedApp, error } = await supabase.from('job_applications').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updatedApp || undefined;
    }
  },
  sessions: {
    findMany: async (): Promise<Session[]> => {
      const { data, error } = await supabase.from('sessions').select('*');
      if (error) throw error;
      return data || [];
    },
    findById: async (id: string): Promise<Session | undefined> => {
      const { data, error } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    findByApplicationId: async (appId: string): Promise<Session | undefined> => {
      const { data, error } = await supabase.from('sessions').select('*').eq('job_application_id', appId).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    create: async (data: Omit<Session, 'id' | 'check_in_time' | 'timer_status'>): Promise<Session> => {
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({ ...data, timer_status: 'running', check_in_time: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return newSession;
    },
    update: async (id: string, data: Partial<Session>): Promise<Session | undefined> => {
      const { data: updatedSession, error } = await supabase.from('sessions').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updatedSession || undefined;
    }
  },
  walletTransactions: {
    findManyByUser: async (userId: string): Promise<WalletTransaction[]> => {
      const { data, error } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<WalletTransaction, 'id' | 'created_at'>): Promise<WalletTransaction> => {
      const { data: newTx, error } = await supabase.from('wallet_transactions').insert(data).select().single();
      if (error) throw error;
      return newTx;
    }
  },
  disputes: {
    findMany: async (): Promise<Dispute[]> => {
      const { data, error } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    findById: async (id: string): Promise<Dispute | undefined> => {
      const { data, error } = await supabase.from('disputes').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    create: async (data: Omit<Dispute, 'id' | 'created_at' | 'status'>): Promise<Dispute> => {
      const { data: newDispute, error } = await supabase.from('disputes').insert({ ...data, status: 'open' }).select().single();
      if (error) throw error;
      return newDispute;
    },
    update: async (id: string, data: Partial<Dispute>): Promise<Dispute | undefined> => {
      const { data: updatedDispute, error } = await supabase.from('disputes').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updatedDispute || undefined;
    }
  },
  ratings: {
    findManyByUser: async (userId: string): Promise<Rating[]> => {
      const { data, error } = await supabase.from('ratings').select('*').eq('rated_user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<Rating, 'id' | 'created_at'>): Promise<Rating> => {
      const { data: newRating, error } = await supabase.from('ratings').insert(data).select().single();
      if (error) throw error;
      return newRating;
    }
  },
  strikes: {
    findManyByUser: async (userId: string): Promise<Strike[]> => {
      const { data, error } = await supabase.from('strikes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<Strike, 'id' | 'created_at'>): Promise<Strike> => {
      const { data: newStrike, error } = await supabase.from('strikes').insert(data).select().single();
      if (error) throw error;
      return newStrike;
    }
  },
  verificationOtps: {
    saveOtp: async (phone: string, otp: string, expiresAt: Date): Promise<any> => {
      const { data, error } = await supabase
        .from('verification_otps')
        .upsert({ phone, otp, expires_at: expiresAt.toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    getOtp: async (phone: string): Promise<any> => {
      const { data, error } = await supabase
        .from('verification_otps')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      if (error) throw error;
      return data || undefined;
    },
    deleteOtp: async (phone: string): Promise<void> => {
      const { error } = await supabase
        .from('verification_otps')
        .delete()
        .eq('phone', phone);
      if (error) throw error;
    }
  }
};
