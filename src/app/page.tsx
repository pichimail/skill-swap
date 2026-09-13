'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Map, MessageSquare, Moon, PhoneCall, Sun, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const features = [
  { icon: Users, title: 'Match by exchange fit', copy: 'Pair what you can teach with what another person wants to learn.' },
  { icon: PhoneCall, title: 'Move into a live session', copy: 'Use the call room with camera controls and explicit safety check-ins.' },
  { icon: Map, title: 'Generate a learning path', copy: 'Create a four-week roadmap with NVIDIA first and OpenRouter fallback.' },
  { icon: MessageSquare, title: 'Keep the loop going', copy: 'Matched conversations and session history stay attached to the workspace.' },
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b ss-hairline bg-background/95 backdrop-blur-xl">
        <div className="ss-page h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 min-h-11">
            <span className="ss-chamfer h-8 w-8 grid place-items-center bg-[var(--signal)] text-black font-black">S</span>
            <span className="text-[15px] font-extrabold tracking-[-0.03em]">Skill Swap</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-1.5">
            {mounted && (
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-muted" aria-label="Toggle theme">
                {resolvedTheme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>
            )}
            <Link href="/auth/signin" className="ss-button-primary">Open workspace <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="ss-page px-4 sm:px-6 min-h-[calc(100dvh-64px)] grid lg:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-16 items-center py-16 lg:py-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Peer learning, structured</p>
            <h1 className="mt-5 text-[clamp(3rem,8vw,6.8rem)] leading-[.9] max-w-5xl">Learn one skill. Teach another.</h1>
            <p className="mt-7 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">A focused exchange workspace for matching, messaging, video sessions, AI roadmaps and measurable progress—without turning the product into another bloated social feed.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/auth/signin" className="ss-button-primary">Start swapping <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="ss-button-secondary">See how it works</a>
            </div>
          </div>

          <div className="relative border-y ss-hairline py-5 lg:py-8">
            <div className="grid grid-cols-2 border ss-hairline">
              {features.map((feature, index) => (
                <div key={feature.title} className={`min-h-[180px] p-4 sm:p-5 flex flex-col justify-between ${index % 2 ? 'border-l' : ''} ${index > 1 ? 'border-t' : ''} ss-hairline`}>
                  <feature.icon className="h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-extrabold">{feature.title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{feature.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-y ss-hairline">
          <div className="ss-page px-4 sm:px-6 py-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">How it works</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">Three steps, one exchange loop.</h2>
            </div>
            <div className="mt-10 grid md:grid-cols-3 border-y ss-hairline">
              {[
                ['01', 'Set your profile', 'Add the skills you can teach and the skills you want to learn.'],
                ['02', 'Match and connect', 'Find a compatible partner, message them, then move into a live session.'],
                ['03', 'Keep progressing', 'Generate roadmaps, complete sessions and let analytics build from real activity.'],
              ].map(([step, title, copy], index) => (
                <div key={step} className={`py-6 md:px-6 md:first:pl-0 ${index ? 'border-t md:border-t-0 md:border-l' : ''} ss-hairline`}>
                  <span className="text-[10px] font-black text-muted-foreground">{step}</span>
                  <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground max-w-sm">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="ss-page px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Platform</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">The dashboard is the product.</h2>
            <p className="mt-4 text-sm text-muted-foreground">Desktop keeps a clear command rail. Mobile uses horizontal quick-launch chips, a persistent bottom dock and draggable sheets instead of shrinking desktop modals into a phone viewport.</p>
          </div>
          <div className="border ss-hairline rounded-[10px] overflow-hidden bg-[var(--canvas-elevated)]">
            <div className="h-12 border-b ss-hairline flex items-center gap-1.5 px-4"><span className="h-2.5 w-2.5 rounded-full bg-[var(--signal)]" /><span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="h-2.5 w-2.5 rounded-full bg-muted" /></div>
            <div className="grid sm:grid-cols-[160px_1fr] min-h-[340px]">
              <div className="hidden sm:block border-r ss-hairline p-4"><div className="h-7 w-24 bg-foreground rounded-[6px]" /><div className="mt-5 space-y-2">{[1,2,3,4,5].map((item) => <div key={item} className={`h-9 rounded-[6px] ${item === 1 ? 'bg-[var(--signal)]' : 'bg-muted'}`} />)}</div></div>
              <div className="p-5 sm:p-7"><div className="h-4 w-24 bg-muted rounded" /><div className="mt-4 h-10 w-2/3 bg-foreground rounded-[5px]" /><div className="mt-8 grid grid-cols-3 border-y ss-hairline">{[1,2,3].map((item) => <div key={item} className="h-24 border-l first:border-l-0 ss-hairline p-3"><div className="h-3 w-12 bg-muted rounded" /><div className="mt-5 h-7 w-10 bg-foreground rounded" /></div>)}</div><div className="mt-8 h-32 border-y ss-hairline grid place-items-center"><div className="h-10 w-10 rounded-full bg-[var(--signal)]" /></div></div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-y ss-hairline">
          <div className="ss-page px-4 sm:px-6 py-16 lg:py-24 max-w-5xl">
            <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">FAQ</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Before you join.</h2>
            <div className="mt-8 divide-y divide-[var(--hairline)] border-y ss-hairline">
              {[
                ['Is Skill Swap free?', 'The current product does not include a paid tier.'],
                ['How does roadmap generation work?', 'The server attempts NVIDIA first and automatically falls back to OpenRouter when the primary provider fails.'],
                ['How is mobile different?', 'Navigation becomes a bottom dock, quick actions become horizontal swipeable chips, and modal workflows use draggable bottom sheets.'],
              ].map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-sm font-extrabold"><span>{question}</span><span className="text-xl text-muted-foreground group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="pt-3 pr-8 text-xs text-muted-foreground max-w-2xl">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ss-page px-4 sm:px-6 py-16 lg:py-24">
          <div className="bg-foreground text-background rounded-[10px] p-7 sm:p-10 lg:p-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl"><p className="text-[10px] uppercase tracking-[0.17em] opacity-60 font-bold">Ready</p><h2 className="mt-3 text-3xl sm:text-5xl text-background">Open the workspace and start with one skill.</h2></div>
            <Link href="/auth/signin" className="ss-button-primary shrink-0">Get started <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t ss-hairline">
        <div className="ss-page px-4 sm:px-6 py-7 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Skill Swap</span>
          <span>Peer learning · Video · Roadmaps · Progress</span>
        </div>
      </footer>
    </div>
  );
}
