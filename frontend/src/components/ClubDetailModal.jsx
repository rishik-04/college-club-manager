import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  BookmarkCheck,
  ArrowLeft,
  ExternalLink, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Instagram, 
  Linkedin, 
  Globe, 
  Clock,
  MapPin,
  Send,
  Brain,
  Code,
  Trophy,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function ClubDetailModal({
  clubId,
  onClose,
  onToggleSave,
  isSaved: initialIsSaved,
  savedCount: initialSavedCount,
  onOpenApply
}) {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [savedCount, setSavedCount] = useState(initialSavedCount);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    api.clubs.getById(clubId)
      .then((data) => {
        setClub(data);
        setIsSaved(data.is_saved);
        setSavedCount(data.saved_count);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [clubId]);

  const handleSaveClick = async () => {
    if (!club) return;
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setSavedCount((prev) => (newSaved ? prev + 1 : Math.max(0, prev - 1)));
    if (onToggleSave) onToggleSave(club.id);
  };

  if (!clubId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clubs</span>
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !club ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading club profile...</p>
          </div>
        ) : (
          <>
            {/* Header Hero Cover */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-800 overflow-hidden">
              <img
                src={club.cover_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>

              <button
                onClick={handleSaveClick}
                className={`absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition ${
                  isSaved
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Saved' : 'Save Club'}</span>
                <span className="opacity-70 font-normal">({savedCount})</span>
              </button>
            </div>

            {/* Profile Bar */}
            <div className="px-6 sm:px-8 pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
                <div className="flex items-end gap-4">
                  <img
                    src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
                    alt={club.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white shrink-0"
                  />
                  <div className="pb-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 mb-1">
                      {club.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                      {club.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {club.website_url && (
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl border border-slate-200 transition"
                      title="Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {club.instagram_url && (
                    <a
                      href={club.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl border border-slate-200 transition"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {club.linkedin_url && (
                    <a
                      href={club.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sub Tabs */}
              <div className="flex items-center gap-6 text-sm font-semibold border-b border-transparent -mb-4">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`pb-3 border-b-2 transition ${
                    activeSubTab === 'overview'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  About & Outcomes
                </button>
                <button
                  onClick={() => setActiveSubTab('members')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeSubTab === 'members'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Board Members
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {club.board_members?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setActiveSubTab('events')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeSubTab === 'events'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Events
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {(club.upcoming_events?.length || 0) + (club.past_events?.length || 0)}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto">
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      About the Club
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {club.description}
                    </p>
                  </div>

                  {/* Visual Why Join Grid */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                      WHY JOIN {club.name.toUpperCase()}?
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-center space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-sm">
                          <Brain className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-extrabold text-sky-950">Learn & Upskill</h5>
                        <p className="text-[11px] text-sky-700/80 leading-tight">Master hands-on industry skills</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-sm">
                          <Code className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-extrabold text-indigo-950">Build Projects</h5>
                        <p className="text-[11px] text-indigo-700/80 leading-tight">Ship real portfolio software</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-extrabold text-emerald-950">Hackathons & Events</h5>
                        <p className="text-[11px] text-emerald-700/80 leading-tight">Compete for prizes & network</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        Who Can Apply? (Eligibility)
                      </div>
                      <p className="text-xs text-amber-950/80 leading-relaxed">
                        {club.eligibility}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60">
                      <div className="flex items-center gap-2 text-sky-800 font-bold text-sm mb-2">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        What You'll Gain (Outcomes)
                      </div>
                      <p className="text-xs text-sky-950/80 leading-relaxed">
                        {club.outcomes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'members' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Executive Board Members
                  </h4>
                  {club.board_members?.length === 0 ? (
                    <p className="text-sm text-slate-400">No board members listed yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {club.board_members.map((bm) => (
                        <div
                          key={bm.id}
                          className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70"
                        >
                          <img
                            src={bm.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={bm.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm shrink-0"
                          />
                          <div>
                            <h5 className="text-sm font-bold text-slate-800 leading-tight">
                              {bm.name}
                            </h5>
                            <span className="text-xs font-medium text-sky-600 block mt-0.5">
                              {bm.position}
                            </span>
                            {bm.email && (
                              <span className="text-[11px] text-slate-400 block truncate">
                                {bm.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'events' && (
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Upcoming Events ({club.upcoming_events?.length || 0})
                    </h4>
                    {club.upcoming_events?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No upcoming events scheduled right now.</p>
                    ) : (
                      <div className="space-y-3">
                        {club.upcoming_events.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {new Date(ev.event_date).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900">{ev.title}</h5>
                              <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                              <span className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.location}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Events */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Past Events ({club.past_events?.length || 0})
                    </h4>
                    {club.past_events?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No past events recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {club.past_events.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                                  {new Date(ev.event_date).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-900">{ev.title}</h5>
                              <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                              <span className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.location}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar with Native Apply + Google Form Link */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 hidden sm:block">
                Apply directly to <strong className="text-slate-800">{club.name}</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    onOpenApply(club);
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  APPLY NOW (IN-APP)
                </button>
                <a
                  href={club.google_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center justify-center gap-1"
                  title="Google Form Mirror"
                >
                  Google Form
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
