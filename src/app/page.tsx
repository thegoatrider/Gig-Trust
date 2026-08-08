import Link from "next/link";
import { ShieldCheck, Zap, Coins, MapPin, AlertOctagon, UserCheck, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 border-b border-gray-200/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black font-outfit bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              GigTrust
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
            <Link href="/pricing" className="hover:text-violet-600 transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-violet-600 transition-colors">Safety & Terms</Link>
            <Link href="/admin" className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Admin Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold mb-6 animate-fade-in">
            <ShieldCheck className="w-4 h-4" /> Next-Gen India-Compliant Gig Economy
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-outfit tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-gray-900">
            The Trust Network for{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
              Verified Gigs
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Eliminate no-shows, proxy attendance, and payment disputes. Verified identities, automated escrow, GPS check-ins, and safety-gated dispatch.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 max-w-lg mx-auto">
            <Link 
              href="/signup?role=worker" 
              className="w-full bg-white hover:bg-gray-50 shadow-sm border border-gray-150 p-5 rounded-2xl flex items-center justify-between gap-4 text-left border-l-4 border-l-violet-500 transition-all"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-violet-600 font-extrabold block mb-0.5">Find Work</span>
                <span className="text-base font-black text-gray-900 block">I am a Worker</span>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-600" />
            </Link>

            <Link 
              href="/signup?role=employer" 
              className="w-full bg-white hover:bg-gray-50 shadow-sm border border-gray-150 p-5 rounded-2xl flex items-center justify-between gap-4 text-left border-l-4 border-l-amber-500 transition-all"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-600 font-extrabold block mb-0.5">Hire Talent</span>
                <span className="text-base font-black text-gray-900 block">I am an Employer</span>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-600" />
            </Link>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { label: "Identity Verified", desc: "Aadhaar / DigiLocker lock", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Funds Escrowed", desc: "Razorpay wallet protection", icon: Coins, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              { label: "Anti-Proxy Attendance", desc: "Geofenced check-in control", icon: MapPin, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
              { label: "Built-In Safety", desc: "SOS alerts & active tracking", icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50 border-red-100" },
            ].map((badge, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${badge.bg} flex flex-col items-center text-center shadow-sm`}>
                <badge.icon className={`w-7 h-7 mb-3.5 ${badge.color}`} />
                <h3 className="font-extrabold text-gray-900 text-sm mb-1">{badge.label}</h3>
                <p className="text-[11px] text-gray-500 leading-normal font-semibold">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Tier Section */}
      <section className="py-20 bg-white border-t border-b border-gray-200/60 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black font-outfit text-gray-900 mb-3">Verification Trust Tiers</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm">Bronze, Silver, and Gold status levels to build trust and open up higher paying jobs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Bronze Card */}
            <div className="bg-[#F6F7F9] p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-[10px] font-extrabold uppercase tracking-wider">Bronze Badge</span>
                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Basic OCR Verify</h3>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed font-semibold">Instantly unlocked by uploading a scanned ID. Validated via automatic OCR parsing.</p>
              <ul className="text-xs text-gray-600 space-y-2.5 font-bold">
                <li className="flex items-center gap-2">✓ Aadhaar/DL/Voter Card Upload</li>
                <li className="flex items-center gap-2">✓ Dynamic Form Validation</li>
                <li className="flex items-center gap-2">✓ Up to ₹5,000 monthly gigs</li>
              </ul>
            </div>

            {/* Silver Card */}
            <div className="bg-[#F6F7F9] p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-violet-500 relative">
              <div className="absolute -top-3.5 right-6 bg-violet-600 text-[9px] text-white font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">Most Popular</div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-800 text-[10px] font-extrabold uppercase tracking-wider">Silver Badge</span>
                <Star className="w-5 h-5 text-violet-500 fill-violet-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Full Verification</h3>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed font-semibold">Requires DigiLocker identity lock, live selfie matches, and a ₹500 security deposit.</p>
              <ul className="text-xs text-gray-600 space-y-2.5 font-bold">
                <li className="flex items-center gap-2 text-violet-700">✓ DigiLocker API Integration</li>
                <li className="flex items-center gap-2 text-violet-700">✓ AI Face Match Match & Verification</li>
                <li className="flex items-center gap-2 text-violet-700">✓ ₹500 Security Wallet Lock</li>
                <li className="flex items-center gap-2">✓ Unlocks higher paying premium tasks</li>
              </ul>
            </div>

            {/* Gold Card */}
            <div className="bg-[#F6F7F9] p-7 rounded-[28px] border border-gray-200/60 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">Gold Badge</span>
                <div className="flex">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 -ml-1" />
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Elite Status</h3>
              <p className="text-gray-500 text-xs mb-6 leading-relaxed font-semibold">Awarded for complete background check uploads (Police Verification) and high ratings.</p>
              <ul className="text-xs text-gray-600 space-y-2.5 font-bold">
                <li className="flex items-center gap-2 text-amber-700">✓ Certified Police Verification Doc</li>
                <li className="flex items-center gap-2 text-amber-700">✓ High Average rating (&gt; 4.8 / 5.0)</li>
                <li className="flex items-center gap-2 text-amber-700">✓ Zero active strikes & disputes</li>
                <li className="flex items-center gap-2">✓ VIP access & express fee payout options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Notice */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-red-50 p-8 rounded-[28px] border border-red-200 shadow-sm flex flex-col items-center">
          <AlertOctagon className="w-10 h-10 text-red-600 mb-4 animate-pulse-slow" />
          <h3 className="text-base font-black text-gray-900 mb-2">Zero-Tolerance Safety Protocols</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-2xl font-semibold">
            GigTrust enforces structural policies for workplace safety. Listing prohibited services triggers auto-moderation. All offline works support active SOS panic triggers, trusted contacts, and live geofenced sharing.
          </p>
          <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
            Safety Protocol 8PM: Online work matches optimized automatically for workers.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-8 px-6 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-xs">
          <p>© 2026 GigTrust Inc. Built for trusted gig execution.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-gray-800 transition-colors">Platform Fees</Link>
            <Link href="/admin" className="text-violet-600 hover:underline">Admin Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
