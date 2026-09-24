import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  BarChart3,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  ExternalLink,
  Home,
  GraduationCap,
  Megaphone,
  Pin,
  Calendar
} from 'lucide-react';
import { ClubLogo } from '../../components/ClubMedia';

export default function SuperAdminPortal() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [message, setMessage] = useState(null);

  // Super Admin Events State
  const [eventSearch, setEventSearch] = useState('');
  const [eventTabSub, setEventTabSub] = useState('upcoming');
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Drill-down Demographics Modal state
  const [selectedClubAnalytics, setSelectedClubAnalytics] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Assign Club Admin Form
  const [assignForm, setAssignForm] = useState({ userId: '', clubId: '' });

  // Create / Edit Club Modal state
  const [showClubModal, setShowClubModal] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: '',
    category: 'Technical',
    description: '',
    eligibility: '',
    outcomes: '',
    google_form_url: '',
    logo_url: '',
    cover_url: ''
  });
  const [editingClubId, setEditingClubId] = useState(null);

  // Create / Edit Announcement Modal & Filters state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState(null);
  const [annAudienceFilter, setAnnAudienceFilter] = useState('All');
  const [annSearch, setAnnSearch] = useState('');
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    category: 'General',
    is_pinned: false,
    audienceType: 'campus',
    club_id: ''
  });

  // Filters
  const [clubSearch, setClubSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userClubFilter, setUserClubFilter] = useState('All');
  const [userBranchFilter, setUserBranchFilter] = useState('All');
  const [userYearFilter, setUserYearFilter] = useState('All');
  const [userSectionFilter, setUserSectionFilter] = useState('All');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, cData, aData, uData, annData, evData] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.clubs.getAll({ include_inactive: true }).catch(() => []),
        api.admin.getAssignments().catch(() => []),
        api.admin.getUsers().catch(() => []),
        api.announcements.getAll().catch(() => []),
        api.events.getAll().catch(() => [])
      ]);
      setStats(sData);
      setClubs(Array.isArray(cData) ? cData : []);
      setAssignments(Array.isArray(aData) ? aData : []);
      setUsersList(Array.isArray(uData) ? uData : []);
      setAnnouncements(Array.isArray(annData) ? annData : []);
      setEvents(Array.isArray(evData) ? evData : []);
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

  const handleToggleClubStatus = async (clubId, currentStatus) => {
    const actionText = currentStatus ? 'deactivate' : 'activate';
    const confirmMsg = currentStatus
      ? 'Deactivate this organization? It will be hidden from student discovery, but all records will be preserved.'
      : 'Activate this organization? It will become visible to students again.';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.clubs.updateStatus(clubId, !currentStatus);
      showFeedback(`Organization ${actionText}d successfully!`);
      loadAllData();
    } catch (err) {
      showFeedback(err.message || `Failed to ${actionText} club`, true);
    }
  };

  const handleOpenDemographics = async (clubId) => {
    try {
      const anaData = await api.clubs.getAnalytics(clubId);
      setSelectedClubAnalytics(anaData);
      setShowDemoModal(true);
    } catch (err) {
      showFeedback('Could not load club demographics: ' + err.message, true);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.clubId) {
      showFeedback('Please select both a student user and a target club.', true);
      return;
    }
    try {
      await api.admin.assignClubAdmin(Number(assignForm.userId), Number(assignForm.clubId));
      showFeedback('Club Admin privileges assigned successfully!');
      setAssignForm({ userId: '', clubId: '' });
      loadAllData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();
    try {
      if (editingClubId) {
        await api.clubs.update(editingClubId, clubForm);
        showFeedback('Club updated successfully!');
      } else {
        await api.clubs.create(clubForm);
        showFeedback('New club registered successfully!');
      }
      setShowClubModal(false);
      setEditingClubId(null);
      loadAllData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) return;
    try {
      await api.clubs.delete(clubId);
      showFeedback('Club deleted.');
      loadAllData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleCreateOrUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (annForm.audienceType === 'club' && !annForm.club_id) {
      showFeedback('Please select a target club for the club announcement.', true);
      return;
    }
    try {
      const targetClubId = annForm.audienceType === 'club' ? Number(annForm.club_id) : null;
      const payload = {
        title: annForm.title,
        content: annForm.content,
        category: annForm.category || 'General',
        is_pinned: annForm.is_pinned || false,
        club_id: targetClubId
      };
      if (editingAnnId) {
        await api.announcements.update(editingAnnId, payload);
        showFeedback('Announcement updated successfully!');
      } else {
        await api.announcements.create(targetClubId, payload);
        showFeedback('Announcement created successfully!');
      }
      setShowAnnModal(false);
      setEditingAnnId(null);
      setAnnForm({ title: '', content: '', category: 'General', is_pinned: false, audienceType: 'campus', club_id: '' });
      loadAllData();
    } catch (err) {
      showFeedback(err.message || 'Failed to save announcement', true);
    }
  };

  const handleEditAnnouncement = (ann) => {
    setEditingAnnId(ann.id);
    setAnnForm({
      title: ann.title || '',
      content: ann.content || '',
      category: ann.category || 'General',
      is_pinned: ann.is_pinned || false,
      audienceType: ann.club_id ? 'club' : 'campus',
      club_id: ann.club_id ? String(ann.club_id) : ''
    });
    setShowAnnModal(true);
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.announcements.delete(annId);
      showFeedback('Announcement deleted.');
      loadAllData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleTogglePinAnnouncement = async (annId) => {
    try {
      await api.announcements.togglePin(annId);
      showFeedback('Announcement pin status updated!');
      loadAllData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#173B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Loading Campus Governance Console...</p>
        </div>
      </div>
    );
  }

  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const filteredUsers = safeUsers.filter((u) => {
    const query = userSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.roll_number && u.roll_number.toLowerCase().includes(query));

    const matchesBranch = userBranchFilter === 'All' || (u.branch && u.branch.toLowerCase().includes(userBranchFilter.toLowerCase()));
    const matchesYear = userYearFilter === 'All' || (u.year && u.year.toLowerCase().includes(userYearFilter.toLowerCase()));
    const matchesSection = userSectionFilter === 'All' || (u.section && u.section.toLowerCase().includes(userSectionFilter.toLowerCase()));
    const matchesClub = userClubFilter === 'All' || (u.enrolled_club_ids && u.enrolled_club_ids.includes(Number(userClubFilter)));

    return matchesSearch && matchesBranch && matchesYear && matchesSection && matchesClub;
  });

  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
  const filteredAnnouncements = safeAnnouncements.filter((a) => {
    const query = annSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (a.title && a.title.toLowerCase().includes(query)) ||
      (a.content && a.content.toLowerCase().includes(query)) ||
      (a.club_name && a.club_name.toLowerCase().includes(query));

    const matchesAudience =
      annAudienceFilter === 'All' ||
      (annAudienceFilter === 'Campus' && !a.club_id) ||
      (annAudienceFilter === 'Club' && a.club_id);

    return matchesSearch && matchesAudience;
  });

  const safeEvents = Array.isArray(events) ? events : [];
  const filteredEvents = safeEvents.filter((ev) => {
    const query = eventSearch.toLowerCase();
    const matchesSearch =
      !query ||
      (ev.title && ev.title.toLowerCase().includes(query)) ||
      (ev.description && ev.description.toLowerCase().includes(query)) ||
      (ev.club_name && ev.club_name.toLowerCase().includes(query));

    const isPast = ev.is_past || new Date(ev.event_date) < new Date();
    const matchesSubTab = eventTabSub === 'past' ? isPast : !isPast;

    return matchesSearch && matchesSubTab;
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Global Overview', icon: Home },
    { id: 'manage_clubs', label: `Manage Clubs (${clubs.length})`, icon: Building2 },
    { id: 'events', label: `Events (${events.length})`, icon: Calendar },
    { id: 'assign_admins', label: 'Club Admin Assignments', icon: UserCheck },
    { id: 'student_directory', label: `Student Directory (${usersList.length})`, icon: Users },
    { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
  ];

  const categoryDist = stats?.category_distribution || [];
  const totalCategoryClubs = categoryDist.reduce((acc, c) => acc + c.count, 0) || 1;
  const palette = ['#173B67', '#2F6FEB', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  const yearDist = stats?.memberships_by_year || [];
  const maxYearCount = Math.max(1, ...yearDist.map((y) => y.count));

  const branchDist = stats?.memberships_by_branch || [];
  const maxBranchCount = Math.max(1, ...branchDist.map((b) => b.count));

  const clubWiseMem = stats?.club_wise_membership || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#173B67] text-white p-4 sm:p-5 shrink-0 flex flex-col justify-between space-y-6 border-r border-blue-900/40">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-blue-800/60">
            <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm text-white truncate">Campus Administration</h2>
              <span className="text-[11px] text-blue-200 font-medium block">Governance Console</span>
            </div>
          </div>

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
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-blue-800/60 text-xs text-blue-200 space-y-1">
          <p className="font-semibold text-white">{user?.name || 'Super Admin'}</p>
          <p className="text-[11px] opacity-80">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Banner Feedback */}
        {message && (
          <div
            className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
              message.isError
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.isError ? <AlertCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. GLOBAL OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Analytics & Demographics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive campus-wide participation matrix and club health</p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Organizations</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_clubs || clubs.length}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">100% Verified Orgs</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Memberships</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_memberships || 0}</div>
                <div className="text-[11px] text-blue-600 font-semibold">Across all student bodies</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Events Scheduled</span>
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_events || 0}</div>
                <div className="text-[11px] text-slate-500 font-semibold">Workshops & hackathons</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Students</span>
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{usersList.length}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Campus directory users</div>
              </div>
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Organization Category Share</h4>
                <div className="space-y-3">
                  {categoryDist.map((cat, idx) => {
                    const pct = Math.round((cat.count / totalCategoryClubs) * 100);
                    const bgCol = palette[idx % palette.length];
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{cat.category}</span>
                          <span>{cat.count} orgs ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: bgCol }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Year Wise Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Academic Year Engagement</h4>
                <div className="space-y-3">
                  {yearDist.map((y) => {
                    const pct = Math.round((y.count / maxYearCount) * 100);
                    return (
                      <div key={y.year} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{y.year}</span>
                          <span>{y.count} Members</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Branch Wise Distribution & Per-Club Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Branch breakdown */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-1">
                <h4 className="text-sm font-bold text-slate-900">Branch Participation</h4>
                <div className="space-y-3">
                  {branchDist.map((b) => {
                    const pct = Math.round((b.count / maxBranchCount) * 100);
                    return (
                      <div key={b.branch} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{b.branch}</span>
                          <span>{b.count} Enrolled</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Club Roster Counts */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-900">Club Enrollment Summary</h4>
                  <span className="text-xs text-slate-500 font-medium">Click club for drill-down</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {clubWiseMem.map((item) => {
                    const displayName = item.club_name || item.name || 'Organization';
                    const displayCategory = item.category || 'Club';
                    const displayMembers = item.total_members ?? item.members ?? 0;
                    return (
                      <div
                        key={item.club_id}
                        onClick={() => handleOpenDemographics(item.club_id)}
                        className="py-2.5 px-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer rounded transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <ClubLogo src={item.logo_url} name={displayName} className="w-7 h-7 rounded border border-slate-200 object-cover" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{displayName}</span>
                            <span className="text-[10px] text-slate-500">{displayCategory}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {displayMembers} Members
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE CLUBS TAB */}
        {activeTab === 'manage_clubs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Manage Organizations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register, update, or remove recognized campus student clubs</p>
              </div>
              <button
                onClick={() => {
                  setEditingClubId(null);
                  setClubForm({
                    name: '',
                    category: 'Technical',
                    description: '',
                    eligibility: '',
                    outcomes: '',
                    google_form_url: '',
                    logo_url: '',
                    cover_url: ''
                  });
                  setShowClubModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs transition"
              >
                <Plus className="w-4 h-4" /> Register New Club
              </button>
            </div>

            {/* Filter Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter organization directory by name or category..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs
                .filter((c) => !clubSearch || c.name.toLowerCase().includes(clubSearch.toLowerCase()) || c.category.toLowerCase().includes(clubSearch.toLowerCase()))
                .map((c) => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <ClubLogo src={c.logo_url} name={c.name} className="w-10 h-10 rounded border border-slate-200 object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                              {c.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              c.is_active !== false
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {c.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleOpenDemographics(c.id)}
                        className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <BarChart3 className="w-3.5 h-3.5" /> Demographics
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleClubStatus(c.id, c.is_active !== false)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                            c.is_active !== false
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingClubId(c.id);
                            setClubForm({
                              name: c.name || '',
                              category: c.category || 'Technical',
                              description: c.description || '',
                              eligibility: c.eligibility || '',
                              outcomes: c.outcomes || '',
                              google_form_url: c.google_form_url || '',
                              logo_url: c.logo_url || '',
                              cover_url: c.cover_url || ''
                            });
                            setShowClubModal(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition"
                          title="Edit Club"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClub(c.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition"
                          title="Delete Club"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. ASSIGN CLUB ADMINS TAB */}
        {activeTab === 'assign_admins' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Club Admin Role Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assign student leadership permissions to manage designated clubs</p>
            </div>

            {/* Assignment Form Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs max-w-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Assign New Club Admin</h4>
              <form onSubmit={handleAssignAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student User</label>
                  <select
                    value={assignForm.userId}
                    onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="">-- Choose Student User --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — Role: {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Organization</label>
                  <select
                    value={assignForm.clubId}
                    onChange={(e) => setAssignForm({ ...assignForm, clubId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="">-- Choose Target Club --</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs shadow-2xs transition"
                >
                  Grant Admin Rights
                </button>
              </form>
            </div>

            {/* Current Assignments List */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Current Active Club Admins</h4>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {assignments.map((a) => (
                  <div key={a.id} className="py-2.5 px-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{a.user_name || `User ID: ${a.user_id}`}</span>
                      <span className="text-slate-500">{a.user_email}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 font-semibold border border-blue-200">
                      {a.club_name || `Club ID: ${a.club_id}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. STUDENT DIRECTORY TAB */}
        {activeTab === 'student_directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Student Body Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Filter enrolled students by academic branch, year, and section</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 self-start sm:self-auto">
                Showing {filteredUsers.length} of {usersList.length} Students
              </span>
            </div>

            {/* Multi-filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap lg:flex-nowrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={userClubFilter}
                  onChange={(e) => setUserClubFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Clubs</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-36">
                <select
                  value={userBranchFilter}
                  onChange={(e) => setUserBranchFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div className="w-full sm:w-36">
                <select
                  value={userYearFilter}
                  onChange={(e) => setUserYearFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Academic Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="w-full sm:w-32">
                <select
                  value={userSectionFilter}
                  onChange={(e) => setUserSectionFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserSearch('');
                  setUserClubFilter('All');
                  setUserBranchFilter('All');
                  setUserYearFilter('All');
                  setUserSectionFilter('All');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs border border-slate-200 transition shrink-0"
              >
                Clear Filters
              </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-slate-500">{u.email}</td>
                      <td className="py-3 px-4">{u.branch || 'CSE'}</td>
                      <td className="py-3 px-4">{u.year || '1st Year'}</td>
                      <td className="py-3 px-4">{u.section || 'A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : u.role === 'CLUB_ADMIN'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ANNOUNCEMENTS MANAGEMENT TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Campus Announcements</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage campus-wide and organization notices across the portal</p>
              </div>
              <button
                onClick={() => {
                  setEditingAnnId(null);
                  setAnnForm({ title: '', content: '', category: 'General', is_pinned: false, audienceType: 'campus', club_id: '' });
                  setShowAnnModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs transition"
              >
                <Plus className="w-4 h-4" /> Create Announcement
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search announcements by title, text, or club..."
                  value={annSearch}
                  onChange={(e) => setAnnSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Audience:</span>
                <select
                  value={annAudienceFilter}
                  onChange={(e) => setAnnAudienceFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                >
                  <option value="All">All Audiences</option>
                  <option value="Campus">Campus-Wide Only</option>
                  <option value="Club">Club-Specific Only</option>
                </select>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-3">
              {filteredAnnouncements.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
                  <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">No announcements found matching criteria.</p>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`bg-white p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-2xs transition ${
                      ann.is_pinned ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            !ann.club_id
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {!ann.club_id ? 'Campus-Wide' : `Club: ${ann.club_name}`}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {ann.category || 'General'}
                        </span>

                        {ann.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 uppercase">
                            <Pin className="w-3 h-3 text-amber-700" /> Pinned
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>

                      {ann.created_at && (
                        <div className="text-[10px] text-slate-400 font-medium pt-1">
                          Posted on {new Date(ann.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleTogglePinAnnouncement(ann.id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition ${
                          ann.is_pinned
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title={ann.is_pinned ? 'Unpin from feed top' : 'Pin to feed top'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${ann.is_pinned ? 'fill-amber-700 text-amber-700' : 'text-slate-500'}`} />
                        <span>{ann.is_pinned ? 'Unpin' : 'Pin'}</span>
                      </button>

                      <button
                        onClick={() => handleEditAnnouncement(ann)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-200 flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 6. EVENTS MANAGEMENT TAB */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Campus Events Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Overview and details for all ongoing, upcoming, and past campus events</p>
              </div>

              {/* Sub-tabs: Ongoing/Upcoming vs Past */}
              <div className="flex bg-slate-200 p-1 rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setEventTabSub('upcoming')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
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
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                    eventTabSub === 'past'
                      ? 'bg-[#173B67] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Past Events
                </button>
              </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between md:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or host club..."
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
                <p className="text-xs text-slate-500">There are no {eventTabSub} events matching your search filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventModal(ev)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col"
                  >
                    {ev.image_url ? (
                      <img src={ev.image_url} alt={ev.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Calendar className="w-10 h-10" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200 truncate">
                            {ev.club_name || 'Campus Club'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            ev.is_past || new Date(ev.event_date) < new Date()
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {ev.is_past || new Date(ev.event_date) < new Date() ? 'PAST' : 'UPCOMING'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{ev.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{new Date(ev.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        {ev.location && (
                          <div className="truncate">📍 {ev.location}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Club Form Modal */}
      {showClubModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">{editingClubId ? 'Edit Organization' : 'Register New Organization'}</h4>
            <form onSubmit={handleSaveClub} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={clubForm.category}
                  onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Social">Social</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClubModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  Save Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Create / Edit Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingAnnId ? 'Edit Announcement' : 'Create New Announcement'}
              </h4>
              <button
                onClick={() => {
                  setShowAnnModal(false);
                  setEditingAnnId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                    annForm.audienceType === 'campus'
                      ? 'bg-blue-50 border-[#173B67] text-[#173B67]'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="audienceType"
                      value="campus"
                      checked={annForm.audienceType === 'campus'}
                      onChange={() => setAnnForm({ ...annForm, audienceType: 'campus', club_id: '' })}
                      className="text-[#173B67]"
                    />
                    <span>Campus-Wide (All)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                    annForm.audienceType === 'club'
                      ? 'bg-blue-50 border-[#173B67] text-[#173B67]'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="audienceType"
                      value="club"
                      checked={annForm.audienceType === 'club'}
                      onChange={() => setAnnForm({ ...annForm, audienceType: 'club' })}
                      className="text-[#173B67]"
                    />
                    <span>Specific Organization</span>
                  </label>
                </div>
              </div>

              {annForm.audienceType === 'club' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Organization</label>
                  <select
                    required
                    value={annForm.club_id}
                    onChange={(e) => setAnnForm({ ...annForm, club_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="">-- Choose a Club --</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="Headline / Title..."
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="General, Urgent, Workshop, Deadline..."
                  value={annForm.category}
                  onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement message..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="super_ann_is_pinned"
                  checked={annForm.is_pinned || false}
                  onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="super_ann_is_pinned" className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-700" />
                  Pin this announcement to top of feed
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnModal(false);
                    setEditingAnnId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#173B67] text-white rounded-md text-xs font-semibold hover:bg-[#122E52]"
                >
                  {editingAnnId ? 'Save Changes' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demographics Drill-down Modal */}
      {showDemoModal && selectedClubAnalytics && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900">{selectedClubAnalytics.club_name} — Demographics</h4>
              <button onClick={() => setShowDemoModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200 font-semibold text-blue-900">
                Total Enrolled Members: {selectedClubAnalytics.total_members}
              </div>

              {/* Branch breakdown */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-700 uppercase">Branch Distribution</h5>
                {selectedClubAnalytics.branch_distribution?.map((item) => (
                  <div key={item.name} className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span>{item.name}</span>
                    <span className="font-bold text-blue-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            {selectedEventModal.image_url && (
              <img src={selectedEventModal.image_url} alt={selectedEventModal.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {selectedEventModal.club_name || 'Campus Club'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEventModal.title}</h3>
                </div>
                <button onClick={() => setSelectedEventModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-y border-slate-100 py-3">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{new Date(selectedEventModal.event_date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
                {selectedEventModal.location && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span>Location:</span>
                    <span className="font-semibold">{selectedEventModal.location}</span>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase mb-1">Description</h5>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedEventModal.description}</p>
              </div>

              {selectedEventModal.registration_url && (
                <div className="pt-2">
                  <a
                    href={selectedEventModal.registration_url.startsWith('http') ? selectedEventModal.registration_url : `https://${selectedEventModal.registration_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#173B67] text-white rounded-md text-xs font-bold hover:bg-[#122E52]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Register / External Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
