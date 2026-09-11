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
    <div className="space-y-4 mb-8">
      {/* Search Input and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name, technology, mission or outcome..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
          <span className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            Showing <strong className="text-slate-800">{totalClubs}</strong> Clubs
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
