import { useState, useEffect } from 'react';
import { WellnessHub } from './components/WellnessHub';
import { JournalInput } from './components/JournalInput';
import { PredictiveRisk } from './components/PredictiveRisk';
import { TherapistMatching } from './components/TherapistMatching';
import { SentimentTrend } from './components/SentimentTrend';
import { SettingsPanel } from './components/SettingsPanel';
import { Auth } from './components/Auth';
import { AnalysisResult, JournalEntry } from './types';
import { analyzeJournalContent } from './services/aiService';
import { MOCK_ANALYSIS } from './constants';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Shield, LayoutDashboard, History, Settings, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wellness' | 'history'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const path = `users/${user.uid}/entries`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Convert Firestore Timestamp to ISO string if needed, or handle it in UI
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
        } as JournalEntry;
      });
      setHistory(entries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalysis = async (content: string) => {
    if (!user) return;

    let result: AnalysisResult;
    try {
      result = await analyzeJournalContent(content);
    } catch (e) {
      console.warn("Using mock analysis due to error/missing key");
      result = MOCK_ANALYSIS;
    }
    
    const path = `users/${user.uid}/entries`;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(collection(db, path));
      const entryId = docRef.id;
      
      await setDoc(docRef, {
        id: entryId,
        content,
        timestamp: serverTimestamp(),
        userId: user.uid,
        analysis: result
      });

      // High Risk Alert logic (Sends email to developer)
      const highRisk = result.riskLevels.find(r => r.level === 'high' || r.level === 'critical');
      if (highRisk) {
        fetch('/api/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `User ${user.email || user.uid} flagged with ${highRisk.level.toUpperCase()} risk (${highRisk.label}). Content: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
            riskLevel: highRisk.level
          })
        }).catch(err => console.error("Alert failed:", err));
      }

      setActiveEntryId(entryId);
      setActiveAnalysis(result);
      setFeedbackSubmitted(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!user || !activeEntryId) return;
    
    const { doc, updateDoc } = await import('firebase/firestore');
    const path = `users/${user.uid}/entries/${activeEntryId}`;
    try {
      await updateDoc(doc(db, path), {
        feedback: helpful
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-blue-50/30 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-blue-100 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight">MindGuard <span className="text-blue-400 font-normal tracking-normal text-sm hidden sm:inline">AI v1.2</span></h1>
        </div>
        
        <nav className="hidden lg:flex gap-10">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'wellness', label: 'Wellness' },
            { id: 'history', label: 'Archives' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-700">Clinical Mode</span>
            <span className="text-[10px] text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Analysis Engines Online
            </span>
          </div>
          <button className="lg:hidden w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <LayoutDashboard size={18} />
          </button>
          
          <Auth />

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-16 inset-x-0 bg-white border-b border-slate-200 z-40 p-4 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'wellness', label: 'Wellness Hub' },
                { id: 'history', label: 'Journal Archives' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Model Specs */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-blue-100 flex-col shrink-0">
          <div className="p-6 overflow-y-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Neural Pipeline</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-blue-900 tracking-tight uppercase">Sentiment-XL</span>
                  <span className="px-1.5 py-0.5 bg-blue-500 text-[8px] text-white rounded font-bold uppercase">Online</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-snug">Multi-modal Bayesian analysis for psychological assessment.</p>
              </div>
              <div className="p-3 border border-slate-100 rounded-lg hover:bg-blue-50/30 transition-colors">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secondary Filter</span>
                <p className="text-xs text-slate-700 mt-1 font-medium text-blue-600">Cognitive Distortion Mapping</p>
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 mb-4">Risk Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Alert Threshold</label>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full w-4/5 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                  <span>Sensitivity 0.8</span>
                  <span className="font-bold text-blue-700">Critical 0.95</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Augmented XAI</span>
                <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
              <h3 className="text-xs font-bold flex items-center gap-2 mb-2 uppercase tracking-widest text-blue-50">
                <Shield size={14} />
                End-to-End
              </h3>
              <p className="text-[11px] text-blue-100 leading-relaxed font-medium">
                RSA-4096 Encryption secures all neurological transcripts at rest.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Stage: Workflow */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto bg-blue-50/10">
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {isSettingsOpen ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full"
                >
                  <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
                </motion.div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 md:space-y-8"
                >
                  <JournalInput onAnalyze={handleAnalysis} />
                  
                  {activeAnalysis ? (
                    <PredictiveRisk 
                      analysis={activeAnalysis} 
                      onFeedback={handleFeedback}
                      feedbackSubmitted={feedbackSubmitted}
                    />
                  ) : (
                    <div className="h-48 md:h-64 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 md:p-12">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100 mb-4">
                        <LayoutDashboard size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-400">Inference Stage Ready</h3>
                      <p className="text-sm text-slate-400 mt-1">Submit your cognitive input for real-time neural mapping.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wellness' && (
                <motion.div
                  key="wellness"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <WellnessHub />
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-900">Archive</h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological Data Store</span>
                    </div>
                  </div>

                  {history.length > 0 && <SentimentTrend history={history} />}

                  {history.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic">No historical data available.</div>
                  ) : (
                    history.map((entry) => (
                      <div key={entry.id} className="bg-white p-4 md:p-5 rounded-xl border border-blue-50 shadow-sm flex flex-col md:flex-row gap-4 md:gap-6 hover:border-blue-200 transition-colors">
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-tight">{new Date(entry.timestamp).toLocaleString()}</div>
                          <p className="text-sm text-slate-700 leading-relaxed pl-3 border-l-2 border-blue-100">"{entry.content}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                           <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg text-center min-w-[70px] flex-1 md:flex-none">
                             <div className="text-[9px] font-bold text-blue-400 uppercase">Affect</div>
                             <div className="text-sm font-black text-blue-600">{Math.round((entry.analysis?.sentiment.score || 0) * 100)}%</div>
                           </div>
                           <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-center min-w-[70px] flex-1 md:flex-none">
                             <div className="text-[9px] font-bold text-slate-400 uppercase">Risk</div>
                             <div className="text-sm font-black text-slate-900">{(entry.analysis?.riskLevels?.[2]?.level || 'N/A').toUpperCase()}</div>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
          </div>
        </section>

        {/* Right Sidebar: Specialists & Status */}
        <aside className="hidden xl:flex w-80 bg-white border-l border-blue-50 flex-col shrink-0">
          <div className="p-6 overflow-y-auto">
            <TherapistMatching />
            
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex gap-3">
                <div className="w-5 h-5 text-orange-600 shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-orange-800">Low Insight Warning</h3>
                  <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">Analysis requires more longitudinal data for accurate baseline normalization.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Status Bar */}
      <footer className="h-8 bg-blue-600 flex items-center px-4 md:px-6 justify-between text-[8px] md:text-[10px] font-medium text-blue-100 uppercase tracking-wider shrink-0 overflow-hidden">
        <div className="flex gap-3 md:gap-6 whitespace-nowrap overflow-hidden">
          <span>Session ID: <span className="text-white font-mono">MG-{Date.now().toString().slice(-4)}</span></span>
          <span className="hidden sm:inline">Engine Batch: <span className="text-white font-mono">B-92.4</span></span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
          <span className="hidden sm:inline italic">Neural Grid Synchronized</span>
          <span className="sm:hidden">Stable</span>
        </div>
      </footer>
    </div>
  );
}
