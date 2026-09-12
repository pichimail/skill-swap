'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const { loginDemo, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      // Presentation Fallback Mode! Let the user through smoothly.
      loginDemo();
      return;
    }

    
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      loginDemo();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* LEFT COLUMN - Form */}
      <div className="w-full md:w-1/2 bg-[#0f172a] flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 relative">
        <Link href="/" className="absolute top-8 left-8 md:left-12 flex items-center gap-2">
          <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-sky-500/20">S</div>
          <span className="text-xl font-medium tracking-tight text-white">SkillSwap</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto mt-12 md:mt-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
              {mode === 'signin' ? 'Your skill journey awaits' : 'Join the exchange'}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'signin' ? 'Sign in with your email and password to access the platform.' : 'Create an account to start sharing and learning.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-sm text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono tracking-wider text-slate-500 uppercase">Email Address</label>
              <input 
                id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-md text-sm outline-none transition-all text-white placeholder:text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{ border: '1px solid #27272a', background: '#0f172a' }}
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono tracking-wider text-slate-500 uppercase">Password</label>
              <div className="relative">
                <input 
                  id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-12 rounded-md text-sm outline-none transition-all text-white placeholder:text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ border: '1px solid #27272a', background: '#0f172a' }}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium text-white disabled:opacity-50 transition-all hover:bg-blue-600"
              style={{ background: '#1d4ed8' }}
            >
              {isLoading ? (
                <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <>{mode === 'signin' ? 'SIGN IN' : 'SIGN UP'} <span className="ml-2 font-serif text-lg">→</span></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setError(null); }} className="font-semibold text-white hover:underline underline-offset-4">
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#27272a]" /></div>
            <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase">
              <span className="px-4 bg-[#0f172a] text-slate-500">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-xs font-mono tracking-wider font-semibold rounded-md transition-colors hover:bg-[#18181b] disabled:opacity-50"
              style={{ border: '1px solid #27272a', color: '#e4e4e7', background: '#0f1115' }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              CONTINUE WITH GOOGLE
            </button>
          </div>

          <p className="mt-10 text-center text-[10px] text-slate-500">
            By continuing, you agree to our <button type="button" onClick={() => alert('Demo for DC')} className="underline underline-offset-2">Terms</button> and <button type="button" onClick={() => alert('Demo for DC')} className="underline underline-offset-2">Privacy Policy</button>.
          </p>
        </motion.div>
        
        <div className="absolute bottom-8 left-8 md:left-12 text-[10px] font-mono text-slate-700">
          © {new Date().getFullYear()} Skill Swap. The platform for peer learning.
        </div>
      </div>

      {/* RIGHT COLUMN - Graphic */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_#7dd3fc_2px,_transparent_2px)] [background-size:24px_24px] opacity-80 pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-[#38bdf8]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-[#0f172a]/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 p-16 lg:p-24 flex flex-col justify-center h-full max-w-xl">
          <div className="flex items-center gap-2 mb-6 font-mono text-[10px] tracking-widest text-blue-800 font-bold uppercase">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-800" />
            IN-PROCESS SKILL EXCHANGE
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-blue-950 leading-tight mb-6">
            Intelligent matchmaking for peer-to-peer learning.
          </h2>
          <p className="text-blue-900/80 font-medium text-lg leading-relaxed">
            Zero-proxy video sessions. Swap skills, follow AI-guided roadmaps, and grow your reputation across the globe.
          </p>
        </div>
      </div>
    </div>
  );
}
