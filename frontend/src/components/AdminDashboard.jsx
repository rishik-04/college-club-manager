import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Heart, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Award,
  UserCheck,
  UserPlus,
  Link,
  Crown
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Social',
  'Entrepreneurship',
  'Creative',
  'Management'
];

export default function AdminDashboard({ user, onShowToast, onRefreshClubs }) {
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [myClub, setMyClub] = useState(null);
  const [activeTab, setActiveTab] = useState('clubs'); // clubs, events, users, assignments, my_club

  // Modals state
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [boardMemberModalOpen, setBoardMemberModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Club Form State
  const [clubForm, setClubForm] = useState({
    name: '',
    category: 'Technical',
    description: '',
    eligibility: '',
    outcomes: '',
    logo_url: '',
    cover_url: '',
    google_form_url: '',
    instagram_url: '',
    linkedin_url: '',
    website_url: ''
  });

  // Event Form State
  const [eventForm, setEventForm] = useState({
    club_id: '',
    title: '',
    description: '',
    event_date: '',
    location: '',
    image_url: '',
    is_past: false,
    registration_url: ''
  });

  // Board Member Form State
  const [boardForm, setBoardForm] = useState({
    name: '',
    position: '',
    photo_url: '',
    email: '',
    linkedin_url: ''
  });

  // Assignment Form State
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    club_id: ''
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      const [sData, cData, eData] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.clubs.getAll().catch(() => []),
        api.events.getAll({ filter_type: 'all' }).catch(() => [])
      ]);
      setStats(sData);
      setClubs(cData);
      setEvents(eData);

      if (user?.role === 'CLUB_ADMIN') {
        const clubDetails = await api.admin.getMyClub().catch(() => null);
        setMyClub(clubDetails);
        if (clubDetails) {
          setClubForm({
            name: clubDetails.name,
            category: clubDetails.category,
            description: clubDetails.description,
            eligibility: clubDetails.eligibility || '',
            outcomes: clubDetails.outcomes || '',
            logo_url: clubDetails.logo_url || '',
            cover_url: clubDetails.cover_url || '',
            google_form_url: clubDetails.google_form_url || '',
            instagram_url: clubDetails.instagram_url || '',
            linkedin_url: clubDetails.linkedin_url || '',
            website_url: clubDetails.website_url || ''
          });
        }
      }

      if (isSuperAdmin) {
        const [uData, aData] = await Promise.all([
          api.admin.getUsers().catch(() => []),
          api.admin.getAssignments().catch(() => [])
        ]);
        setUsers(uData);
        setAssignments(aData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddClub = () => {
    setEditingClub(null);
    setClubForm({
      name: '',
      category: 'Technical',
      description: '',
      eligibility: 'Open to all years and departments interested in learning and participating.',
      outcomes: 'Hands-on practical experience, certificates, networking, and leadership opportunities.',
      logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
      google_form_url: 'https://forms.google.com/sample-club-form',
      instagram_url: '',
      linkedin_url: '',
      website_url: ''
    });
    setClubModalOpen(true);
  };

  const handleOpenEditClub = (club) => {
    setEditingClub(club);
    setClubForm({
      name: club.name,
      category: club.category,
      description: club.description,
      eligibility: club.eligibility || '',
      outcomes: club.outcomes || '',
      logo_url: club.logo_url || '',
      cover_url: club.cover_url || '',
      google_form_url: club.google_form_url || '',
      instagram_url: club.instagram_url || '',
      linkedin_url: club.linkedin_url || '',
      website_url: club.website_url || ''
    });
    setClubModalOpen(true);
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();
    try {
      if (editingClub) {
        await api.clubs.update(editingClub.id, clubForm);
        onShowToast('Club details updated successfully!');
      } else if (myClub && user?.role === 'CLUB_ADMIN') {
        await api.clubs.update(myClub.id, clubForm);
        onShowToast('Your club info updated successfully!');
      } else {
        await api.clubs.create(clubForm);
        onShowToast('New club created successfully!');
      }
      setClubModalOpen(false);
      loadAllData();
      if (onRefreshClubs) onRefreshClubs();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? This will remove all its events and board members.')) return;
    try {
      await api.clubs.delete(clubId);
      onShowToast('Club deleted');
      loadAllData();
      if (onRefreshClubs) onRefreshClubs();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const targetClubId = eventForm.club_id || (myClub ? myClub.id : clubs[0]?.id);
      if (!targetClubId) {
        onShowToast('Please select a valid club', 'error');
        return;
      }
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: new Date(eventForm.event_date).toISOString(),
        location: eventForm.location,
        image_url: eventForm.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
        is_past: eventForm.is_past,
        registration_url: eventForm.registration_url || null
      };
      await api.events.create(parseInt(targetClubId), payload);
      onShowToast('Event created successfully!');
      setEventModalOpen(false);
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.events.delete(eventId);
      onShowToast('Event deleted');
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleAddBoardMember = async (e) => {
    e.preventDefault();
    if (!myClub && !editingClub) return;
    const targetClubId = myClub ? myClub.id : editingClub.id;
    try {
      await api.clubs.addBoardMember(targetClubId, boardForm);
      onShowToast('Board member added successfully!');
      setBoardMemberModalOpen(false);
      setBoardForm({ name: '', position: '', photo_url: '', email: '', linkedin_url: '' });
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDeleteBoardMember = async (clubId, memberId) => {
    if (!window.confirm('Remove this board member?')) return;
    try {
      await api.clubs.deleteBoardMember(clubId, memberId);
      onShowToast('Board member removed');
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateRole(userId, newRole);
      onShowToast(`User role updated to ${newRole}`);
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!assignForm.user_id || !assignForm.club_id) {
      onShowToast('Please select both a user and a club', 'error');
      return;
    }
    try {
      await api.admin.assignClubAdmin(parseInt(assignForm.user_id), parseInt(assignForm.club_id));
      onShowToast('Club Admin assigned successfully!');
      setAssignModalOpen(false);
      setAssignForm({ user_id: '', club_id: '' });
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Remove this admin assignment?')) return;
    try {
      await api.admin.deleteAssignment(assignmentId);
      onShowToast('Assignment removed');
      loadAllData();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> 
            {isSuperAdmin ? 'Main University Governance Portal' : 'Club Admin Control Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSuperAdmin ? 'Main Admin Dashboard' : `Manage Club: ${myClub?.name || 'Your Assigned Club'}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={handleOpenAddClub}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Club
            </button>
          )}

          <button
            onClick={() => {
              if (myClub) {
                setEventForm((prev) => ({ ...prev, club_id: myClub.id }));
              } else if (clubs.length > 0) {
                setEventForm((prev) => ({ ...prev, club_id: clubs[0].id }));
              }
              setEventModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            Add Event
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clubs</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.total_clubs}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.total_students || 1}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Events</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.upcoming_events}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Saved Club</p>
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                {stats.top_saved_clubs[0]?.name || 'AI Club'}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin vs Club Admin Tabbed Interface */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        {isSuperAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'clubs' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Clubs ({clubs.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'events' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'users' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'assignments' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Club Admins Mapping ({assignments.length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('my_club')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'my_club' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Club Details & Links
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'board' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Board Members ({myClub?.board_members?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('my_events')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'my_events' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Club Events ({(myClub?.upcoming_events?.length || 0) + (myClub?.past_events?.length || 0)})
            </button>
          </>
        )}
      </div>

      {/* CLUB ADMIN: My Club Profile Editor Tab */}
      {!isSuperAdmin && (activeTab === 'my_club' || activeTab === 'clubs') && myClub && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase">Assigned Club Profile</span>
              <h3 className="text-xl font-extrabold text-slate-900">{myClub.name}</h3>
            </div>
            <a
              href={myClub.google_form_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 hover:bg-sky-100 transition"
            >
              View Active Application Form
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <form onSubmit={handleSaveClub} className="space-y-4 text-xs sm:text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Club Name *</label>
                <input
                  type="text"
                  required
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                <select
                  value={clubForm.category}
                  onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={clubForm.description}
                onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Eligibility Criteria *</label>
                <textarea
                  required
                  rows={2}
                  value={clubForm.eligibility}
                  onChange={(e) => setClubForm({ ...clubForm, eligibility: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Outcomes / Benefits *</label>
                <textarea
                  required
                  rows={2}
                  value={clubForm.outcomes}
                  onChange={(e) => setClubForm({ ...clubForm, outcomes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5" />
                Google Form Application URL (Direct Redirect Link) *
              </label>
              <input
                type="url"
                required
                value={clubForm.google_form_url}
                onChange={(e) => setClubForm({ ...clubForm, google_form_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-50/20 text-slate-900 font-medium"
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={clubForm.logo_url}
                  onChange={(e) => setClubForm({ ...clubForm, logo_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={clubForm.cover_url}
                  onChange={(e) => setClubForm({ ...clubForm, cover_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
              >
                Save Club Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLUB ADMIN: Board Members Tab */}
      {!isSuperAdmin && activeTab === 'board' && myClub && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">
              Executive Board Members ({myClub.board_members?.length || 0})
            </h3>
            <button
              onClick={() => setBoardMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" /> Add Board Member
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClub.board_members?.map((bm) => (
              <div key={bm.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={bm.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{bm.name}</h5>
                    <span className="text-[11px] font-semibold text-sky-600 block">{bm.position}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBoardMember(myClub.id, bm.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPER ADMIN: All Clubs Table */}
      {isSuperAdmin && activeTab === 'clubs' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Club Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Saves</th>
                  <th className="py-3.5 px-4">Application Link</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clubs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 flex items-center gap-3 font-semibold text-slate-900">
                      <img
                        src={c.logo_url}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span>{c.name}</span>
                        <span className="block text-xs font-normal text-slate-400 line-clamp-1 max-w-xs">
                          {c.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-rose-600">
                      ❤️ {c.saved_count || 0}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={c.google_form_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        Google Form
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditClub(c)}
                          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Edit Club"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClub(c.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Club"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Table (Both Roles) */}
      {(activeTab === 'events' || activeTab === 'my_events') && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-4">Host Club</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isSuperAdmin ? events : events.filter(e => e.club_id === myClub?.id)).map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <span>{ev.title}</span>
                      <span className="block text-xs font-normal text-slate-400">{ev.location}</span>
                    </td>
                    <td className="py-4 px-4 text-sky-700 font-medium">
                      {ev.club_name || `Club #${ev.club_id}`}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        ev.is_past ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ev.is_past ? 'Past' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* SUPER ADMIN: Users Management Table */}
      {isSuperAdmin && activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Branch & Year</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Club</th>
                  <th className="py-3.5 px-6 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {u.name}
                      <span className="block text-xs font-normal text-slate-400">{u.email}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {u.branch || '—'} {u.year ? `(${u.year})` : ''}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'SUPER_ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : u.role === 'CLUB_ADMIN'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {u.assigned_club_name ? (
                        <span className="text-sky-700 font-bold">🏆 {u.assigned_club_name}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="CLUB_ADMIN">CLUB_ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: Club Admins Assignment Table */}
      {isSuperAdmin && activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Club Admin Ownership Mappings</h3>
              <p className="text-xs text-slate-500">Assign specific club administrative permissions to users</p>
            </div>
            <button
              onClick={() => setAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              Assign New Club Admin
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Administrator Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Managed Club</th>
                  <th className="py-3.5 px-6 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-sky-600" />
                      {a.user_name}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{a.user_email}</td>
                    <td className="py-4 px-4 font-bold text-sky-800 bg-sky-50/50 rounded-lg">
                      {a.club_name}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
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

      {/* Add / Edit Club Modal */}
      {clubModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 my-8 border border-slate-200 relative">
            <button
              onClick={() => setClubModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-5">
              {editingClub ? 'Edit Club Profile' : 'Add New Campus Club'}
            </h3>

            <form onSubmit={handleSaveClub} className="space-y-4 text-xs sm:text-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Club Name *</label>
                  <input
                    type="text"
                    required
                    value={clubForm.name}
                    onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    placeholder="e.g. AI & Machine Learning Club"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                  <select
                    value={clubForm.category}
                    onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Eligibility Criteria *</label>
                  <textarea
                    required
                    rows={2}
                    value={clubForm.eligibility}
                    onChange={(e) => setClubForm({ ...clubForm, eligibility: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Outcomes / Benefits *</label>
                  <textarea
                    required
                    rows={2}
                    value={clubForm.outcomes}
                    onChange={(e) => setClubForm({ ...clubForm, outcomes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Google Form Application URL *</label>
                <input
                  type="url"
                  required
                  value={clubForm.google_form_url}
                  onChange={(e) => setClubForm({ ...clubForm, google_form_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  placeholder="https://forms.google.com/..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    value={clubForm.logo_url}
                    onChange={(e) => setClubForm({ ...clubForm, logo_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={clubForm.cover_url}
                    onChange={(e) => setClubForm({ ...clubForm, cover_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  {editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 relative">
            <button
              onClick={() => setEventModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-5">
              Add New Campus Event
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Host Club *</label>
                <select
                  value={eventForm.club_id}
                  onChange={(e) => setEventForm({ ...eventForm, club_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                >
                  {(isSuperAdmin ? clubs : (myClub ? [myClub] : clubs)).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  placeholder="e.g. Annual Campus Hackathon 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  placeholder="Agenda, prerequisites, speakers..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. Hall A or Virtual"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_past"
                  checked={eventForm.is_past}
                  onChange={(e) => setEventForm({ ...eventForm, is_past: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_past" className="text-xs font-semibold text-slate-700">
                  Mark as already past event
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Board Member Modal */}
      {boardMemberModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200 relative">
            <button
              onClick={() => setBoardMemberModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Add Executive Board Member</h3>

            <form onSubmit={handleAddBoardMember} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  placeholder="e.g. Kaushik Surapalli"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Position / Role *</label>
                <input
                  type="text"
                  required
                  value={boardForm.position}
                  onChange={(e) => setBoardForm({ ...boardForm, position: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  placeholder="e.g. President or Vice President"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={boardForm.photo_url}
                  onChange={(e) => setBoardForm({ ...boardForm, photo_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBoardMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Club Admin Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200 relative">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Assign Club Administrator</h3>

            <form onSubmit={handleAssignAdmin} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Select User *</label>
                <select
                  required
                  value={assignForm.user_id}
                  onChange={(e) => setAssignForm({ ...assignForm, user_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) [{u.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Select Club *</label>
                <select
                  required
                  value={assignForm.club_id}
                  onChange={(e) => setAssignForm({ ...assignForm, club_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Club --</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  Assign Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
