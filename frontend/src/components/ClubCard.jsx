import React from 'react';
import { Bookmark, BookmarkCheck, ArrowRight, Calendar, Users } from 'lucide-react';
import { ClubCover, ClubLogo } from './ClubMedia';

export default function ClubCard({
  club,
  onSelect,
  onToggleSave,
  isSaved,
  savedCount = 0
}) {
  if (!club) return null;

  return (
    <div 
      onClick={() => onSelect(club.id)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-[#CC0000]/40 hover:shadow-md transition duration-150 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Cover Header */}
      <div className="h-32 w-full relative shrink-0 overflow-hidden bg-slate-100">
        <ClubCover
          src={club.cover_url}
          name={club.name}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
        />

        {/* Category Badge (Penn Clubs soft pill) */}
        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#CC0000] border border-red-200 shadow-2xs z-10">
          {club.category}
        </span>

        {/* Save Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(club.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded transition shadow-2xs z-10 ${
            isSaved
              ? 'bg-[#CC0000] text-white'
              : 'bg-white/95 hover:bg-white text-slate-700 border border-slate-200'
          }`}
          title={isSaved ? "Saved" : "Save organization"}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-start gap-3">
          <ClubLogo src={club.logo_url} name={club.name} className="w-10 h-10 rounded text-xs shrink-0 border border-slate-200 shadow-2xs" />
          <div className="space-y-0.5 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#CC0000] transition truncate">
              {club.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {club.description}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Members info badge (Penn Clubs style) */}
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{savedCount > 0 ? savedCount + 42 : 143} members</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student Org
            </span>
          </div>

          {/* Upcoming Event Badge */}
          {club.next_event_title ? (
            <div className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-[#CC0000] shrink-0" />
                <span className="truncate">{club.next_event_title}</span>
              </div>
              <div className="text-[10px] text-slate-500 pl-4 truncate">
                {club.next_event_date ? new Date(club.next_event_date).toLocaleDateString() : 'Upcoming'}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Active Workshops & Sprints</span>
              </div>
              <div className="text-[10px] text-slate-500 pl-4 truncate">
                Campus Innovation Hub
              </div>
            </div>
          )}

          {/* Primary View Action */}
          <button className="w-full py-2 bg-[#173B67] hover:bg-[#CC0000] text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-2xs">
            <span>View Organization</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
