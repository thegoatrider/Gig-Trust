"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, MapPin, Tag, Briefcase, Filter, ArrowLeft, 
  Check, ArrowRight, ShieldCheck, AlertCircle, Coins, User, ShieldAlert 
} from "lucide-react";

export default function WorkerJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [minRate, setMinRate] = useState(0);

  // Application Success HUD
  const [appliedJobId, setAppliedJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setJobs(json.jobs);
    } catch (e: any) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setError("");
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAppliedJobId(jobId);
      setTimeout(() => setAppliedJobId(null), 3000);
      fetchJobs(); // refresh state
    } catch (e: any) {
      setError(e.message || "Could not apply.");
    }
  };

  const categories = ["All", "Electrical", "Plumbing", "Home Cleaning", "Data Entry", "Office Help", "Cooking", "Delivery", "Security Guard"];

  // Filter logic
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || 
                          j.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || j.category === category;
    const matchesMode = mode === "All" || j.mode === mode;
    const matchesRate = j.rate >= minRate;
    return matchesSearch && matchesCategory && matchesMode && matchesRate;
  });

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
            <h1 className="text-lg font-bold font-outfit text-gray-900">Available Gigs</h1>
          </div>
          <span className="text-xs text-gray-400 font-medium">Matched: {filteredJobs.length}</span>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* Quick Filters Area */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role or keywords..." 
                className="w-full glass-input text-xs pl-8 py-2.5 rounded-full"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" />
            </div>

            {/* Horizontal Categories Scroll */}
            <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-none -mx-5 px-5">
              {categories.map((c, idx) => {
                const isActive = category === c;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all border ${
                      isActive 
                        ? 'bg-violet-600 border-violet-600 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Formats Selector */}
            <div className="flex gap-2">
              {[
                { value: 'All', label: 'All formats' },
                { value: 'online', label: 'Remote Only' },
                { value: 'offline', label: 'On-site Only' }
              ].map((m, idx) => {
                const isActive = mode === m.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={`flex-1 py-1.5 border text-center text-[9px] font-bold rounded-xl transition-all ${
                      isActive 
                        ? 'bg-violet-50 border-violet-500 text-violet-750' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gigs List */}
          <div className="space-y-4 pt-2">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                Syncing available open gigs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white p-8 text-center text-gray-400 text-xs rounded-3xl border border-gray-100 shadow-sm">
                No open jobs match filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => {
                  const isApplied = appliedJobId === job.id;
                  
                  return (
                    <div key={job.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-violet-50 border border-violet-100 text-violet-700 text-[8px] font-bold uppercase tracking-wider">
                              {job.category}
                            </span>
                            <h3 className="font-extrabold text-gray-900 text-sm mt-1.5">{job.title}</h3>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-lg font-black text-[#EA580C]">₹{job.rate}</span>
                            <span className="text-[9px] text-gray-400 block lowercase -mt-0.5">
                              /{job.price_type === 'hourly' ? 'hour' : 'fixed'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-normal mt-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5 mt-3 text-[9px] text-gray-400 font-semibold">
                          <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3 text-gray-400" /> {job.mode === 'online' ? 'Remote' : 'On-Site'}</span>
                          <span>•</span>
                          <span>Trial: {job.trial_minutes} min</span>
                          <span>•</span>
                          <span className="text-emerald-600">Geofence OK</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-gray-50">
                        {isApplied ? (
                          <div 
                            className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Applied
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            className="bg-violet-600 hover:bg-violet-755 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                          >
                            Apply For Job <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* persistent navigation bar */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/worker/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-bold">Jobs</span>
          </Link>
          
          <Link href="/worker/jobs" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Search className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Browse</span>
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
