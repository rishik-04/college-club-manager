import React, { useState } from 'react';
import { 
  Compass, 
  Calendar, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn,
  GraduationCap,
  Megaphone,
  Kanban,
  Award,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAuth, 
  savedCount = 0,
  onOpenAssistant
}) {
  const { user, logout, isAdmin, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickLogin = async (role) => {
    try {
      if (role === 'student') {
        await login('student@college.edu', 'password123');
      } else {
        await login('admin@college.edu', 'admin123');
      }
      setDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'events', label: 'Events', icon: Calendar },
    { 
      id: 'saved', 
      label: 'Saved', 
      icon: Bookmark, 
      badge: savedCount > 0 ? savedCount : null 
    },
    { id: 'match', label: 'Club Match ✨', icon: Sparkles, highlight: true },
  ];

  if (isAdmin) {
    navItems.push({ id: 'kanban', label: 'Recruitment Kanban', icon: Kanban });
    navItems.push({ id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('explore')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                CAMPUS<span className="text-sky-600">CLUBS</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 block -mt-1 tracking-wider uppercase">
                College Club Manager
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Assistant + User Auth */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/80 rounded-2xl hover:bg-sky-100 transition shadow-sm"
              title="Club Assistant ✨"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span>Club Assistant ✨</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile & Applications
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setActiveTab('kanban')}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-sky-700 hover:bg-sky-50 flex items-center gap-2.5"
                        >
                          <Kanban className="w-4 h-4 text-sky-600" />
                          Recruitment Kanban
                        </button>
                        <button
                          onClick={() => setActiveTab('admin')}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Admin Dashboard
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickLogin('student')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  Student Demo
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  Admin Demo
                </button>
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex lg:hidden border-t border-slate-200 py-2 gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
