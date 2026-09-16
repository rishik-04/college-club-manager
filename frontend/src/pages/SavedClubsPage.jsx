import React, { useState, useEffect } from 'react';
import { Bookmark, Compass, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClubCard from '../components/ClubCard';

export default function SavedClubsPage({ onSelectClub, onToggleSave, savedClubIds, onExplore }) {
  const { user } = useAuth();
  const [savedClubs, setSavedClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSaved();
    } else {
      setLoading(false);
    }
  }, [user, savedClubIds]);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await api.saved.getAll();
      setSavedClubs(data.map((item) => item.club));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
          <Bookmark className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sign in to Save Clubs</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Log in with your student account to bookmark clubs, track recruitment deadlines, and manage direct applications.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-sky-600" /> My Saved Clubs Shortlist
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Clubs ({savedClubs.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quickly review requirements, recruitment deadlines, and direct application links for your saved clubs.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading your saved clubs...</p>
        </div>
      ) : savedClubs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No saved clubs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Save clubs you're interested in and they'll appear here for quick access and direct recruitment application.
            </p>
          </div>
          <button
            onClick={onExplore}
            className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition inline-flex items-center gap-2 shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Explore Clubs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onSelect={onSelectClub}
              onToggleSave={onToggleSave}
              isSaved={true}
              savedCount={club.saved_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
