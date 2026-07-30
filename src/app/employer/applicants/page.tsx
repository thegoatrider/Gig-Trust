"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert, Star, Check, X, AlertTriangle, RefreshCw } from "lucide-react";

export default function EmployerApplicants() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchApplicants = async () => {
    try {
      const res = await fetch("/api/employer/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleHireAction = async (appId: string, action: 'hire' | 'reject') => {
    setError("");
    setSuccess("");
    setActionLoadingId(appId);
    try {
      const res = await fetch("/api/employer/applicants/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, action })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess(action === 'hire' ? "Worker hired! Escrow deposit successfully locked." : "Candidate application rejected.");
      fetchApplicants(); // refresh
    } catch (e: any) {
      setError(e.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Syncing applicant listings...
      </div>
    );
  }

  const { applicants, user } = data;

  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    if (tier === 'silver') return 'border-slate-300 bg-slate-300/10 text-slate-300';
    return 'border-orange-500 bg-orange-500/10 text-orange-400';
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
            <h1 className="text-xl font-bold font-outfit text-white">Review Applicants</h1>
          </div>
          <button onClick={fetchApplicants} className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2 animate-slide-up">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <strong className="font-bold block mb-1">Hiring Error</strong>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        {applicants.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs rounded-2xl border border-white/5">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            No new applications to review. When workers apply, their trust profiles will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app: any, idx: number) => {
              const needsEscrow = app.jobRate;
              const hasBalance = user.wallet_balance >= needsEscrow;

              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {app.workerEmail.split('@')[0].toUpperCase()}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(app.workerKycStatus)}`}>
                        {app.workerKycStatus}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 leading-normal space-y-1">
                      <p>Applied for: <strong className="text-white">{app.jobTitle}</strong> ({app.jobCategory})</p>
                      <p>Proposed Pay: ₹{app.jobRate} ({app.priceType === 'hourly' ? 'Hourly' : 'Fixed'})</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.workerSkills.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="text-[9px] font-semibold bg-white/5 px-2.5 py-1 rounded-full text-slate-400">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch sm:items-end gap-3 w-full md:w-auto">
                    <div className="text-xs text-right">
                      {hasBalance ? (
                        <span className="text-[10px] text-slate-500">Escrow hold cover: Verified</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Insufficient funds (Needs ₹{needsEscrow})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleHireAction(app.id, 'reject')}
                        disabled={actionLoadingId === app.id}
                        className="py-2 px-4 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>

                      <button
                        onClick={() => handleHireAction(app.id, 'hire')}
                        disabled={actionLoadingId === app.id || !hasBalance}
                        className="py-2 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Approve & Hire
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
