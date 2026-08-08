"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Clock, ShieldAlert, Camera, MapPin, CheckCircle2, 
  AlertTriangle, RefreshCw, Smartphone, QrCode, Briefcase, Search, Coins, User 
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
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-gray-500 text-sm font-semibold">
        Syncing active session...
      </div>
    );
  }

  const { activeSession, applications } = data;
  const pendingApp = applications.find((a: any) => a.status === 'applied' || a.status === 'shortlisted' || a.status === 'accepted');

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
            <Link href="/worker/dashboard" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold font-outfit text-gray-900">Attendance Clock</h1>
          </div>
          <button onClick={fetchSession} className="p-1.5 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-4 h-4 text-gray-500 hover:text-gray-900" />
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-650" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {success}
            </div>
          )}

          {/* 1. CHECKED-IN SCREEN */}
          {activeSession ? (
            <div className="space-y-5 animate-fade-in">
              {/* Timer HUD */}
              <div className="bg-white p-6 rounded-[28px] text-center border-l-4 border-l-violet-500 shadow-sm space-y-3">
                <div className="text-[10px] text-violet-650 font-bold uppercase tracking-wider">Session Time Elapsed</div>
                <div className="text-5xl font-mono font-black text-gray-900 tracking-wider">
                  {formatTime(elapsedSeconds)}
                </div>
                <p className="text-xs text-gray-500">
                  Gig: <strong className="text-gray-900">{activeSession.jobTitle}</strong>
                </p>
              </div>

              {/* Safety SOS Panic Button */}
              <div className="bg-red-50 p-6 rounded-[28px] border border-red-200 text-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping mb-1.5"></div>
                  <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Active Safety Shield</h3>
                </div>
                <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-normal">
                  SOS triggers push alerts to safety servers and dispatches coordinate logs to listed guardians.
                </p>
                
                <button
                  type="button"
                  onClick={handleSOS}
                  className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-lg border-4 border-white shadow-md mx-auto block active:scale-95 transition-all animate-pulse"
                >
                  SOS
                </button>
              </div>

              {/* Selfie Verification Checks */}
              <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-violet-600" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Selfie Verification Checks</h3>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Face Match checks are triggered randomly during active tasks to prevent proxy workers.
                </p>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 gap-2">
                  <div>
                    <span className="text-xs text-gray-700 font-bold block">Random Selfie Check</span>
                    <span className="text-[9px] text-gray-400 font-semibold block capitalize mt-0.5">Status: {selfieStatus}</span>
                  </div>

                  {selfieStatus === 'verified' ? (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold">
                      {selfieScore}% Face Matched
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={selfieStatus === 'verifying'}
                      onClick={handleSelfieVerify}
                      className="bg-violet-600 hover:bg-violet-755 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {selfieStatus === 'verifying' ? "Verifying..." : "Verify Face"}
                    </button>
                  )}
                </div>
              </div>

              {/* Checkout control */}
              <button
                onClick={handleCheckOut}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 text-xs transition-colors"
              >
                Stop session & Check Out
              </button>
            </div>
          ) : (
            /* 2. CHECK-IN SCREEN */
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Check-in Gating</h3>
                <p className="text-xs text-gray-500 leading-normal">Select verification method. Physical geofence limits check-in bounds.</p>
              </div>

              {/* Check-In Tab buttons */}
              <div className="grid grid-cols-2 gap-3 border-b border-gray-50 pb-3">
                <button
                  type="button"
                  onClick={() => setCheckInMethod('otp')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    checkInMethod === 'otp'
                      ? 'bg-violet-50 text-violet-700 border border-violet-300'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Enter OTP code
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInMethod('qr')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    checkInMethod === 'qr'
                      ? 'bg-violet-50 text-violet-700 border border-violet-300'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Show QR code
                </button>
              </div>

              {checkInMethod === 'otp' ? (
                <form onSubmit={handleCheckIn} className="space-y-5">
                  {/* OTP check-in Code */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Check-in OTP Code (From Employer)
                    </label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 4-Digit OTP" 
                      className="w-full glass-input text-center text-xl font-black tracking-widest py-2"
                    />
                    {pendingApp && (
                      <div className="mt-2 text-center text-[10px] text-violet-750 bg-violet-50 p-2 border border-violet-100 rounded-xl font-bold">
                        Demo OTP Code: <strong className="text-violet-900">{pendingApp.otp}</strong>
                      </div>
                    )}
                  </div>

                  {/* GPS Coordinates check */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Coordinates verification
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        step="any"
                        value={workerLat}
                        onChange={(e) => setWorkerLat(parseFloat(e.target.value))}
                        className="glass-input text-xs bg-gray-50" 
                      />
                      <input 
                        type="number" 
                        step="any"
                        value={workerLng}
                        onChange={(e) => setWorkerLng(parseFloat(e.target.value))}
                        className="glass-input text-xs bg-gray-50" 
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">
                      Distance restriction: Must be within 200m of MG Road location (12.9716, 77.5946).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-755 text-white font-bold py-3 rounded-xl shadow-sm transition-all text-xs"
                  >
                    Verify & Check In
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-36 h-36 bg-gray-50 p-3 rounded-2xl mx-auto flex items-center justify-center border border-gray-150 shadow-sm">
                    <QrCode className="w-full h-full text-gray-900" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-800 font-bold block">Check-in QR Scanner</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Show this QR to the employer to check-in your session.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* persistent navigation bar */}
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
