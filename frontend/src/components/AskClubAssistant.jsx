import React, { useState } from 'react';
import { X, Send, Sparkles, Bot, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_QUESTIONS = [
  "Which clubs are related to AI and Machine Learning?",
  "What major upcoming bootcamps or hackathons are scheduled?",
  "Who can apply? Are first-year beginners allowed?",
  "How do I submit an application form to join a club?"
];

export default function AskClubAssistant({ isOpen, onClose, onSelectClub }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your College Club Advisor. Ask me anything about our campus clubs, upcoming workshops, eligibility guidelines, or how to apply!",
      relatedClubs: [],
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.ai.ask(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.answer,
          relatedClubs: response.related_clubs || [],
          sources: response.sources || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I couldn't reach the club database right now. Please try again or explore clubs from the catalog!",
          relatedClubs: [],
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                Club Assistant ✨
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-200 text-sky-800">
                  AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Ask about recruitment, events, and campus life</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>

              {/* Related Clubs Chips */}
              {msg.relatedClubs && msg.relatedClubs.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.relatedClubs.map((rc) => (
                    <button
                      key={rc.id}
                      onClick={() => {
                        onClose();
                        onSelectClub(rc.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 transition flex items-center gap-1 shadow-sm"
                    >
                      <span>{rc.name}</span>
                      <ArrowRight className="w-3 h-3 text-sky-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <BookOpen className="w-3 h-3" />
                  <span>Sources: {msg.sources.join(', ')}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              Analyzing club data & drafting advice...
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick questions
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-600 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50/50 whitespace-nowrap transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about clubs..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
