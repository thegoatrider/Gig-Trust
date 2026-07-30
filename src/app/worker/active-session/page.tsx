"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Clock, ShieldAlert, Camera, MapPin, CheckCircle2, 
  AlertTriangle, RefreshCw, Smartphone, QrCode 
} from "lucide-react";

export default function ActiveSession() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check-In fields
  const [checkInMethod, setCheckInMethod] = useState<'otp' | 'qr'>('otp');
  const [inputOtp, setInputOtp] = useState("");
  const [workerLat, setWorkerLat] = useState(12.9716);
  const [workerLng, setWorkerLng] = useState(77.5946);

  // Timer counter
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // UI status states
  const [selfieScore, setSelfieScore] = useState<number | null>(null);
  const [selfieStatus, setSelfieStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/worker/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Timer interval hook
  useEffect(() => {
    let interval: any;
    if (data?.activeSession && data.activeSession.timer_status === 'running') {
      const start = new Date(data.activeSession.check_in_time).getTime();
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - start) / 1000);
        setElapsedSeconds(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [data]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Find the accepted job application to check-in
    const targetApp = data.applications.find((a: any) => a.status === 'applied' || a.status === 'shortlisted' || a.status === 'accepted');
    if (!targetApp) {
      setError("No active pending hires to check in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/worker/session/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: targetApp.id,
          workerLat,
          workerLng,
          inputOtp
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess("Checked in successfully! Gig session started.");
      fetchSession();
    } catch (err: any) {
      setError(err.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieVerify = async () => {
    setError("");
    setSelfieStatus('verifying');
    try {
      const res = await fetch("/api/worker/session/selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: data.activeSession.id,
          selfieUrl: "/docs/attendance_selfie.jpg"
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSelfieScore(json.matchScore);
      setSelfieStatus('verified');
      setSuccess("Selfie verification verified! Face matched successfully.");
    } catch (e: any) {
      setSelfieStatus('failed');
      setError(e.message);
    }
  };

  const handleSOS = async () => {
    setError("");
    setSuccess("");
    if (!confirm("CRITICAL WARNING: This will immediately alert your listed guardians and ping safety dispatch servers with your coordinates. Continue?")) {
      return;
    }
    try {
      const res = await fetch("/api/worker/session/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: workerLat, lng: workerLng })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      alert("🚨 SOS Broadcast Completed! Emergency notification successfully sent to your guardians.");
      setSuccess(json.message);
    } catch (e: any) {
      setError(e.message || "Failed to alert guardians.");
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setSuccess("");
    if (!confirm("Are you sure you want to request check-out? This will stop the attendance timer.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/worker/session/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.activeSession.id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess(json.message);
      fetchSession();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Syncing active session...
      </div>
    );
  }

  const { activeSession, applications } = data;
  const pendingApp = applications.find((a: any) => a.status === 'applied' || a.status === 'shortlisted' || a.status === 'accepted');

  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/worker/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-white">Live Attendance Control</h1>
          </div>
          <button onClick={fetchSession} className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        {/* 1. CHECKED-IN SCREEN */}
        {activeSession ? (
          <div className="space-y-6 animate-fade-in">
            {/* Timer HUD */}
            <div className="glass-panel p-8 rounded-3xl text-center border-l-4 border-l-violet-500 space-y-4">
              <div className="text-xs text-violet-400 font-bold uppercase tracking-wider">Session Time Elapsed</div>
              <div className="text-6xl font-mono font-extrabold text-white tracking-widest">
                {formatTime(elapsedSeconds)}
              </div>
              <p className="text-xs text-slate-400">
                Job: <strong className="text-white">{activeSession.jobTitle}</strong>
              </p>
            </div>

            {/* Safety SOS Panic Button */}
            <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-950/5 text-center space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mb-2"></div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Active Safety Shield</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Pressing the SOS triggers immediate push alerts to platform admin servers and dispatches coordinates to your 3 guardians.
              </p>
              
              <button
                type="button"
                onClick={handleSOS}
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-extrabold text-xl shadow-lg shadow-red-500/25 border-4 border-red-950/40 mx-auto block active:scale-95 transition-all glow-pulse"
              >
                SOS
              </button>
            </div>

            {/* Selfie Verification Checks */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Attendance Verification Checks</h3>
              </div>
              <p className="text-xs text-slate-400">
                AI Face Match checks are triggered randomly during active tasks to prevent substitute workers.
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-white/5">
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Random Selfie Check-in</span>
                  <span className="text-[10px] text-slate-500">Status: {selfieStatus}</span>
                </div>

                {selfieStatus === 'verified' ? (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">
                    Score: {selfieScore}% Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={selfieStatus === 'verifying'}
                    onClick={handleSelfieVerify}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {selfieStatus === 'verifying' ? "Comparing..." : "Submit Photo check"}
                  </button>
                )}
              </div>
            </div>

            {/* Checkout control */}
            <button
              onClick={handleCheckOut}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl border border-white/5 shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              Stop session & Check Out
            </button>
          </div>
        ) : (
          /* 2. CHECK-IN SCREEN */
          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Check-in Verification Gating</h3>
              <p className="text-xs text-slate-400">Select your check-in code method. Requires physical geofence verification validation.</p>
            </div>

            {/* Check-In Tab buttons */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
              <button
                type="button"
                onClick={() => setCheckInMethod('otp')}
                className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  checkInMethod === 'otp'
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" /> OTP check-in code
              </button>
              <button
                type="button"
                onClick={() => setCheckInMethod('qr')}
                className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  checkInMethod === 'qr'
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" /> QR check-in token
              </button>
            </div>

            {checkInMethod === 'otp' ? (
              <form onSubmit={handleCheckIn} className="space-y-6">
                {/* OTP check-in Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Check-in OTP Code (Generated for hired application)
                  </label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-Digit OTP" 
                    className="w-full glass-input text-center text-xl font-bold tracking-widest"
                  />
                  {pendingApp && (
                    <div className="mt-2 text-center text-[10px] text-violet-400 bg-violet-950/40 p-2 border border-violet-500/20 rounded-lg">
                      Demo OTP Code: <strong className="text-white">{pendingApp.otp}</strong> (Provided in this sandbox)
                    </div>
                  )}
                </div>

                {/* GPS Coordinates coordinates check */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-400">
                    Verify Coordinate location check
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      step="any"
                      value={workerLat}
                      onChange={(e) => setWorkerLat(parseFloat(e.target.value))}
                      className="glass-input text-xs" 
                    />
                    <input 
                      type="number" 
                      step="any"
                      value={workerLng}
                      onChange={(e) => setWorkerLng(parseFloat(e.target.value))}
                      className="glass-input text-xs" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    We will calculate distance to check if you are within 200m of MG Road (12.9716, 77.5946).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                >
                  Verify check-in & Start clock timer
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Check-in QR Code Scanner</span>
                  <span className="text-[10px] text-slate-500 mt-1">Show this QR to the employer to check-in your session.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
