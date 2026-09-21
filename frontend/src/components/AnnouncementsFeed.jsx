import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Bell } from 'lucide-react';
import { api } from '../services/api';

export default function AnnouncementsFeed({ clubId = null }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [clubId]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.announcements.getAll({ club_id: clubId });
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-xs">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading campus notices...</p>
      </div>
    );
  }

  if (safeAnnouncements.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center">
        <p className="text-xs text-slate-500">No active campus notices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest News Container (Georgia Tech Engage Style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-red-50 text-[#CC0000] border border-red-100">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                Latest Campus News
              </h3>
              <p className="text-[11px] text-slate-500">
                Official announcements & notices
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#CC0000] border border-red-200 uppercase">
            {safeAnnouncements.length} {safeAnnouncements.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        <div className="space-y-3">
          {safeAnnouncements.map((ann) => (
            <div 
              key={ann.id} 
              className={`p-3.5 rounded-lg border transition relative ${
                ann.is_pinned 
                  ? 'bg-amber-50/70 border-amber-200' 
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/90'
              }`}
            >
              {ann.is_pinned && (
                <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 uppercase">
                  <Pin className="w-3 h-3 text-amber-700" />
                  Pinned
                </span>
              )}

              <div className="flex items-start gap-2.5">
                {ann.club_logo ? (
                  <img
                    src={ann.club_logo}
                    alt={ann.club_name}
                    className="w-8 h-8 rounded object-cover border border-slate-200 bg-white shrink-0 mt-0.5 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-[#CC0000] font-bold text-xs shrink-0 mt-0.5 border border-red-100">
                    <Bell className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#CC0000] truncate">{ann.club_name}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Links Sidebar Card (Georgia Tech Engage style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Campus Links
        </h4>
        <ul className="space-y-2 text-xs font-medium">
          <li>
            <a href="/explore" className="text-slate-700 hover:text-[#CC0000] flex items-center justify-between py-1 transition">
              <span>Center for Student Engagement</span>
              <span className="text-slate-400">↗</span>
            </a>
          </li>
          <li>
            <a href="/events" className="text-slate-700 hover:text-[#CC0000] flex items-center justify-between py-1 transition">
              <span>Campus Event Calendar</span>
              <span className="text-slate-400">↗</span>
            </a>
          </li>
          <li>
            <a href="/match" className="text-slate-700 hover:text-[#CC0000] flex items-center justify-between py-1 transition">
              <span>Club Recommendation Algorithm</span>
              <span className="text-slate-400">↗</span>
            </a>
          </li>
          <li>
            <a href="/my-clubs" className="text-slate-700 hover:text-[#CC0000] flex items-center justify-between py-1 transition">
              <span>Student Organization Involvement</span>
              <span className="text-slate-400">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
