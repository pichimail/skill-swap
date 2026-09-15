'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[minmax(0,.9fr)_minmax(420px,1.1fr)] bg-background text-foreground">
      <section className="min-h-[100dvh] flex flex-col px-4 sm:px-8 lg:px-12 xl:px-20 py-5 sm:py-8 border-r ss-hairline">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-h-11">
            <span className="ss-chamfer h-8 w-8 grid place-items-center bg-[var(--signal)] text-black font-black">S</span>
            <span className="text-[15px] font-extrabold tracking-[-0.03em]">Skill Swap</span>
          </Link>
          <Link href="/" className="min-h-11 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </div>

        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center py-12">
          <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Google account</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Return to your workspace.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Skill Swap uses Google OAuth only. Your Google password is never shared with Skill Swap.</p>

          {error && <div role="alert" className="mt-6 min-h-11 p-3 rounded-[9px] border border-red-500/30 bg-red-500/5 flex items-start gap-3 text-xs text-red-500"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span className="break-words">{error}</span></div>}

          <button onClick={handleGoogleSignIn} disabled={isLoading || loading} className="ss-button-primary w-full mt-8 disabled:opacity-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09A7 7 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-5.38 6.16-5.38z" fill="#EA4335"/></svg>
            {isLoading ? 'Opening Google…' : 'Continue with Google'}
          </button>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">By continuing, Google confirms your account identity and email address. Product data remains in Skill Swap’s Neon database.</p>
        </div>

        <p className="text-[10px] text-muted-foreground pb-[env(safe-area-inset-bottom)]">© {new Date().getFullYear()} Skill Swap</p>
      </section>

      <aside className="hidden lg:flex relative overflow-hidden bg-[#050505] text-white items-end p-10 xl:p-16">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(245,220,24,.75) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-10 right-10 h-28 w-28 rounded-full bg-[var(--signal)]" />
        <div className="relative z-10 max-w-xl"><p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">Skill exchange workspace</p><h2 className="mt-4 text-[clamp(2.7rem,5vw,5rem)] leading-[.95] font-black tracking-[-.055em] text-white">Match. Call. Learn. Repeat.</h2><div className="mt-8 grid grid-cols-3 border-y border-white/15">{['Peer matching', 'AI roadmaps', 'Live sessions'].map((item, index) => <div key={item} className={`py-4 text-[11px] font-bold ${index ? 'border-l border-white/15 pl-4' : ''}`}>{item}</div>)}</div></div>
      </aside>
    </div>
  );
}
