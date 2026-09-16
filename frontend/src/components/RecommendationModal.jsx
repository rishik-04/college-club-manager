import React, { useState, useEffect } from 'react';
import { Sparkles, Check, ArrowRight, Heart, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COMMON_INTERESTS = [
  'Python',
  'AI & Machine Learning',
  'Web Development',
  'Robotics',
  'Hackathons',
  'UI/UX Design',
  'Mobile Apps',
  'Photography',
  'Video Editing',
  'Public Speaking',
  'Community Service',
  'Sports & Athletics',
  'Music & Dance',
  'Startups & Pitching',
  'Cybersecurity'
];

export default function RecommendationModal({ onSelectClub, onToggleSave }) {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.interests) {
      const userTags = user.interests.split(',').map((t) => t.trim()).filter(Boolean);
      setSelectedTags(userTags);
      fetchRecommendations(userTags);
    } else {
      // Default recommendations
      fetchRecommendations(['AI & Machine Learning', 'Web Development']);
    }
  }, [user]);

  const toggleTag = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    fetchRecommendations(newTags);
  };

  const fetchRecommendations = async (tags) => {
    setLoading(true);
    try {
      const results = await api.ai.recommend(tags);
      setRecommendations(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-400/20 text-sky-300 border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
            INTELLIGENT CAMPUS MATCHING ENGINE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Club Match ✨ — Find Clubs That Match Your Passions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select your interests, programming languages, and hobbies below. Our Data Science engine calculates your compatibility score and recommends the best clubs for your career.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Interactive Interest Picker */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>What are you interested in?</span>
          <span className="text-xs text-sky-600 font-semibold">{selectedTags.length} selected</span>
        </h3>

        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_INTERESTS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white text-sky-600 border-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected ? '✓' : ''}
                </span>
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            Recommended Clubs For You
            {loading && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Ranked by AI match percentage
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Select one or more interests above to view your personalized club compatibility list.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((item) => {
              const { club, match_score, reasons } = item;
              return (
                <div
                  key={club.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-sky-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category and Score */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                        {club.category}
                      </span>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {match_score}% Match
                      </div>
                    </div>

                    {/* Logo & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={club.logo_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0 bg-white"
                      />
                      <h4
                        onClick={() => onSelectClub(club.id)}
                        className="font-extrabold text-slate-900 hover:text-sky-600 transition cursor-pointer text-base line-clamp-1"
                      >
                        {club.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {club.description}
                    </p>

                    {/* Match Reasons */}
                    <div className="space-y-1 mb-4 bg-sky-50/70 p-3 rounded-2xl border border-sky-100/80">
                      <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider block mb-1">
                        Why it matches:
                      </span>
                      {reasons.map((r, i) => (
                        <p key={i} className="text-xs text-sky-900 font-semibold flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          {r}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onSelectClub(club.id)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-center"
                    >
                      View Club
                    </button>
                    <a
                      href={club.google_form_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      Apply Now
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
