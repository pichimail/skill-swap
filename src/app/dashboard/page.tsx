'use client';

import { motion } from 'framer-motion';
import { Users, Award, ChevronRight, Activity, Globe, ArrowRight, Video } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} className="bg-card/80 backdrop-blur-sm border border-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-border/50">
        <div><h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Welcome back, {firstName}</h1><p className="text-muted-foreground text-xs font-medium">Your workspace is ready. You have <strong className="text-primary">0 new connections</strong> pending.</p></div>
        <div className="flex flex-col sm:flex-row gap-3"><Link href="/dashboard/matches"><motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 h-full">View Matches <ArrowRight className="h-4 w-4" /></motion.div></Link><Link href="/dashboard/call"><motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative px-5 py-2.5 bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"><Video className="h-4 w-4" /> Talk to Strangers<span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-card animate-pulse" /></motion.div></Link></div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[
        { label: 'Hours Learned', value: '0', icon: Activity, trend: 'Waiting for first session' },
        { label: 'People Met', value: '0', icon: Users, trend: 'Ready to connect' },
        { label: 'Platform Active Users', value: '1', icon: Globe, trend: 'Online now' },
      ].map((stat, i) => <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-card/80 backdrop-blur-sm border border-border p-5 rounded-2xl flex flex-col shadow-lg shadow-border/50"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-primary/10 rounded-lg"><stat.icon className="h-5 w-5 text-primary" /></div><span className="text-[10px] font-bold tracking-wide text-foreground bg-muted px-2 py-1 rounded-full border border-border">{stat.trend}</span></div><h3 className="text-muted-foreground text-xs mb-1 font-medium">{stat.label}</h3><p className="text-3xl font-black text-foreground">{stat.value}</p></motion.div>)}</div>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-border/50"><div className="p-5 border-b border-border flex justify-between items-center"><h3 className="font-semibold text-foreground text-sm">Recent Connections</h3></div><div className="p-8 flex-1 flex flex-col items-center justify-center text-center"><div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 relative"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute inset-0 bg-primary/10 rounded-full" /><Users className="h-6 w-6 text-muted-foreground" /></div><h4 className="text-sm font-bold text-foreground mb-1">No connections yet</h4><p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">When you complete a skill swap session, your partner will appear here.</p><Link href="/dashboard/matches"><motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6 px-5 py-2 bg-muted text-foreground text-xs font-bold rounded-lg border border-border hover:border-primary/50 transition-colors">Find a Match</motion.div></Link></div></motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-border/50"><div className="p-5 border-b border-border flex justify-between items-center"><h3 className="font-semibold text-foreground text-sm">Verified Badges</h3><Award className="h-4 w-4 text-primary" /></div><div className="p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden"><div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 z-10 relative"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute inset-[-10px] border border-dashed border-primary/30 rounded-full" /><Award className="h-6 w-6 text-muted-foreground" /></div><h4 className="text-sm font-bold text-foreground mb-1 z-10">No badges earned</h4><p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed z-10">Verify your skills through our 2-step Peer & AI verification process to earn badges.</p></div></motion.div>
      </div>
    </motion.div>
  );
}
