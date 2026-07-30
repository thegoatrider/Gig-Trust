"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Plus, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-white">Create New Gig Posting</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <strong className="font-bold block mb-1">Posting Blocked</strong>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Job Category</label>
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">Price Format</label>
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC Installation Assistant Needed"
              className="w-full glass-input text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Job Description & Scope</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detail the tasks, tools required, and physical location description..."
              className="w-full glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Proposed Rate (₹)</label>
              <input
                type="number"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 200"
                className="w-full glass-input text-xs"
              />
            </div>

            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Format Format</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full glass-input text-xs"
              >
                <option value="offline">Physical (On-site)</option>
                <option value="online">Remote (Online)</option>
              </select>
            </div>

            {/* Trial Minutes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trial Cutoff (Min)</label>
              <select
                value={trialMinutes}
                onChange={(e) => setTrialMinutes(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Compliance & Pay info notice */}
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/10 text-[10px] text-slate-400 space-y-1">
            <span className="font-bold text-violet-300 block">Structural Marketplace Policies:</span>
            <p>1. Minimum pay rates are enforced per category (e.g. Electrical: ₹150/hr, Cleaning: ₹100/hr).</p>
            <p>2. Prohibited keywords (sexual massage, adult services) trigger automatic listing blocks.</p>
            <p>3. Ending a gig inside the Trial Window pays the worker for active minutes only (20% minimum).</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            {loading ? "Verifying compliance..." : "Confirm & Post Job Listing"}
            <Plus className="w-4 h-4 text-slate-900" />
          </button>
        </form>
      </main>
    </div>
  );
}
