import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function StudentRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('1st Year');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [section, setSection] = useState('Section A');
  const [interests, setInterests] = useState('AI & ML, Web Development, Programming');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        role: 'STUDENT',
        roll_number: rollNumber,
        year,
        branch,
        section,
        interests,
      });
      navigate('/explore');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-5 my-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#173B67] uppercase tracking-wider">
            COLLEGE CLUB MANAGER
          </div>
          <h1 className="text-2xl font-bold text-slate-900 pt-1">Student Registration</h1>
          <p className="text-slate-500 text-xs">Create your student profile to access campus clubs and activities.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-xl space-y-4 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@college.edu"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="2101A0501"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
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
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
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
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interests & Skills</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="AI & ML, Web Development, Hackathons..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#173B67] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#173B67] hover:bg-[#122E52] text-white font-semibold rounded-md text-xs transition disabled:opacity-50 mt-2 shadow-2xs"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/student-login" className="text-blue-700 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
