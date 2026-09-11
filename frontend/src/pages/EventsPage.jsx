import React, { useState, useEffect } from 'react';
import { Calendar, QrCode, Sparkles, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import QRTicketModal from '../components/QRTicketModal';

export default function EventsPage({ onSelectClub, onShowToast }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    fetchEvents(filterType);
  }, [filterType]);

  const fetchEvents = async (type) => {
    setLoading(true);
    try {
      const data = await api.events.getAll({ filter_type: type });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    if (!user) {
      onShowToast('Please sign in to RSVP for event passes', 'error');
      return;
    }
    try {
      const ticket = await api.events.rsvp(eventId);
      setActiveTicket(ticket);
      onShowToast('RSVP successful! Digital QR ticket generated.');
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Campus Event Calendar & Ticketing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workshops, Hackathons & QR Gate Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            RSVP for upcoming bootcamps to generate your instant entrance QR code pass.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setFilterType('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterType('past')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'past'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No events found in this category</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col">
              <EventCard event={event} onSelectClub={onSelectClub} />
              {!event.is_past && (
                <button
                  onClick={() => handleRSVP(event.id)}
                  className="mt-2 w-full py-2 px-3 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  RSVP & Get QR Ticket Pass
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ticket Pass Modal */}
      {activeTicket && (
        <QRTicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
}
