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
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-gray-500 text-sm font-semibold">
        Verifying administrator credentials...
      </div>
    );
  }

  // Calculate quick analytic stats
  const totalCommissionEscrow = disputes.reduce((acc, d) => acc + (d.amount || 0), 0);
  const activeGigCount = users.filter(u => u.kyc_status === 'gold').length; // dummy mapping

  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] font-sans pb-16">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-black font-outfit text-gray-900">Central Operations Deck</h1>
        </div>
        <button onClick={fetchData} className="p-1.5 hover:bg-gray-100 rounded-full">
          <RefreshCw className="w-4 h-4 text-gray-500 hover:text-gray-900" />
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-650" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl text-xs text-emerald-700 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Tab Router Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-200 pb-4">
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
                className={`py-3 rounded-2xl text-xs font-bold flex flex-col md:flex-row items-center justify-center gap-2 transition-all border ${
                  activeTab === t.id
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* 1. TABS: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">KYC Document Reviews</h3>
            <div className="space-y-4">
              {users.filter(u => u.role === 'worker' || u.role === 'employer').map((u, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-xs">{u.email}</h4>
                      <span className="text-[9px] bg-gray-200 text-gray-650 px-2 py-0.5 rounded capitalize font-bold">{u.role}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 space-y-1 font-semibold">
                      <p>KYC Tier: <strong className="text-gray-850 capitalize">{u.kyc_status}</strong> (Score: {u.trust_score})</p>
                      {u.profile && (
                        <p>ID type: {u.profile.id_doc_type || 'N/A'} (Verified: {u.profile.id_verified ? 'Yes' : 'No'})</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleKycAction(u.id, 'silver')}
                      className="py-1.5 px-3 bg-gray-850 hover:bg-gray-900 text-white rounded-lg text-[10px] font-bold shadow-sm"
                    >
                      Approve Silver
                    </button>
                    <button
                      onClick={() => handleKycAction(u.id, 'gold')}
                      className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-lg text-[10px] font-bold shadow-sm"
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
          <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-outfit">Escrow Dispute Panel</h3>
            {disputes.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                No unresolved escrow disputes pending.
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 border border-gray-150 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between border-b border-gray-200/80 pb-3">
                      <div>
                        <span className="text-[9px] bg-red-550/10 text-red-700 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Dispute Status: {d.status}
                        </span>
                        <h4 className="font-extrabold text-gray-900 text-xs mt-2">Disputed Session: {d.session_id}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Raised by: {d.raisedByName}</p>
                      </div>
                      <span className="text-base font-black text-gray-900">₹{d.amount || 'Escrow Locked'}</span>
                    </div>

                    <div className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-200 font-semibold">
                      <strong>Filing Reason:</strong> "{d.reason}"
                    </div>

                    {d.status === 'open' && (
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleDisputeAction(d.id, 'refund_employer')}
                          className="py-1.5 px-4 bg-gray-805 hover:bg-gray-900 text-white rounded-lg text-[10px] font-bold"
                        >
                          Refund 100% to Employer
                        </button>
                        <button
                          onClick={() => handleDisputeAction(d.id, 'payout_worker')}
                          className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-lg text-[10px] font-bold"
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
          <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Issue Reliability Strikes</h3>
            
            <form onSubmit={handleIssueStrike} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Target User ID (UUID)</label>
                <input 
                  type="text" 
                  value={strikeUserId}
                  onChange={(e) => setStrikeUserId(e.target.value)}
                  placeholder="Paste User UUID" 
                  className="w-full glass-input text-xs py-2 bg-gray-50 border-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Penalty Reason</label>
                <input 
                  type="text" 
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  placeholder="e.g. Gig Late No-Show" 
                  className="w-full glass-input text-xs py-2 bg-gray-50 border-gray-200"
                />
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Issue Penalty Strike
              </button>
            </form>

            <div className="pt-6 border-t border-gray-200">
              <span className="text-xs text-gray-700 block mb-3 font-bold">Guidelines:</span>
              <ul className="text-[10px] text-gray-500 space-y-1.5 list-disc pl-4 font-semibold">
                <li>Strikes deduct 15 points from their Trust Score automatically.</li>
                <li>Accumulating 3 strikes within 30 days locks the worker profile, preventing new gig acceptances.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 4. TABS: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Financial & System Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-gray-50 border border-gray-150 rounded-2xl">
                <Coins className="w-6 h-6 text-violet-650 mb-2" />
                <span className="text-[9px] text-gray-450 uppercase tracking-wider font-extrabold">Locked Escrow Pool</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1">₹4,820.00</h4>
              </div>

              <div className="p-5 bg-gray-50 border border-gray-150 rounded-2xl">
                <Scale className="w-6 h-6 text-emerald-650 mb-2" />
                <span className="text-[9px] text-gray-450 uppercase tracking-wider font-extrabold">Platform Commissions</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1">₹723.00</h4>
              </div>

              <div className="p-5 bg-gray-50 border border-gray-150 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-amber-600 mb-2" />
                <span className="text-[9px] text-gray-450 uppercase tracking-wider font-extrabold">Verified Badges Issued</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1">{users.length}</h4>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
