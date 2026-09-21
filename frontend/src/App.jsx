import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ClubDetailModal from './components/ClubDetailModal';
import AuthModal from './components/AuthModal';
import AskClubAssistant from './components/AskClubAssistant';
import RecommendationModal from './components/RecommendationModal';
import StudentLayout from './components/StudentLayout';

import RoleSelection from './pages/RoleSelection';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import ClubAdminLogin from './pages/ClubAdminLogin';
import AdminLogin from './pages/AdminLogin';

import ExplorePage from './pages/ExplorePage';
import EventsPage from './pages/EventsPage';
import SavedClubsPage from './pages/SavedClubsPage';
import MyClubsPage from './pages/MyClubsPage';
import ProfilePage from './pages/ProfilePage';
import ClubAdminPortal from './pages/ClubAdmin/ClubAdminPortal';
import SuperAdminPortal from './pages/SuperAdmin/SuperAdminPortal';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation & Modals
  const [selectedClubId, setSelectedClubId] = useState(null);
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
      navigate('/student-login');
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

  const isAuthPage = [
    '/roles',
    '/student-login',
    '/student-register',
    '/club-admin-login',
    '/admin-login',
  ].includes(location.pathname);

  // Determine current tab from path for Navbar highlighting
  let currentTab = 'explore';
  if (location.pathname === '/events') currentTab = 'events';
  else if (location.pathname === '/saved') currentTab = 'saved';
  else if (location.pathname === '/match') currentTab = 'match';
  else if (location.pathname === '/club-admin') currentTab = 'club-admin';
  else if (location.pathname === '/super-admin') currentTab = 'super-admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Navbar (hidden on auth & role selection screens) */}
      {!isAuthPage && (
        <Navbar
          activeTab={currentTab}
          setActiveTab={(tab) => {
            if (tab === 'club-admin') navigate('/club-admin');
            else if (tab === 'super-admin') navigate('/super-admin');
            else if (tab === 'events') navigate('/events');
            else if (tab === 'saved') navigate('/saved');
            else if (tab === 'match') navigate('/match');
            else navigate('/explore');
          }}
          onOpenAuth={() => navigate('/student-login')}
          savedCount={savedClubIds.size}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />
      )}

      {/* Main View */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/roles" replace />} />
          <Route path="/roles" element={<RoleSelection />} />

          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/club-admin-login" element={<ClubAdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route
            path="/explore"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <ExplorePage
                  clubs={clubs}
                  search={search}
                  setSearch={setSearch}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onToggleSave={handleToggleSave}
                  savedClubIds={savedClubIds}
                  onOpenMatch={() => navigate('/match')}
                />
              </StudentLayout>
            }
          />

          <Route
            path="/clubs"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <ExplorePage
                  clubs={clubs}
                  search={search}
                  setSearch={setSearch}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onToggleSave={handleToggleSave}
                  savedClubIds={savedClubIds}
                  onOpenMatch={() => navigate('/match')}
                />
              </StudentLayout>
            }
          />

          <Route
            path="/events"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <EventsPage
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onShowToast={showToast}
                />
              </StudentLayout>
            }
          />

          <Route
            path="/saved"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <SavedClubsPage
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onToggleSave={handleToggleSave}
                  savedClubIds={savedClubIds}
                  onExplore={() => navigate('/explore')}
                />
              </StudentLayout>
            }
          />

          <Route
            path="/my-clubs"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <MyClubsPage
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onExplore={() => navigate('/explore')}
                />
              </StudentLayout>
            }
          />

          <Route
            path="/match"
            element={
              <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
                <RecommendationModal
                  onSelectClub={(id) => setSelectedClubId(id)}
                  onToggleSave={handleToggleSave}
                />
              </StudentLayout>
            }
          />

          <Route path="/assistant" element={
            <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
              <div className="py-12 px-4 text-center max-w-xl mx-auto space-y-4">
                <h2 className="text-2xl font-extrabold text-[#0F172A]">AI Club Assistant ✨</h2>
                <p className="text-slate-500 text-xs">Ask any question to discover clubs, events, and eligibility criteria across campus.</p>
                <button
                  onClick={() => setIsAssistantOpen(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-xs"
                >
                  Open AI Assistant Drawer ✨
                </button>
              </div>
            </StudentLayout>
          } />

          <Route path="/profile" element={
            <StudentLayout onOpenAssistant={() => setIsAssistantOpen(true)}>
              <ProfilePage onShowToast={showToast} />
            </StudentLayout>
          } />

          <Route path="/club-admin" element={<ClubAdminPortal />} />
          <Route path="/super-admin" element={<SuperAdminPortal />} />

          <Route path="*" element={<Navigate to="/roles" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-300">
            College Club Manager — Student Discovers ➔ Club Admin Maintains ➔ Main Admin Monitors
          </p>
          <p className="text-slate-500 mt-1">
            FastAPI • SQLAlchemy • React • 3-Tier Governance • Role-Based RBAC • AI Assistant
          </p>
        </footer>
      )}

      {/* Modals & Drawers */}
      {selectedClubId && (
        <ClubDetailModal
          clubId={selectedClubId}
          onClose={() => setSelectedClubId(null)}
          onToggleSave={handleToggleSave}
          isSaved={savedClubIds.has(selectedClubId)}
          savedCount={clubs.find((c) => c.id === selectedClubId)?.saved_count || 0}
        />
      )}

      <AskClubAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectClub={(id) => setSelectedClubId(id)}
      />

      {/* Floating Ask Club Assistant Button (Students Only) */}
      {!isAuthPage && (!user || user?.role === 'STUDENT') && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-indigo-400/30 hover:scale-105 active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Ask Club Assistant ✨
        </button>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
