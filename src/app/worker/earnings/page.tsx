"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Send, AlertCircle, CheckCircle2, ChevronRight, ArrowRight, Briefcase, Search, User 
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
            <h1 className="text-lg font-bold font-outfit text-gray-900">Earnings Wallet</h1>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-650" /> {error}
            </div>
          )}

          {/* Balance card */}
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-2 border-t-4 border-t-amber-500">
            <div className="text-gray-400 text-[10px] uppercase tracking-wider font-extrabold">Available Balance</div>
            <div className="text-3xl font-black text-gray-900">
              ₹{balance.toFixed(2)}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Accumulated earnings from completed job escrows.
            </p>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-violet-600" /> UPI / Bank Payout
            </h3>

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-[10px] text-emerald-705 rounded-xl flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {success}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
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
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
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
                className="w-full bg-violet-600 hover:bg-violet-755 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {submitting ? "Processing Payout..." : "Request Payout"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Transactions Ledger List */}
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Transaction Ledger</h3>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600 mx-auto mb-2"></div>
                Loading ledger data...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No activity logged. Complete a gig to receive earnings.
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto pr-1">
                {transactions.map((tx, idx) => {
                  const isCredit = tx.type === 'credit' || tx.type === 'release';
                  const isHold = tx.type === 'hold';
                  
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isCredit 
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-805' 
                              : isHold 
                              ? 'bg-violet-50 border border-violet-200 text-violet-805' 
                              : 'bg-red-50 border border-red-200 text-red-805'
                          }`}>
                            {tx.type}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400">{tx.ref_id.substring(0, 10)}...</span>
                        </div>
                        <span className="text-[9px] text-gray-450 block mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className={`font-black text-xs ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
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
          
          <Link href="/worker/jobs" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold">Browse</span>
          </Link>

          <Link href="/worker/earnings" className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-900">
            <Coins className="w-5 h-5 text-gray-900" />
            <span className="text-[10px] font-extrabold">Wallet</span>
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
