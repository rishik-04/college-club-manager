import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onShowToast }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [interests, setInterests] = useState('Python, AI, Web Development');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role: 'STUDENT',
          branch,
          year,
          interests
        });
        onShowToast('Account registered successfully! Welcome!');
      } else {
        await login(email, password);
        onShowToast('Signed in successfully!');
      }
      onClose();
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    try {
      if (role === 'student') {
        await login('student@college.edu', 'password123');
        onShowToast('Logged in as Student Demo (Alex Rivera)');
      } else {
        await login('admin@college.edu', 'admin123');
        onShowToast('Logged in as Admin Demo (Dr. Sarah Jenkins)');
      }
      onClose();
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-slate-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-sky-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {isRegister ? 'Join College Club Manager' : 'Sign in to Your Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister ? 'Discover, bookmark, and apply to clubs across campus' : 'Access your saved clubs, recommendations, and events'}
          </p>
        </div>

        {/* 1-Click Demo Buttons for Easy Evaluation */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            ⚡ Quick 1-Click Test Drive Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5 text-sky-600" />
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs sm:text-sm">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  placeholder="e.g. Alex Rivera"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                placeholder="student@college.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="CSE / ECE / ME"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="1st, 2nd, 3rd..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interests (Comma-separated)</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="AI, Robotics, Web Dev, Music"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register as Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
