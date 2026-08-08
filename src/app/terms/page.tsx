import Link from "next/link";
import { Shield, AlertCircle, Clock, Heart, Award } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Link href="/" className="text-sm font-bold text-violet-650 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black font-outfit text-gray-900 mb-3">
            Safety & Terms
          </h1>
          <p className="text-gray-500 font-medium">
            Effective Date: July 27, 2026. Please read our trust policies carefully.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Prohibited Services */}
          <section className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-650" />
              <h2 className="text-lg font-black text-gray-900">1. Strict Prohibited Listings</h2>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4 font-semibold">
              GigTrust strictly enforces a zero-tolerance policy against listings associated with sexual services, body massages, or adult entertainment of any kind. 
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-750 font-bold leading-normal">
              <strong>Automatic Moderation Warning:</strong> Every listing is subject to real-time semantic analysis. Accounts attempting to post prohibited categories will be permanently banned with zero refunds.
            </div>
          </section>

          {/* 2. Worker Reliability Strikes */}
          <section className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-black text-gray-900">2. Reliability Strike System</h2>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4 font-semibold">
              To guarantee that employers receive reliable gig partners, we implement an automated strike system:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2.5 font-bold mb-4">
              <li><strong>No-Show Penalty:</strong> Failing to report to an accepted offline gig within 30 minutes of check-in time results in 1 strike.</li>
              <li><strong>Delay Approvals:</strong> If you are running late, you must initiate the "Request More Time" route. Delays must be approved by the employer.</li>
              <li><strong>Suspension Limit:</strong> Accumulating 3 strikes within any 30-day period locks the account, triggering admin reviews.</li>
            </ul>
          </section>

          {/* 3. Escrow Payments */}
          <section className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-violet-500">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-violet-650" />
              <h2 className="text-lg font-black text-gray-900">3. Escrow Hold & Commission</h2>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4 font-semibold">
              When an employer hires a worker, the agreed amount is immediately debited from the employer's preloaded wallet and placed in a secure Escrow holding vault.
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2.5 font-bold mb-4">
              <li>Funds are released only after worker completes the session and the employer approves check-out.</li>
              <li>A standard <strong>15% platform commission</strong> is deducted from the escrow balance prior to worker credit payout.</li>
              <li>Workers can withdraw verified credits immediately to any linked bank account via UPI.</li>
            </ul>
          </section>

          {/* 4. Safety protocols */}
          <section className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-emerald-650" />
              <h2 className="text-lg font-black text-gray-900">4. Core Workplace Safety & SOS</h2>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4 font-semibold">
              GigTrust requires active safety protocols to protect workers, especially for offline assignments:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2.5 font-bold">
              <li><strong>SOS Integration:</strong> An active panic button is visible on every check-in screen. Clicking SOS broadcasts live GPS coordinates to listed emergency contacts and registers an immediate banner in the Admin Dashboard.</li>
              <li><strong>Geofenced Safety check:</strong> Attendance check-ins and check-outs are validated using GPS coordinate comparisons.</li>
              <li><strong>Face Checks:</strong> The system may trigger random mid-session selfie prompts to verify that the worker matches the ID document uploaded during onboarding.</li>
            </ul>
          </section>

          {/* 5. 8PM Safety Protocol Framing */}
          <section className="bg-white p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-650" />
              <h2 className="text-lg font-black text-gray-900">5. Late Night Safety Protocol (Post 8 PM)</h2>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4 font-semibold">
              To minimize safety risks while maintaining equal access to earning opportunities, jobs scheduled or active past 8:00 PM for female workers are subject to mandatory digital safety guardrails:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2.5 font-bold">
              <li><strong>Online-Only Option:</strong> Gig matches scheduled past 8 PM default to remote/online formats where possible to ensure physical security.</li>
              <li><strong>Active Tracking Shield:</strong> If physical work is selected, continuous background GPS location sharing, automated OTP check-ins, and trusted guardian alerts are enabled.</li>
              <li><em>Compliance Note: This safety protocol is framed as a protection safeguard rather than a blanket work ban. We advise regular review with your legal team to ensure compliance with local labor laws.</em></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400 font-semibold">
          <p>© 2026 GigTrust Inc. All rights reserved. Safety First.</p>
        </div>
      </div>
    </div>
  );
}
