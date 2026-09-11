import React from 'react';
import { Compass, Sparkles, Trophy, Users, Rocket, Calendar } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import ClubCard from '../components/ClubCard';

export default function ExplorePage({
  clubs,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  onSelectClub,
  onToggleSave,
  savedClubIds,
  onOpenMatch
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 text-white">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Rocket className="w-3.5 h-3.5 text-sky-400" />
            2026 CAMPUS RECRUITMENT SEASON IS LIVE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Discover Your Community. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
              Build Skills, Lead & Shine.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Explore 50+ college clubs across technical, cultural, sports, and entrepreneurship domains. Check upcoming events, meet executive boards, and submit your official application today.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenMatch}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 flex items-center gap-2 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Find Clubs by My Interests
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-gradient-to-tr from-sky-600/30 to-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalClubs={clubs.length}
      />

      {/* Club Cards Grid */}
      {clubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No clubs found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try searching for a different keyword or switch the category filter above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onSelect={onSelectClub}
              onToggleSave={onToggleSave}
              isSaved={savedClubIds.has(club.id)}
              savedCount={club.saved_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
