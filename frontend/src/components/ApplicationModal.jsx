import React, { useState } from 'react';
import { X, Send, Sparkles, Check, Briefcase, User, Link as LinkIcon, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DOMAIN_OPTIONS = [
  'Technical / Software Lead',
  'AI & Machine Learning',
  'UI/UX & Graphic Design',
  'Public Relations & Marketing',
  'Event Management & Operations',
  'Sponsorship & Corporate Relations',
  'Content Writing & Media'
];

export default function ApplicationModal({ club, isOpen, onClose, onShowToast }) {
  const { user } = useAuth();
  const [domain, setDomain] = useState('Technical / Software Lead');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [whyJoin, setWhyJoin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onShowToast('Please sign in to submit an application', 'error');
      return;
    }
    setLoading(true);

    try {
      await api.applications.apply(club.id, {
        domain,
        experience_level: experienceLevel,
        why_join: whyJoin,
        portfolio_url: portfolioUrl || null
      });
      onShowToast('Application submitted successfully! Track progress in your Profile tab.');
      onClose();
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <img
              src={club.logo_url}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-md shrink-0 bg-white"
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
                Official Campus Application
              </span>
              <h3 className="text-xl font-extrabold leading-tight">
                Apply to {club.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Domain / Role Preference *
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            >
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setExperienceLevel(lvl)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  experienceLevel === lvl
                    ? 'bg-sky-50 border-sky-500 text-sky-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Why do you want to join {club.name}? *
            </label>
            <textarea
              required
              rows={3}
              value={whyJoin}
              onChange={(e) => setWhyJoin(e.target.value)}
              placeholder="Describe your motivation, relevant experience, or projects you'd like to work on..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Portfolio / GitHub / LinkedIn Link (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourprofile or https://linkedin.com/in/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
