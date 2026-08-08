"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert, Star, Check, X, AlertTriangle, RefreshCw, Briefcase, PlusCircle, Wallet, User } from "lucide-react";

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
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-gray-500 text-sm font-semibold">
        Syncing applicant listings...
      </div>
    );
  }

  const { applicants, user } = data;

  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'border-amber-400 bg-amber-50 text-amber-800 font-extrabold';
    if (tier === 'silver') return 'border-slate-300 bg-slate-100 text-slate-700 font-extrabold';
    return 'border-orange-200 bg-orange-50 text-orange-850 font-extrabold';
  };

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
            <h1 className="text-lg font-bold font-outfit text-gray-900">Applicants</h1>
          </div>
          <button onClick={fetchApplicants} className="p-1.5 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-4 h-4 text-gray-500 hover:text-gray-900" />
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">Hiring Error</strong>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-750 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-650" /> {success}
            </div>
          )}

          {applicants.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-450 text-xs rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p>No new applications to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app: any, idx: number) => {
                const needsEscrow = app.jobRate;
                const hasBalance = user.wallet_balance >= needsEscrow;

                return (
                  <div key={idx} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-gray-900 text-sm">
                            {app.workerEmail.split('@')[0].toUpperCase()}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getBadgeColor(app.workerKycStatus)}`}>
                            {app.workerKycStatus}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-650 flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.8
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 leading-normal space-y-1">
                        <p>For job: <strong className="text-gray-900">{app.jobTitle}</strong></p>
                        <p>Pay rate: <strong className="text-[#EA580C]">₹{app.jobRate}</strong> ({app.priceType === 'hourly' ? 'Hourly' : 'Fixed'})</p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {app.workerSkills.map((sk: string, sIdx: number) => (
                          <span key={sIdx} className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-650">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-50">
                      <div className="text-[10px] text-left">
                        {hasBalance ? (
                          <span className="text-emerald-600 font-bold">✓ Escrow cover verified</span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Insufficient balance (Needs ₹{needsEscrow})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleHireAction(app.id, 'reject')}
                          disabled={actionLoadingId === app.id}
                          className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleHireAction(app.id, 'hire')}
                          disabled={actionLoadingId === app.id || !hasBalance}
                          className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          Hire Candidate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* persistent navigation bar */}
        <nav className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <Link href="/employer/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Briefcase className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Jobs</span>
          </Link>
          
          <Link href="/employer/post-job" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Post</span>
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
