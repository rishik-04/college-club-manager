import React, { useState, useEffect } from 'react';
import { Bookmark, Compass } from 'lucide-react';
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
      if (Array.isArray(data)) {
        setSavedClubs(data.map((item) => item.club).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3 shadow-2xs">
        <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Sign in to view saved clubs</h3>
        <p className="text-xs text-slate-500">
          Sign in with your student account to bookmark and manage your favorite clubs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Saved Clubs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Clubs you've bookmarked for quick access and updates.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#173B67] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading saved clubs...</p>
        </div>
      ) : savedClubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3 shadow-2xs">
          <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">You haven't saved any clubs yet.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore active student organizations and save them for quick access.
          </p>
          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122E52] transition inline-flex items-center gap-2 mt-2 shadow-2xs"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Clubs Directory</span>
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
