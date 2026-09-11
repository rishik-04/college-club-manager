import React, { useState, useEffect } from 'react';
import { Heart, Compass, ArrowRight, ExternalLink } from 'lucide-react';
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
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sign in to Save Clubs</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Log in with your student account to bookmark clubs, track application deadlines, and get tailored notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="w-4 h-4 fill-current" /> My Personal Shortlist
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Clubs ({savedClubs.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quickly review requirements, deadlines, and direct recruitment links for your bookmarked clubs.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading your saved clubs...</p>
        </div>
      ) : savedClubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Heart className="w-12 h-12 text-slate-200 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You haven't saved any clubs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse the catalog and tap the heart icon on any club card to save it here for fast access.
          </p>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Campus Clubs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
