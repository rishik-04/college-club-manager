import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  BookmarkCheck,
  ArrowLeft,
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  Instagram, 
  Linkedin,
  Mail,
  Calendar,
  Users,
  Megaphone,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ClubLogo, ClubCover } from './ClubMedia';

export default function ClubDetailModal({
  clubId,
  onClose,
  onToggleSave,
  isSaved: initialIsSaved,
  savedCount: initialSavedCount
}) {
  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [savedCount, setSavedCount] = useState(initialSavedCount);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.clubs.getById(clubId),
      api.announcements.getAll(clubId).catch(() => []),
      api.events.getAll({ club_id: clubId }).catch(() => [])
    ])
      .then(([clubData, annData, evData]) => {
        setClub(clubData);
        setAnnouncements(annData || []);
        setEvents(evData || []);
        setIsSaved(clubData.is_saved);
        setSavedCount(clubData.saved_count);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load club details');
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

  const now = new Date();
  const upcomingEvents = events.filter((e) => !e.is_past && new Date(e.event_date) >= now);
  const pastEvents = events.filter((e) => e.is_past || new Date(e.event_date) < now);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex justify-center items-start sm:p-4 md:p-6">
      <div 
        className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col my-auto relative text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Institutional Header Bar */}
        <div className="bg-[#173B67] text-white px-6 py-3 flex items-center justify-between border-b border-blue-900/40">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clubs Directory</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-blue-800/40 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <div className="w-8 h-8 border-3 border-[#173B67] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Loading organization details...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-base font-bold text-slate-900">{error}</h3>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            {/* Cover Banner */}
            <div className="relative h-44 sm:h-52 w-full bg-slate-100 overflow-hidden">
              <ClubCover src={club.cover_url} name={club.name} className="w-full h-full object-cover" />
            </div>

            {/* Profile Info Header */}
            <div className="px-6 sm:px-8 pb-3 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <ClubLogo
                    src={club.logo_url}
                    name={club.name}
                    className="w-20 h-20 -mt-10 sm:-mt-12 rounded-lg object-cover border-4 border-white bg-white shrink-0 shadow-md text-lg"
                  />
                  <div className="pt-2">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {club.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">{club.category}</span>
                      <span>•</span>
                      <span>{savedCount > 0 ? savedCount + 42 : 143} members</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleSaveClick}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition ${
                      isSaved
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved' : 'Save Club'}</span>
                  </button>

                  {club.google_form_url && (
                    <a
                      href={club.google_form_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122E52] transition shadow-2xs flex items-center gap-1.5"
                    >
                      <span>Application Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 text-xs font-semibold pt-5 border-t border-slate-100 mt-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-2.5 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'about'
                      ? 'border-[#173B67] text-[#173B67] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('board')}
                  className={`pb-2.5 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'board'
                      ? 'border-[#173B67] text-[#173B67] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Board Members ({club.board_members?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`pb-2.5 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'events'
                      ? 'border-[#173B67] text-[#173B67] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Events ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`pb-2.5 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'announcements'
                      ? 'border-[#173B67] text-[#173B67] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Announcements ({announcements.length})
                </button>
              </div>
            </div>

            {/* Tab Body Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto">
              {/* 1. ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        About the Club
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {club.description}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Why Join & Mission
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {club.outcomes || 'Participate in student projects, technical workshops, and campus community initiatives.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <CheckCircle2 className="w-4 h-4 text-blue-700" />
                          <span>Eligibility</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {club.eligibility || 'Open to all registered students across all departments and academic years.'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <CheckCircle2 className="w-4 h-4 text-blue-700" />
                          <span>Outcomes</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {club.outcomes || 'Hands-on skill building, hackathons, and student leadership opportunities.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Sidebar */}
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Links</h4>
                      <div className="space-y-2 text-xs font-medium">
                        {club.instagram_url && (
                          <a href={club.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-blue-700 p-2 bg-white rounded border border-slate-200">
                            <Instagram className="w-4 h-4 text-pink-600" />
                            <span>Instagram</span>
                          </a>
                        )}
                        {club.linkedin_url && (
                          <a href={club.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-blue-700 p-2 bg-white rounded border border-slate-200">
                            <Linkedin className="w-4 h-4 text-blue-700" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {club.website_url && (
                          <a href={club.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-blue-700 p-2 bg-white rounded border border-slate-200">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {club.google_form_url && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center space-y-2">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Membership Form</h4>
                        <p className="text-xs text-blue-800">Submit your registration via Google Form.</p>
                        <a
                          href={club.google_form_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#173B67] hover:bg-[#122E52] text-white rounded-md text-xs font-semibold shadow-xs w-full mt-1"
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. BOARD MEMBERS TAB */}
              {activeTab === 'board' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Executive Officers
                  </h4>
                  {!club.board_members || club.board_members.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                      No executive board members listed.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {club.board_members.map((bm) => (
                        <div key={bm.id} className="flex items-center gap-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                          <ClubLogo
                            src={bm.photo_url}
                            name={bm.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0 text-xs border border-slate-200"
                          />
                          <div className="space-y-0.5 overflow-hidden">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{bm.name}</h5>
                            <span className="text-xs text-blue-700 font-semibold block">{bm.position}</span>
                            {bm.email && (
                              <a href={`mailto:${bm.email}`} className="text-[11px] text-slate-500 hover:underline flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{bm.email}</span>
                              </a>
                            )}
                            {bm.linkedin_url && (
                              <a href={bm.linkedin_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-700 hover:underline flex items-center gap-1">
                                <Linkedin className="w-3 h-3 shrink-0" />
                                <span>LinkedIn Profile</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. EVENTS TAB */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-700" /> Scheduled Events
                    </h4>
                    {upcomingEvents.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                        No upcoming events currently scheduled.
                      </div>
                    ) : (
                      upcomingEvents.map((ev) => (
                        <div key={ev.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">Upcoming</span>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{ev.title}</h5>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              📅 {new Date(ev.event_date).toLocaleString()} • 📍 {ev.location}
                            </p>
                          </div>
                          {ev.registration_url && (
                            <a
                              href={ev.registration_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-[#2F6FEB] hover:bg-blue-700 text-white rounded-md text-xs font-semibold whitespace-nowrap shadow-xs"
                            >
                              Register Now
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Past Events */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past Events Archive</h4>
                    {pastEvents.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50/60 rounded-lg border border-slate-200 text-slate-400 text-xs">
                        No past events recorded.
                      </div>
                    ) : (
                      pastEvents.map((ev) => (
                        <div key={ev.id} className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 text-xs">{ev.title}</span>
                            <span className="text-slate-500">{new Date(ev.event_date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-600">{ev.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 4. ANNOUNCEMENTS TAB */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-blue-700" /> Club Announcements
                  </h4>
                  {announcements.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                      No announcements posted.
                    </div>
                  ) : (
                    announcements.map((ann) => (
                      <div key={ann.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded uppercase">
                              {ann.category || 'General'}
                            </span>
                            {ann.is_pinned && (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                                Pinned Notice
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">{ann.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
