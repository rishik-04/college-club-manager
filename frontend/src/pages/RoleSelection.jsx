import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Shield, ArrowRight, Building } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative border-t-4 border-[#CC0000]">
      {/* Top Header Bar (Utah Campus Connect style) */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs z-10 text-slate-900">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/roles')}>
            <div className="w-8 h-8 rounded bg-[#CC0000] text-white flex items-center justify-center font-black text-sm shadow-2xs">
              CC
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Campus <span className="text-[#CC0000]">Connect</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
            <button onClick={() => navigate('/roles')} className="hover:text-[#CC0000] transition">About</button>
            <button onClick={() => navigate('/explore')} className="hover:text-[#CC0000] transition">Organizations</button>
            <button onClick={() => navigate('/events')} className="hover:text-[#CC0000] transition">Events</button>
          </nav>
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          University Student Engagement System
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-6xl mx-auto px-4 py-12 w-full space-y-10 z-10 flex-1 flex flex-col justify-center">
        {/* Title Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#CC0000] bg-red-50 px-3 py-1 rounded-full border border-red-200">
            OFFICIAL CAMPUS PORTAL
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Discover Unique Opportunities
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-600">
            Join student organizations, attend events, track your involvement, and manage club operations.
          </p>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {/* Card 1: Student Portal */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs hover:border-[#CC0000]/40 hover:shadow-md transition duration-150 flex flex-col justify-between text-center space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#CC0000] mx-auto">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Student Portal</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Explore student organizations, join active clubs, register for campus events, and save your favorites.
              </p>
            </div>

            <button
              onClick={() => navigate('/student-login')}
              className="w-full py-2.5 bg-[#CC0000] hover:bg-[#B30000] text-white font-bold rounded text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-2"
            >
              <span>Student Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Club Admin Portal */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md transition duration-150 flex flex-col justify-between text-center space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto">
                <Users className="w-7 h-7 text-slate-700" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Club Admin Portal</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Manage club profiles, executive board members, member rosters, events, and announcements.
              </p>
            </div>

            <button
              onClick={() => navigate('/club-admin-login')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>Club Admin Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Main Admin Portal */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md transition duration-150 flex flex-col justify-between text-center space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto">
                <Shield className="w-7 h-7 text-slate-700" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Campus Admin Console</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Supervise campus-wide club registrations, student directory, and global demographics.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin-login')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border border-slate-300 rounded text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <span>Admin Console Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center space-y-1 pt-4">
          <p className="text-xs font-semibold text-slate-600">
            College Club Governance & Student Engagement System
          </p>
        </div>
      </main>

      {/* Footer Graphic */}
      <div className="w-full h-16 bg-white border-t border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
        © College Club Manager — Institutional Student Portal
      </div>
    </div>
  );
}
