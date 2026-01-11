/**
 * AIResponseModal Component
 * Displays AI-generated content in a modal
 */

import React from 'react';
import { X } from 'lucide-react';
import type { AIResponse } from '../types/index';

interface AIResponseModalProps {
  aiResult: AIResponse | null;
  setAiResult: (result: AIResponse | null) => void;
}

export const AIResponseModal: React.FC<AIResponseModalProps> = ({
  aiResult,
  setAiResult,
}) => {
  if (!aiResult) return null;

  const contentToRender =
    typeof aiResult.content === 'string'
      ? aiResult.content
      : JSON.stringify(aiResult.content, null, 2);

  return (
    <div className="fixed inset-0 bg-[#091E42]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 border border-[#DFE1E6]">
        <div className="p-6 border-b flex justify-between items-center bg-[#F4F5F7] rounded-t-3xl font-black text-[#172B4D] text-sm uppercase tracking-widest">
          <span>{aiResult.title}</span>
          <button
            onClick={() => setAiResult(null)}
            className="p-2 hover:bg-gray-200 rounded-full transition transition-all hover:bg-gray-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 text-sm whitespace-pre-wrap leading-relaxed text-[#172B4D] prose prose-blue max-h-[60vh] overflow-y-auto custom-scrollbar-thin">
          {contentToRender}
        </div>
        <div className="p-4 border-t text-right bg-[#FAFBFC] rounded-b-3xl">
          <button
            onClick={() => setAiResult(null)}
            className="px-8 py-3 bg-[#0052CC] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-[#0747A6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
