import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  Bookmark,
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentLayout({ children, onOpenAssistant }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPath = location.pathname;

  const sidebarLinks = [
    { label: 'Explore', icon: Search, path: '/explore' },
    { label: 'Events', icon: Calendar, path: '/events' },
    { label: 'My Clubs', icon: Users, path: '/my-clubs' },
    { label: 'Saved', icon: Bookmark, path: '/saved' },
    { label: 'Club Match', icon: Sparkles, path: '/match' },
    { label: 'Ask about clubs', icon: MessageSquare, action: onOpenAssistant },
    { label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FA] text-slate-800 flex">
      {/* Left Vertical Dark Navy Sidebar (Screen 2 Layout) */}
      <aside className="w-56 bg-[#0B1B3A] shrink-0 hidden lg:flex lg:flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold px-2 pb-4 border-b border-white/10 text-sm">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Campus Clubs</span>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.path && (currentPath === item.path || (item.path === '/explore' && currentPath === '/clubs'));

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2F6FEB] text-white shadow-xs font-bold'
                      : 'text-[#B9C4DE] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8FA6D6]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout / Authentication Action */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/roles');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-white/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout ({user.name?.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/student-login')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-300 hover:text-white hover:bg-white/10 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
