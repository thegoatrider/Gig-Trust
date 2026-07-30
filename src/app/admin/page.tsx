"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, AlertTriangle, Scale, Coins, Award, 
  Trash2, ShieldAlert, ArrowLeft, RefreshCw, CheckCircle, Ban 
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes' | 'strikes' | 'analytics'>('verifications');
  const [users, setUsers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Issue Strike Form State
  const [strikeUserId, setStrikeUserId] = useState("");
  const [strikeReason, setStrikeReason] = useState("");

  const fetchData = async () => {
    setError("");
    setLoading(true);
    try {
      // 1. Fetch verifications users
      const resU = await fetch("/api/admin/verifications");
      const jsonU = await resU.json();
      if (!resU.ok) throw new Error(jsonU.error);
      setUsers(jsonU.users);

      // 2. Fetch disputes
      const resD = await fetch("/api/admin/disputes");
      const jsonD = await resD.json();
      if (!resD.ok) throw new Error(jsonD.error);
      setDisputes(jsonD.disputes);
    } catch (e: any) {
      setError(e.message || "Admin authorization failed. Make sure to login via the admin quick shortcut.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKycAction = async (userId: string, newStatus: 'gold' | 'silver' | 'rejected') => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuccess("KYC tier updated successfully.");
      fetchData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDisputeAction = async (disputeId: string, resolution: 'payout_worker' | 'refund_employer') => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeId, resolution })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuccess("Dispute resolved and escrow transferred.");
      fetchData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleIssueStrike = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!strikeUserId || !strikeReason) {
      setError("Please fill out both target user ID and strike reason.");
      return;
    }
    try {
      const res = await fetch("/api/admin/strikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: strikeUserId, reason: strikeReason })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuccess(`Strike registered successfully. Current strike count: ${json.totalStrikes}`);
      setStrikeUserId("");
      setStrikeReason("");
      fetchData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Verifying administrator credentials...
      </div>
    );
  }

  // Calculate quick analytic stats
  const totalCommissionEscrow = disputes.reduce((acc, d) => acc + (d.amount || 0), 0);
  const activeGigCount = users.filter(u => u.kyc_status === 'gold').length; // dummy mapping

  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold font-outfit text-white">Central Operations Deck</h1>
        </div>
        <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
          <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        {/* Tab Router Buttons */}
        <div className="grid grid-cols-4 gap-4 border-b border-white/5 pb-4">
          {[
            { id: 'verifications', label: 'KYC Verification Reviews', icon: ShieldCheck },
            { id: 'disputes', label: 'Escrow Disputes', icon: Scale },
            { id: 'strikes', label: 'Strikes & Bans', icon: Ban },
            { id: 'analytics', label: 'Analytics deck', icon: Coins }
          ].map((t, idx) => {
            const Icon = t.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3 rounded-xl text-xs font-semibold flex flex-col md:flex-row items-center justify-center gap-2 transition-all border ${
                  activeTab === t.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* 1. TABS: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">KYC Document Reviews</h3>
            <div className="space-y-4">
              {users.filter(u => u.role === 'worker' || u.role === 'employer').map((u, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">{u.email}</h4>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded capitalize">{u.role}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 space-y-1">
                      <p>KYC Tier: <strong className="text-white capitalize">{u.kyc_status}</strong> (Score: {u.trust_score})</p>
                      {u.profile && (
                        <p>ID type: {u.profile.id_doc_type || 'N/A'} (Verified: {u.profile.id_verified ? 'Yes' : 'No'})</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleKycAction(u.id, 'silver')}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold"
                    >
                      Approve Silver
                    </button>
                    <button
                      onClick={() => handleKycAction(u.id, 'gold')}
                      className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-bold"
                    >
                      Approve Gold (Background Check)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. TABS: DISPUTES */}
        {activeTab === 'disputes' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-outfit">Escrow Dispute Panel</h3>
            {disputes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No unresolved escrow disputes pending.
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d, idx) => (
                  <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                          Dispute Status: {d.status}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-2">Disputed Session: {d.session_id}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Raised by: {d.raisedByName}</p>
                      </div>
                      <span className="text-xl font-extrabold text-white">₹{d.amount || 'Escrow Locked'}</span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-white/5">
                      <strong>Filing Reason:</strong> "{d.reason}"
                    </div>

                    {d.status === 'open' && (
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleDisputeAction(d.id, 'refund_employer')}
                          className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold"
                        >
                          Refund 100% to Employer
                        </button>
                        <button
                          onClick={() => handleDisputeAction(d.id, 'payout_worker')}
                          className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-bold"
                        >
                          Release 100% to Worker Escrow
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. TABS: STRIKES */}
        {activeTab === 'strikes' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Issue Reliability Strikes</h3>
            
            <form onSubmit={handleIssueStrike} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target User ID (UUID)</label>
                <input 
                  type="text" 
                  value={strikeUserId}
                  onChange={(e) => setStrikeUserId(e.target.value)}
                  placeholder="Paste User UUID" 
                  className="w-full glass-input text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Penalty Reason</label>
                <input 
                  type="text" 
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  placeholder="e.g. Gig Late No-Show" 
                  className="w-full glass-input text-xs py-2"
                />
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Issue Penalty Strike
              </button>
            </form>

            <div className="pt-6 border-t border-white/5">
              <span className="text-xs text-slate-400 block mb-3">Guidelines:</span>
              <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-4">
                <li>Strikes deduct 15 points from their Trust Score automatically.</li>
                <li>Accumulating 3 strikes within 30 days locks the worker profile, preventing new gig acceptances.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 4. TABS: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial & System Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
                <Coins className="w-6 h-6 text-violet-400 mb-2" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Locked Escrow Pool</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">₹4,820.00</h4>
              </div>

              <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
                <Scale className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Platform Commissions</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">₹723.00</h4>
              </div>

              <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-amber-400 mb-2" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified Badges Issued</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">{users.length}</h4>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
