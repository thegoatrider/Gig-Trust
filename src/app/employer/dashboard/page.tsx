"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, Plus, Users, Shield, Coins, LogOut, 
  MapPin, Clock, RefreshCw, AlertCircle, FileText, Play 
} from "lucide-react";

export default function EmployerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
        <span>Syncing Business Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Dashboard Error</h3>
        <p className="text-slate-400 text-xs mb-6 max-w-sm">{error}</p>
        <button onClick={fetchDashboard} className="px-4 py-2 bg-amber-600 rounded-lg text-xs font-semibold text-slate-950">
          Retry Sync
        </button>
      </div>
    );
  }

  const { user, profile, jobs, applicants, activeSessions } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/employer/dashboard" className="text-xl font-bold font-outfit bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            GigTrust Employer
          </Link>

          <div className="flex items-center gap-4">
            <div 
              className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-amber-400" /> Wallet: ₹{user.wallet_balance.toFixed(2)}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        {/* Company Header details */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit">
              {profile?.business_name || 'Acme Business Portal'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">GSTIN: {profile?.gstin || 'Verification Pending'}</p>
          </div>

          <Link
            href="/employer/post-job"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" /> Create New Job Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-white/5">
            <Briefcase className="w-6 h-6 text-violet-400 mb-2" />
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Jobs Posted</div>
            <div className="text-2xl font-extrabold text-white mt-1">{jobs.length}</div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/5">
            <Users className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Open Candidates</div>
            <div className="text-2xl font-extrabold text-white mt-1">{applicants.length}</div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/5">
            <Clock className="w-6 h-6 text-amber-400 mb-2" />
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Running Clocks</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {activeSessions.filter((s: any) => s.timer_status === 'running').length}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/5">
            <Shield className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Locked Escrow</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              ₹{(activeSessions.filter((s: any) => s.timer_status === 'running').reduce((acc: any, s: any) => acc + s.jobRate, 0)).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Navigation Router Panels */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/employer/applicants" className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex justify-between items-center group">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Review Candidates ({applicants.length})</h3>
              <p className="text-xs text-slate-400 mt-1">Accept or reject pending applications from verified workers.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link href="/employer/active-sessions" className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all flex justify-between items-center group">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">Track Running Clocks ({activeSessions.length})</h3>
              <p className="text-xs text-slate-400 mt-1">Live GPS location sharing, attendance selfies, and trial cutoff cancellations.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Posted Jobs section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Recently Created Postings
          </h3>

          {jobs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No active job listings found. Click "Create New Job Post" above to start recruiting.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: any, idx: number) => {
                const statusColors: any = {
                  open: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                  active: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
                  completed: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
                  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20'
                };

                return (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{job.title}</h4>
                        <span className="text-[10px] text-slate-400">({job.category})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 flex gap-4">
                        <span>Rate: ₹{job.rate}/{job.price_type === 'hourly' ? 'hr' : 'fix'}</span>
                        <span>•</span>
                        <span>Mode: {job.mode}</span>
                        <span>•</span>
                        <span>Trial: {job.trial_minutes} min</span>
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
