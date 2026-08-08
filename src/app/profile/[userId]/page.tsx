"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, ShieldCheck, Mail, Phone, Heart, Users, Calendar } from "lucide-react";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("worker");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch for profile and current session
    setTimeout(() => {
      // Setup demo profile values
      const dummyWorker = {
        userId: params.userId,
        name: "Rohan Sharma",
        email: "rohan.sharma@gmail.com",
        phone: "9876543210",
        role: "worker",
        kycStatus: "silver",
        trustScore: 85,
        skills: ["Electrical", "Plumbing", "Home Cleaning"],
        education: [{ school: "Delhi University", degree: "B.Com", year: "2019" }],
        experience: [{ company: "Urban Company", role: "Service Partner", duration: "2 years" }],
        // Private columns
        medicalConditions: "Aspirin allergy, asthma history.",
        guardians: [
          { name: "Rajesh Kumar", phone: "9111111111", address: "Noida", relation: "blood" }
        ],
        ratings: [
          { score: 5, comment: "Excellent service, completed wiring on time.", author: "Tech Solutions Pvt Ltd" },
          { score: 4, comment: "Polite worker, arrived within geofence on time.", author: "Indiranagar Resident Office" }
        ]
      };

      setProfileData(dummyWorker);
      
      // Read simulated role from path or window params to check if user is admin
      const hash = window.location.search;
      if (hash.includes("role=admin")) {
        setCurrentUserRole("admin");
      }
      setLoading(false);
    }, 500);
  }, [params.userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Syncing Trust Credentials...
      </div>
    );
  }

  const isAdmin = currentUserRole === "admin";
  const getBadgeColor = (tier: string) => {
    if (tier === 'gold') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    if (tier === 'silver') return 'border-slate-300 bg-slate-300/10 text-slate-300';
    return 'border-orange-500 bg-orange-500/10 text-orange-400';
  };

  return (
    <div className="min-h-screen text-gray-700 bg-[#F6F7F9] font-sans pb-16">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <Link href="/" className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-gray-900">Trust Network Profile</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6 animate-fade-in">
        {/* Core User Details */}
        <div className="bg-white p-7 rounded-[28px] border border-gray-150 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-violet-50 text-violet-750 border border-violet-100 flex items-center justify-center text-2xl font-black font-outfit shadow-sm">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2.5 justify-center md:justify-start">
                <h2 className="text-xl font-bold text-gray-900 font-outfit">{profileData.name}</h2>
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getBadgeColor(profileData.kycStatus)}`}>
                  {profileData.kycStatus}
                </span>
              </div>
              <p className="text-xs text-gray-550 mt-1 capitalize font-semibold">Verified gig {profileData.role}</p>
            </div>
          </div>

          <div className="bg-white py-3 px-6 rounded-2xl text-center border border-gray-150 border-l-4 border-l-violet-500 shadow-sm shrink-0">
            <span className="text-[9px] text-gray-450 uppercase tracking-widest font-extrabold block mb-0.5">Trust Score</span>
            <span className="text-2xl font-black text-gray-905">{profileData.trustScore}</span>
            <span className="text-[9px] text-gray-450 block font-semibold">/ 100 max</span>
          </div>
        </div>

        {/* Public Fields: Skills & Experience */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Experience */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Work Experience</h3>
              {profileData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900">{exp.role}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">{exp.company} • {exp.duration}</p>
                </div>
              ))}
            </div>

            {/* Ratings */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Client Feedback</h3>
              <div className="space-y-3">
                {profileData.ratings.map((rtg: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{rtg.author}</span>
                      <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                        {Array.from({ length: rtg.score }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-normal font-semibold">"{rtg.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Skills */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Skill Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((sk: string, idx: number) => (
                <span key={idx} className="text-[10px] bg-violet-50 border border-violet-100 text-violet-700 px-3.5 py-1.5 rounded-full font-bold">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Private Fields Gated Panel (Only visible to Admin) */}
        <div className="pt-4 border-t border-gray-150">
          {isAdmin ? (
            <div className="bg-red-50 p-7 rounded-[28px] border border-red-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 border-b border-red-200 pb-3">
                <ShieldCheck className="w-6 h-6 text-red-650" />
                <div>
                  <h3 className="text-sm font-bold text-red-750 uppercase tracking-wider">Admin Clearance Panel</h3>
                  <p className="text-[9px] text-gray-500 font-semibold mt-0.5">Sensitive Columns Visible (Admin/Emergency authorization verified)</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs leading-normal">
                {/* Private Medical */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" /> Medical Conditions (Private Column)
                  </span>
                  <p className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-medium">
                    {profileData.medicalConditions}
                  </p>
                </div>

                {/* Private Guardians */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" /> Guardians Contacts (Private Table)
                  </span>
                  {profileData.guardians.map((g: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 space-y-1 font-medium">
                      <p><strong>Name:</strong> {g.name} ({g.relation})</p>
                      <p><strong>Phone:</strong> {g.phone}</p>
                      <p><strong>Address:</strong> {g.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[28px] text-center border border-gray-150 shadow-sm text-gray-400 text-xs font-semibold leading-relaxed">
              🔒 Private medical conditions and emergency guardian tables are hidden from public view to comply with workplace safety regulations.
              {/* Dev Shortcut */}
              <div className="mt-3">
                <Link href="?role=admin" className="text-violet-650 hover:underline font-extrabold">
                  (Developer Mode: Simulate Admin to view private data)
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
