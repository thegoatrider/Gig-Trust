"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, ArrowRight, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignupLink, setShowSignupLink] = useState(false);
  const [mockOtp, setMockOtp] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSignupLink(false);
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
    setShowSignupLink(false);
    if (otp !== mockOtp && otp !== "123456") {
      setError("Incorrect verification code. Please check the code printed in the banner.");
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
        if (res.status === 404) {
          setShowSignupLink(true);
        }
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
    setShowSignupLink(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center py-12 px-6 lg:px-8 relative font-sans text-gray-900">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block text-3xl font-extrabold font-outfit bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          GigTrust
        </Link>
        <h2 className="mt-6 text-2xl font-bold font-outfit text-gray-900">
          Access your secure portal
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Or{" "}
          <Link href={`/signup?role=worker${phone ? `&phone=${phone}` : ""}`} className="text-violet-600 hover:text-violet-700 font-semibold underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[28px] shadow-sm border border-gray-100">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Authentication Alert</span>
              </div>
              <p>{error}</p>
              {showSignupLink && (
                <Link 
                  href={`/signup?role=worker&phone=${phone}`}
                  className="mt-1 self-start bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition-colors"
                >
                  Register Now
                </Link>
              )}
            </div>
          )}

          {/* Verification Code Hint */}
          {step === 2 && mockOtp && (
            <div className="mb-6 p-5 bg-violet-50 border border-violet-100 rounded-2xl text-center">
              <span className="text-[10px] text-violet-600 uppercase tracking-wider font-extrabold block mb-1">
                Demo Verification Code
              </span>
              <span className="text-3xl font-mono tracking-widest font-black text-violet-900">
                {mockOtp}
              </span>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Use this generated OTP to bypass SMS validation in this demo version.
              </p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setError("");
                      setShowSignupLink(false);
                    }}
                    className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm tracking-widest font-semibold"
                    placeholder="9999999999"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Requesting..." : "Send Verification Code"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm tracking-widest text-center font-bold"
                    placeholder="******"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                  Back to Phone number
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick-Fill Section for Demo testing */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" /> Developer Quick-Fill Profiles
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("8888888888")}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/50 text-left text-xs text-gray-700 flex justify-between items-center transition-colors font-medium"
              >
                <span>Worker Profile (Standard)</span>
                <span className="font-bold text-violet-600">88888 88888</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("7777777777")}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/50 text-left text-xs text-gray-700 flex justify-between items-center transition-colors font-medium"
              >
                <span>Employer Profile (Company)</span>
                <span className="font-bold text-amber-600">77777 77777</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("9999999999")}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/50 text-left text-xs text-gray-700 flex justify-between items-center transition-colors font-medium"
              >
                <span>Admin Profile (Full Control)</span>
                <span className="font-bold text-red-600">99999 99999</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

