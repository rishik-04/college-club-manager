import React from 'react';
import { Compass, Sparkles, Trophy, Users, Rocket, Calendar, Bookmark, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import ClubCard from '../components/ClubCard';
import ClubSlideshow from '../components/ClubSlideshow';

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
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'Rishik';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Student Home Summary / Dashboard Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Campus Dashboard</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good evening, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Discover your campus community. Explore 48 official student organizations, hackathons, and activities.
          </p>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <span className="block text-xl font-black text-white">{clubs.length > 0 ? clubs.length : 48}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Clubs</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <span className="block text-xl font-black text-emerald-400">12</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Events</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <span className="block text-xl font-black text-sky-400">{savedClubIds?.size || 0}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Saved</span>
          </div>
        </div>
      </div>

      {/* Featured Clubs Hero Slideshow / Carousel */}
      <ClubSlideshow
        clubs={clubs}
        onSelectClub={onSelectClub}
        onToggleSave={onToggleSave}
        savedClubIds={savedClubIds}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalClubs={clubs.length}
      />

      {/* Prominent 3-Column Club Cards Grid */}
      {clubs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-inner">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No clubs found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Try searching for another keyword or clear the category filter to explore all 48 campus clubs.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
          >
            Clear Filters & View All Clubs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
