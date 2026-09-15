'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, Search, Zap, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = async () => { await signOut({ callbackUrl: '/' }); };

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/matches', label: 'Matches' },
    { href: '/dashboard/roadmap', label: 'Roadmap' },
    { href: '/dashboard/messages', label: 'Messages' },
    { href: '/dashboard/analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto flex h-[72px] items-center px-4 md:px-6">
        <Link href="/dashboard" className="mr-8 flex items-center space-x-2.5 shrink-0"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20"><Zap className="h-4 w-4 text-white" /></div><span className="font-semibold text-lg text-slate-900 hidden md:inline-block">SkillSwap</span></Link>
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium flex-1">{links.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`relative px-4 py-2 rounded-md transition-colors ${isActive ? 'text-teal-700 bg-teal-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>{link.label}</Link>; })}</nav>
        <div className="flex items-center gap-3 ml-auto"><div className="hidden md:block relative mr-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="search" placeholder="Search skills or users..." className="h-10 w-[240px] rounded-lg px-3 py-1 text-sm pl-9 outline-none text-slate-900 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" /></div><button aria-label="Notifications" className="hidden sm:inline-flex items-center justify-center rounded-lg h-10 w-10 text-slate-500 hover:bg-slate-100 transition-colors"><Bell className="h-[18px] w-[18px]" /></button><div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div><Link href="/dashboard/settings" className="hidden sm:inline-flex items-center justify-center rounded-lg h-10 w-10 text-slate-500 hover:bg-slate-100 transition-colors"><Settings className="h-[18px] w-[18px]" /></Link><Link href="/dashboard/profile" className="hidden sm:inline-flex items-center justify-center rounded-lg h-10 w-10 text-slate-500 hover:bg-slate-100 transition-colors"><User className="h-[18px] w-[18px]" /></Link><button aria-label="Sign out" onClick={handleLogout} className="hidden sm:inline-flex items-center justify-center rounded-lg h-10 w-10 text-slate-500 hover:bg-slate-100 transition-colors"><LogOut className="h-[18px] w-[18px]" /></button><button aria-label="Toggle menu" className="lg:hidden inline-flex items-center justify-center rounded-lg h-10 w-10 text-slate-600 hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      </div>
      {mobileOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="lg:hidden px-4 pb-4 bg-white border-t border-slate-100"><nav className="flex flex-col gap-1 pt-2">{links.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-teal-700 bg-teal-50' : 'text-slate-600'}`}>{link.label}</Link>; })}<button onClick={handleLogout} className="px-4 py-3 rounded-lg text-sm font-medium text-left text-red-600">Sign out</button></nav></motion.div>}
    </header>
  );
}
