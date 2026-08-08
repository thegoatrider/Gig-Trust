"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, MapPin, Coins, ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function EmployerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [docUploaded, setDocUploaded] = useState(false);

  // Step 2: Location Coordinates
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);

  // Step 3: Preload wallet
  const [walletDeposit, setWalletDeposit] = useState("5000");
  const [preloadCompleted, setPreloadCompleted] = useState(false);

  const handleDocUploadSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      setDocUploaded(true);
      setLoading(false);
      setSuccess("Business registration PDF uploaded and validated.");
    }, 800);
  };

  const handlePreloadSimulate = async () => {
    const amt = parseFloat(walletDeposit);
    if (isNaN(amt) || amt <= 0) {
      setError("Please input a valid positive amount.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPreloadCompleted(true);
      setSuccess(`₹${amt} preloaded successfully to wallet via Razorpay (Demo Mode)!`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    setError("");
    setSuccess("");

    if (step === 1) {
      if (!businessName || !gstin) {
        setError("Business Name and GSTIN are required details.");
        return;
      }
      if (!docUploaded) {
        setError("Please upload business registration papers for compliance review.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!address) {
        setError("Please define your primary business address location.");
        return;
      }
      setStep(3);
      return;
    }

    // Submit final onboarding payload
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete-employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          gstin,
          business_docs_url: "/docs/business.pdf",
          verified_location_lat: lat,
          verified_location_lng: lng
        })
      });

      if (!res.ok) throw new Error("Onboarding submission failed.");
      router.push("/employer/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { label: "Company Details", icon: Briefcase },
    { label: "Verified Location", icon: MapPin },
    { label: "Preload Balance", icon: Coins }
  ];

  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold font-outfit text-gray-900 text-center mb-2">
          Employer Onboarding Wizard
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Complete compliance verification to begin hiring vetted professional gig workers.
        </p>

        {/* Step Tracker */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stepsList.map((s, idx) => {
            const stepNum = idx + 1;
            const Icon = s.icon;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div 
                key={idx}
                className={`glass-panel p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isActive 
                    ? 'border-amber-500 bg-amber-50 text-amber-800' 
                    : isCompleted 
                    ? 'border-emerald-500/20 bg-emerald-50 text-emerald-800' 
                    : 'border-gray-200/60 bg-gray-50 opacity-60'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-amber-500' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-700">{s.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
            {success}
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Company Profile</h3>
                <p className="text-xs text-gray-500">Enter corporate information. GSTIN is verified automatically for taxation compliance.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Registered Business Name</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Hospitality Group" 
                    className="w-full glass-input text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">GSTIN Number (15-Digit)</label>
                  <input 
                    type="text" 
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 29AAAAA1111A1Z1" 
                    className="w-full glass-input text-xs tracking-wider" 
                    maxLength={15}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <label className="block text-xs font-semibold text-gray-600">Upload Registration Document (PDF/JPG)</label>
                  <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center">
                    {docUploaded ? (
                      <div className="text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Registration Verified
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleDocUploadSimulate}
                          className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-200 shadow-sm"
                        >
                          <Upload className="w-4 h-4 text-gray-400" /> Upload File
                        </button>
                        <span className="text-[10px] text-gray-400 mt-2">Support files: pdf, docx, jpeg (max 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Office / Site Location Coordinates</h3>
                <p className="text-xs text-gray-500">Establish corporate coordinates. Used to confirm physical geofences for worker attendance clocks.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Address</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3} 
                    className="w-full glass-input text-xs" 
                    placeholder="Enter full business location address (e.g. Tech Park, Outer Ring Rd, Bangalore)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude coordinate</label>
                    <input 
                      type="number" 
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full glass-input text-xs bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude coordinate</label>
                    <input 
                      type="number" 
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full glass-input text-xs bg-gray-50/50" 
                    />
                  </div>
                </div>

                <div className="h-44 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <MapPin className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                  <span className="text-xs text-gray-800 font-bold">Office site coordinates Synced</span>
                  <span className="text-[10px] text-gray-400 mt-1">Check-ins will restrict workers unless within 200 meters.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRELOAD WALLET */}
          {step === 3 && (
            <div className="space-y-6 text-center py-6 animate-fade-in">
              <Coins className="w-16 h-16 text-amber-500 mx-auto animate-pulse-slow" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Preload Escrow Balance</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Hire worker slots securely. GigTrust locks funds in escrow immediately upon candidate hiring. Deposit now to post jobs instantly.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl max-w-sm mx-auto border border-gray-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preload Amount (₹)</label>
                  <input 
                    type="number" 
                    value={walletDeposit}
                    onChange={(e) => setWalletDeposit(e.target.value)}
                    className="w-full glass-input text-center text-xl font-extrabold focus:outline-none" 
                  />
                </div>

                {preloadCompleted ? (
                  <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Funds Deposited in Wallet
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePreloadSimulate}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Deposit via Razorpay (Demo Mode)
                  </button>
                )}
              </div>

              <div className="text-[10px] text-gray-400 max-w-md mx-auto flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4 text-violet-600" />
                Preloaded balances are 100% refundable at any time if there are no active escrow claims.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            disabled={step === 1 || loading}
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSaveAndNext}
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            {step === 3 ? (loading ? "Completing..." : "Complete Setup") : "Save & Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
