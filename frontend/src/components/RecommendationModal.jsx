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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-400/20 text-sky-300 border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            CONTENT-BASED CLUB RECOMMENDATION ENGINE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find the Clubs That Match Your True Passions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select your skills, hobbies, and career interests below. Our algorithm matches your profile against club outcomes, activities, and events to calculate your personalized compatibility percentage.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Interactive Interest Picker */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Choose Your Interests & Skills
        </h3>

        <div className="flex flex-wrap gap-2">
          {COMMON_INTERESTS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Top Club Matches For You
            {loading && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>}
          </h3>
          <span className="text-xs text-slate-500">
            Ranked by relevance score
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400">
            Select one or more interests above to generate tailored recommendations.
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
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        {match_score}% Match
                      </div>
                    </div>

                    {/* Logo & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={club.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"
                      />
                      <h4
                        onClick={() => onSelectClub(club.id)}
                        className="font-bold text-slate-900 hover:text-sky-600 transition cursor-pointer text-base line-clamp-1"
                      >
                        {club.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {club.description}
                    </p>

                    {/* Match Reasons */}
                    <div className="space-y-1.5 mb-4 bg-sky-50/60 p-3 rounded-2xl border border-sky-100">
                      <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                        Why it matches:
                      </span>
                      {reasons.map((r, i) => (
                        <p key={i} className="text-xs text-sky-900/90 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-sky-500"></span>
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
