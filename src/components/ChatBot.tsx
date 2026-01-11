/**
 * ChatBot Component - TypeScript Version
 * AI-powered leave logging assistant with modern patterns
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { callGemini } from '../services/aiService';
import { formatDate, getWorkingDaysCount, toLocalISO } from '../utils/dateUtils';
import type { Person, Sprint, LeaveFormData, ParsedLeaveData } from '../types/index';

interface ChatBotProps {
  onAddLeave: (leave: LeaveFormData) => void;
  people: Person[];
  sprints: Sprint[];
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  onAddLeave,
  people,
  sprints,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi! I'm your AI Leave Assistant. Chat with me to log your time off!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<ParsedLeaveData | null>(null);
  const [pendingClarification, setPendingClarification] =
    useState<ParsedLeaveData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, pendingConfirmation, pendingClarification]);

  const extractJSON = (text: string): ParsedLeaveData | null => {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const msg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);

    if (people.length === 0 || sprints.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Admin board setup required before logging leaves.',
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const names = people.map((p) => p.name).join(', ');
      const now = new Date();
      const currentYear = now.getFullYear();
      const todayISO = toLocalISO(now);

      const sys = `
        Role: Leave Logger AI. 
        Current Context: Today is ${todayISO}. Current Year is ${currentYear}.
        Roster: [${names}].
        
        Task: Extract Leave Data.
        OUTPUT FORMAT (JSON ONLY):
        {
          "name": "Member Full Name",
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "matchType": "exact" | "suggested" | "none",
          "suggestion": "Correct Name from Roster"
        }

        STRICT RULES:
        1. If user doesn't mention a year, use ${currentYear}.
        2. Format dates as YYYY-MM-DD.
        3. Match the user provided name against the Roster list.
        4. Do not include any text other than the JSON block.
      `;

      const res = await callGemini(msg, sys);
      const result = extractJSON(res);

      if (!result || !result.name) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: "I couldn't identify the name or dates. Could you try again? (e.g. 'Alex is off Jan 12 to 15')",
          },
        ]);
      } else if (result.matchType === 'none') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `Sorry, I couldn't find a member named "${result.name}" in the team roster.`,
          },
        ]);
      } else if (result.matchType === 'suggested') {
        setPendingClarification(result);
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `I found "${result.name}" which isn't on the list. Did you mean ${result.suggestion}?`,
          },
        ]);
      } else {
        const wDays = getWorkingDaysCount(result.start, result.end, []);
        setPendingConfirmation({ ...result, workingDays: wDays });
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `I've prepared a leave request for ${result.name} from ${formatDate(result.start)} to ${formatDate(result.end)}. Please confirm below.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'I encountered a parsing error. Please try mentioning the date clearly like "Jan 10".',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-[#DFE1E6] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#0052CC] p-4 flex justify-between items-center text-white font-black text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span>🤖</span> AI Assistant
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="hover:opacity-75 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-thin"
            ref={scrollRef}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0052CC] text-white shadow-md'
                      : 'bg-[#F4F5F7] border border-[#DFE1E6] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {pendingClarification && (
              <div className="flex gap-2 p-2 bg-blue-50 rounded-lg animate-in zoom-in">
                <button
                  onClick={() => {
                    const r: ParsedLeaveData = {
                      ...pendingClarification,
                      name: pendingClarification.suggestion || '',
                      matchType: 'exact',
                    };
                    setPendingConfirmation({
                      ...r,
                      workingDays: getWorkingDaysCount(r.start, r.end, []),
                    });
                    setPendingClarification(null);
                    setMessages((p) => [
                      ...p,
                      { role: 'ai', text: `Great! Set to ${r.name}.` },
                    ]);
                  }}
                  className="px-3 py-2 bg-[#0052CC] text-white text-[10px] font-black rounded-lg uppercase transition-all hover:bg-[#0747A6]"
                >
                  YES, {pendingClarification.suggestion}
                </button>
                <button
                  onClick={() => setPendingClarification(null)}
                  className="px-3 py-2 bg-white border border-[#DFE1E6] text-[10px] font-black rounded-lg hover:bg-gray-50 transition-all"
                >
                  NO
                </button>
              </div>
            )}

            {pendingConfirmation && (
              <div className="bg-[#E3FCEF] border border-[#ABF5D1] p-4 rounded-xl shadow-sm text-xs animate-in zoom-in">
                <p className="font-black uppercase text-[9px] mb-2 text-[#006644]">
                  Verify Leave Entry:
                </p>
                <p>
                  <strong>Member:</strong> {pendingConfirmation.name}
                </p>
                <p>
                  <strong>Dates:</strong> {formatDate(pendingConfirmation.start)}{' '}
                  to {formatDate(pendingConfirmation.end)}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      onAddLeave({
                        name: pendingConfirmation.name,
                        start: pendingConfirmation.start,
                        end: pendingConfirmation.end,
                      });
                      setMessages((prev) => [
                        ...prev,
                        {
                          role: 'ai',
                          text: 'Leave logged successfully! Capacity updated.',
                        },
                      ]);
                      setPendingConfirmation(null);
                    }}
                    className="flex-1 bg-[#006644] text-white py-2 rounded font-black text-[9px] uppercase tracking-widest shadow-md transition-all hover:bg-[#004d33]"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setPendingConfirmation(null)}
                    className="flex-1 bg-white border py-2 rounded font-black text-[9px] uppercase transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <Loader2 size={16} className="animate-spin text-blue-600 mx-auto" />
            )}
          </div>

          <div className="p-4 border-t bg-[#FAFBFC] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask to log leave..."
              className="flex-1 bg-white border border-[#DFE1E6] p-2 text-xs rounded-lg outline-none focus:ring-2 focus:ring-[#4C9AFF]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-[#0052CC] text-white rounded-lg shadow-sm transition-all hover:bg-[#0747A6] disabled:opacity-50 active:scale-95"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#0052CC] text-white rounded-full shadow-2xl flex items-center justify-center relative hover:scale-110 transition-all group active:scale-95 shadow-blue-500/20"
        aria-label="Toggle AI assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={32} />}
        {!isOpen && (
          <span className="absolute -top-1 -left-1 bg-red-600 text-[9px] font-black px-2 py-1 rounded-full animate-bounce border-2 border-white shadow-lg">
            AI
          </span>
        )}
      </button>
    </div>
  );
};
