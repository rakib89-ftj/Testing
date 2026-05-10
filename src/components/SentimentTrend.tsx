import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { JournalEntry } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface SentimentTrendProps {
  history: JournalEntry[];
}

type TimeRange = 'week' | 'month' | 'all';

export function SentimentTrend({ history }: SentimentTrendProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Filter history based on time range
  const filterHistory = (entries: JournalEntry[]) => {
    if (timeRange === 'all') return entries;
    const now = new Date();
    const days = timeRange === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return entries.filter(entry => new Date(entry.timestamp) >= cutoff);
  };

  const filteredHistory = filterHistory(history);

  // Sort history by timestamp ascending for the chart
  const chartData = [...filteredHistory]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(entry => ({
      time: new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: Math.round((entry.analysis?.sentiment.score || 0) * 100),
      rawTime: new Date(entry.timestamp).getTime()
    }));

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0;
  const previousScore = chartData.length > 1 ? chartData[chartData.length - 2].score : 0;
  const trend = latestScore - previousScore;

  if (history.length < 2) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Longitudinal Sentiment Mapping</h3>
            <p className="text-[11px] text-slate-500">Awaiting more data points for trend stabilization.</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center bg-blue-50/20 rounded-xl border border-dashed border-blue-100 overflow-hidden relative">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-blue-600">
             <svg width="100%" height="100%">
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
           </div>
           <p className="text-xs text-slate-400 italic">Submit at least 2 entries to generate visualization</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm shadow-blue-200">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Affective Trajectory</h3>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest flex items-center gap-1.5 uppercase">
              Neural Sentiment Segment: {timeRange === 'all' ? 'Archive' : `${timeRange === 'week' ? '7' : '30'} Days`}
              <span className="w-0.5 h-3 bg-blue-200"></span>
              {chartData.length} Nodes
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-blue-50/50 p-1 rounded-lg">
            {[
              { id: 'week', label: '7D' },
              { id: 'month', label: '30D' },
              { id: 'all', label: 'ALL' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                  timeRange === range.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-blue-400 hover:text-blue-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 bg-blue-50/30 p-2 rounded border border-blue-100">
            <div className="px-3">
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Current Bias</div>
              <div className={`text-sm font-black flex items-center gap-1 ${latestScore >= 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                {latestScore > 0 ? '+' : ''}{latestScore}%
                {trend > 0 ? <TrendingUp size={14} className="text-emerald-500" /> : trend < 0 ? <TrendingDown size={14} className="text-rose-500" /> : <Minus size={14} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {chartData.length < 2 ? (
          <div className="h-full flex flex-col items-center justify-center bg-blue-50/20 rounded border border-dashed border-blue-100">
            <Calendar className="w-8 h-8 text-blue-200 mb-2" />
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Insufficient data points</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eff6ff" />
              <XAxis 
                dataKey="time" 
                hide={true}
              />
              <YAxis 
                domain={[-100, 100]} 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#60a5fa' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #dbeafe',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  padding: '12px'
                }}
                labelStyle={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px' }}
                itemStyle={{ fontSize: '14px', fontWeight: 900, color: '#1d4ed8' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-[10px] text-blue-300 font-bold uppercase tracking-widest">
        <span>Historical Origin</span>
        <span>Live Analysis</span>
      </div>
    </motion.div>
  );
}

