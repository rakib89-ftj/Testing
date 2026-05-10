import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Feather } from 'lucide-react';

interface Props {
  onAnalyze: (content: string) => Promise<void>;
}

export const JournalInput: React.FC<Props> = ({ onAnalyze }) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      await onAnalyze(content);
      setContent('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-blue-50 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
          <Feather size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Session Entry</h2>
          <p className="text-[11px] text-blue-400 uppercase font-bold tracking-widest">Input Stream</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Document cognitive patterns or physiological reflections..."
          className="w-full min-h-[140px] p-5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600/5 focus:bg-white focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 resize-none outline-none"
        />
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-100"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit for Assessment
              </>
            )}
          </button>
        </div>
      </div>

      {isAnalyzing && (
        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-3"
        >
          <div className="relative w-6 h-6 shrink-0">
            <div className="absolute inset-0 border-2 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] text-blue-700 font-medium">
            Engaging neural layers: Sentiment classification ➜ Distortion detection ➜ Risk mapping...
          </p>
        </motion.div>
      )}
    </div>
  );
};
