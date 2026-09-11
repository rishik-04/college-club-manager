import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 bg-white/95 text-slate-800 border-slate-200">
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
