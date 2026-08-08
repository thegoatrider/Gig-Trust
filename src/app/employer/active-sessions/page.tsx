"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, ShieldCheck, MapPin, CheckCircle, 
  XOctagon, AlertTriangle, RefreshCw, AlertCircle, ShieldAlert, Briefcase, PlusCircle, Wallet, User 
} from "lucide-react";

export default function EmployerActiveSessions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/employer/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to sync active sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleReleaseEscrow = async (sessionId: string) => {
    setError("");
    setSuccess("");
    setActionLoadingId(sessionId);
    try {
      const res = await fetch("/api/employer/session/release-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess("Checkout approved! Escrow payments released to worker's wallet.");
      fetchSessions();
    } catch (e: any) {
      setError(e.message || "Failed to release escrow.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTrialCutoff = async (sessionId: string) => {
    setError("");
    setSuccess("");
    if (!confirm("Are you sure you want to end this worker session inside the trial window? Worker will receive a 20% minimum pay coverage, and 80% is refunded to you.")) {
      return;
    }
    setActionLoadingId(sessionId);
    try {
      const res = await fetch("/api/employer/session/trial-cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess(json.message);
      fetchSessions();
    } catch (e: any) {
      setError(e.message || "Failed to trigger trial cutoff.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Syncing active tracking clocks...
      </div>
    );
  }

  const { activeSessions } = data;

  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    if (tier === 'silver') return 'border-slate-300 bg-slate-300/10 text-slate-300';
    return 'border-orange-500 bg-orange-500/10 text-orange-400';
  };

  // Helper to calculate trial time remaining
  const getTrialMinutesRemaining = (checkInTime: string, trialMinutes: number) => {
    const elapsed = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000);
    const remaining = trialMinutes - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] sm:py-6 flex justify-center text-gray-900">
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

        {/* Header */}
        <header className="sticky top-0 sm:top-7 z-40 bg-[#F6F7F9] border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold font-outfit text-gray-900">Tracking Clocks</h1>
          </div>
          <button onClick={fetchSessions} className="p-1.5 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-4 h-4 text-gray-500 hover:text-gray-900" />
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-55 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-650" />
              <div>
                <strong className="font-bold block mb-1">Alert Triggered</strong>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-650" /> {success}
            </div>
          )}

          {activeSessions.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-450 text-xs rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <Clock className="w-10 h-10 text-gray-350 mx-auto animate-pulse-slow" />
              <p>No active sessions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((ses: any, idx: number) => {
                const trialRem = getTrialMinutesRemaining(ses.check_in_time, ses.trialMinutes);
                const inTrial = trialRem > 0;
                const isCheckingOut = ses.timer_status === 'completed';

                return (
                  <div key={idx} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-5">
                    {/* Worker header */}
                    <div className="flex justify-between items-start gap-3 border-b border-gray-50 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-gray-900 text-sm">{ses.workerName.toUpperCase()}</h3>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getBadgeColor(ses.workerKycStatus)}`}>
                            {ses.workerKycStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Gig: <strong className="text-gray-900">{ses.jobTitle}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-gray-450 uppercase tracking-wider block font-bold mb-0.5">Status</span>
                        <span className={`text-xs font-bold ${isCheckingOut ? 'text-[#EA580C]' : 'text-violet-600'}`}>
                          {isCheckingOut ? 'Checkout Ready' : 'Timer Running'}
                        </span>
                      </div>
                    </div>

                    {/* Tracking parameters */}
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      {/* Geofence status */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-[8px] text-gray-400 block uppercase tracking-wider mb-0.5">Geofence Check</span>
                        {ses.geofence_ok ? (
                          <span className="text-emerald-650 font-bold">✓ Geofence Safe</span>
                        ) : (
                          <span className="text-red-650 font-bold">🚨 Out of Bounds</span>
                        )}
                      </div>

                      {/* Clocked check-in time */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-[8px] text-gray-400 block uppercase tracking-wider mb-0.5">Check-in Clock</span>
                        <span className="text-gray-700 font-bold">
                          {new Date(ses.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Trial status */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 col-span-2">
                        <span className="text-[8px] text-gray-400 block uppercase tracking-wider mb-0.5">Trial Window</span>
                        {inTrial ? (
                          <span className="text-[#EA580C] font-bold flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> {trialRem} mins remaining
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">Trial Expired (Full Escrow Cover active)</span>
                        )}
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-50">
                      <div className="text-[9px] text-gray-450 leading-relaxed">
                        {inTrial 
                          ? "Ending session now triggers trial cutoff (pays 20% minimum coverage)." 
                          : "Full escrow amount of ₹" + ses.jobRate + " is locked and due for release."
                        }
                      </div>

                      <div className="flex items-center gap-2">
                        {inTrial && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ses.id}
                            onClick={() => handleTrialCutoff(ses.id)}
                            className="flex-1 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-750 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <XOctagon className="w-3.5 h-3.5" /> Trial Cutoff
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={actionLoadingId === ses.id}
                          onClick={() => handleReleaseEscrow(ses.id)}
                          className="flex-1 py-2 bg-violet-600 hover:bg-violet-755 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 rounded-xl shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Release Escrow
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* persistent navigation bar */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/employer/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-bold">Jobs</span>
          </Link>
          
          <Link href="/employer/post-job" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Post</span>
          </Link>

          <Link href="/employer/active-sessions" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Wallet className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Wallet</span>
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
