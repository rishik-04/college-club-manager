import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Bookmark, BookmarkCheck, Users, Calendar } from 'lucide-react';

export default function ClubSlideshow({ clubs, onSelectClub, onToggleSave, savedClubIds }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter top 5 featured clubs
  const featuredClubs = clubs.slice(0, 5);

  useEffect(() => {
    if (featuredClubs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredClubs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredClubs.length]);

  if (!featuredClubs || featuredClubs.length === 0) return null;

  const currentClub = featuredClubs[currentIndex];
  const isSaved = savedClubIds?.has(currentClub.id);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredClubs.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredClubs.length);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl text-white mb-6 group transition-all">
      {/* Reduced Cover Height (25-35% shorter) */}
      <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden">
        <img
          src={currentClub.cover_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80'}
          alt={currentClub.name}
          className="w-full h-full object-cover opacity-45 scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        {/* Top Left Featured Pill */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-6 z-10 flex items-center gap-2">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            FEATURED CLUB
          </span>
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/10 text-white backdrop-blur-md">
            {currentClub.category}
          </span>
        </div>

        {/* Top Right Bookmark Button */}
        <button
          onClick={() => onToggleSave(currentClub.id)}
          className={`absolute top-4 right-4 sm:top-5 sm:right-6 z-10 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition ${
            isSaved 
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
              : 'bg-white/20 text-white hover:bg-white hover:text-slate-900'
          }`}
          title={isSaved ? "Saved" : "Save Club"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Content Box */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4 max-w-2xl">
            <img
              src={currentClub.logo_url}
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl bg-white shrink-0 hidden sm:block"
            />
            <div className="space-y-1">
              <h2 
                onClick={() => onSelectClub(currentClub.id)}
                className="text-2xl sm:text-3xl font-black text-white hover:text-sky-300 cursor-pointer transition leading-tight"
              >
                {currentClub.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-xl">
                {currentClub.description}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectClub(currentClub.id)}
              className="px-6 py-3 rounded-2xl text-xs font-extrabold text-slate-900 bg-white hover:bg-sky-400 hover:text-slate-950 transition shadow-lg flex items-center gap-2"
            >
              Explore Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Arrow Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {featuredClubs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-sky-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
