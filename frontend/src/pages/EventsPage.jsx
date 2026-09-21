import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';

export default function EventsPage({ onSelectClub, onShowToast }) {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents(filterType);
  }, [filterType]);

  const fetchEvents = async (type) => {
    setLoading(true);
    try {
      const data = await api.events.getAll({ filter_type: type });
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Events
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Discover workshops, hackathons, and seminars hosted by student organizations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shrink-0 shadow-2xs">
          <button
            onClick={() => setFilterType('upcoming')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              filterType === 'upcoming'
                ? 'bg-[#173B67] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterType('past')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              filterType === 'past'
                ? 'bg-[#173B67] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-[#173B67] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#173B67] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-2xs p-8">
          <h3 className="text-sm font-bold text-slate-900">No events scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">There are no events listed under this filter right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onSelectClub={onSelectClub} onShowToast={onShowToast} />
          ))}
        </div>
      )}
    </div>
  );
}
