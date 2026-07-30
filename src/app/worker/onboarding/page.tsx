"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserCheck, MapPin, Award, ShieldAlert, BadgePlus, Coins, 
  ArrowRight, ArrowLeft, Camera, Upload, CheckCircle2, AlertTriangle, Play 
} from "lucide-react";

export default function WorkerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Identity & Face Match State
  const [idDocType, setIdDocType] = useState<'Aadhaar' | 'Driving Licence' | 'Voter ID' | 'Passport'>('Aadhaar');
  const [idNumber, setIdNumber] = useState("");
  const [idVerified, setIdVerified] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceScore, setFaceScore] = useState<number | null>(null);

  // Step 2: Location
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);

  // Step 3: Education & Experience
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduYear, setEduYear] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expDuration, setExpDuration] = useState("");

  // Step 4: Medical & Guardians (3 contacts)
  const [medical, setMedical] = useState("");
  const [guardians, setGuardians] = useState([
    { name: "", phone: "", address: "", relation_type: "blood" },
    { name: "", phone: "", address: "", relation_type: "blood" },
    { name: "", phone: "", address: "", relation_type: "other" }
  ]);

  // Step 5: Skills & Work Modes
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState<'online' | 'offline' | 'both'>('both');

  // Step 6: Security Deposit
  const [depositCompleted, setDepositCompleted] = useState(false);

  const availableSkills = ["Electrical", "Plumbing", "Home Cleaning", "Data Entry", "Office Help", "Cooking", "Delivery", "Security Guard"];

  const handleDigiLockerSimulate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'digilocker' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIdNumber(data.result.idNumber);
      setIdVerified(true);
      setSuccess("Identity verified instantly via DigiLocker API!");
    } catch (e: any) {
      setError(e.message || "DigiLocker connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOcrSimulate = async () => {
    if (!idNumber) {
      setError("Please enter your document ID number first for OCR validation.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'ocr', docType: idDocType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIdVerified(true);
      setSuccess("Document scanned successfully! Details extracted via Vision OCR.");
    } catch (e: any) {
      setError(e.message || "OCR Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieSimulate = () => {
    setSelfieUploaded(true);
    setLoading(true);
    setTimeout(() => {
      setFaceVerified(true);
      setFaceScore(97.8);
      setLoading(false);
      setSuccess("Face Match check passed! Match confidence score: 97.8%");
    }, 1000);
  };

  const handleGuardianChange = (index: number, field: string, value: string) => {
    const updated = [...guardians];
    updated[index] = { ...updated[index], [field]: value };
    setGuardians(updated);
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDepositCompleted(true);
      setSuccess("₹500 Security deposit successfully held! Silver Tier Unlocked.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    setError("");
    setSuccess("");
    
    // Validation checks per step
    if (step === 1 && (!idVerified || !faceVerified)) {
      setError("Please complete both Document Verification and Face Match comparison before proceeding.");
      return;
    }
    if (step === 2 && !address) {
      setError("Please input your primary residence location.");
      return;
    }
    if (step === 4) {
      const emptyGrd = guardians.some(g => !g.name || !g.phone || !g.address);
      if (emptyGrd) {
        setError("Worker safety rules require exactly 3 complete emergency contacts.");
        return;
      }
    }
    if (step === 5 && selectedSkills.length === 0) {
      setError("Please select at least 1 skill badge to display on your profile.");
      return;
    }

    if (step < 6) {
      setStep(step + 1);
      return;
    }

    // Submit final onboarding payload
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dob: "1995-11-20",
          gender: "Male",
          base_location_lat: lat,
          base_location_lng: lng,
          id_doc_type: idDocType,
          id_doc_url: "/docs/id.jpg",
          id_verified: idVerified,
          face_match_score: faceScore,
          education: [{ school: eduSchool, degree: eduDegree, year: eduYear }],
          work_experience: [{ company: expCompany, role: expRole, duration: expDuration }],
          medical_conditions: medical,
          guardians,
          skills: selectedSkills,
          work_mode: workMode,
          depositCompleted
        })
      });

      if (!res.ok) throw new Error("Onboarding submission failed.");
      router.push("/worker/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { label: "Identity Check", icon: UserCheck },
    { label: "Home Location", icon: MapPin },
    { label: "Resume Info", icon: Award },
    { label: "Emergency Contacts", icon: ShieldAlert },
    { label: "Skills & Modes", icon: BadgePlus },
    { label: "Deposit Hold", icon: Coins }
  ];

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-outfit text-white text-center mb-2">
          Worker Onboarding Wizard
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Complete the steps to activate your marketplace account and unlock verified job bookings.
        </p>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {stepsList.map((s, idx) => {
            const stepNum = idx + 1;
            const Icon = s.icon;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div 
                key={idx}
                className={`glass-panel p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isActive 
                    ? 'border-violet-500 bg-violet-500/10' 
                    : isCompleted 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-white/5 opacity-55'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-300">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Alert banners */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
            {success}
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl border border-white/5 mb-8">
          {/* STEP 1: IDENTITY & FACE MATCH */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Identity Verification</h3>
                <p className="text-xs text-slate-400">Choose instant DigiLocker sync for Gold/Silver validation, or manually upload and run OCR scanner fallback.</p>
              </div>

              {/* DigiLocker Option */}
              <div className="p-5 rounded-xl bg-violet-500/5 border border-violet-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Method A: Connect DigiLocker (Recommended)</h4>
                  <p className="text-xs text-slate-400">Pulls official verified documents. Silver badge instantly unlocked.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDigiLockerSimulate}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Connect DigiLocker API
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 font-semibold my-2">-- OR --</div>

              {/* Manual Upload Fallback */}
              <div className="space-y-4 p-5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-white">Method B: Manual Document Upload (OCR Scanner)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Document Type</label>
                    <select 
                      value={idDocType} 
                      onChange={(e) => setIdDocType(e.target.value as any)}
                      className="w-full glass-input text-xs"
                    >
                      <option>Aadhaar</option>
                      <option>Driving Licence</option>
                      <option>Voter ID</option>
                      <option>Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Document ID Number</label>
                    <input 
                      type="text" 
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter ID Number" 
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleOcrSimulate}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/5"
                  >
                    <Upload className="w-4 h-4 text-slate-400" /> Simulate OCR Extract
                  </button>
                </div>
              </div>

              {/* Face Match check */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-violet-400" /> Face Match Attendance Safety
                </h4>
                <p className="text-xs text-slate-400">Upload a selfie to compare against your document photo. Prevents proxy workers from attending gigs.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 border-2 border-dashed border-white/10 rounded-xl bg-slate-900/30">
                  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 text-slate-400 relative overflow-hidden">
                    {selfieUploaded ? (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">Selfie Loaded</span>
                    ) : (
                      <Camera className="w-8 h-8" />
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <button
                      type="button"
                      onClick={handleSelfieSimulate}
                      className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow"
                    >
                      Capture Live Selfie
                    </button>
                    <p className="text-[10px] text-slate-500">Camera permission will open. Simulated face validation scoring applied.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Work Radius & Coordinates</h3>
                <p className="text-xs text-slate-400">Input your base home address to match gigs within your immediate travel radius.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Primary Residence Address</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3} 
                    className="w-full glass-input text-xs" 
                    placeholder="Enter full address details (e.g. 123, MG Road, Indiranagar, Bangalore)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Latitude coordinate</label>
                    <input 
                      type="number" 
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full glass-input text-xs bg-slate-900/40" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Longitude coordinate</label>
                    <input 
                      type="number" 
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full glass-input text-xs bg-slate-900/40" 
                    />
                  </div>
                </div>

                {/* Leaflet/OSM Fallback visual */}
                <div className="h-44 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/50 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <MapPin className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                  <span className="text-xs text-slate-300 font-bold">Bangalore Center coordinates Selected</span>
                  <span className="text-[10px] text-slate-500 mt-1">Geocoding synced. Radius check will restrict check-ins outside 200m bounds.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESUME EXPERIENCE */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Experience & Credentials</h3>
                <p className="text-xs text-slate-400">Provide education details and recent gig/work records to showcase on your profile.</p>
              </div>

              {/* Education section */}
              <div className="space-y-4 p-5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-violet-400">Education Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">School / University</label>
                    <input 
                      type="text" 
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                      placeholder="e.g. Delhi University" 
                      className="w-full glass-input text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Year of Passing</label>
                    <input 
                      type="text" 
                      value={eduYear}
                      onChange={(e) => setEduYear(e.target.value)}
                      placeholder="e.g. 2020" 
                      className="w-full glass-input text-xs" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Degree Course</label>
                  <input 
                    type="text" 
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Commerce (B.Com)" 
                    className="w-full glass-input text-xs" 
                  />
                </div>
              </div>

              {/* Experience section */}
              <div className="space-y-4 p-5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-amber-400">Work Experience</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Company / App Partner</label>
                    <input 
                      type="text" 
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="e.g. Urban Company" 
                      className="w-full glass-input text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Role / Job Title</label>
                    <input 
                      type="text" 
                      value={expRole}
                      onChange={(e) => setExpRole(e.target.value)}
                      placeholder="e.g. AC Maintenance Technician" 
                      className="w-full glass-input text-xs" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Employment Duration</label>
                  <input 
                    type="text" 
                    value={expDuration}
                    onChange={(e) => setExpDuration(e.target.value)}
                    placeholder="e.g. 2 Years (Part-Time)" 
                    className="w-full glass-input text-xs" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GUARDIANS & PRIVATE LOGS */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Safety Contacts & Private Medical Info</h3>
                <p className="text-xs text-slate-400">Your medical conditions and emergency guardian contacts are strictly confidential. Visible only to Admins and triggered during active SOS alerts.</p>
              </div>

              {/* Medical field */}
              <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/20">
                <label className="block text-xs font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Medical Conditions (Private Column)
                </label>
                <textarea 
                  value={medical}
                  onChange={(e) => setMedical(e.target.value)}
                  rows={2}
                  className="w-full glass-input text-xs border-red-500/20 focus:border-red-500"
                  placeholder="Detail any conditions, allergies, or emergency directives here. NEVER shown publicly."
                />
              </div>

              {/* 3 Guardian contacts */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">Required Safety Contacts (Exactly 3)</h4>
                
                {guardians.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Emergency Contact #{idx + 1}</span>
                      <select
                        value={g.relation_type}
                        onChange={(e) => handleGuardianChange(idx, 'relation_type', e.target.value)}
                        className="text-[10px] bg-slate-900 border border-white/10 rounded px-2 py-0.5"
                      >
                        <option value="blood">Blood Relative</option>
                        <option value="other">Other relation</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        required
                        value={g.name}
                        onChange={(e) => handleGuardianChange(idx, 'name', e.target.value)}
                        placeholder="Full Name" 
                        className="glass-input text-xs py-1.5 px-3"
                      />
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        value={g.phone}
                        onChange={(e) => handleGuardianChange(idx, 'phone', e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit Phone" 
                        className="glass-input text-xs py-1.5 px-3"
                      />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={g.address}
                      onChange={(e) => handleGuardianChange(idx, 'address', e.target.value)}
                      placeholder="Home Address" 
                      className="w-full glass-input text-xs py-1.5 px-3"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SKILLS & WORK MODES */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Skill Badges & Workspace Formats</h3>
                <p className="text-xs text-slate-400">Select the skills you want to display to employers and pick your preferred working formats.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-3">Preferred Skill Badges (Select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill, idx) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                            isSelected 
                              ? 'bg-violet-500/20 border-violet-500 text-violet-300' 
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="block text-xs font-semibold text-slate-400 mb-3">Work Mode Preference</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'online', label: 'Online Only', desc: 'Remote jobs' },
                      { value: 'offline', label: 'Offline Only', desc: 'Physical/In-person' },
                      { value: 'both', label: 'Hybrid/Either', desc: 'Maximum matches' }
                    ].map((mode, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWorkMode(mode.value as any)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          workMode === mode.value 
                            ? 'bg-violet-500/10 border-violet-500 text-white' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block">{mode.label}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SECURITY DEPOSIT HOLD */}
          {step === 6 && (
            <div className="space-y-6 text-center py-6 animate-fade-in">
              <Coins className="w-16 h-16 text-amber-500 mx-auto animate-pulse-slow" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">6. Unlock Silver Trust Badge</h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  A ₹500 security deposit hold is required to activate Silver verification. Locks commitment, reduces client no-shows, and is fully refundable on account closure.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-xl max-w-sm mx-auto border border-white/5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">One-Time Refundable Deposit</div>
                <div className="text-4xl font-extrabold text-white mb-4">₹500.00</div>
                
                {depositCompleted ? (
                  <div className="py-2.5 px-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Deposit Locked in Wallet
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Pay ₹500 via Razorpay (Demo Mode)
                  </button>
                )}
              </div>

              <div className="text-[10px] text-slate-500 max-w-md mx-auto flex items-center gap-1.5 justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                You can proceed with Bronze tier without depositing, but Silver grants higher payouts.
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
            className="px-6 py-3 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSaveAndNext}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-500/10"
          >
            {step === 6 ? (loading ? "Completing..." : "Complete Registration") : "Save & Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
