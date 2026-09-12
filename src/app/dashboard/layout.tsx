'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Map, MessageSquare, BarChart2, 
  Settings, LogOut, Zap, Search, Bell, Shield, Moon, Sun, Clock, Compass, X, Home, ArrowRight, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemo, logoutDemo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
    if (!loading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && isClient) {
      const isSetup = localStorage.getItem(`profile_setup_${user.uid}`);
      if (!isSetup) {
        setShowOnboarding(true);
      }
    }
  }, [user, isClient]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`profile_setup_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  };

  if (loading || !user || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    setShowLogoutModal(false);
    if (isDemo || !auth) logoutDemo();
    else { await signOut(auth); router.push('/'); }
  };

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Matches', href: '/dashboard/matches', icon: Users },
    { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  ];

  const reminders = [
    { name: 'Call w/ Alex', time: 'Today, 4 PM' },
    { name: 'React Review', time: 'Tomorrow' },
  ];

  return (
    <div className="min-h-screen flex bg-muted font-sans text-foreground overflow-hidden transition-colors duration-300">
      <aside className="w-[260px] bg-card border-r border-border flex flex-col z-20 shadow-sm shrink-0">
        <div className="h-[72px] flex items-center px-6 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-sky-500/20">S</div>
            <span className="text-xl text-foreground font-bold tracking-tight">SkillSwap</span>
          </Link>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-3 px-3">Workspace</div>
          <nav className="space-y-2 mb-8 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors z-10 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                  {isActive && <motion.div layoutId="sidebar-active-pill" className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-md shadow-primary/20" initial={false} transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-3 px-3">Quick Actions</div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center"><Award className="h-3 w-3 text-primary" /></div><span className="text-xs font-semibold text-foreground">Explore More</span></div></div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">Discover advanced matching algorithms and earn verified skill badges.</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setTourActive(true)} className="w-full py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-md shadow-md shadow-primary/20">Explore Main Features</motion.button>
          </div>
        </div>
        <div className="p-4 border-t border-border bg-card">
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-1"><div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">{user.email ? user.email[0].toUpperCase() : 'U'}</div><span className="truncate font-medium">{user.displayName || user.email || 'Demo User'}</span></Link>
          <div className="flex items-center justify-between px-3 py-2"><Link href="/dashboard/settings" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors"><Settings className="h-4 w-4" /> Settings</Link><button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-muted-foreground hover:text-foreground transition-colors">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button></div>
          <motion.button whileHover={{ x: 5 }} onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-red-500 hover:bg-red-500/10 transition-colors mt-1 font-medium"><LogOut className="h-4 w-4" /> Sign Out</motion.button>
          <div className="mt-4 pt-4 border-t border-border space-y-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 shadow-inner"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Shield className="h-3.5 w-3.5 text-emerald-500" /></motion.div>Skill Swap Secure Connection</div><p className="text-[9px] text-muted-foreground leading-relaxed text-center px-1"><strong className="text-foreground">Moderation Notice:</strong> We monitor every call and chat for safety.</p></div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        <header className="h-[72px] bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 shrink-0 transition-colors z-20"><div className="flex items-center gap-3"><h2 className="text-lg font-bold text-foreground tracking-tight capitalize">{pathname === '/dashboard' ? 'Home' : pathname.split('/').pop()}</h2></div><div className="flex items-center gap-4 relative"><button onClick={() => setShowNotifications(!showNotifications)} onBlur={() => setTimeout(() => setShowNotifications(false), 200)} className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"><Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-card" /></button><AnimatePresence>{showNotifications && <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"><div className="p-3 bg-card border-b border-border flex justify-between items-center"><h3 className="text-sm font-bold text-foreground">Notifications</h3><span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">0 New</span></div><div className="max-h-[300px] overflow-y-auto p-6 flex flex-col items-center justify-center text-center"><Bell className="h-8 w-8 text-muted-foreground mb-3 opacity-20" /><p className="text-xs font-semibold text-foreground mb-1">No new notifications</p><p className="text-[10px] text-muted-foreground">You're all caught up. Check back later for updates, connection requests, and roadmap alerts.</p></div></motion.div>}</AnimatePresence></div></header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted transition-colors"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto">{children}</motion.div></main>
      </div>
      <AnimatePresence>{tourActive && <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed bottom-8 right-8 z-50 w-80 bg-card border-2 border-border shadow-2xl rounded-2xl overflow-hidden text-foreground"><div className="p-4 bg-card text-foreground relative"><button onClick={() => setTourActive(false)} className="absolute top-3 right-3 p-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"><X className="h-4 w-4 text-foreground" /></button><div className="flex items-center gap-3 mb-2"><div className="h-8 w-8 rounded-full bg-sky-500/20 flex items-center justify-center animate-pulse"><Compass className="h-5 w-5 text-sky-500" /></div><h3 className="font-bold text-foreground">Interactive Tour</h3></div><div className="mt-4 bg-card text-foreground border border-border p-4 rounded-xl shadow-inner relative"><div className="absolute -left-2 top-6 w-4 h-4 bg-card border-l border-b border-border rotate-45" />{pathname === '/dashboard' && <p className="text-sm font-semibold leading-relaxed">Start your journey here. Navigate to <strong className="text-primary">Matches</strong> in the left menu to view your AI-paired connections.</p>}{pathname === '/dashboard/matches' && <p className="text-sm font-semibold leading-relaxed">These are your matches. Click <strong className="text-sky-500">Talk to Strangers</strong> above to initiate a zero-proxy WebRTC video session.</p>}{pathname === '/dashboard/call' && <p className="text-sm font-semibold leading-relaxed">Active Video Session. Please note that <strong className="text-red-500">AI Moderation</strong> will enforce identity verification shortly.</p>}{pathname !== '/dashboard' && pathname !== '/dashboard/matches' && pathname !== '/dashboard/call' && <p className="text-sm font-semibold leading-relaxed">Use the <strong className="text-primary">Roadmap</strong> module to generate Llama 3 curriculums, or view your metrics in <strong className="text-primary">Analytics</strong>.</p>}</div></div></motion.div>}</AnimatePresence>
      <AnimatePresence>{showLogoutModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 text-center"><div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4"><LogOut className="h-6 w-6 text-red-500" /></div><h2 className="text-lg font-bold text-foreground mb-2">Are you sure?</h2><p className="text-xs text-muted-foreground mb-6">You are about to sign out of your Skill Swap account. You will need to log back in to access your dashboard.</p><div className="flex gap-3 justify-center"><button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 text-xs font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors flex-1">Cancel</button><button onClick={handleLogout} className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex-1">Sign Out</button></div></motion.div></div>}</AnimatePresence>
      <AnimatePresence>{showOnboarding && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-8"><div className="w-16 h-16 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center mb-6 border border-sky-500/20"><Users className="h-8 w-8 text-sky-500" /></div><h2 className="text-2xl font-black text-foreground mb-2 text-center tracking-tight">Complete Your Profile</h2><p className="text-sm text-muted-foreground mb-8 text-center max-w-sm mx-auto">Before you start swapping skills, let's set up your account details. This helps AI match you perfectly.</p><div className="space-y-4 mb-8"><div><label className="text-xs font-bold text-foreground mb-1.5 block">Full Name</label><input type="text" defaultValue={user?.displayName || ''} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-foreground mb-1.5 block">Phone Number</label><input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors" /></div><div><label className="text-xs font-bold text-foreground mb-1.5 block">Security Password</label><input type="password" placeholder="••••••••" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors" /></div></div></div><div className="flex gap-3"><button onClick={completeOnboarding} className="px-6 py-3 text-sm font-bold text-foreground bg-muted hover:bg-border rounded-xl transition-colors flex-1">Skip for now</button><button onClick={completeOnboarding} className="px-6 py-3 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors flex-1 shadow-lg shadow-sky-500/20">Save Profile</button></div></motion.div></div>}</AnimatePresence>
    </div>
  );
}
