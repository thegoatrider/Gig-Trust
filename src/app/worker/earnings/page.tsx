"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Send, AlertCircle, CheckCircle2, ChevronRight, ArrowRight 
} from "lucide-react";

export default function WorkerEarnings() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Withdrawal Form
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/worker/earnings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBalance(json.walletBalance);
      setTransactions(json.transactions);
    } catch (e: any) {
      setError(e.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amt = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(amt) || amt <= 0) {
      setError("Please input a valid positive amount to withdraw.");
      return;
    }
    if (amt > balance) {
      setError("Insufficient wallet balance.");
      return;
    }
    if (!upiId || !upiId.includes("@")) {
      setError("Please input a valid UPI ID (e.g. name@okhdfcbank).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/worker/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, upiId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccess(`Withdrawal of ₹${amt} requested successfully! Sent to UPI: ${upiId}`);
      setWithdrawAmount("");
      fetchEarnings(); // refresh
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/worker/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-white">Earnings Wallet</h1>
          </div>
          <span className="text-xs text-slate-400">Withdrawals verified instantly</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 grid md:grid-cols-3 gap-8">
        {/* Left Side: Balance & Withdrawal Form */}
        <div className="md:col-span-1 space-y-6">
          {/* Balance card */}
          <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-amber-500 space-y-4">
            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Available Balance</div>
            <div className="text-4xl font-extrabold text-white flex items-baseline gap-1">
              ₹{balance.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Accumulated earnings from completed job escrows, minus standard fees.
            </p>
          </div>

          {/* Withdrawal drawer/form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-violet-400" /> UPI / Bank Payout
            </h3>

            {success && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-400 rounded-lg flex items-center gap-1.5 leading-normal">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 500" 
                  className="w-full glass-input text-xs" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  UPI ID (VPA)
                </label>
                <input 
                  type="text" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi" 
                  className="w-full glass-input text-xs tracking-wider" 
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !balance}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? "Processing Payout..." : "Request Instant Withdrawal"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Transactions History */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading ledger data...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No wallet activity logged. Complete your first gig to generate ledger items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500">
                    <th className="pb-3 font-semibold">Reference ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx, idx) => {
                    const isCredit = tx.type === 'credit' || tx.type === 'release';
                    const isHold = tx.type === 'hold';
                    
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-[10px] text-slate-400">{tx.ref_id}</td>
                        <td className="py-4 font-semibold capitalize">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isCredit 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : isHold 
                              ? 'bg-violet-500/10 text-violet-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-4 font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </td>
                        <td className="py-4 text-[10px] text-slate-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
