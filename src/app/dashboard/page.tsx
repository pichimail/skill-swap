'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Database,
  Map,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type HealthState = {
  ok?: boolean;
  database?: { configured?: boolean; reachable?: boolean };
  redis?: { configured?: boolean; reachable?: boolean };
  ai?: { nvidia?: boolean; openrouter?: boolean };
};

const actions = [
  { label: 'Start a call', href: '/dashboard/call', icon: PhoneCall },
  { label: 'Find matches', href: '/dashboard/matches', icon: Users },
  { label: 'Generate roadmap', href: '/dashboard/roadmap', icon: Map },
  { label: 'Open messages', href: '/dashboard/messages', icon: MessageSquare },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const [health, setHealth] = useState<HealthState | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/health', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (active) setHealth(payload);
      })
      .catch(() => { if (active) setHealth({ ok: false }); });
    return () => { active = false; };
  }, []);

  const services = [
    { label: 'Neon database', ready: Boolean(health?.database?.configured && health?.database?.reachable), icon: Database },
    { label: 'Upstash cache', ready: Boolean(health?.redis?.configured && health?.redis?.reachable), icon: Wifi },
    { label: 'AI provider', ready: Boolean(health?.ai?.nvidia || health?.ai?.openrouter), icon: Sparkles },
  ];

  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section className="grid lg:grid-cols-[1fr_auto] gap-5 lg:gap-8 items-end">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Skill exchange workspace</p>
          <h1 className="mt-3">Welcome back, {firstName}.</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Match with people, learn together, and turn each session into a measurable skill-building loop.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/matches" className="ss-button-primary">Find a match <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/dashboard/call" className="ss-button-secondary"><PhoneCall className="h-4 w-4" /> Start call</Link>
        </div>
      </section>

      <section aria-label="Quick actions">
        <div className="ss-chip-rail">
          {actions.map((action, index) => (
            <Link key={action.href} href={action.href} className={`ss-chip ${index === 0 ? 'ss-chip-active' : ''}`}>
              <action.icon className="h-3.5 w-3.5" /> {action.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="ss-stat-grid">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Hours learned</p>
          <div className="mt-3 flex items-end justify-between gap-4"><strong className="text-3xl font-black tracking-[-0.05em]">0</strong><Activity className="h-5 w-5 text-muted-foreground" /></div>
          <p className="mt-2 text-[11px] text-muted-foreground">Starts after your first completed session.</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">People met</p>
          <div className="mt-3 flex items-end justify-between gap-4"><strong className="text-3xl font-black tracking-[-0.05em]">0</strong><Users className="h-5 w-5 text-muted-foreground" /></div>
          <p className="mt-2 text-[11px] text-muted-foreground">Your verified connections will accumulate here.</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Workspace state</p>
          <div className="mt-3 flex items-end justify-between gap-4"><strong className="text-3xl font-black tracking-[-0.05em]">Ready</strong><ShieldCheck className="h-5 w-5 text-muted-foreground" /></div>
          <p className="mt-2 text-[11px] text-muted-foreground">Matching, roadmap and call routes are available.</p>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.45fr_.85fr] gap-8 lg:gap-10">
        <div>
          <div className="flex items-center justify-between pb-3 border-b ss-hairline">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Connections</p>
              <h2 className="mt-1">Recent activity</h2>
            </div>
            <Link href="/dashboard/matches" className="text-xs font-bold hover:underline underline-offset-4">View matches</Link>
          </div>
          <div className="py-10 md:py-14 flex flex-col items-start sm:items-center sm:text-center border-b ss-hairline">
            <span className="h-12 w-12 grid place-items-center rounded-full bg-muted"><Users className="h-5 w-5 text-muted-foreground" /></span>
            <h3 className="mt-4 text-base font-extrabold">No connections yet</h3>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">Once a skill swap is accepted, the person, session history and next action will appear here.</p>
            <Link href="/dashboard/matches" className="ss-button-secondary mt-5">Browse matches <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        <div>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Infrastructure</p>
            <h2 className="mt-1">Service status</h2>
          </div>
          <div className="divide-y divide-[var(--hairline)] border-b ss-hairline">
            {services.map((service) => (
              <div key={service.label} className="min-h-[64px] flex items-center gap-3 py-3">
                <service.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-xs font-bold">{service.label}</span>
                <span className={`inline-flex items-center gap-2 text-[10px] font-bold ${service.ready ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className={`h-2 w-2 rounded-full ${service.ready ? 'bg-[var(--signal)]' : 'bg-muted-foreground/35'}`} />
                  {health === null ? 'Checking' : service.ready ? 'Online' : 'Needs config'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Status reads directly from <code className="text-foreground">/api/health</code>, so this panel reflects runtime configuration rather than a fake dashboard metric.</p>
        </div>
      </section>
    </div>
  );
}
