import React from 'react';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';

export default function EventCard({ event, onSelectClub }) {
  const eventDate = new Date(event.event_date);
  const isPast = event.is_past;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
      isPast 
        ? 'border-slate-200/80 opacity-80' 
        : 'border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5'
    }`}>
      {/* Event Header Image */}
      {event.image_url && (
        <div className="h-40 w-full overflow-hidden relative bg-slate-100">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${
              isPast 
                ? 'bg-slate-800/80 text-slate-200' 
                : 'bg-emerald-600/90 text-white'
            }`}>
              {isPast ? 'Past Event' : 'Upcoming'}
            </span>
          </div>
        </div>
      )}

      {/* Event Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Club badge & Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            {event.club_name && (
              <button
                onClick={() => onSelectClub && onSelectClub(event.club_id)}
                className="font-bold text-sky-600 hover:underline truncate max-w-[200px]"
              >
                {event.club_name}
              </button>
            )}
            <span className="flex items-center gap-1 font-medium text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{event.location}</span>
            </span>

            {event.registration_url && !isPast && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1"
              >
                Register
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
