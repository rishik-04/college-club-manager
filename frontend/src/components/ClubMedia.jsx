import React, { useState } from 'react';

export function getClubInitials(name) {
  if (!name) return '??';
  const cleanName = name.replace(/^the\s+/i, '').trim();
  const words = cleanName.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
}

export function ClubFallbackLogo({ name, className = "w-12 h-12 rounded-xl text-sm font-bold" }) {
  const initials = getClubInitials(name);
  return (
    <div
      className={`${className} bg-slate-800 text-slate-100 flex items-center justify-center font-extrabold tracking-wider border border-slate-700/50 shrink-0 shadow-xs`}
    >
      {initials}
    </div>
  );
}

export function ClubLogo({ src, name, className = "w-12 h-12 rounded-xl text-sm font-bold" }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return <ClubFallbackLogo name={name} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name || 'Club Logo'}
      className={`${className} object-cover shrink-0`}
      onError={() => setImgError(true)}
    />
  );
}

export function ClubCover({ src, name, className = "h-48 w-full" }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    const initials = getClubInitials(name);
    return (
      <div
        className={`${className} bg-slate-900 border-b border-slate-800 flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-slate-950/60" />
        <span className="relative z-10 text-4xl sm:text-5xl font-black text-slate-700/60 tracking-widest select-none">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'Club Cover'}
      className={`${className} object-cover`}
      onError={() => setImgError(true)}
    />
  );
}
