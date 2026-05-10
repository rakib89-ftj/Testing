import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { EXERCISES, QUOTES } from '../constants';
import { Wind, Coffee, Brain, Sparkles, ChevronRight, Quote as QuoteIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WellnessHub: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    // Randomize quote on mount
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Breathing': return <Wind size={18} />;
      case 'Mindfulness': return <Brain size={18} />;
      case 'Cognitive': return <Sparkles size={18} />;
      case 'Action': return <Coffee size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Daily Inspiration */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <QuoteIcon size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="px-2 py-0.5 bg-white/20 rounded font-bold text-[10px] uppercase tracking-widest border border-white/20">In-Sight</div>
          </div>
          <p className="text-2xl font-extrabold leading-tight mb-4">
            "{QUOTES[quoteIdx].text}"
          </p>
          <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">— {QUOTES[quoteIdx].author}</p>
        </div>
      </motion.div>

      {/* Encouragement Message */}
      <div className="p-8 bg-white border border-blue-50 rounded-xl shadow-sm shadow-blue-50/50">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">Cognitive Affirmation</h2>
        <h3 className="text-xl font-extrabold text-blue-900 mb-3">Incremental progress sustains architectural stability.</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Consistent engagement with neurological patterns is a primary indicator of clinical resilience. We recommend selecting a tactical module below to anchor your current state.
        </p>
      </div>

      {/* Quick Exercises */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Tactical Modules</h2>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">4 Modules Available</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXERCISES.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 bg-white border-b border-blue-50 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    {getIcon(ex.category)}
                  </div>
                  <span className="text-[9px] font-black text-blue-400 border border-blue-100 px-2 py-0.5 rounded italic">{ex.duration}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base mb-1">{ex.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-6 font-medium">{ex.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-blue-50">
                <span className="text-[9px] font-bold uppercase text-blue-400 tracking-widest group-hover:text-blue-600 transition-colors">{ex.category}</span>
                <ChevronRight size={14} className="text-blue-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Encouragement */}
      <div className="py-10 text-center border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
           MindGuard AI is with you on every step of your journey.
        </p>
      </div>
    </div>
  );
};
