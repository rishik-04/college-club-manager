import React from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Creative',
  'Social',
  'Entrepreneurship',
  'Others'
];

export default function FilterBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  totalClubs = 0
}) {
  return (
    <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for Organizations, keywords, or skills..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#CC0000] focus:bg-white rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tag Pills (Penn Clubs style) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Category Filter:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-[#CC0000] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter & Sort Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="font-medium text-slate-500">
          Showing <span className="text-slate-900 font-bold">{totalClubs}</span> {totalClubs === 1 ? 'organization' : 'organizations'}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Sort By:</span>
          <div className="relative inline-block">
            <select className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold px-2.5 py-1 pr-6 rounded-md text-xs focus:outline-none appearance-none cursor-pointer hover:bg-slate-100">
              <option value="newest">Newest to Oldest</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
