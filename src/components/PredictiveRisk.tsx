import React from 'react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldAlert, Brain, Heart, Zap, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

interface Props {
  analysis: AnalysisResult;
  onFeedback?: (helpful: boolean) => void;
  feedbackSubmitted?: boolean;
}

export const PredictiveRisk: React.FC<Props> = ({ analysis, onFeedback, feedbackSubmitted }) => {
  const [localFeedback, setLocalFeedback] = React.useState<boolean | null>(null);

  const handleFeedback = (helpful: boolean) => {
    setLocalFeedback(helpful);
    onFeedback?.(helpful);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysis.riskLevels.map((risk, i) => (
          <motion.div
            key={risk.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">{risk.label}</p>
                <p className={cn(
                  "text-2xl font-black tracking-tighter",
                  risk.level === 'critical' || risk.level === 'high' ? "text-blue-900" : "text-slate-900"
                )}>
                  {risk.score}%
                </p>
              </div>
              <div className="pb-0.5">
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider",
                  risk.level === 'critical' || risk.level === 'high' ? "bg-rose-500 text-white" :
                  risk.level === 'medium' ? "bg-blue-100 text-blue-700" : "bg-blue-50 text-blue-400"
                )}>
                  {risk.level}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-blue-50 h-1 rounded-full overflow-hidden border border-blue-100/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.score}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000 shadow-sm",
                  risk.level === 'critical' || risk.level === 'high' ? "bg-blue-600 shadow-blue-400/50" :
                  risk.level === 'medium' ? "bg-blue-400" : "bg-blue-200"
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-white rounded-xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 border-r border-blue-50">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="text-blue-600" size={16} />
              <h3 className="text-[11px] font-black text-blue-300 uppercase tracking-widest">Affective Assessment</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.emotions}
                    dataKey="confidence"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {analysis.emotions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #dbeafe', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {analysis.emotions.map((e, i) => (
                <div key={e.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-blue-700 uppercase">{e.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 flex flex-col bg-blue-50/20">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="text-blue-600" size={16} />
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-tight">Cognitive Map (XAI)</h3>
            </div>
            <div className="flex-1 space-y-2">
              {analysis.distortions.map((distortion, i) => (
                <motion.div
                  key={distortion}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 bg-white border border-blue-50 rounded-lg group hover:border-blue-400 transition-colors shadow-sm"
                >
                  <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Zap size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{distortion}</span>
                </motion.div>
              ))}
              {analysis.distortions.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-blue-300 italic text-xs">
                  No core distortions detected in current input.
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-blue-100 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase font-black text-blue-400 tracking-widest">Model Explanation</span>
                <p className="text-[11px] text-blue-800 leading-relaxed italic">
                  "{analysis.explanation}"
                </p>
              </div>

              {/* Feedback UI */}
              <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Was this helpful?</span>
                  <div className="flex gap-2">
                    {localFeedback === null && !feedbackSubmitted ? (
                      <>
                        <button 
                          onClick={() => handleFeedback(true)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-300 hover:text-blue-600 transition-colors border border-blue-50"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button 
                          onClick={() => handleFeedback(false)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-blue-300 hover:text-rose-600 transition-colors border border-blue-50"
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
                        <Check size={12} strokeWidth={3} />
                        Feedback Recorded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
