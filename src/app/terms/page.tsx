import Link from "next/link";
import { Shield, AlertCircle, Clock, Heart, Award } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Link href="/" className="text-sm text-violet-400 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold font-outfit text-white mb-4">
            Platform Guidelines & Safety Protocols
          </h1>
          <p className="text-slate-400">
            Effective Date: July 27, 2026. Please read our trust policies carefully.
          </p>
        </div>

        <div className="space-y-12">
          {/* 1. Prohibited Services */}
          <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">1. Strict Prohibited Listings</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              GigTrust strictly enforces a zero-tolerance policy against listings associated with sexual services, body massages, or adult entertainment of any kind. 
            </p>
            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 leading-normal">
              <strong>Automatic Moderation Warning:</strong> Every listing is subject to real-time semantic analysis and image filtering. Accounts attempting to post prohibited categories will be permanently banned with zero balance refunds.
            </div>
          </section>

          {/* 2. Worker Reliability Strikes */}
          <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">2. Worker Reliability Strike System</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              To guarantee that employers receive reliable gig partners, we implement an automated strike system:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2 mb-4">
              <li><strong>No-Show Penalty:</strong> Failing to report to an accepted offline gig within 30 minutes of check-in time without sending a delay request results in 1 strike.</li>
              <li><strong>Delay Approvals:</strong> If you are running late, you must initiate the "Request More Time" in-app route. Delays must be approved by the employer to avoid penalties.</li>
              <li><strong>Suspension Limit:</strong> Accumulating 3 strikes within any 30-day period automatically locks the account, triggering manual admin reviews and badge revocations.</li>
            </ul>
          </section>

          {/* 3. Escrow Payments */}
          <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-violet-500">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold text-white">3. Escrow Hold & Commission</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              When an employer hires a worker, the agreed amount is immediately debited from the employer's preloaded wallet and placed in a secure Escrow holding vault.
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2 mb-4">
              <li>Funds are released only after worker completes the session and the employer approves check-out, OR automatically upon dispute resolution.</li>
              <li>A standard <strong>15% platform commission</strong> is deducted from the escrow balance prior to worker credit payout.</li>
              <li>Workers can withdraw verified credits immediately to any linked bank account via UPI or IMPS.</li>
            </ul>
          </section>

          {/* 4. Safety protocols */}
          <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">4. Core Workplace Safety & SOS</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              GigTrust requires active safety protocols to protect workers, especially for offline assignments:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2">
              <li><strong>SOS Integration:</strong> An active panic button is visible on every check-in screen. Clicking SOS broadcasts live GPS coordinates to listed emergency contacts and registers an immediate priority banner in the Admin Dashboard.</li>
              <li><strong>Geofenced Safety check:</strong> Attendance check-ins and check-outs are validated using GPS coordinate comparisons to prevent spoofing or unauthorized attendance proxies.</li>
              <li><strong>Face Checks:</strong> The system may trigger random mid-session selfie prompts to verify that the worker matches the ID document uploaded during onboarding.</li>
            </ul>
          </section>

          {/* 5. 8PM Safety Protocol Framing */}
          <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">5. Late Night Safety Protocol (Post 8 PM)</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              To minimize safety risks while maintaining equal access to earning opportunities, jobs scheduled or active past 8:00 PM for female workers are subject to mandatory digital safety guardrails:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2">
              <li><strong>Online-Only Option:</strong> Gig matches scheduled past 8 PM default to remote/online formats where possible to ensure physical security.</li>
              <li><strong>Active Tracking Shield:</strong> If physical work is selected, continuous background GPS location sharing, automated OTP check-ins, and trusted guardian alerts are enabled.</li>
              <li><em>Compliance Note: This safety protocol is framed as a protection safeguard rather than a blanket work ban. We advise regular review with your legal team to ensure compliance with local labor laws.</em></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>© 2026 GigTrust Inc. All rights reserved. Safety First.</p>
        </div>
      </div>
    </div>
  );
}
