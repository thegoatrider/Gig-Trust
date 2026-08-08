"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, Plus, Users, Shield, Coins, LogOut, 
  MapPin, Clock, RefreshCw, AlertCircle, FileText, Trash2, PlusCircle, Wallet, User
} from "lucide-react";

export default function EmployerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/employer/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard data");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {}
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this job posting?")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to cancel job.");
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-3"></div>
        <span className="font-medium">Syncing Business Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Dashboard Sync Error</h3>
        <p className="text-gray-500 text-xs mb-6 max-w-sm">{error}</p>
        <button onClick={fetchDashboard} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm">
          Retry Sync
        </button>
      </div>
    );
  }

  const { user, profile, jobs, applicants, activeSessions } = data;

  // Filter out cancelled jobs for employer view to keep it clean
  const visibleJobs = jobs.filter((j: any) => j.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-[#E5E7EB] sm:py-6 flex justify-center">
      {/* Phone Emulator wrapper */}
      <div className="w-full max-w-md bg-[#F6F7F9] min-h-screen sm:min-h-[850px] sm:max-h-[900px] sm:rounded-[40px] shadow-2xl border border-gray-200/80 flex flex-col relative overflow-hidden pb-20">
        
        {/* Top Notch/Dynamic Island simulation on emulator */}
        <div className="hidden sm:block absolute top-0 inset-x-0 h-7 bg-black z-50 rounded-t-[40px] flex items-center justify-between px-6 text-white text-[10px] font-semibold">
          <span>9:41</span>
          <div className="w-20 h-4 bg-[#111111] rounded-full mx-auto -mt-0.5" />
          <div className="flex gap-1">
            <span>5G</span>
            <span className="w-3 h-2 border border-white rounded-sm" />
          </div>
        </div>

        {/* Top Header Navbar */}
        <header className="sticky top-0 sm:top-7 z-40 bg-[#F6F7F9] border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <Link href="/employer/dashboard" className="text-xl font-black font-outfit text-gray-900">
            GigTrust
          </Link>
          <div className="flex items-center gap-2">
            <div className="text-[10px] bg-white border border-gray-200/80 px-2.5 py-1.5 rounded-full font-bold text-gray-700 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> ₹{user.wallet_balance.toFixed(0)}
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors border border-red-100"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content Scrolling Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Welcome greeting */}
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-gray-900 tracking-tight">
              Hi, {profile?.business_name ? profile.business_name.split(' ')[0] : 'Demo'}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Manage your jobs and hires
            </p>
          </div>

          {/* Stats Badges Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Posted</span>
              <span className="text-lg font-black text-gray-900 mt-1">{jobs.length}</span>
            </div>
            <Link href="/employer/applicants" className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm hover:border-violet-500/20 transition-all flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Candidates</span>
              <span className="text-lg font-black text-violet-600 mt-1">{applicants.length}</span>
            </Link>
            <Link href="/employer/active-sessions" className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm hover:border-violet-500/20 transition-all flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Running</span>
              <span className="text-lg font-black text-emerald-600 mt-1">
                {activeSessions.filter((s: any) => s.timer_status === 'running').length}
              </span>
            </Link>
          </div>

          {/* Core Postings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-violet-600" /> Active Postings
              </h2>
              <Link href="/employer/post-job" className="text-xs text-violet-600 hover:underline font-bold flex items-center gap-0.5">
                Create new <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            {visibleJobs.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl py-12 px-6 text-center text-gray-400 text-xs">
                No active job listings found. Tap + above to post a job.
              </div>
            ) : (
              <div className="space-y-4">
                {visibleJobs.map((job: any, idx: number) => {
                  // Map statuses to visual tags
                  const isHired = job.status === 'active';
                  const isCompleted = job.status === 'completed';
                  
                  return (
                    <div key={idx} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
                      {/* Top Header Row of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            {job.description || "To take care of orders"}
                          </p>
                        </div>
                        {isHired && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D35400] shrink-0">
                            hired
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#E8F8F5] text-[#117A65] shrink-0">
                            completed
                          </span>
                        )}
                        {!isHired && !isCompleted && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-600 shrink-0">
                            {job.status}
                          </span>
                        )}
                      </div>

                      {/* Details & Badges Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">
                            {job.mode === 'offline' ? 'On-site' : 'Remote'}
                          </span>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">
                            {job.min_workers || 1} needed
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-[#EA580C]">
                          ₹{job.rate}/{job.price_type === 'hourly' ? 'hr' : 'fix'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-50 flex justify-end">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Persistent Bottom Tab Bar Navigation matching the screenshot */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/employer/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Briefcase className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Jobs</span>
          </Link>
          
          <Link href="/employer/post-job" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Post</span>
          </Link>

          <Link href="/employer/active-sessions" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-bold">Wallet</span>
          </Link>

          <Link href="/employer/onboarding" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

