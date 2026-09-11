import React from 'react';
import { Heart, ArrowRight, Calendar, Users, ExternalLink } from 'lucide-react';

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
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Banner Cover Image */}
      <div className="h-28 w-full bg-slate-100 overflow-hidden relative">
        <img
          src={club.cover_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Category Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-sm ${categoryStyle}`}>
          {club.category}
        </span>

        {/* Bookmark Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(club.id);
          }}
          aria-label="Save club"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-110'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Title */}
          <div className="flex items-start gap-3.5 -mt-10 mb-3 relative z-10">
            <img
              src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
            />
            <div className="pt-5">
              <h3 
                onClick={() => onSelect(club.id)}
                className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition cursor-pointer leading-tight line-clamp-1"
              >
                {club.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
            {club.description}
          </p>
        </div>

        {/* Footer Meta & Button */}
        <div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <strong className="text-slate-700">{savedCount}</strong> saves
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <strong className="text-slate-700">{club.events_count || 0}</strong> events
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(club.id)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
            >
              Details
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <a
              href={club.google_form_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/20"
            >
              Apply
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
