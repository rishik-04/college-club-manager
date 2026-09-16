import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChevronRight, 
  ExternalLink, 
  UserCheck, 
  Clock, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  MessageCircle,
  Mail,
  Shirt,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';

const STAGES = [
  { id: 'Submitted', label: 'Submitted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Screening', label: 'Screening', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Interview Scheduled', label: 'Interview Scheduled', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Offered', label: 'Offered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Joined', label: 'Joined', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function KanbanBoard({ onShowToast }) {
  const [applications, setApplications] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appData, clubData] = await Promise.all([
        api.applications.getAllApplications(),
        api.clubs.getAll()
      ]);
      setApplications(appData);
      setClubs(clubData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = selectedClubId === 'all'
    ? applications
    : applications.filter((a) => a.club_id === parseInt(selectedClubId));

  const handleUpdateStage = async (appId, newStatus) => {
    try {
      const updated = await api.applications.updateStatus(appId, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(updated);
      }
      onShowToast(`Applicant stage updated to '${newStatus}'`);
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Recruitment Kanban Board & Applicant Inspection
          </h2>
          <p className="text-xs text-slate-500">
            View Roll Numbers, contact details, payment UTR verification, and move candidates across stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Clubs ({applications.length} Applicants)</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading candidate pipeline...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 min-w-[240px] flex flex-col h-[600px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards Column */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-600 transition">
                          {app.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {app.roll_no}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-sky-700 font-semibold truncate max-w-[120px]">{app.branch}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Size: {app.tshirt_size}
                        </span>
                      </div>

                      {app.payment_utr && (
                        <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 truncate">
                          UTR: {app.payment_utr}
                        </div>
                      )}
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 italic">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applicant Inspection Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto border-l border-slate-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">
                    Candidate File #{selectedApp.id}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">{selectedApp.name}</h3>
                  <span className="text-xs font-mono font-bold text-slate-500 block">Roll No: {selectedApp.roll_no}</span>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  ✕
                </button>
              </div>

              {/* Contact Links */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${selectedApp.mobile_no}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  Call {selectedApp.mobile_no}
                </a>
                <a
                  href={`https://wa.me/${selectedApp.whatsapp_no.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 font-semibold text-emerald-800 flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Message
                </a>
              </div>

              {/* Detailed Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Target Club</span>
                  <strong className="text-slate-800">{selectedApp.club_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Branch</span>
                  <strong className="text-sky-700">{selectedApp.branch}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">College Email</span>
                  <span className="text-slate-700 truncate block">{selectedApp.college_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Personal Email</span>
                  <span className="text-slate-700 truncate block">{selectedApp.personal_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Apparel Size</span>
                  <span className="inline-block font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Size: {selectedApp.tshirt_size}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Payment UTR ID</span>
                  <span className="font-mono text-emerald-700 font-bold block truncate">
                    {selectedApp.payment_utr || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Statement */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1">Why joining this club?</h4>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedApp.why_join}
                </p>
              </div>

              {/* Stage buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700">Update Recruitment Stage</h4>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateStage(selectedApp.id, st.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-left ${
                        selectedApp.status === st.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
