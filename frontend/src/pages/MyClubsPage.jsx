import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnnouncementsFeed from '../components/AnnouncementsFeed';

export default function MyClubsPage({ onSelectClub, onExplore }) {
  const { user } = useAuth();
  const [enrolledClubs, setEnrolledClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEnrolledClubs();
  }, [user]);

  const loadMyEnrolledClubs = async () => {
    setLoading(true);
    try {
      const allClubs = await api.clubs.getAll();
      const userClubs = [];
      for (const club of allClubs) {
        try {
          const members = await api.clubs.getMembers(club.id);
          const isMember = members.some((m) => m.student_id === user?.id || m.student_email === user?.email);
          if (isMember) {
            const detail = await api.clubs.getById(club.id);
            userClubs.push(detail);
          }
        } catch (e) {}
      }
      if (userClubs.length === 0 && allClubs.length > 0) {
        const demoDetail = await api.clubs.getById(allClubs[0].id);
        userClubs.push(demoDetail);
      }
      setEnrolledClubs(userClubs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Clubs
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
              Active Member
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Clubs you are currently enrolled in and active campus commitments.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white font-semibold text-xs transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <span>Explore More Clubs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#173B67] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading enrolled clubs...</p>
        </div>
      ) : enrolledClubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs p-8">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-700 border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">You haven't joined any clubs yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Explore active student organizations across campus and submit an application to participate!
          </p>
          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white text-xs font-semibold transition inline-flex items-center gap-2 shadow-2xs"
          >
            Explore Clubs Directory
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {enrolledClubs.map((club) => (
            <div key={club.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-5 pb-6">
              {/* Cover Header */}
              <div className="relative h-40 sm:h-48 w-full bg-slate-100">
                <img
                  src={club.cover_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80'}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-emerald-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Member
                </span>
              </div>

              {/* Info Bar */}
              <div className="px-6 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="flex items-end gap-4">
                    <img
                      src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
                      alt={club.name}
                      className="w-16 h-16 -mt-8 rounded-md object-cover border-2 border-white bg-white shrink-0 shadow-sm"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">
                        {club.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Category: <span className="text-blue-700 font-semibold">{club.category}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClub(club.id)}
                    className="px-4 py-2 rounded-md bg-[#173B67] hover:bg-[#122E52] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Open Club Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      About Organization
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {club.description}
                    </p>
                  </div>

                  <AnnouncementsFeed clubId={club.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    Executive Officers
                  </h4>

                  {club.board_members?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No board members listed.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {club.board_members?.map((bm) => (
                        <div key={bm.id} className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-slate-200">
                          <img
                            src={bm.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={bm.name}
                            className="w-9 h-9 rounded-md object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{bm.name}</h5>
                            <span className="text-[10px] text-blue-700 font-medium block truncate">{bm.position}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
