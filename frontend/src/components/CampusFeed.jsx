import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Pin, 
  Plus, 
  X, 
  Calendar, 
  Sparkles, 
  Tag, 
  Clock, 
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CampusFeed({ onShowToast, onSelectClub }) {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [clubId, setClubId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, clubData] = await Promise.all([
        api.announcements.getAll(),
        api.clubs.getAll()
      ]);
      setAnnouncements(annData);
      setClubs(clubData);
      if (clubData.length > 0) setClubId(clubData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.announcements.create(parseInt(clubId), {
        title,
        content,
        category,
        is_pinned: isPinned
      });
      onShowToast('Announcement published to campus feed!');
      setModalOpen(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.announcements.delete(id);
      onShowToast('Announcement removed');
      loadData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
            <Megaphone className="w-4 h-4" /> Live Campus Broadcast
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Club Newsfeed & Bulletins
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates, audition results, workshop venue changes, and competition announcements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
          </button>
        )}
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading campus newsfeed...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No announcements posted yet</h3>
          <p className="text-xs text-slate-400 mt-1">Check back soon for news from campus clubs!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-3xl p-6 border transition-all ${
                ann.is_pinned
                  ? 'border-amber-300 shadow-md bg-gradient-to-r from-amber-50/30 to-white'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Header: Club Logo, Name & Time */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={ann.club_logo || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <div>
                    <button
                      onClick={() => onSelectClub && onSelectClub(ann.club_id)}
                      className="font-bold text-sm text-slate-900 hover:text-sky-600 transition"
                    >
                      {ann.club_name}
                    </button>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ann.is_pinned && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned Bulletin
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    {ann.category}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                {ann.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4">
              Post Campus Announcement
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Club *</label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  placeholder="e.g. Spring Auditions Location Update"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Event">Event Update</option>
                    <option value="Urgent">Urgent Notice</option>
                  </select>
                </div>
                <div className="flex items-center pt-5 gap-2">
                  <input
                    type="checkbox"
                    id="pin"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <label htmlFor="pin" className="text-xs font-semibold text-slate-700">
                    Pin to Top
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 leading-relaxed"
                  placeholder="Write the message to students..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
