import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Sparkles, 
  Save, 
  Send, 
  QrCode, 
  Award, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Kanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import QRTicketModal from '../components/QRTicketModal';
import CertificateModal from '../components/CertificateModal';

export default function ProfilePage({ onShowToast }) {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('details'); // details, applications, tickets
  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [saving, setSaving] = useState(false);

  const [myApps, setMyApps] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      const [apps, tickets] = await Promise.all([
        api.applications.getMyApplications(),
        api.events.getMyTickets()
      ]);
      setMyApps(apps);
      setMyTickets(tickets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        branch,
        year,
        interests
      });
      onShowToast('Profile updated successfully!');
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email} • {user.branch || 'Student'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              Role: {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => setCertModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md shrink-0"
        >
          <Award className="w-4 h-4 text-amber-400" />
          View Verified Activity Certificate
        </button>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'details'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Applications ({myApps.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Event Passes ({myTickets.length})
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 3rd Year"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skills & Interests (Used by AI Recommendation Engine)
              </label>
              <textarea
                rows={3}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Python, AI, Robotics, Web Development, Hackathons"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 leading-relaxed outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApps.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No applications submitted yet</h3>
              <p className="text-xs text-slate-400 mt-1">Open any club page and click 'Apply Now' to submit an application.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApps.map((app) => (
                <div key={app.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {app.domain}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900">{app.club_name}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'Joined'
                        ? 'bg-purple-100 text-purple-800'
                        : app.status === 'Offered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'Interview Scheduled'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl">
                    "{app.why_join}"
                  </p>

                  {app.admin_notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Admin Update Note:</strong> {app.admin_notes}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                    <span>Level: {app.experience_level}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {myTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No event passes issued yet</h3>
              <p className="text-xs text-slate-400 mt-1">RSVP on the Campus Events page to get your instant QR ticket pass.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myTickets.map((t) => (
                <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{t.club_name}</span>
                      <span className="font-mono text-sky-600 font-bold">{t.ticket_code}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.event_title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{t.location}</p>
                  </div>

                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    View QR Pass
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedTicket && (
        <QRTicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      <CertificateModal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} />
    </div>
  );
}
