import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ onShowToast }) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [section, setSection] = useState(user?.section || 'Section A');
  const [interests, setInterests] = useState(user?.interests || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        branch,
        year,
        section,
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Student Profile
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Manage your student credentials, academic branch, and interest preferences.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* User Summary Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-14 h-14 rounded-xl bg-[#173B67] text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">{user.name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <p className="text-xs font-semibold text-[#2F6FEB] mt-1">
              {user.year || '3rd Year'} • {user.branch || 'CSE'} • {user.section || 'Section A'}
            </p>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#173B67] focus:bg-white"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#173B67] focus:bg-white"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#173B67] focus:bg-white"
              >
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Data Science">Data Science</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Electrical & Electronics">EEE</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#173B67] focus:bg-white"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
                <option value="Section D">Section D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interests (Used by Club Match Algorithm)
            </label>
            <textarea
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="AI & ML, Python, Hackathons, Web Development"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#173B67] focus:bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#173B67] hover:bg-[#122F52] text-white font-bold text-xs rounded-lg transition disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Saving...' : 'Edit profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
