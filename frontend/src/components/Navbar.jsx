import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Crown,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAuth, 
  savedCount = 0,
  onOpenAssistant
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.announcements.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, is_read: true })) : []));
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => (n && n.id === id ? { ...n, is_read: true } : n)) : []));
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => n && !n.is_read).length : 0;

  const isClubAdmin = user?.role === 'CLUB_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Institutional Role-Based Navigation Items
  const navItems = [
    { id: 'explore', label: 'Clubs', icon: Compass, path: '/explore' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
  ];

  if (!isClubAdmin && !isSuperAdmin) {
    navItems.push({ id: 'my-clubs', label: 'My Clubs', icon: ShieldCheck, path: '/my-clubs' });
    navItems.push({ 
      id: 'saved', 
      label: 'Saved', 
      icon: Bookmark, 
      path: '/saved',
      badge: savedCount > 0 ? savedCount : null 
    });
    navItems.push({ id: 'match', label: 'Club Match', icon: Sparkles, path: '/match' });
  } else if (isClubAdmin) {
    navItems.push({ id: 'club-admin', label: 'Club Admin', icon: ShieldCheck, path: '/club-admin' });
  } else if (isSuperAdmin) {
    navItems.push({ id: 'super-admin', label: 'Campus Admin', icon: Crown, path: '/super-admin' });
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-t-4 border-[#CC0000] border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Institutional Logo (Utah Campus Connect style) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setActiveTab('explore');
              navigate('/explore');
            }}
          >
            <div className="w-9 h-9 rounded bg-[#CC0000] flex items-center justify-center text-white font-black text-lg shadow-2xs group-hover:bg-[#B30000] transition">
              CC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  Campus <span className="text-[#CC0000]">Connect</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  UUtah Style
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 block -mt-1 tracking-wider uppercase">
                College Club Manager
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
                  className={`flex items-center gap-2 px-4 h-full text-xs uppercase font-bold tracking-wider transition relative ${
                    isActive
                      ? 'text-[#CC0000] border-b-2 border-[#CC0000]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#CC0000]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#CC0000] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/explore')} 
              className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (dropdownOpen) setDropdownOpen(false);
                }}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#CC0000] rounded-full shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-slate-900"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-[#CC0000] border border-red-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#CC0000] hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        You're all caught up.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-3 text-xs flex gap-3 cursor-pointer transition ${
                            n.is_read ? 'bg-white hover:bg-slate-50 text-slate-500' : 'bg-red-50/40 hover:bg-red-50 text-slate-900 font-medium'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-[#CC0000]'}`} />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-[#CC0000] truncate">{n.club_name}</span>
                              <span className="text-slate-400">{n.type === 'announcement' ? 'Notice' : 'Event'}</span>
                            </div>
                            <div className="font-bold text-slate-900 line-clamp-1">{n.title}</div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown or Utah-Style Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition border border-slate-300"
                >
                  <div className="w-6 h-6 rounded bg-[#CC0000] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-slate-900"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </button>

                    {isClubAdmin && (
                      <button
                        onClick={() => navigate('/club-admin')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-[#CC0000] hover:bg-red-50 flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
                        Club Admin Portal
                      </button>
                    )}

                    {isSuperAdmin && (
                      <button
                        onClick={() => navigate('/super-admin')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-900 hover:bg-slate-100 flex items-center gap-2.5"
                      >
                        <Crown className="w-4 h-4 text-slate-700" />
                        Campus Admin Console
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/roles');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/student-login')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#CC0000] hover:bg-[#B30000] rounded transition shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                SIGN IN
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
