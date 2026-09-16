import React from 'react';
import { Bookmark, BookmarkCheck, ArrowRight, Calendar, Users, ExternalLink } from 'lucide-react';

const CATEGORY_COLORS = {
  Technical: 'bg-blue-50 text-blue-700 border-blue-200',
  Cultural: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Social: 'bg-rose-50 text-rose-700 border-rose-200',
  Entrepreneurship: 'bg-amber-50 text-amber-700 border-amber-200',
  Creative: 'bg-pink-50 text-pink-700 border-pink-200',
  Management: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function ClubCard({
  club,
  onSelect,
  onToggleSave,
  isSaved,
  savedCount = 0
}) {
  const categoryStyle = CATEGORY_COLORS[club.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Compact Top Banner Cover Image */}
      <div className="h-24 w-full bg-slate-100 overflow-hidden relative">
        <img
          src={club.cover_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

        {/* Category Badge */}
        <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border backdrop-blur-md shadow-sm ${categoryStyle}`}>
          {club.category}
        </span>

        {/* Bookmark Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(club.id);
          }}
          aria-label="Save club"
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 flex items-center justify-center ${
            isSaved
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-sky-600'
          }`}
          title={isSaved ? "Saved" : "Save Club"}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Title */}
          <div className="flex items-start gap-3 -mt-8 mb-2.5 relative z-10">
            <img
              src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0"
            />
            <div className="pt-3">
              <h3 
                onClick={() => onSelect(club.id)}
                className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition cursor-pointer leading-tight line-clamp-1"
              >
                {club.name}
              </h3>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {club.description}
          </p>

          {/* Upcoming Event Teaser Indicator */}
          {club.next_event_title ? (
            <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-semibold">Next: {club.next_event_title}</span>
            </div>
          ) : (
            <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate italic">Active Campus Club</span>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-700">{savedCount}</strong> saved
          </span>

          <button
            onClick={() => onSelect(club.id)}
            className="py-1.5 px-3.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 transition flex items-center justify-center gap-1 shadow-sm"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
