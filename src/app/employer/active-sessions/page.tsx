"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, ShieldCheck, MapPin, CheckCircle, 
  XOctagon, AlertTriangle, RefreshCw, AlertCircle, ShieldAlert 
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
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-white">Live Tracking Clocks</h1>
          </div>
          <button onClick={fetchSessions} className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2.5 animate-slide-up">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <strong className="font-bold block mb-1">Alert Triggered</strong>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        {activeSessions.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs rounded-2xl border border-white/5">
            <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse-slow" />
            No running worker clocks detected. Once hired workers check-in using OTP/QR, they will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {activeSessions.map((ses: any, idx: number) => {
              const trialRem = getTrialMinutesRemaining(ses.check_in_time, ses.trialMinutes);
              const inTrial = trialRem > 0;
              const isCheckingOut = ses.timer_status === 'completed';

              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                  {/* Worker header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-white text-base">{ses.workerName.toUpperCase()}</h3>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(ses.workerKycStatus)}`}>
                          {ses.workerKycStatus}
                        </span>
                        <span className="text-[10px] text-slate-400">Score: {ses.workerTrustScore}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Active Job: <strong className="text-white">{ses.jobTitle}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Stopwatch Clock</span>
                      <span className="text-xl font-mono font-bold text-white">
                        {isCheckingOut ? 'Checkout Requested' : 'Timer Running'}
                      </span>
                    </div>
                  </div>

                  {/* Tracking parameters */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {/* Geofence status */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">Geofence Check</span>
                      {ses.geofence_ok ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Geofence OK (Within 200m)</span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">🚨 Out of Bounds</span>
                      )}
                    </div>

                    {/* Clocked check-in time */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">Check-in Time</span>
                      <span className="text-slate-300 font-semibold">
                        {new Date(ses.check_in_time).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Trial status */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">Trial Period Status</span>
                      {inTrial ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> {trialRem} mins remaining
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold">Trial Expired (Full Escrow due)</span>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-400 max-w-md">
                      {inTrial 
                        ? "Ending session now triggers the trial cutoff policy (pays 20% minimum rate)." 
                        : "Full escrow amount of ₹" + ses.jobRate + " is locked and due for release upon completion."
                      }
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      {inTrial && (
                        <button
                          type="button"
                          disabled={actionLoadingId === ses.id}
                          onClick={() => handleTrialCutoff(ses.id)}
                          className="py-2 px-4 rounded-xl border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <XOctagon className="w-4 h-4" /> End Session (Trial Cutoff)
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoadingId === ses.id}
                        onClick={() => handleReleaseEscrow(ses.id)}
                        className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 shadow-lg shadow-amber-500/10"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Release Payout
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
