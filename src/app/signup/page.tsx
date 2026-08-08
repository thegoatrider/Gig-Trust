"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Briefcase, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-select role and prefill phone based on query parameters
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employer') {
      setRole('employer');
    } else if (roleParam === 'worker') {
      setRole('worker');
    }
    
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam.replace(/\D/g, "").slice(0, 10));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Automatically routes to onboarding wizards based on chosen role
      if (role === 'worker') {
        router.push("/worker/onboarding");
      } else {
        router.push("/employer/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center py-12 px-6 lg:px-8 relative font-sans text-gray-900">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block text-3xl font-extrabold font-outfit bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          GigTrust
        </Link>
        <h2 className="mt-6 text-2xl font-bold font-outfit text-gray-900">
          Create your Trust Profile
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold underline">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[28px] shadow-sm border border-gray-100">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-3">
                I want to register as a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                    role === 'worker'
                      ? 'bg-violet-50 border-violet-600 text-violet-950 font-bold'
                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <User className={`w-6 h-6 mb-2 ${role === 'worker' ? 'text-violet-600' : 'text-gray-400'}`} />
                  <span className="text-sm block">Gig Worker</span>
                  <span className="text-[10px] text-gray-400 mt-1">Get jobs & earn daily payouts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                    role === 'employer'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold'
                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${role === 'employer' ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className="text-sm block">Employer</span>
                  <span className="text-[10px] text-gray-400 mt-1">Hire verified professionals</span>
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm tracking-wide font-semibold"
                  placeholder="9999999999"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10 || !email.includes("@")}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Creating Account..." : "Create Account & Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 flex justify-center text-xs text-gray-500 text-center gap-1 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>By signing up, you agree to our safety regulations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-gray-500 text-sm">
        Syncing SignUp parameters...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

