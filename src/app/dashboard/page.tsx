'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Database, KeyRound, Map, MessageSquare, PhoneCall, Radio, Sparkles, Users, Wifi } from 'lucide-react';
import { authenticatedFetch, readJson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Health = {
  ok: boolean;
  database: { configured: boolean; reachable: boolean };
  schema: { ready: boolean; version: string | null; expected: string };
  redis: { configured: boolean; reachable: boolean };
  auth: { googleOAuth: boolean };
  storage: { blob: boolean };
  realtime: { livekit: boolean };
  ai: { ready: boolean; nvidia: { configured: boolean; model: string }; openrouter: { configured: boolean; model: string } };
};
type Analytics = { totalSessions: number; learnedHours: number; taughtHours: number; peopleMet: number; skillPoints: number; badges: { id: string; label: string }[] };

const actions = [
  { label: 'Start a call', href: '/dashboard/call', icon: PhoneCall },
  { label: 'Find matches', href: '/dashboard/matches', icon: Users },
  { label: 'Generate roadmap', href: '/dashboard/roadmap', icon: Map },
  { label: 'Open messages', href: '/dashboard/messages', icon: MessageSquare },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const [health, setHealth] = useState<Health | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/health', { cache: 'no-store' }).then((r) => r.json()).then((data) => { if (active) setHealth(data); }).catch(() => { if (active) setHealth(null); });
    authenticatedFetch('/api/analytics').then((r) => readJson<{ analytics: Analytics }>(r)).then((data) => { if (active) setAnalytics(data.analytics); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const services = [
    { label: 'Neon + schema', ready: Boolean(health?.database.reachable && health?.schema.ready), icon: Database },
    { label: 'Upstash protection', ready: Boolean(health?.redis.reachable), icon: Wifi },
    { label: 'Google OAuth', ready: Boolean(health?.auth.googleOAuth), icon: KeyRound },
    { label: 'AI provider', ready: Boolean(health?.ai.ready), icon: Sparkles },
    { label: 'LiveKit realtime', ready: Boolean(health?.realtime.livekit), icon: Radio },
  ];

  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section className="grid lg:grid-cols-[1fr_auto] gap-5 lg:gap-8 items-end"><div className="max-w-2xl"><p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Skill exchange workspace</p><h1 className="mt-3">Welcome back, {firstName}.</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Your dashboard reads profile, sessions, matches and infrastructure from the authenticated backend.</p></div><div className="flex flex-wrap gap-2"><Link href="/dashboard/matches" className="ss-button-primary">Find a match <ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/call" className="ss-button-secondary"><PhoneCall className="h-4 w-4" /> Start call</Link></div></section>
      <section aria-label="Quick actions"><div className="ss-chip-rail">{actions.map((action, index) => <Link key={action.href} href={action.href} className={`ss-chip ${index === 0 ? 'ss-chip-active' : ''}`}><action.icon className="h-3.5 w-3.5" /> {action.label}</Link>)}</div></section>
      <section className="ss-stat-grid"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Hours learned</p><div className="mt-3 flex items-end justify-between gap-4"><strong className="text-3xl font-black tracking-[-0.05em]">{analytics?.learnedHours ?? '—'}</strong><Activity className="h-5 w-5 text-muted-foreground" /></div><p className="mt-2 text-[11px] text-muted-foreground">Completed session time.</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">People met</p><div className="mt-3 flex items-end justify-between gap-4"><strong className="text-3xl font-black tracking-[-0.05em]">{analytics?.peopleMet ?? '—'}</strong><Users className="h-5 w-5 text-muted-foreground" /></div><p className="mt-2 text-[11px] text-muted-foreground">Accepted skill-swap connections.</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Workspace state</p><div className="mt-3 flex items-end justify-between gap-4"><strong className="text-2xl font-black tracking-[-0.05em]">{health === null ? 'Checking' : health.ok ? 'Ready' : 'Needs config'}</strong><Sparkles className="h-5 w-5 text-muted-foreground" /></div><p className="mt-2 text-[11px] text-muted-foreground">Derived from the production health contract.</p></div></section>
      <section className="grid xl:grid-cols-[1.3fr_.9fr] gap-8 lg:gap-10"><div><div className="pb-3 border-b ss-hairline"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Progress</p><h2 className="mt-1">Real activity</h2></div><div className="grid grid-cols-2 sm:grid-cols-3 border-b ss-hairline"><Metric label="Sessions" value={analytics?.totalSessions ?? '—'} /><Metric label="Taught" value={analytics ? `${analytics.taughtHours}h` : '—'} /><Metric label="Points" value={analytics?.skillPoints ?? '—'} /></div></div><div><div className="pb-3 border-b ss-hairline"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Infrastructure</p><h2 className="mt-1">Service status</h2></div><div className="divide-y divide-[var(--hairline)] border-b ss-hairline">{services.map((service) => <div key={service.label} className="min-h-[64px] flex items-center gap-3 py-3"><service.icon className="h-4 w-4 text-muted-foreground" /><span className="flex-1 text-xs font-bold">{service.label}</span><span className="inline-flex items-center gap-2 text-[10px] font-bold"><span className={`h-2 w-2 rounded-full ${service.ready ? 'bg-[var(--signal)]' : 'bg-red-500'}`} />{health === null ? 'Checking' : service.ready ? 'Online' : 'Needs config'}</span></div>)}</div></div></section>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="py-5 px-3 first:pl-0 border-l first:border-l-0 ss-hairline"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></div>; }
