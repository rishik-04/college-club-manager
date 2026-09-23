import React, { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COMMON_INTERESTS = [
  'Programming',
  'AI & ML',
  'Web Development',
  'Robotics',
  'Hackathons',
  'Design',
  'Public Speaking',
  'Photography',
  'Sports',
  'Music',
  'Entrepreneurship',
  'Cybersecurity'
];

export default function RecommendationModal({ onSelectClub }) {
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
      fetchRecommendations(['AI & ML', 'Web Development']);
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
      setRecommendations(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Find Clubs That Match You
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Select your academic interests and extracurricular goals to find compatible campus organizations.
        </p>
      </div>

      {/* Interest Selector */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Your Interests & Skills
          </h3>
          <span className="text-xs text-blue-700 font-semibold">{selectedTags.length} selected</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_INTERESTS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#173B67] text-white border-[#173B67]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Recommended Organizations
            {loading && <div className="w-4 h-4 border-2 border-[#173B67] border-t-transparent rounded-full animate-spin"></div>}
          </h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-2xs">
            Select one or more interests above to generate tailored organization recommendations.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item) => {
              const { club, match_score, reasons } = item;
              const matchText = match_score >= 70 ? 'Strong match' : match_score >= 40 ? 'Good match' : 'Potential match';

              const rawReasons = reasons || item.match_reasons || item.why_match || [];
              const safeReasons = (rawReasons && rawReasons.length > 0)
                ? rawReasons
                : (selectedInterests.length > 0
                    ? ["Recommended based on your selected preferences."]
                    : ["Complete your preferences to get more personalized recommendations."]);

              return (
                <div
                  key={club.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 shadow-2xs transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                        {club.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        {matchText} ({match_score}%)
                      </span>
                    </div>

                    <div>
                      <h4
                        onClick={() => onSelectClub(club.id)}
                        className="font-bold text-sm text-slate-900 hover:text-blue-700 transition cursor-pointer line-clamp-1"
                      >
                        {club.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {club.description}
                      </p>
                    </div>

                    {/* Why this matches */}
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Why this matches:
                      </span>
                      {safeReasons.map((r, i) => (
                        <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectClub(club.id)}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {club.google_form_url && (
                      <a
                        href={club.google_form_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122E52] transition"
                      >
                        Apply ↗
                      </a>
                    )}
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
