import React, { useState } from 'react';
import { X, Send, Bot, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_QUESTIONS = [
  "Which clubs focus on AI?",
  "What events are upcoming?",
  "How do I apply to a club?"
];

export default function AskClubAssistant({ isOpen, onClose, onSelectClub }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I can help you find clubs, events and application details. What would you like to know?",
      relatedClubs: []
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
          relatedClubs: response.related_clubs || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I couldn't connect right now. Please explore clubs from the catalog!",
          relatedClubs: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0B1120]/70 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-[#111827] h-full shadow-2xl flex flex-col border-l border-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Club Assistant</h3>
              <p className="text-[11px] text-slate-400">Ask about clubs and events</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
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
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] text-slate-300 border border-[#1E293B]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>

              {/* Related Clubs Chips */}
              {msg.relatedClubs && msg.relatedClubs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.relatedClubs.map((rc) => (
                    <button
                      key={rc.id}
                      onClick={() => {
                        onClose();
                        onSelectClub(rc.id);
                      }}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-[#0B1120] border border-[#1E293B] text-blue-400 hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <span>{rc.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Thinking...
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B1120] space-y-1.5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#111827] border border-[#1E293B] text-slate-300 hover:text-white hover:border-blue-500 whitespace-nowrap transition"
              >
                [{q}]
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#111827] border-t border-[#1E293B]">
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
              placeholder="Ask about clubs..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-[#0B1120] border border-[#1E293B] focus:border-blue-500 rounded-lg text-xs text-white focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
