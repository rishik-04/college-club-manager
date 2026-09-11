import React from 'react';
import { X, Award, CheckCircle2, ShieldCheck, Printer, Download, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CertificateModal({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!isOpen || !user) return null;

  const issueDate = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-900 relative animate-in zoom-in-95 p-8 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-slate-100 text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame Border Overlay */}
        <div className="border-2 border-dashed border-amber-500/60 p-6 rounded-2xl relative text-center space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-sky-50/20">
          
          {/* Header Seal */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Award className="w-7 h-7" />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 block">
              Official University Transcript & Activity Record
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Certificate of Co-Curricular Excellence
            </h2>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            This certifies that <strong className="text-slate-900 text-sm underline">{user.name}</strong> ({user.branch || 'Student'}, {user.year || '3rd Year'}) has actively participated in campus leadership, technical workshops, and club activities.
          </p>

          {/* Credit Points Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-left max-w-lg mx-auto shadow-sm space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-700">
              <span>Category / Engagement</span>
              <span>Credit Points</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Technical & AI Workshops</span>
              <strong className="text-emerald-600">+45 Credits</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hackathon & Coding Competitions</span>
              <strong className="text-emerald-600">+60 Credits</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Community Outreach & Mentorship</span>
              <strong className="text-emerald-600">+30 Credits</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-slate-900 text-sm">
              <span>Total Co-Curricular Score:</span>
              <span className="text-sky-600">135 Points (Tier 1 Distinction)</span>
            </div>
          </div>

          {/* Signatures & Verification QR */}
          <div className="pt-4 flex items-end justify-between text-left text-xs border-t border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Dr. Sarah Jenkins</p>
              <p className="text-[11px] text-slate-500">Dean of Student Affairs</p>
              <p className="text-[10px] text-slate-400 mt-1">Issued: {issueDate}</p>
            </div>

            <div className="text-right flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-900 rounded-xl p-1 text-white flex flex-col items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <span className="text-[8px] font-mono tracking-tighter uppercase">VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
