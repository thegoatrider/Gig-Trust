"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Plus, AlertCircle, CheckCircle2, ShieldAlert, PlusCircle, Wallet, User } from "lucide-react";

export default function EmployerPostJob() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [rate, setRate] = useState("");
  const [priceType, setPriceType] = useState<'hourly' | 'fixed'>('hourly');
  const [mode, setMode] = useState<'online' | 'offline'>('offline');
  const [trialMinutes, setTrialMinutes] = useState("30");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description || !rate) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          rate: parseFloat(rate),
          priceType,
          mode,
          trialMinutes: parseInt(trialMinutes)
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create posting.");

      setSuccess("Job posted successfully! Escrow requirements will apply when hiring candidates.");
      
      // Redirect after brief pause
      setTimeout(() => router.push("/employer/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Electrical", "Plumbing", "Home Cleaning", "Data Entry", "Office Help", "Cooking", "Delivery", "Security Guard"];

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
            <h1 className="text-lg font-bold font-outfit text-gray-900">Post a Gig</h1>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-55 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-650" />
              <div>
                <strong className="font-bold block mb-1">Posting Blocked</strong>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-650" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Job Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  {categories.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price Format</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as any)}
                  className="w-full glass-input text-xs"
                >
                  <option value="hourly">Hourly Billing</option>
                  <option value="fixed">Fixed Budget</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AC Installation Assistant"
                className="w-full glass-input text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description & Scope</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detail the tasks, tools required..."
                className="w-full glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Rate */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full glass-input text-xs px-2"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Format</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full glass-input text-xs px-2"
                >
                  <option value="offline">On-site</option>
                  <option value="online">Remote</option>
                </select>
              </div>

              {/* Trial Minutes */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trial (Min)</label>
                <select
                  value={trialMinutes}
                  onChange={(e) => setTrialMinutes(e.target.value)}
                  className="w-full glass-input text-xs px-1"
                >
                  <option value="15">15 Min</option>
                  <option value="30">30 Min</option>
                  <option value="45">45 Min</option>
                  <option value="60">60 Min</option>
                </select>
              </div>
            </div>

            {/* Compliance Info Notice */}
            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-[9px] text-gray-500 space-y-1">
              <span className="font-bold text-violet-850 block">Marketplace Policies:</span>
              <p>1. Minimum wage limits apply per category (e.g. Clean: ₹100/hr).</p>
              <p>2. Prohibited keywords auto-block listings immediately.</p>
              <p>3. Ending a gig inside the Trial Window refunds 80% to employer.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-755 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs"
            >
              {loading ? "Verifying compliance..." : "Confirm & Post Job"}
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </main>

        {/* persistent navigation bar */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/employer/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-bold">Jobs</span>
          </Link>
          
          <Link href="/employer/post-job" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <PlusCircle className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Post</span>
          </Link>

          <Link href="/employer/active-sessions" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-bold">Wallet</span>
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
