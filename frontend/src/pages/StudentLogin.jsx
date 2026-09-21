import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function StudentLogin() {
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
      await login(email, password);
      navigate('/explore');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#173B67] uppercase tracking-wider">
            COLLEGE CLUB MANAGER
          </div>
          <h1 className="text-2xl font-bold text-slate-900 pt-1">Student Portal Sign In</h1>
          <p className="text-slate-500 text-xs">Access your student organizations, registered events, and campus updates.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-xl space-y-5 shadow-2xs">
          {/* Quick Demo Credentials Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#173B67]">Demo Student Account</p>
              <p className="text-slate-600 text-[11px]">Email: <span className="text-slate-900 font-mono">student@college.edu</span></p>
              <p className="text-slate-600 text-[11px]">Pass: <span className="text-slate-900 font-mono">password123</span></p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('student@college.edu');
                setPassword('password123');
              }}
              className="px-2.5 py-1 rounded bg-[#173B67] text-white font-semibold text-[11px] transition shrink-0"
            >
              Auto-fill Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">College Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
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
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
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
              className="w-full py-2.5 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs transition disabled:opacity-50 mt-2 shadow-2xs"
            >
              {loading ? 'Signing in...' : 'Sign In to Student Portal'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don't have a student account?{' '}
              <Link to="/student-register" className="text-blue-700 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
