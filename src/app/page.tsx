import Link from "next/link";
import { ShieldCheck, Zap, Coins, MapPin, AlertOctagon, UserCheck, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-outfit bg-gradient-to-r from-violet-400 via-purple-500 to-amber-400 bg-clip-text text-transparent tracking-wide">
              GigTrust
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <Link href="/pricing" className="hover:text-violet-400 transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-violet-400 transition-colors">Safety & Terms</Link>
            <Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Admin Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-violet-500/20 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold mb-6 animate-fade-in">
            <ShieldCheck className="w-4 h-4" /> Next-Gen India-Compliant Gig Economy
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-outfit tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            The Trust Network for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">
              Verified Gigs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Eliminate no-shows, proxy attendance, and payment disputes. Verified identities, automated escrow, GPS check-ins, and safety-gated dispatch.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              href="/signup?role=worker" 
              className="w-full sm:w-auto glass-panel glass-panel-hover px-8 py-4 rounded-xl flex items-center justify-between gap-4 text-left border-l-4 border-l-violet-500"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-violet-400 font-bold block mb-1">Find Work</span>
                <span className="text-lg font-bold text-white block">I am a Worker</span>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-400" />
            </Link>

            <Link 
              href="/signup?role=employer" 
              className="w-full sm:w-auto glass-panel glass-panel-hover px-8 py-4 rounded-xl flex items-center justify-between gap-4 text-left border-l-4 border-l-amber-500"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block mb-1">Hire Talent</span>
                <span className="text-lg font-bold text-white block">I am an Employer</span>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </Link>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { label: "Identity Verified", desc: "Aadhaar / DigiLocker integration", icon: UserCheck, color: "text-emerald-400" },
              { label: "Funds Escrowed", desc: "Razorpay secure wallet protection", icon: Coins, color: "text-yellow-400" },
              { label: "Anti-Proxy Attendance", desc: "Geofenced check-in & selfie validation", icon: MapPin, color: "text-blue-400" },
              { label: "Built-In Safety", desc: "SOS alert & real-time tracking", icon: AlertOctagon, color: "text-red-400" },
            ].map((badge, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <badge.icon className={`w-8 h-8 mb-3 ${badge.color}`} />
                <h3 className="font-semibold text-white text-sm mb-1">{badge.label}</h3>
                <p className="text-xs text-slate-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Tier Section */}
      <section className="py-20 bg-slate-950/40 border-t border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Verification Trust Tiers</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Bronze, Silver, and Gold status levels to build trust and open up higher paying jobs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Bronze Card */}
            <div className="glass-panel p-8 rounded-2xl relative border-l-2 border-l-orange-500/50">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider">Bronze Badge</span>
                <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Basic OCR Verify</h3>
              <p className="text-slate-400 text-sm mb-6">Instantly unlocked by uploading a scanned ID. Validated via automatic OCR parsing.</p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">✓ Aadhaar/DL/Voter Card Upload</li>
                <li className="flex items-center gap-2">✓ Dynamic Form Validation</li>
                <li className="flex items-center gap-2">✓ Up to ₹5,000 monthly gigs</li>
              </ul>
            </div>

            {/* Silver Card */}
            <div className="glass-panel p-8 rounded-2xl relative border-l-2 border-l-slate-400">
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-violet-600 to-purple-600 text-[10px] text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow">Most Popular</div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-slate-400/10 text-slate-300 text-xs font-bold uppercase tracking-wider">Silver Badge</span>
                <Star className="w-5 h-5 text-slate-300 fill-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Full Verification</h3>
              <p className="text-slate-400 text-sm mb-6">Requires DigiLocker identity lock, live selfie matches, and a ₹500 security deposit.</p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2 text-violet-400">✓ DigiLocker API Integration</li>
                <li className="flex items-center gap-2 text-violet-400">✓ AI Face Match Match & Verification</li>
                <li className="flex items-center gap-2 text-violet-400">✓ ₹500 Security Wallet Lock</li>
                <li className="flex items-center gap-2">✓ Unlocks higher paying premium tasks</li>
              </ul>
            </div>

            {/* Gold Card */}
            <div className="glass-panel p-8 rounded-2xl relative border-l-2 border-l-amber-500">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">Gold Badge</span>
                <div className="flex">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 -ml-1" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Elite Status</h3>
              <p className="text-slate-400 text-sm mb-6">Awarded for complete background check uploads (Police Verification) and high ratings.</p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2 text-amber-400">✓ Certified Police Verification Doc</li>
                <li className="flex items-center gap-2 text-amber-400">✓ High Average rating (&gt; 4.8 / 5.0)</li>
                <li className="flex items-center gap-2 text-amber-400">✓ Zero active strikes & disputes</li>
                <li className="flex items-center gap-2">✓ VIP access & express fee payout options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Notice */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="glass-panel p-8 rounded-2xl border border-red-500/15 bg-red-950/5 flex flex-col items-center">
          <AlertOctagon className="w-12 h-12 text-red-500/80 mb-4 animate-pulse-slow" />
          <h3 className="text-lg font-bold text-white mb-2">Zero-Tolerance Marketplace & Safety Protocols</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-2xl">
            GigTrust enforces structural policies for workplace safety. Listing prohibited services triggers auto-moderation. All offline works support active SOS panic triggers, trusted contacts, and live geofenced sharing.
          </p>
          <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-white/5 px-3 py-1 rounded">
            Safety Protocol 8PM: Online work matches optimized automatically for workers.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950/80 py-8 px-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GigTrust Inc. Built for trusted gig execution.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-slate-300">Platform Fees</Link>
            <Link href="/admin" className="text-violet-400 hover:underline">Admin Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
