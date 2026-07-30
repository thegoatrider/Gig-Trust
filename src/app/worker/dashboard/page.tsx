"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, Coins, Search, FileText, ArrowRight, ShieldCheck, 
  LogOut, Play, Clock, AlertTriangle, AlertCircle 
} from "lucide-react";

export default function WorkerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/worker/dashboard");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-2"></div>
        <span>Syncing Trust Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Dashboard Error</h3>
        <p className="text-slate-400 text-xs mb-6 max-w-sm">{error}</p>
        <button onClick={fetchDashboard} className="px-4 py-2 bg-violet-600 rounded-lg text-xs font-semibold text-white">
          Retry Sync
        </button>
      </div>
    );
  }

  const { user, profile, applications, activeSession } = data;

  // Compute Badge Color
  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    if (tier === 'silver') return 'border-slate-300 bg-slate-300/10 text-slate-300';
    return 'border-orange-500 bg-orange-500/10 text-orange-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/worker/dashboard" className="text-xl font-bold font-outfit bg-gradient-to-r from-violet-400 to-amber-300 bg-clip-text text-transparent">
            GigTrust Worker
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/worker/earnings" 
              className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" /> ₹{user.wallet_balance.toFixed(2)}
            </Link>
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

      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
        {/* Active Session Highlight Banner */}
        {activeSession && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 to-indigo-950/80 border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400">
                <Clock className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider block">Gig Session Running</span>
                <h4 className="text-base font-bold text-white leading-tight">{activeSession.jobTitle}</h4>
              </div>
            </div>
            <Link 
              href="/worker/active-session"
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
            >
              Open Session Panel <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>
        )}

        {/* Profile Card & Trust Score Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Trust score Gauge */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center justify-center border-l-4 border-l-violet-500">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">Trust Network Score</span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="54" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-violet-500" 
                  fill="transparent" 
                  strokeDasharray="339.2"
                  strokeDashoffset={339.2 - (339.2 * user.trust_score) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white">{user.trust_score}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">/ 100 max</span>
              </div>
            </div>
            
            <div className={`mt-5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getBadgeColor(user.kyc_status)}`}>
              {user.kyc_status} Badge
            </div>
          </div>

          {/* Quick-link Actions */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Link href="/worker/jobs" className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-violet-500/50 transition-all group">
              <Search className="w-8 h-8 text-violet-400 mb-4" />
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">Browse Gigs</h3>
                <p className="text-xs text-slate-400 mt-1">Apply for verified local hourly tasks and remote gigs.</p>
              </div>
            </Link>

            <Link href="/worker/earnings" className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <Coins className="w-8 h-8 text-amber-400 mb-4" />
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Earnings Wallet</h3>
                <p className="text-xs text-slate-400 mt-1">View completed transactions and withdraw funds to bank account.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Applications List */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" /> Active Job Applications ({applications.length})
            </h3>
            <Link href="/worker/jobs" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
              Find more Gigs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              You haven't submitted any job applications yet. Click "Browse Gigs" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any, idx: number) => {
                const statusColors: any = {
                  applied: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                  shortlisted: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                  accepted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
                  completed: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                };

                return (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{app.jobTitle}</h4>
                        <span className="text-[10px] text-slate-400">({app.jobCategory})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Hired by: {app.employerName}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span>Rate: ₹{app.jobRate}/{app.priceType === 'hourly' ? 'hr' : 'fix'}</span>
                        <span>•</span>
                        <span className="capitalize">Mode: {app.mode}</span>
                        {app.status === 'accepted' && (
                          <>
                            <span>•</span>
                            <span className="text-violet-400">Trial Period: {app.trialMinutes} mins</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                      {app.status === 'accepted' && (
                        <Link 
                          href="/worker/active-session"
                          className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          Check In <Play className="w-2.5 h-2.5 fill-current" />
                        </Link>
                      )}
                    </div>
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
