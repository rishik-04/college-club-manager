import React, { useState } from 'react';
import { Calendar, MapPin, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function EventCard({ event, onSelectClub, onShowToast }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(event?.is_registered || false);
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const isPast = event.is_past;

  const handleRegister = async () => {
    if (!user) {
      if (onShowToast) onShowToast('Please sign in to register for campus events', 'error');
      navigate('/student-login');
      return;
    }

    setLoading(true);
    try {
      if (event.registration_url) {
        window.open(event.registration_url, '_blank', 'noreferrer');
      }
      await api.events.register(event.id);
      setRegistered(true);
      if (onShowToast) onShowToast('Successfully registered for event!');
    } catch (err) {
      if (err.message && err.message.includes('Already registered')) {
        setRegistered(true);
      }
      if (onShowToast) onShowToast(err.message || 'Registered for event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 hover:border-[#CC0000]/40 hover:shadow-md transition duration-150 flex flex-col overflow-hidden ${
      isPast ? 'opacity-85' : ''
    }`}>
      {/* Event Image / Georgia Tech Engage Header */}
      {event.image_url ? (
        <div className="h-36 w-full overflow-hidden relative bg-slate-100">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isPast 
                ? 'bg-slate-800 text-slate-200' 
                : 'bg-[#CC0000] text-white shadow-2xs'
            }`}>
              {isPast ? 'Past Event' : 'Upcoming'}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-28 w-full bg-slate-900 p-3.5 flex flex-col justify-between relative overflow-hidden text-white border-b border-slate-200">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
            isPast ? 'bg-slate-700 text-slate-200' : 'bg-[#CC0000] text-white'
          }`}>
            {isPast ? 'Past Event' : 'Upcoming Event'}
          </span>
          <span className="text-xs font-bold text-slate-200 truncate">{event.club_name || 'Campus Event'}</span>
        </div>
      )}

      {/* Event Details (Georgia Tech Engage style) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Date & Time Row */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
            <span>
              {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h3 className="text-sm font-extrabold text-slate-900 leading-snug hover:text-[#CC0000] transition">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Location Row */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Footer: Hosting Club Badge & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {event.club_name ? (
            <button
              onClick={() => onSelectClub && onSelectClub(event.club_id)}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-[#173B67] bg-slate-100 border border-slate-200 hover:bg-slate-200 truncate max-w-[130px]"
            >
              {event.club_name}
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400">Campus Event</span>
          )}

          {isPast ? (
            <span className="px-3 py-1 rounded text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 uppercase">
              COMPLETED
            </span>
          ) : registered ? (
            <span className="px-3 py-1 rounded text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> REGISTERED ✓
            </span>
          ) : (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="px-3.5 py-1.5 rounded text-xs font-bold text-white bg-[#CC0000] hover:bg-[#B30000] transition flex items-center gap-1 uppercase tracking-wider shadow-2xs"
            >
              {loading ? 'Registering...' : 'REGISTER NOW'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
