"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mockOtp, setMockOtp] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP generation
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
      setStep(2);
    } catch (err) {
      setError("Failed to dispatch code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp !== mockOtp && otp !== "123456") {
      setError("Incorrect code. Please check the code printed in the alert banner.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "worker") {
        router.push("/worker/dashboard");
      } else if (role === "employer") {
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (num: string) => {
    setPhone(num);
    setStep(1);
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8 relative font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block text-3xl font-bold font-outfit bg-gradient-to-r from-violet-400 to-amber-300 bg-clip-text text-transparent">
          GigTrust
        </Link>
        <h2 className="mt-6 text-2xl font-bold font-outfit text-white">
          Access your secure portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{" "}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-semibold underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Verification Code Hint */}
          {step === 2 && mockOtp && (
            <div className="mb-6 p-4 bg-violet-950/40 border border-violet-500/30 rounded-xl text-center">
              <span className="text-xs text-violet-400 uppercase tracking-wider font-bold block mb-1">
                Demo Verification Code
              </span>
              <span className="text-3xl font-mono tracking-widest font-extrabold text-white">
                {mockOtp}
              </span>
              <p className="text-[10px] text-slate-400 mt-2">
                Use this generated OTP to bypass SMS validation in this demo version.
              </p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 glass-input text-white focus:outline-none focus:border-brand-500 text-sm tracking-widest font-medium"
                    placeholder="9999999999"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Requesting..." : "Send Verification Code"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 glass-input text-white focus:outline-none focus:border-brand-500 text-sm tracking-widest text-center font-bold"
                    placeholder="******"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Back to Phone number
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick-Fill Section for Demo testing */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-3 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-amber-500" /> Developer Quick-Fill Profiles
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("8888888888")}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs text-slate-300 flex justify-between items-center transition-colors"
              >
                <span>Worker Profile (Standard)</span>
                <span className="font-semibold text-violet-400">88888 88888</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("7777777777")}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs text-slate-300 flex justify-between items-center transition-colors"
              >
                <span>Employer Profile (Company)</span>
                <span className="font-semibold text-amber-400">77777 77777</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("9999999999")}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs text-slate-300 flex justify-between items-center transition-colors"
              >
                <span>Admin Profile (Full Control)</span>
                <span className="font-semibold text-red-400">99999 99999</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
