import React from 'react';
import { Search, Users, Calendar, Sparkles, Filter } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import ClubCard from '../components/ClubCard';
import AnnouncementsFeed from '../components/AnnouncementsFeed';

export default function ExplorePage({
  clubs = [],
  search = '',
  setSearch,
  selectedCategory = 'All',
  setSelectedCategory,
  onSelectClub,
  onToggleSave,
  savedClubIds = new Set()
}) {
  const safeClubs = Array.isArray(clubs) ? clubs : [];

  return (
    <div className="space-y-8">
      {/* 🏛️ Utah Campus Connect Hero Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 border border-slate-200">
        {/* Campus Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80')`
          }}
        />

        {/* Hero Content Overlay */}
        <div className="relative z-10 py-12 px-6 sm:px-12 text-center text-white max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-red-300">
              UNIVERSITY STUDENT ENGAGEMENT PORTAL
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Discover unique opportunities at College Club Manager
            </h1>
          </div>

          {/* Prominent Search Bar (Utah Campus Connect style) */}
          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-white/40 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Events, Organizations, and Campus News..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none px-2"
            />
            <button
              onClick={() => {}}
              className="px-5 py-2.5 bg-[#CC0000] hover:bg-[#B30000] text-white font-bold text-xs uppercase tracking-wider rounded transition shrink-0 shadow-2xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* 3 Quick Feature Overview Cards (Utah Campus Connect Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#CC0000] mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 border-b-2 border-[#CC0000] pb-1 inline-block">
            Find Organizations
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Join a student organization and build lasting connections across campus departments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#CC0000] mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 border-b-2 border-[#CC0000] pb-1 inline-block">
            Attend Events
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Discover workshops, hackathons, guest lectures, and activities happening across campus.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#CC0000] mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 border-b-2 border-[#CC0000] pb-1 inline-block">
            Track Involvement
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Get personalized club recommendations matched to your branch, section, and skills.
          </p>
        </div>
      </div>

      {/* Directory Section Header */}
      <div className="space-y-1 pt-4 border-t border-slate-200">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Campus Organizations</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {safeClubs.length} Active
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Browse and filter official university student organizations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalClubs={safeClubs.length}
      />

      {/* Main Grid + Announcements Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Penn Clubs Style Club Cards */}
        <div className="lg:col-span-3 space-y-6">
          {safeClubs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-2xs">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No clubs found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search terms or category filter to explore all available campus clubs.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 rounded text-xs font-bold text-white bg-[#CC0000] hover:bg-[#B30000] transition shadow-2xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {safeClubs.map((club) => (
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

        {/* Right Column: Georgia Tech Engage Style Announcements Widget */}
        <div className="lg:col-span-1">
          <AnnouncementsFeed />
        </div>
      </div>
    </div>
  );
}
