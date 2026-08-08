"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, Coins, Search, FileText, ArrowRight, ShieldCheck, 
  LogOut, Play, Clock, AlertTriangle, AlertCircle, Briefcase, User
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
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-3"></div>
        <span className="font-medium">Syncing Trust Profile...</span>
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

  const { user, profile, applications, activeSession } = data;

  // Compute Badge Color
  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'bg-amber-100 border-amber-200 text-amber-800';
    if (tier === 'silver') return 'bg-gray-100 border-gray-200 text-gray-800';
    return 'bg-orange-100 border-orange-200 text-orange-800';
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] sm:py-6 flex justify-center">
      {/* Phone Emulator wrapper */}
      <div className="w-full max-w-md bg-[#F6F7F9] min-h-screen sm:min-h-[850px] sm:max-h-[900px] sm:rounded-[40px] shadow-2xl border border-gray-200/80 flex flex-col relative overflow-hidden pb-20">
        
        {/* Top Notch simulation */}
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
          <Link href="/worker/dashboard" className="text-xl font-black font-outfit text-gray-900">
            GigTrust
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              href="/worker/earnings" 
              className="text-[10px] bg-white border border-gray-200/80 px-2.5 py-1.5 rounded-full font-bold text-gray-700 flex items-center gap-1"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" /> ₹{user.wallet_balance.toFixed(0)}
            </Link>
            <button 
              onClick={handleLogout}
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors border border-red-100"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          
          {/* Welcome Greet */}
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-gray-900 tracking-tight">
              Hi, {user.email ? user.email.split('@')[0] : 'Worker'}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Manage your gigs and check-ins
            </p>
          </div>

          {/* Active Session Highlight Banner */}
          {activeSession && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/20">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[9px] text-violet-200 font-bold uppercase tracking-wider block">Gig Session Running</span>
                  <h4 className="text-xs font-bold leading-tight truncate max-w-[150px]">{activeSession.jobTitle}</h4>
                </div>
              </div>
              <Link 
                href="/worker/active-session"
                className="bg-white text-violet-700 text-[10px] font-bold py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-sm shrink-0"
              >
                Open Clock <Play className="w-2.5 h-2.5 fill-current" />
              </Link>
            </div>
          )}

          {/* Profile Card & Trust Gauge */}
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Trust Network Score</span>
            
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#F3F4F6" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#8B5CF6" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * user.trust_score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-gray-900">{user.trust_score}</span>
                <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">/ 100</span>
              </div>
            </div>
            
            <div className={`mt-4 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(user.kyc_status)}`}>
              {user.kyc_status} Badge
            </div>
          </div>

          {/* Navigation panels quick-links */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/worker/jobs" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-violet-500/20 transition-all flex flex-col justify-between group">
              <Search className="w-6 h-6 text-violet-600 mb-3" />
              <div>
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">Browse Gigs</h3>
                <p className="text-[10px] text-gray-400 mt-1">Apply for verified local gigs</p>
              </div>
            </Link>

            <Link href="/worker/earnings" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-violet-500/20 transition-all flex flex-col justify-between group">
              <Coins className="w-6 h-6 text-amber-500 mb-3" />
              <div>
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-amber-500 transition-colors">Wallet Logs</h3>
                <p className="text-[10px] text-gray-400 mt-1">View earnings ledger</p>
              </div>
            </Link>
          </div>

          {/* Job Applications list */}
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-violet-600" /> My Applications ({applications.length})
              </h3>
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No job applications submitted yet. Tap "Browse Gigs" to apply.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any, idx: number) => {
                  const statusColors: any = {
                    applied: 'bg-blue-50 text-blue-600',
                    shortlisted: 'bg-purple-50 text-purple-600',
                    accepted: 'bg-[#E8F8F5] text-[#117A65]',
                    rejected: 'bg-red-50 text-red-600',
                    completed: 'bg-gray-100 text-gray-600'
                  };

                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100/50 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs truncate max-w-[150px]">{app.jobTitle}</h4>
                          <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{app.employerName}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500 pt-1.5 border-t border-gray-200/40">
                        <span>Rate: ₹{app.jobRate}/{app.priceType === 'hourly' ? 'hr' : 'fix'}</span>
                        {app.status === 'accepted' ? (
                          <Link 
                            href="/worker/active-session"
                            className="bg-violet-600 hover:bg-violet-700 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            Check In <Play className="w-2.5 h-2.5 fill-current" />
                          </Link>
                        ) : (
                          <span className="capitalize">{app.mode}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Persistent Nav bar for phone viewport */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/worker/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Briefcase className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Jobs</span>
          </Link>
          
          <Link href="/worker/jobs" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold">Browse</span>
          </Link>

          <Link href="/worker/earnings" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Coins className="w-5 h-5" />
            <span className="text-[10px] font-bold">Wallet</span>
          </Link>

          <Link href="/worker/onboarding" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

