import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ClubDetailModal from './components/ClubDetailModal';
import AuthModal from './components/AuthModal';
import AskClubAssistant from './components/AskClubAssistant';
import RecommendationModal from './components/RecommendationModal';
import AdminDashboard from './components/AdminDashboard';
import ApplicationModal from './components/ApplicationModal';
import KanbanBoard from './components/KanbanBoard';
import CampusFeed from './components/CampusFeed';

import ExplorePage from './pages/ExplorePage';
import EventsPage from './pages/EventsPage';
import SavedClubsPage from './pages/SavedClubsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { user } = useAuth();

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('explore'); // explore, feed, events, saved, match, kanban, admin, profile
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [applyingClub, setApplyingClub] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Clubs State
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedClubIds, setSavedClubIds] = useState(new Set());
  const [loadingClubs, setLoadingClubs] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 3500);
  };

  useEffect(() => {
    loadClubs();
  }, [search, selectedCategory, user]);

  const loadClubs = async () => {
    try {
      const data = await api.clubs.getAll({ search, category: selectedCategory });
      setClubs(data);

      const savedIds = new Set(data.filter((c) => c.is_saved).map((c) => c.id));
      setSavedClubIds(savedIds);
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleToggleSave = async (clubId) => {
    if (!user) {
      showToast('Please sign in to save clubs to your shortlist', 'error');
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedClubIds.has(clubId);

    setSavedClubIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(clubId);
      else next.add(clubId);
      return next;
    });

    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            is_saved: !isCurrentlySaved,
            saved_count: isCurrentlySaved ? Math.max(0, c.saved_count - 1) : c.saved_count + 1,
          };
        }
        return c;
      })
    );

    try {
      if (isCurrentlySaved) {
        await api.saved.unsave(clubId);
        showToast('Club removed from your saved list');
      } else {
        await api.saved.save(clubId);
        showToast('Club saved to your shortlist! ❤️');
      }
    } catch (err) {
      showToast(err.message, 'error');
      loadClubs();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        savedCount={savedClubIds.size}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'explore' && (
          <ExplorePage
            clubs={clubs}
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectClub={(id) => setSelectedClubId(id)}
            onToggleSave={handleToggleSave}
            savedClubIds={savedClubIds}
            onOpenMatch={() => setActiveTab('match')}
          />
        )}

        {activeTab === 'feed' && (
          <CampusFeed
            onShowToast={showToast}
            onSelectClub={(id) => setSelectedClubId(id)}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage
            onSelectClub={(id) => setSelectedClubId(id)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'saved' && (
          <SavedClubsPage
            onSelectClub={(id) => setSelectedClubId(id)}
            onToggleSave={handleToggleSave}
            savedClubIds={savedClubIds}
            onExplore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'match' && (
          <RecommendationModal
            onSelectClub={(id) => setSelectedClubId(id)}
            onToggleSave={handleToggleSave}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard onShowToast={showToast} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onShowToast={showToast}
            onRefreshClubs={loadClubs}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage onShowToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          College Club Manager Enterprise Platform — 2026 Edition
        </p>
        <p className="text-slate-400 mt-1">
          FastAPI • SQLAlchemy • React • Recruitment Kanban • Dynamic QR Passes • Newsfeed
        </p>
      </footer>

      {/* Modals & Drawers */}
      {selectedClubId && (
        <ClubDetailModal
          clubId={selectedClubId}
          onClose={() => setSelectedClubId(null)}
          onToggleSave={handleToggleSave}
          isSaved={savedClubIds.has(selectedClubId)}
          savedCount={clubs.find((c) => c.id === selectedClubId)?.saved_count || 0}
          onOpenApply={(club) => setApplyingClub(club)}
        />
      )}

      {applyingClub && (
        <ApplicationModal
          club={applyingClub}
          isOpen={true}
          onClose={() => setApplyingClub(null)}
          onShowToast={showToast}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onShowToast={showToast}
      />

      <AskClubAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectClub={(id) => setSelectedClubId(id)}
      />

      {/* Floating Ask Advisor Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 hover:scale-105 active:scale-95 transition"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        Ask Club Advisor
      </button>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
