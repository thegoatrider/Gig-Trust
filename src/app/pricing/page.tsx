import Link from "next/link";
import { Coins, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Link href="/" className="text-sm font-bold text-violet-650 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black font-outfit text-gray-900 mb-3">
            Transparent Pricing
          </h1>
          <p className="text-gray-500 font-medium">
            No hidden costs. Built to sustain a verified, dispute-free marketplace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Worker Payout Card */}
          <div className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-t-4 border-t-violet-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-750 font-extrabold text-xs uppercase tracking-wider mb-4">
                <Coins className="w-4 h-4" /> For Workers
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">15% Commission</h2>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed font-semibold">
                Only deducted when a gig is completed and paid out. Setting up profiles and browsing gigs is 100% free.
              </p>
              <ul className="space-y-3 text-xs text-gray-700 mb-8 font-bold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Free profile listing & job alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Escrow locks protect against late payments
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Instant UPI withdrawals
                </li>
              </ul>
            </div>
            <Link 
              href="/signup?role=worker" 
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-center rounded-xl transition-all block text-xs shadow-sm"
            >
              Start Earning
            </Link>
          </div>

          {/* Employer Posting Card */}
          <div className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-t-4 border-t-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider mb-4">
                <Coins className="w-4 h-4" /> For Employers
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">0% Posting Fee</h2>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed font-semibold">
                Post as many gigs as needed. You only pay the worker's agreed rate. No monthly subscription or hiring fees.
              </p>
              <ul className="space-y-3 text-xs text-gray-700 mb-8 font-bold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Unlimited job listings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Preload wallet and lock escrow per gig
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> 100% refund on cancellations inside trial
                </li>
              </ul>
            </div>
            <Link 
              href="/signup?role=employer" 
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-center rounded-xl transition-all block text-xs shadow-sm"
            >
              Post Gigs Now
            </Link>
          </div>
        </div>

        {/* Deposit details */}
        <div className="bg-white p-7 rounded-[28px] border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-black text-gray-900">Silver / Gold Tier Security Deposit</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4 font-semibold">
            Workers upgrading to the **Silver Badge** (DigiLocker verified + Face Match) are required to make a one-time security deposit of **₹500**. This deposit acts as a trust commitment.
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2.5 font-bold">
            <li>Funds are locked securely in your wallet holding state.</li>
            <li>Fully refundable upon account closure if you have zero unresolved disputes, active tasks, or outstanding strikes.</li>
            <li>Significantly increases your trust score rating, opening up premium and urgent gig bookings.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
