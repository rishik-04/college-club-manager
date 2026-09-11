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
  Award
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

export default function AdminDashboard({ onShowToast, onRefreshClubs }) {
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('clubs'); // clubs, events, users

  // Modals state
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [sData, cData, eData] = await Promise.all([
        api.admin.getStats(),
        api.clubs.getAll(),
        api.events.getAll({ filter_type: 'all' })
      ]);
      setStats(sData);
      setClubs(cData);
      setEvents(eData);

      // Load users
      try {
        const uData = await api.admin.getUsers();
        setUsers(uData);
      } catch (e) {
        // May fail if not SUPER_ADMIN
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
        onShowToast('Club updated successfully!');
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
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: new Date(eventForm.event_date).toISOString(),
        location: eventForm.location,
        image_url: eventForm.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
        is_past: eventForm.is_past,
        registration_url: eventForm.registration_url || null
      };
      await api.events.create(parseInt(eventForm.club_id), payload);
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateRole(userId, newRole);
      onShowToast(`User role updated to ${newRole}`);
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
            <ShieldCheck className="w-4 h-4" /> Administrative Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddClub}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Club
          </button>
          <button
            onClick={() => {
              if (clubs.length > 0) {
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

      {/* Metrics Row */}
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
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

      {/* Admin Tabs Bar */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('clubs')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'clubs'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Clubs ({clubs.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'events'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Manage Clubs Table */}
      {activeTab === 'clubs' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Club Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Student Saves</th>
                  <th className="py-3.5 px-4">Recruitment Form</th>
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

      {/* Tab 2: Manage Events Table */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-4">Club</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
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

      {/* Tab 3: Manage Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Branch & Year</th>
                  <th className="py-3.5 px-4">Role</th>
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
                  placeholder="What is this club about? What are its primary goals?"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    placeholder="Who can apply? Requirements..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Outcomes / Benefits *</label>
                  <textarea
                    required
                    rows={2}
                    value={clubForm.outcomes}
                    onChange={(e) => setClubForm({ ...clubForm, outcomes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    placeholder="What will members learn or gain?"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={clubForm.cover_url}
                    onChange={(e) => setClubForm({ ...clubForm, cover_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Website</label>
                  <input
                    type="text"
                    value={clubForm.website_url}
                    onChange={(e) => setClubForm({ ...clubForm, website_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={clubForm.instagram_url}
                    onChange={(e) => setClubForm({ ...clubForm, instagram_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={clubForm.linkedin_url}
                    onChange={(e) => setClubForm({ ...clubForm, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="https://linkedin.com/..."
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
                  {clubs.map((c) => (
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

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Registration Form URL</label>
                <input
                  type="url"
                  value={eventForm.registration_url}
                  onChange={(e) => setEventForm({ ...eventForm, registration_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  placeholder="https://forms.google.com/..."
                />
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
    </div>
  );
}
