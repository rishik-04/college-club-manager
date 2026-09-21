import React, { useState, useEffect } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { ClubLogo } from '../../components/ClubMedia';

export default function SuperAdminPortal() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState(null);

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

  // Filters
  const [clubSearch, setClubSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userBranchFilter, setUserBranchFilter] = useState('All');
  const [userYearFilter, setUserYearFilter] = useState('All');
  const [userSectionFilter, setUserSectionFilter] = useState('All');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, cData, aData, uData] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.clubs.getAll().catch(() => []),
        api.admin.getAssignments().catch(() => []),
        api.admin.getUsers().catch(() => [])
      ]);
      setStats(sData);
      setClubs(Array.isArray(cData) ? cData : []);
      setAssignments(Array.isArray(aData) ? aData : []);
      setUsersList(Array.isArray(uData) ? uData : []);
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

    return matchesSearch && matchesBranch && matchesYear && matchesSection;
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Global Overview', icon: Home },
    { id: 'manage_clubs', label: `Manage Clubs (${clubs.length})`, icon: Building2 },
    { id: 'assign_admins', label: 'Club Admin Assignments', icon: UserCheck },
    { id: 'student_directory', label: `Student Directory (${usersList.length})`, icon: Users },
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
                  onClick={() => setActiveTab(item.id)}
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

        <div className="pt-4 border-t border-blue-800/60">
          <button
            onClick={() => {
              setEditingClubId(null);
              setClubForm({
                name: '',
                category: 'Technical',
                description: '',
                eligibility: 'Open to all students across all branches and years.',
                outcomes: 'Master skills and lead campus initiatives.',
                google_form_url: 'https://forms.google.com/sample-club-app',
                logo_url: '',
                cover_url: ''
              });
              setShowClubModal(true);
            }}
            className="w-full py-2 px-3 rounded-md bg-blue-900/60 hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-blue-700/50 transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Club</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
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
                <h2 className="text-2xl font-bold text-slate-900">Campus Overview</h2>
                <p className="text-slate-500 text-xs mt-0.5">Global statistics across campus organizations, student memberships, and events.</p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-700" /> Total Clubs
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_clubs ?? clubs.length}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" /> Total Students
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_students ?? usersList.length}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-700" /> Total Memberships
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_memberships ?? 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-700" /> Total Events
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total_events ?? 0}</div>
              </div>
            </div>

            {/* Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs tracking-wide uppercase">Category Distribution</h3>
                <div className="space-y-2 text-xs pt-1">
                  {categoryDist.map((item, idx) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: palette[idx % palette.length] }} />
                        <span className="font-semibold text-slate-700">{item.category}</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.count} clubs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs tracking-wide uppercase">Memberships by Year</h3>
                <div className="space-y-2 text-xs pt-1">
                  {yearDist.map((item) => (
                    <div key={item.year} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700 font-semibold">{item.year}</span>
                        <span className="text-blue-700 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#173B67] rounded-full"
                          style={{ width: `${Math.max(8, Math.round((item.count / maxYearCount) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs tracking-wide uppercase">Memberships by Branch</h3>
                <div className="space-y-2 text-xs pt-1">
                  {branchDist.map((item) => (
                    <div key={item.branch} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700 font-semibold truncate max-w-[160px]">{item.branch}</span>
                        <span className="text-blue-700 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2F6FEB] rounded-full"
                          style={{ width: `${Math.max(8, Math.round((item.count / maxBranchCount) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Club Roster Overview Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Organization Roster Sizes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Organization Name</th>
                      <th className="py-2.5 px-4">Demographics</th>
                      <th className="py-2.5 px-4 text-right">Total Active Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {clubWiseMem.map((item) => (
                      <tr key={item.club_id || item.name} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <ClubLogo name={item.name} className="w-7 h-7 rounded text-[10px]" />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOpenDemographics(item.club_id)}
                            className="text-blue-700 font-semibold hover:underline text-xs"
                          >
                            View Demographics Breakdown
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-700">{item.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE CLUBS */}
        {activeTab === 'manage_clubs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Manage Campus Organizations</h3>
              <button
                onClick={() => {
                  setEditingClubId(null);
                  setClubForm({
                    name: '',
                    category: 'Technical',
                    description: '',
                    eligibility: 'Open to all students across all branches and years.',
                    outcomes: 'Master skills and lead campus initiatives.',
                    google_form_url: 'https://forms.google.com/sample-club-app',
                    logo_url: '',
                    cover_url: ''
                  });
                  setShowClubModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Register New Club
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Assigned Club Admin</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clubs.map((c) => {
                    const assignedAdmin = assignments.find((a) => a.club_id === c.id);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <ClubLogo src={c.logo_url} name={c.name} className="w-7 h-7 rounded text-xs" />
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-700">
                          {assignedAdmin ? assignedAdmin.user_name : <span className="text-slate-400 italic font-normal">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-300">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
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
                            className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClub(c.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ASSIGN ADMINS */}
        {activeTab === 'assign_admins' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-xl font-bold text-slate-900">Club Admin Privileges Assignment</h3>

            <form onSubmit={handleAssignAdmin} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Student User</label>
                  <select
                    required
                    value={assignForm.userId}
                    onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="">-- Choose Student --</option>
                    {safeUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Organization</label>
                  <select
                    required
                    value={assignForm.clubId}
                    onChange={(e) => setAssignForm({ ...assignForm, clubId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs shadow-2xs"
              >
                Grant Club Admin Privileges
              </button>
            </form>

            {/* Assignments List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <h4 className="px-5 py-3 bg-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200">
                Current Active Assignments
              </h4>
              <div className="divide-y divide-slate-200">
                {assignments.map((a) => (
                  <div key={a.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{a.user_name}</span>
                      <span className="text-slate-500 font-medium"> ({a.user_email})</span>
                      <span className="text-slate-400 mx-2">➜</span>
                      <span className="font-bold text-blue-700">{a.club_name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                      Club Admin Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. STUDENT DIRECTORY */}
        {activeTab === 'student_directory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Campus Student Directory ({filteredUsers.length})</h3>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, roll no..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
                />
              </div>

              <select
                value={userBranchFilter}
                onChange={(e) => setUserBranchFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
              </select>

              <select
                value={userYearFilter}
                onChange={(e) => setUserYearFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <select
                value={userSectionFilter}
                onChange={(e) => setUserSectionFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67]"
              >
                <option value="All">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
                <option value="Section D">Section D</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
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
    </div>
  );
}
