import Link from "next/link";
import { Coins, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Link href="/" className="text-sm text-violet-400 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold font-outfit text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400">
            No hidden costs. Built to sustain a verified, dispute-free marketplace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Worker Payout Card */}
          <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-violet-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-400 font-bold text-sm uppercase tracking-wider mb-4">
                <Coins className="w-4 h-4" /> For Workers
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">15% Commission</h2>
              <p className="text-slate-400 text-sm mb-6">
                Only deducted when a gig is completed and paid out. Setting up profiles and browsing gigs is 100% free.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Free profile listing & job alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Escrow locks protect against late payments
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Instant UPI withdrawals
                </li>
              </ul>
            </div>
            <Link 
              href="/signup?role=worker" 
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-center rounded-xl transition-all block text-sm"
            >
              Start Earning
            </Link>
          </div>

          {/* Employer Posting Card */}
          <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">
                <Coins className="w-4 h-4" /> For Employers
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">0% Posting Fee</h2>
              <p className="text-slate-400 text-sm mb-6">
                Post as many gigs as needed. You only pay the worker's agreed rate. No monthly subscription or hiring fees.
              </p>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Unlimited job listings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Preload wallet and lock escrow per gig
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> 100% refund on cancellations inside trial
                </li>
              </ul>
            </div>
            <Link 
              href="/signup?role=employer" 
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-center rounded-xl transition-all block text-sm"
            >
              Post Gigs Now
            </Link>
          </div>
        </div>

        {/* Deposit details */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Silver / Gold Tier Security Deposit</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Workers upgrading to the **Silver Badge** (DigiLocker verified + Face Match) are required to make a one-time security deposit of **₹500**. This deposit acts as a trust commitment.
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2">
            <li>Funds are locked securely in your wallet holding state.</li>
            <li>Fully refundable upon account closure if you have zero unresolved disputes, active tasks, or outstanding reliability strikes.</li>
            <li>Significantly increases your trust score rating, opening up premium and urgent gig bookings.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
