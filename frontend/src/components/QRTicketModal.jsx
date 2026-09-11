import React from 'react';
import { X, Calendar, MapPin, QrCode, CheckCircle2, Download, Printer } from 'lucide-react';

export default function QRTicketModal({ ticket, onClose }) {
  if (!ticket) return null;

  const eventDate = new Date(ticket.event_date);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket Header Pass */}
        <div className="p-6 bg-gradient-to-r from-sky-900 to-slate-900 text-white text-center relative overflow-hidden">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300">
            Official Campus Ticket Pass
          </span>
          <h3 className="text-lg font-black mt-1 leading-snug">
            {ticket.event_title}
          </h3>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
            {ticket.club_name}
          </span>
        </div>

        {/* Stub Body */}
        <div className="p-6 space-y-5 text-center bg-white relative">
          {/* Decorative side ticket notches */}
          <div className="w-5 h-5 rounded-full bg-slate-900/60 absolute -left-3 top-0 -translate-y-1/2"></div>
          <div className="w-5 h-5 rounded-full bg-slate-900/60 absolute -right-3 top-0 -translate-y-1/2"></div>

          {/* QR Code SVG Display */}
          <div className="w-44 h-44 bg-slate-50 border-2 border-dashed border-sky-300 rounded-2xl p-3 mx-auto flex flex-col items-center justify-center shadow-inner">
            <svg
              className="w-full h-full text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Custom SVG QR Code visual pattern */}
              <rect x="0" y="0" width="30" height="30" rx="4" />
              <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" rx="4" />
              <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" rx="4" />
              <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
              <rect x="10" y="80" width="10" height="10" />

              <rect x="40" y="10" width="10" height="10" />
              <rect x="50" y="30" width="10" height="10" />
              <rect x="30" y="50" width="15" height="15" />
              <rect x="55" y="50" width="15" height="15" />
              <rect x="40" y="75" width="10" height="15" />
              <rect x="70" y="70" width="15" height="15" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider mt-1">
              {ticket.ticket_code}
            </span>
          </div>

          {/* Event Details */}
          <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {ticket.location}
            </div>
          </div>

          {/* Ticket Status */}
          <div className="pt-1">
            {ticket.status === 'CHECKED_IN' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Gate Checked-In
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                Valid Entrance Pass
              </span>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Ticket Pass
          </button>
        </div>
      </div>
    </div>
  );
}
