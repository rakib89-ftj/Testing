import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { BrainCircuit, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect results for mobile/APK environments
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (err: any) {
        console.error("Redirect Result Error:", err);
        if (err.code !== 'auth/user-cancelled' && err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || "Redirect authentication failed.");
        }
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      // Check if we are likely in a mobile/WebView environment
      const isWebView = /wv|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isWebView) {
        // Redirect is usually better for mobile WebViews as popups are often blocked/unsupported
        await signInWithRedirect(auth, provider);
      } else {
        // Popup is better for standard desktop/web browsers
        await signInWithPopup(auth, provider);
      }
    } catch (err: any) {
      console.error("Login Error Details:", err);
      
      if (err.code === 'auth/user-cancelled' || err.code === 'auth/popup-closed-by-user') {
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setError(`Domain Unauthorized: Please add "${domain}" to your Authorized Domains in the Firebase Console (Authentication > Settings).`);
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup Blocked: Please enable popups for this site or try opening the app in a new tab.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Google Provider Disabled: Please enable Google Login in the Firebase Console (Authentication > Sign-in method).");
      } else {
        setError(err.message || "Connection failed. Please verify your network and credentials.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mx-auto mb-6">
            <BrainCircuit size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight mb-2">Secure Neurological Access</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            MindGuard AI requires biometric authentication to protect your cognitive data fingerprints.
          </p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-bold transition-all shadow-lg active:scale-[0.98] shadow-blue-100"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
               <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
            </div>
            Continue with Google
          </button>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
          
          <div className="mt-8 pt-8 border-t border-blue-50">
             <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-loose">
               Military-grade AES-256 Encryption<br/>
               HIPAA Compliant Processing
             </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-slate-900">{user.displayName || 'Researcher'}</span>
        <button 
          onClick={handleLogout}
          className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1"
        >
          Secure Eject <LogOut size={10} strokeWidth={3} />
        </button>
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-blue-50 flex items-center justify-center">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserIcon size={20} className="text-blue-200" />
        )}
      </div>
    </div>
  );
}
