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
    <div className="min-h-screen text-slate-200 bg-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur px-6 py-4 flex items-center gap-3">
        <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold font-outfit text-white">Trust Network Profile</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-8 animate-fade-in">
        {/* Core User Details */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center text-3xl font-bold font-outfit">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2.5 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-white font-outfit">{profileData.name}</h2>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(profileData.kycStatus)}`}>
                  {profileData.kycStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 capitalize">Verified gig {profileData.role}</p>
            </div>
          </div>

          <div className="glass-panel py-3 px-6 rounded-2xl text-center border-l-4 border-l-violet-500">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Trust Score</span>
            <span className="text-3xl font-extrabold text-white">{profileData.trustScore}</span>
            <span className="text-[9px] text-slate-500 block">/ 100 max</span>
          </div>
        </div>

        {/* Public Fields: Skills & Experience */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Experience */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Work Experience</h3>
              {profileData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                  <p className="text-xs text-slate-400 mt-1">{exp.company} • {exp.duration}</p>
                </div>
              ))}
            </div>

            {/* Ratings */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ratings & Client Feedback</h3>
              <div className="space-y-3">
                {profileData.ratings.map((rtg: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{rtg.author}</span>
                      <span className="flex items-center gap-0.5 font-semibold text-amber-400">
                        {Array.from({ length: rtg.score }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">"{rtg.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Skills */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skill Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((sk: string, idx: number) => (
                <span key={idx} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-full font-bold">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Private Fields Gated Panel (Only visible to Admin) */}
        <div className="pt-4 border-t border-white/5">
          {isAdmin ? (
            <div className="glass-panel p-8 rounded-2xl border border-red-500/20 bg-red-950/5 space-y-6">
              <div className="flex items-center gap-2 border-b border-red-500/25 pb-3">
                <ShieldCheck className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-base font-bold text-red-400">Admin Clearance Panel</h3>
                  <p className="text-[10px] text-slate-400">Sensitive Columns Visible (Admin/Emergency authorization verified)</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs leading-normal">
                {/* Private Medical */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" /> Medical Conditions (Private Column)
                  </span>
                  <p className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400">
                    {profileData.medicalConditions}
                  </p>
                </div>

                {/* Private Guardians */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" /> Guardians Safety Contacts (Private Table)
                  </span>
                  {profileData.guardians.map((g: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 space-y-1">
                      <p><strong>Name:</strong> {g.name} ({g.relation})</p>
                      <p><strong>Phone:</strong> {g.phone}</p>
                      <p><strong>Address:</strong> {g.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl text-center border border-white/5 bg-slate-900/40 text-slate-500 text-xs">
              🔒 Private medical conditions and emergency guardian tables are hidden from public view to comply with workplace safety regulations.
              {/* Dev Shortcut */}
              <div className="mt-3">
                <Link href="?role=admin" className="text-violet-400 hover:underline font-semibold">
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
