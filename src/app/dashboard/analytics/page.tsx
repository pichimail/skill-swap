'use client';

import { Award, Clock3, TrendingUp, Video, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authenticatedFetch, readJson } from '@/lib/api';

type Analytics = { totalSessions: number; learnedHours: number; taughtHours: number; peopleMet: number; skillPoints: number; topSkills: { id: number; name: string; sessions: number }[]; badges: { id: string; label: string }[] };

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { authenticatedFetch('/api/analytics').then((r) => readJson<{ analytics: Analytics }>(r)).then((v) => setData(v.analytics)).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load analytics')); }, []);
  const stats = [
    { label: 'Total sessions', value: data?.totalSessions ?? '—', icon: Video },
    { label: 'Hours learned', value: data ? `${data.learnedHours}h` : '—', icon: Clock3 },
    { label: 'Hours taught', value: data ? `${data.taughtHours}h` : '—', icon: TrendingUp },
    { label: 'Skill points', value: data?.skillPoints ?? '—', icon: Zap },
  ];
  return <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
    <section><p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Progress</p><h1 className="mt-3">Your analytics.</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Calculated from completed learning sessions and accepted connections.</p>{error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}</section>
    <section className="grid grid-cols-2 xl:grid-cols-4 border-y ss-hairline">{stats.map((stat, index) => <div key={stat.label} className={`py-5 px-0 sm:px-5 ${index % 2 === 1 ? 'border-l' : ''} xl:border-l xl:first:border-l-0 ${index > 1 ? 'border-t xl:border-t-0' : ''} ss-hairline`}><div className="flex items-center justify-between gap-4"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{stat.label}</p><stat.icon className="h-4 w-4 text-muted-foreground" /></div><p className="mt-5 text-3xl font-black tracking-[-0.05em]">{stat.value}</p></div>)}</section>
    <section className="grid lg:grid-cols-2 gap-8 lg:gap-10">
      <div><div className="pb-3 border-b ss-hairline"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Skills</p><h2 className="mt-1">Top skills taught</h2></div><div className="border-b ss-hairline">{data?.topSkills?.length ? data.topSkills.map((skill, i) => <div key={skill.id} className="min-h-14 py-3 border-t first:border-t-0 ss-hairline flex items-center gap-3"><span className="text-[10px] text-muted-foreground">{String(i + 1).padStart(2,'0')}</span><span className="flex-1 text-sm font-bold">{skill.name}</span><span className="text-xs text-muted-foreground">{skill.sessions} sessions</span></div>) : <Empty icon={TrendingUp} title="No teaching history yet" />}</div></div>
      <div><div className="pb-3 border-b ss-hairline"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Achievements</p><h2 className="mt-1">Badges</h2></div><div className="border-b ss-hairline">{data?.badges?.length ? data.badges.map((badge) => <div key={badge.id} className="min-h-14 py-3 flex items-center gap-3"><Award className="h-4 w-4" /><span className="text-sm font-bold">{badge.label}</span></div>) : <Empty icon={Award} title="Complete a session to earn your first badge" />}</div></div>
    </section>
  </div>;
}
function Empty({ icon: Icon, title }: { icon: typeof Award; title: string }) { return <div className="py-10 text-center"><Icon className="h-6 w-6 mx-auto text-muted-foreground" /><p className="mt-3 text-xs text-muted-foreground">{title}</p></div>; }
