"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, MapPin, Tag, Briefcase, Filter, ArrowLeft, 
  Check, ArrowRight, ShieldCheck, AlertCircle 
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
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/worker/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-white">Find Available Gigs</h1>
          </div>
          <span className="text-xs text-slate-400">Total matched: {filteredJobs.length}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 grid md:grid-cols-4 gap-8">
        {/* Filters Panel sidebar */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl h-fit border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-violet-400" /> Filters
          </h3>

          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">Search Keywords</label>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Electrician, Typist" 
                className="w-full glass-input text-xs pl-8 py-2"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input text-xs py-2"
            >
              {categories.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">Format</label>
            <select 
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full glass-input text-xs py-2"
            >
              <option value="All">All formats</option>
              <option value="online">Online / Remote</option>
              <option value="offline">Offline / Physical</option>
            </select>
          </div>

          {/* Min Rate */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">Minimum Rate (₹{minRate})</label>
            <input 
              type="range" 
              min={0} 
              max={1000} 
              step={50}
              value={minRate}
              onChange={(e) => setMinRate(parseInt(e.target.value))}
              className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>₹1000+</span>
            </div>
          </div>
        </div>

        {/* Gigs List section */}
        <div className="md:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              Fetching available open gigs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              No matching open jobs found. Adjust your filters to expand the search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const isApplied = appliedJobId === job.id;
                
                return (
                  <div key={job.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                            {job.category}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-2">{job.title}</h3>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-white">₹{job.rate}</span>
                          <span className="text-[10px] text-slate-400 block lowercase">
                            /{job.price_type === 'hourly' ? 'hour' : 'fixed'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mt-4">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-6 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.mode === 'online' ? 'Remote (Online)' : 'On-Site (Offline)'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Trial: {job.trial_minutes} min cutoff</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Geofence Verified</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      {isApplied ? (
                        <button 
                          disabled
                          className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Applied Successfully
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-violet-500/10"
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
    </div>
  );
}
