import { auth } from '../lib/firebase';
import { User, Shield, Bell, Database, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: Props) {
  const user = auth.currentUser;

  const sections = [
    {
      title: "Biological Profile",
      icon: <UserCircle size={18} className="text-blue-600" />,
      items: ["Diagnostic Identity", "Cognitive Baseline"]
    },
    {
      title: "Security & Sovereignty",
      icon: <Shield size={18} className="text-blue-600" />,
      items: ["Encryption Standards", "Data Access Logs"]
    },
    {
      title: "Telemetric Triggers",
      icon: <Bell size={18} className="text-blue-600" />,
      items: ["Alert Configurations", "Sensitivity Limits"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl border border-blue-100 shadow-sm flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 border-b border-blue-100 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-blue-900 tracking-tight">System Parameters</h2>
        <button 
          onClick={onClose}
          className="text-[10px] font-bold text-blue-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* User Card */}
        <div className="bg-blue-50/50 rounded p-4 border border-blue-50 flex items-center gap-4 shadow-sm shadow-blue-50/30">
          <div className="w-12 h-12 rounded overflow-hidden border-2 border-white shadow-sm">
            <img src={user?.photoURL || ''} alt="User" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{user?.displayName}</h3>
            <p className="text-[10px] text-blue-400 font-mono tracking-tighter uppercase font-bold">{user?.email}</p>
          </div>
        </div>

        {/* sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              {section.icon}
              <span className="text-[9px] uppercase font-black text-blue-300 tracking-[0.2em]">
                {section.title}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  className="flex items-center justify-between p-3 rounded hover:bg-blue-50 border border-transparent transition-all group shadow-sm hover:shadow-blue-100/50"
                >
                  <span className="text-xs font-bold text-slate-500 group-hover:text-blue-700">{item}</span>
                  <ChevronRight size={14} className="text-blue-200 group-hover:text-blue-600 transfrom group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-blue-100">
        <button 
          onClick={() => auth.signOut()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <LogOut size={14} />
          Sign Out of Infrastructure
        </button>
      </div>
    </motion.div>
  );
}
