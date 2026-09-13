'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  ChevronRight,
  Home,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Moon,
  PhoneCall,
  Settings,
  Sun,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from 'next-themes';

const primaryNav = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Matches', href: '/dashboard/matches', icon: Users },
  { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const quickLaunch = [
  { name: 'Start call', href: '/dashboard/call', icon: PhoneCall },
  { name: 'Find a match', href: '/dashboard/matches', icon: Users },
  { name: 'Build roadmap', href: '/dashboard/roadmap', icon: Map },
  { name: 'Open messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Profile', href: '/dashboard/profile', icon: UserRound },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemo, logoutDemo } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) router.replace('/auth/signin');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !mounted) return;
    if (!localStorage.getItem(`profile_setup_${user.uid}`)) setShowOnboarding(true);
  }, [user, mounted]);

  const pageTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'Home';
    const current = primaryNav.find((item) => item.href === pathname)?.name;
    return current || pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') || 'Dashboard';
  }, [pathname]);

  if (loading || !user || !mounted) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-background">
        <div className="h-7 w-7 rounded-full border-2 border-border border-t-[var(--signal)] animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const handleLogout = async () => {
    setShowLogout(false);
    if (isDemo || !auth) {
      logoutDemo();
      router.push('/');
      return;
    }
    await signOut(auth);
    router.push('/');
  };

  const completeOnboarding = () => {
    localStorage.setItem(`profile_setup_${user.uid}`, 'true');
    setShowOnboarding(false);
  };

  return (
    <div data-dashboard-shell className="min-h-[100dvh] bg-background text-foreground lg:flex">
      <aside className="ss-desktop-only sticky top-0 h-[100dvh] w-[240px] shrink-0 border-r ss-hairline bg-[var(--sidebar)]">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-5 border-b ss-hairline">
            <Link href="/dashboard" className="flex items-center gap-3 min-h-11" aria-label="Skill Swap home">
              <span className="ss-chamfer h-8 w-8 grid place-items-center bg-[var(--signal)] text-black font-black text-sm">S</span>
              <span className="text-[15px] font-extrabold tracking-[-0.03em]">Skill Swap</span>
            </Link>
          </div>

          <nav className="p-3 flex-1 overflow-y-auto" aria-label="Dashboard navigation">
            <p className="px-3 pt-2 pb-3 text-[10px] tracking-[0.16em] uppercase text-muted-foreground font-bold">Workspace</p>
            <div className="space-y-1">
              {primaryNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative min-h-11 flex items-center gap-3 px-3 rounded-[8px] text-[13px] font-semibold transition-colors ${
                      active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[var(--signal)] rounded-r-full" />}
                    <item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-7">
              <p className="px-3 pb-3 text-[10px] tracking-[0.16em] uppercase text-muted-foreground font-bold">Quick launch</p>
              <div className="space-y-1">
                {quickLaunch.slice(0, 4).map((item) => (
                  <Link key={item.href} href={item.href} className="min-h-10 flex items-center gap-3 px-3 rounded-[8px] text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <item.icon className="h-4 w-4" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-3 border-t ss-hairline">
            <Link href="/dashboard/profile" className="min-h-11 flex items-center gap-3 px-3 rounded-[8px] hover:bg-muted transition-colors">
              <span className="h-8 w-8 rounded-full bg-[var(--signal)] text-black grid place-items-center font-extrabold text-xs">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold">{user.displayName || 'Skill Swap user'}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{user.email || 'Demo workspace'}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="min-h-10 px-3 flex items-center gap-2 rounded-[8px] text-xs text-muted-foreground hover:text-foreground hover:bg-muted">
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Theme
              </button>
              <button onClick={() => setShowLogout(true)} className="min-h-10 px-3 flex items-center gap-2 rounded-[8px] text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/5">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 min-h-[100dvh]">
        <header className="sticky top-0 z-40 h-14 lg:h-16 flex items-center justify-between px-4 lg:px-7 border-b ss-hairline bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="lg:hidden ss-chamfer h-8 w-8 shrink-0 grid place-items-center bg-[var(--signal)] text-black font-black text-sm">S</Link>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold hidden sm:block">Workspace</p>
              <h2 className="text-[15px] lg:text-[16px] font-extrabold tracking-[-0.025em] capitalize truncate">{pageTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-muted" aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications((value) => !value)} className="relative min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-muted" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-[9px] right-[9px] h-2 w-2 rounded-full bg-[var(--signal)] ring-2 ring-background" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-[min(88vw,320px)] ss-surface p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b ss-hairline">
                      <h3 className="text-sm font-extrabold">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="min-h-9 min-w-9 grid place-items-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="py-7 text-center">
                      <Bell className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-bold text-xs">All clear</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Connection requests and roadmap alerts will appear here.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setShowMore(true)} className="lg:hidden min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-muted" aria-label="Open quick actions"><Menu className="h-[19px] w-[19px]" /></button>
          </div>
        </header>

        <main className="ss-bottom-safe lg:pb-0">
          <div className="lg:hidden px-4 pt-3 border-b ss-hairline">
            <div className="ss-chip-rail" aria-label="Quick launch">
              {quickLaunch.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className="ss-chip">
                  <item.icon className="h-3.5 w-3.5" /> {item.name}
                </Link>
              ))}
            </div>
          </div>
          {children}
        </main>
      </section>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t ss-hairline bg-background/96 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]" aria-label="Mobile dashboard navigation">
        <div className="grid grid-cols-5 h-[66px]">
          {primaryNav.slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`relative min-h-11 flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {active && <span className="absolute top-0 h-[3px] w-7 rounded-b-full bg-[var(--signal)]" />}
                <item.icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.3 : 1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button onClick={() => setShowMore(true)} className="min-h-11 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground">
            <Menu className="h-[19px] w-[19px]" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.button aria-label="Close quick actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMore(false)} className="lg:hidden fixed inset-0 z-[70] bg-black/55" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 260 }}
              dragElastic={0.14}
              onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 700) setShowMore(false); }}
              className="lg:hidden ss-mobile-sheet"
            >
              <div className="ss-sheet-handle" />
              <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Quick launch</p>
                  <h2 className="mt-1 text-xl font-extrabold">Where next?</h2>
                </div>
                <button onClick={() => setShowMore(false)} className="min-h-11 min-w-11 grid place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-5 grid grid-cols-2 gap-px border-y ss-hairline bg-[var(--hairline)]">
                {quickLaunch.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)} className="min-h-[92px] bg-[var(--canvas-elevated)] p-4 flex flex-col justify-between hover:bg-muted transition-colors">
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-bold">{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="px-5 pt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="ss-button-secondary"><Moon className="h-4 w-4" /> Theme</button>
                <button onClick={() => { setShowMore(false); setShowLogout(true); }} className="ss-button-secondary text-red-500"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogout && (
          <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/65">
            <motion.div initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: .98 }} className="w-full max-w-sm ss-surface p-5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Account</p>
              <h2 className="mt-2 text-xl font-extrabold">Sign out?</h2>
              <p className="mt-2 text-xs text-muted-foreground">You’ll need to sign in again to return to your workspace.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setShowLogout(false)} className="ss-button-secondary">Cancel</button>
                <button onClick={handleLogout} className="min-h-11 rounded-[9px] bg-red-500 text-white text-xs font-bold">Sign out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-black/70">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="w-full sm:max-w-md bg-[var(--canvas-elevated)] border ss-hairline rounded-t-[22px] sm:rounded-[12px] p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
              <div className="sm:hidden ss-sheet-handle" />
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">First setup</p>
                  <h2 className="mt-1 text-xl font-extrabold">Complete your profile</h2>
                </div>
                <span className="h-10 w-10 rounded-full bg-[var(--signal)] text-black grid place-items-center"><UserRound className="h-5 w-5" /></span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Your name and interests improve match quality. You can edit everything later.</p>
              <label className="mt-5 block text-[11px] font-bold">Display name</label>
              <input defaultValue={user.displayName || ''} placeholder="Your name" className="ss-input mt-2" />
              <button onClick={completeOnboarding} className="ss-button-primary w-full mt-4">Continue to workspace <ChevronRight className="h-4 w-4" /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
