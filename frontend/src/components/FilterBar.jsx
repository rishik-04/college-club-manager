import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Social',
  'Entrepreneurship',
  'Creative',
  'Management'
];

export default function FilterBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  totalClubs = 0
}) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input and Dynamic Counter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-sky-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name, technology, mission or outcome..."
            className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-extrabold shadow-sm border border-slate-800">
            Showing <span className="text-sky-400 font-black">{totalClubs}</span> Clubs
          </span>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
