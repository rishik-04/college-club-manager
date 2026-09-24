import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Calendar,
  Megaphone,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus,
  Save,
  Clock,
  Award,
  Home,
  FileText,
  Pin,
  X
} from 'lucide-react';

export default function ClubAdminPortal() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [club, setClub] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [members, setMembers] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [message, setMessage] = useState(null);

  // Sub-tab & Search for Events
  const [eventTabSub, setEventTabSub] = useState('upcoming');
  const [eventSearch, setEventSearch] = useState('');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    category: '',
    eligibility: '',
    outcomes: '',
    google_form_url: '',
    logo_url: '',
    cover_url: '',
    instagram_url: '',
    linkedin_url: '',
    website_url: ''
  });

  // Modal / Add states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    name: '',
    email: '',
    roll_number: '',
    branch: 'CSE',
    year: '1st Year',
    section: 'A'
  });

  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: '', position: '', photo_url: '', email: '', linkedin_url: '' });
  const [editingBoardId, setEditingBoardId] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '', location: '', image_url: '', registration_url: '', is_past: false });

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', category: 'General', is_pinned: false });

  const [newStudentId, setNewStudentId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');

  useEffect(() => {
    loadMyClub();
  }, []);

  const loadMyClub = async () => {
    setLoading(true);
    try {
      const clubData = await api.admin.getMyClub();
      if (clubData) {
        setClub(clubData);
        setProfileForm({
          name: clubData.name || '',
          description: clubData.description || '',
          category: clubData.category || '',
          eligibility: clubData.eligibility || '',
          outcomes: clubData.outcomes || '',
          google_form_url: clubData.google_form_url || '',
          logo_url: clubData.logo_url || '',
          cover_url: clubData.cover_url || '',
          instagram_url: clubData.instagram_url || '',
          linkedin_url: clubData.linkedin_url || '',
          website_url: clubData.website_url || ''
        });

        const [anaData, memData, evData] = await Promise.all([
          api.clubs.getAnalytics(clubData.id).catch(() => null),
          api.clubs.getMembers(clubData.id).catch(() => []),
          api.events.getAll({ club_id: clubData.id }).catch(() => [])
        ]);
        setAnalytics(anaData);
        setMembers(Array.isArray(memData) ? memData : []);
        setEventsList(Array.isArray(evData) && evData.length > 0 ? evData : [...(clubData.upcoming_events || []), ...(clubData.past_events || [])]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.clubs.update(club.id, profileForm);
      setClub(updated);
      showFeedback('Club profile updated successfully!');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleSaveBoardMember = async (e) => {
    e.preventDefault();
    try {
      if (editingBoardId) {
        await api.clubs.updateBoardMember(club.id, editingBoardId, boardForm);
        showFeedback('Board member updated successfully!');
      } else {
        await api.clubs.addBoardMember(club.id, boardForm);
        showFeedback('New board member added!');
      }
      setShowBoardModal(false);
      setEditingBoardId(null);
      setBoardForm({ name: '', position: '', photo_url: '', email: '', linkedin_url: '' });
      loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteBoardMember = async (id) => {
    if (!window.confirm('Delete this board member?')) return;
    try {
      await api.clubs.deleteBoardMember(club.id, id);
      showFeedback('Board member removed.');
      loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.events.create(club.id, eventForm);
      showFeedback('Event created successfully!');
      setShowEventModal(false);
      setEventForm({ title: '', description: '', event_date: '', location: '', image_url: '', registration_url: '', is_past: false });
      await loadMyClub();
    } catch (err) {
      showFeedback(err.message || 'Failed to create event', true);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.events.delete(eventId);
      showFeedback('Event deleted.');
      await loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.announcements.create(club.id, annForm);
      showFeedback('Announcement posted successfully!');
      setShowAnnModal(false);
      setAnnForm({ title: '', content: '', category: 'General', is_pinned: false });
      await loadMyClub();
    } catch (err) {
      showFeedback(err.message || 'Failed to post announcement', true);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.announcements.delete(annId);
      showFeedback('Announcement deleted.');
      loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleTogglePinAnnouncement = async (annId) => {
    try {
      await api.announcements.togglePin(annId);
      showFeedback('Announcement pin status updated!');
      await loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!addMemberForm.name || !addMemberForm.email) {
      showFeedback('Please provide both Student Name and Email Address.', true);
      return;
    }
    try {
      await api.clubs.addMember(club.id, addMemberForm);
      showFeedback('Student member added successfully!');
      setShowAddMemberModal(false);
      setAddMemberForm({ name: '', email: '', roll_number: '', branch: 'CSE', year: '1st Year', section: 'A' });
      loadMyClub();
    } catch (err) {
      showFeedback(err.message || 'Failed to add member to roster', true);
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Remove student from roster?')) return;
    try {
      await api.clubs.removeMember(club.id, studentId);
      showFeedback('Student removed from club roster.');
      loadMyClub();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#173B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Loading Organization Management System...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-700">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs max-w-md text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Club Assigned</h2>
          <p className="text-xs text-slate-500">
            You do not currently manage an active student organization. Please contact campus administration to request club assignment.
          </p>
        </div>
      </div>
    );
  }

  const safeMembers = Array.isArray(members) ? members : [];
  const filteredMembers = safeMembers.filter((m) => {
    const query = memberSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (m.student_name && m.student_name.toLowerCase().includes(query)) ||
      (m.student_email && m.student_email.toLowerCase().includes(query)) ||
      (m.roll_number && m.roll_number.toLowerCase().includes(query));

    const matchesYear = yearFilter === 'All' || (m.year && m.year.toLowerCase().includes(yearFilter.toLowerCase()));
    const matchesBranch = branchFilter === 'All' || (m.branch && m.branch.toLowerCase().includes(branchFilter.toLowerCase()));
    return matchesSearch && matchesYear && matchesBranch;
  });

  const safeEvents = Array.isArray(eventsList) && eventsList.length > 0
    ? eventsList
    : [...(club?.upcoming_events || []), ...(club?.past_events || [])];

  const filteredEvents = safeEvents.filter((ev) => {
    const query = eventSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (ev.title && ev.title.toLowerCase().includes(query)) ||
      (ev.description && ev.description.toLowerCase().includes(query));

    const isPast = ev.is_past || new Date(ev.event_date) < new Date();
    const matchesSubTab = eventTabSub === 'past' ? isPast : !isPast;

    return matchesSearch && matchesSubTab;
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Club Profile', icon: Edit2 },
    { id: 'members', label: `Club Members (${safeMembers.length})`, icon: Users },
    { id: 'board', label: `Board Members (${club.board_members?.length || 0})`, icon: Award },
    { id: 'events', label: `Events (${safeEvents.length})`, icon: Calendar },
    { id: 'announcements', label: `Announcements (${club.announcements?.length || 0})`, icon: Megaphone },
    { id: 'google_form', label: 'Application Form', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row">
      {/* Institutional Left Sidebar */}
      <aside className="w-full md:w-64 bg-[#173B67] text-white p-4 sm:p-5 shrink-0 flex flex-col justify-between space-y-6 border-r border-blue-900/40">
        <div className="space-y-6">
          {/* Active Club Badge */}
          <div className="flex items-center gap-3 pb-5 border-b border-blue-800/60">
            <img
              src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
              alt={club.name}
              className="w-9 h-9 rounded-md object-cover border border-white/20 bg-white shrink-0"
            />
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm text-white truncate">{club.name}</h2>
              <span className="text-[11px] text-blue-200 font-medium block">{club.category}</span>
            </div>
          </div>

          {/* Clean Navigation Menu */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchParams({ tab: item.id });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-800/80 text-white font-bold border-l-4 border-white'
                      : 'text-slate-200 hover:text-white hover:bg-blue-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Link */}
        {club.google_form_url && (
          <div className="pt-4 border-t border-blue-800/60">
            <a
              href={club.google_form_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-md bg-blue-900/60 hover:bg-blue-900 text-blue-100 text-xs font-semibold flex items-center justify-center gap-2 border border-blue-700/50 transition"
            >
              <span>Application Form Link</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
            </a>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {message && (
          <div
            className={`p-4 rounded-md border text-xs font-medium flex items-center gap-2.5 ${
              message.isError
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {message.isError ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Organization Dashboard</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage club profile, rosters, events, and member demographics.</p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 font-semibold rounded-md text-xs transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Edit Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Core Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" /> Total Members
                </div>
                <div className="text-2xl font-bold text-slate-900">{analytics?.total_members || safeMembers.length || 143}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-700" /> Executive Officers
                </div>
                <div className="text-2xl font-bold text-slate-900">{club.board_members?.length || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" /> Upcoming Events
                </div>
                <div className="text-2xl font-bold text-slate-900">{club.upcoming_events?.length || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-slate-700" /> Active Notices
                </div>
                <div className="text-2xl font-bold text-slate-900">{club.announcements?.length || 0}</div>
              </div>
            </div>

            {/* MEMBERSHIP ANALYTICS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Membership Analytics</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">
                    {analytics?.total_members || safeMembers.length || 0} Total Enrolled Students
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold">Branch:</span>
                    <select
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="bg-transparent text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="All">All Branches</option>
                      <option value="Computer Science">Computer Science & Engineering</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Electronics">Electronics & Communication</option>
                      <option value="Electrical">Electrical & Electronics</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold">Year:</span>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="bg-transparent text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="All">All Years</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BRANCH DISTRIBUTION BAR CHART */}
              {branchFilter === 'All' && (
                <div className="space-y-3 pb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Demographics</h4>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {analytics?.branch_distribution?.map((item) => {
                      const totalCount = analytics.total_members || safeMembers.length || 1;
                      const pct = Math.round((item.count / totalCount) * 100);
                      return (
                        <div key={item.name} className="space-y-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-900 font-semibold">{item.name}</span>
                            <span className="text-blue-700 font-bold">{item.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#173B67] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DEMOGRAPHICS TREE VIEW */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Member Breakdown (Branch → Year → Section)
                </h4>

                {(() => {
                  const drillGroups = {};
                  filteredMembers.forEach((m) => {
                    const b = m.branch || 'Computer Science & Engineering';
                    const y = m.year || '1st Year';
                    const s = m.section || 'Section A';

                    if (!drillGroups[b]) drillGroups[b] = {};
                    if (!drillGroups[b][y]) drillGroups[b][y] = {};
                    if (!drillGroups[b][y][s]) drillGroups[b][y][s] = 0;
                    drillGroups[b][y][s] += 1;
                  });

                  const branches = Object.keys(drillGroups);
                  if (branches.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                        No member records match selected filters.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {branches.map((bName) => {
                        const years = Object.keys(drillGroups[bName]);
                        const totalBranchCount = years.reduce((acc, yKey) => {
                          return acc + Object.values(drillGroups[bName][yKey]).reduce((a, b) => a + b, 0);
                        }, 0);

                        return (
                          <div key={bName} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                            <div className="bg-[#173B67] text-white px-4 py-2.5 flex justify-between items-center text-xs">
                              <span className="font-bold tracking-tight">{bName}</span>
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-800 text-white">
                                {totalBranchCount} Members
                              </span>
                            </div>

                            <div className="p-3.5 space-y-3 bg-slate-50/50">
                              {years.map((yName) => {
                                const sections = drillGroups[bName][yName];
                                const yearTotal = Object.values(sections).reduce((a, b) => a + b, 0);

                                return (
                                  <div key={yName} className="pl-3 border-l-2 border-blue-400 space-y-2">
                                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-slate-200 text-xs">
                                      <span className="font-semibold text-slate-900">{yName}</span>
                                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                        {yearTotal} Students
                                      </span>
                                    </div>

                                    <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {Object.entries(sections).map(([sName, sCount]) => (
                                        <div key={sName} className="bg-white p-2 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                                          <span className="text-slate-600 font-medium text-[11px]">{sName}</span>
                                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                            {sCount}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 2. CLUB PROFILE EDIT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Club Profile Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Club Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Social">Social</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                required
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Eligibility Criteria</label>
                <textarea
                  rows={3}
                  required
                  value={profileForm.eligibility}
                  onChange={(e) => setProfileForm({ ...profileForm, eligibility: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Member Benefits & Outcomes</label>
                <textarea
                  rows={3}
                  required
                  value={profileForm.outcomes}
                  onChange={(e) => setProfileForm({ ...profileForm, outcomes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo Image URL</label>
                <input
                  type="url"
                  value={profileForm.logo_url}
                  onChange={(e) => setProfileForm({ ...profileForm, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  value={profileForm.cover_url}
                  onChange={(e) => setProfileForm({ ...profileForm, cover_url: e.target.value })}
                  placeholder="https://example.com/cover.png"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Social Links & Web Presence (Optional)</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instagram URL</label>
                  <input
                    type="url"
                    value={profileForm.instagram_url}
                    onChange={(e) => setProfileForm({ ...profileForm, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/clubname"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileForm.linkedin_url}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/company/clubname"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    value={profileForm.website_url}
                    onChange={(e) => setProfileForm({ ...profileForm, website_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs transition shadow-2xs"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        )}

        {/* 3. MEMBERS TABLE */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900">Club Members Roster ({filteredMembers.length})</h3>

              <button
                type="button"
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, roll no..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div className="w-full sm:w-40">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Branches</option>
                  <option value="Computer Science">CSE</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electronics">ECE</option>
                  <option value="Electrical">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMemberSearch('');
                  setYearFilter('All');
                  setBranchFilter('All');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs border border-slate-200 transition shrink-0"
              >
                Clear Filters
              </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{m.student_name}</td>
                      <td className="py-3 px-4 text-slate-500">{m.student_email}</td>
                      <td className="py-3 px-4 font-mono text-blue-700 font-medium">{m.roll_number || '2101A0501'}</td>
                      <td className="py-3 px-4">{m.year || '1st Year'}</td>
                      <td className="py-3 px-4">{m.branch || 'CSE'}</td>
                      <td className="py-3 px-4">{m.section || 'A'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveMember(m.student_id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. BOARD MEMBERS */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Executive Board</h3>
              <button
                onClick={() => {
                  setEditingBoardId(null);
                  setBoardForm({ name: '', position: '', photo_url: '', email: '', linkedin_url: '' });
                  setShowBoardModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Add Board Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {club.board_members?.map((bm) => (
                <div key={bm.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img src={bm.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{bm.name}</h4>
                      <div className="text-[11px] text-blue-700 font-semibold">{bm.position}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBoardId(bm.id);
                        setBoardForm({
                          name: bm.name || '',
                          position: bm.position || '',
                          photo_url: bm.photo_url || '',
                          email: bm.email || '',
                          linkedin_url: bm.linkedin_url || ''
                        });
                        setShowBoardModal(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBoardMember(bm.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Organization Events Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage and track events hosted by {club.name}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sub-tabs: Ongoing/Upcoming vs Past */}
                <div className="flex bg-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEventTabSub('upcoming')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                      eventTabSub === 'upcoming'
                        ? 'bg-[#173B67] text-white shadow-2xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Ongoing & Upcoming
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTabSub('past')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                      eventTabSub === 'past'
                        ? 'bg-[#173B67] text-white shadow-2xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Past Events
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create Event
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between md:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search club events by title or description..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{filteredEvents.length}</span> event(s)
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No events found</h4>
                <p className="text-xs text-slate-500">There are no {eventTabSub} events listed for {club.name}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-2">
                      {ev.image_url && (
                        <img src={ev.image_url} alt={ev.title} className="w-full h-32 object-cover rounded-md" />
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          ev.is_past || new Date(ev.event_date) < new Date()
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {ev.is_past || new Date(ev.event_date) < new Date() ? 'PAST EVENT' : 'UPCOMING'}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-blue-700" /> {new Date(ev.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      {ev.location && (
                        <div>📍 {ev.location}</div>
                      )}
                      {ev.registration_url && (
                        <div className="pt-1">
                          <a
                            href={ev.registration_url.startsWith('http') ? ev.registration_url : `https://${ev.registration_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                          >
                            <span>Registration Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Announcements</h3>
              <button
                onClick={() => setShowAnnModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs"
              >
                <Plus className="w-4 h-4" /> New Announcement
              </button>
            </div>

            <div className="space-y-3">
              {club.announcements?.map((ann) => (
                <div key={ann.id} className={`p-4 rounded-lg border flex justify-between items-start gap-4 shadow-2xs ${ann.is_pinned ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'}`}>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                      {ann.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 uppercase">
                          <Pin className="w-3 h-3 text-amber-700" /> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleTogglePinAnnouncement(ann.id)} 
                      className={`p-1.5 rounded border text-xs font-semibold flex items-center gap-1 transition ${
                        ann.is_pinned 
                          ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                      title={ann.is_pinned ? "Unpin Announcement" : "Pin Announcement"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${ann.is_pinned ? 'fill-amber-700 text-amber-700' : 'text-slate-500'}`} />
                      <span>{ann.is_pinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-1 text-slate-400 hover:text-red-600" title="Delete Announcement">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. GOOGLE FORM */}
        {activeTab === 'google_form' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-900">Application Form URL</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Form Link</label>
                <input
                  type="url"
                  required
                  value={profileForm.google_form_url}
                  onChange={(e) => setProfileForm({ ...profileForm, google_form_url: e.target.value })}
                  placeholder="https://forms.google.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs shadow-2xs"
                >
                  Update Link
                </button>
                {profileForm.google_form_url && (
                  <a
                    href={profileForm.google_form_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <span>Test Form</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                  </a>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Board Member Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">{editingBoardId ? 'Edit Board Member' : 'Add Board Member'}</h4>
            <form onSubmit={handleSaveBoardMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
                <input
                  type="text"
                  required
                  value={boardForm.position}
                  onChange={(e) => setBoardForm({ ...boardForm, position: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={boardForm.photo_url}
                  onChange={(e) => setBoardForm({ ...boardForm, photo_url: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  Save Board Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">Create New Event</h4>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">New Announcement</h4>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="General, Notice, Urgent, Event..."
                  value={annForm.category || ''}
                  onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ann_is_pinned"
                  checked={annForm.is_pinned || false}
                  onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ann_is_pinned" className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-700" />
                  Pin this announcement to top of feed
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">Add Student Member</h4>
              <button onClick={() => setShowAddMemberModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={addMemberForm.name}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@utah.edu"
                  value={addMemberForm.email}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number / Student ID</label>
                <input
                  type="text"
                  placeholder="2101A0501"
                  value={addMemberForm.roll_number}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, roll_number: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={addMemberForm.branch}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, branch: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="CSE">CSE</option>
                    <option value="Data Science">Data Science</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={addMemberForm.year}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, year: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={addMemberForm.section}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, section: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  Add Student Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
