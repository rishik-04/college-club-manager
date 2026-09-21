import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function ClubAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'CLUB_ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/club-admin');
      } else {
        setError('Access denied. Your account is not assigned as a Club Admin.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#173B67] uppercase tracking-widest">
            CAMPUS CLUBS
          </div>
          <div className="text-sm font-medium text-slate-500">
            College Club Manager
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] pt-3">Club Admin Portal</h1>
          <p className="text-slate-500 text-xs">Sign in to manage your assigned club</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-xl shadow-xs space-y-5">
          {/* Quick Demo Credentials Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#173B67]">Demo Account</p>
              <p className="text-slate-600 text-[11px]">Email: <span className="text-slate-900 font-mono font-medium">clubadmin@college.edu</span></p>
              <p className="text-slate-600 text-[11px]">Pass: <span className="text-slate-900 font-mono font-medium">clubadmin123</span> or <span className="text-slate-900 font-mono font-medium">admin123</span></p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('clubadmin@college.edu');
                setPassword('clubadmin123');
              }}
              className="px-2.5 py-1 rounded bg-[#173B67]/10 hover:bg-[#173B67]/20 border border-[#173B67]/30 text-[#173B67] font-semibold text-[11px] transition shrink-0"
            >
              Auto-fill Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clubadmin@college.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#173B67] hover:bg-[#122F52] text-white font-bold rounded-lg text-xs transition disabled:opacity-50 mt-2 shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign in to Club Admin'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Note: Club Admins are assigned by Main Admin.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
