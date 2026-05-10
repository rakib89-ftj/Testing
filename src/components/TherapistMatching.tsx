import React from 'react';
import { motion } from 'motion/react';
import { Therapist } from '../types';
import { Star, MessageCircle, MapPin, Award } from 'lucide-react';

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialties: ['Anxiety Specialist', 'CBT Expert'],
    matchScore: 98,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '2',
    name: 'James Wilson',
    specialties: ['Burnout Prevention', 'Occupational Therapy'],
    matchScore: 92,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '3',
    name: 'Linda Martinez',
    specialties: ['Depression Support', 'Empathy Training'],
    matchScore: 85,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100'
  }
];

export const TherapistMatching: React.FC = () => {
  return (
    <div className="p-0 bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-extrabold tracking-widest text-slate-400">Archival Matches</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Matched Specialists</p>
        </div>
        <div className="px-1.5 py-0.5 bg-blue-600 text-[9px] text-white rounded font-bold uppercase shadow-sm shadow-blue-200">Ready</div>
      </div>

      <div className="space-y-3">
        {MOCK_THERAPISTS.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center gap-4 p-3 bg-white border-b border-blue-50 hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            <img src={therapist.avatar} alt={therapist.name} className="w-10 h-10 rounded shadow-sm object-cover border border-blue-50 transition-all" referrerPolicy="no-referrer" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{therapist.name}</h3>
                <Award size={10} className="text-blue-300 shrink-0" />
              </div>
              <div className="flex gap-1 overflow-hidden">
                <span className="text-[9px] text-blue-400/60 font-bold uppercase truncate tracking-tight">{therapist.specialties[0]}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono font-bold text-blue-600">
                {therapist.matchScore}%
              </div>
            </div>
            
            <div className="w-7 h-7 rounded border border-blue-50 flex items-center justify-center text-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
              <MessageCircle size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-2.5 bg-white border border-blue-600 text-blue-600 rounded font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm">
        Complete Directory
      </button>
    </div>
  );
};
