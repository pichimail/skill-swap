'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Circle, Loader2, Map, Sparkles } from 'lucide-react';
import { authenticatedFetch, readJson } from '@/lib/api';

type WeekPlan = { week: number; title: string; tasks: string[] };
type Saved = { id: string; skill: string; plan: WeekPlan[]; provider: string; model: string; updated_at: string };

export default function RoadmapPage() {
  const [skill, setSkill] = useState('');
  const [weeks, setWeeks] = useState<WeekPlan[]>([]);
  const [history, setHistory] = useState<Saved[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = () => authenticatedFetch('/api/roadmap').then((r) => readJson<{ roadmaps: Saved[] }>(r)).then((data) => { setHistory(data.roadmaps); if (!weeks.length && data.roadmaps[0]) { setWeeks(data.roadmaps[0].plan); setSkill(data.roadmaps[0].skill); setProvider(data.roadmaps[0].provider); } });
  useEffect(() => { void loadHistory().catch(() => undefined); }, []);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault(); if (!skill.trim() || isGenerating) return;
    setIsGenerating(true); setError(null);
    try {
      const response = await authenticatedFetch('/api/roadmap', { method: 'POST', body: JSON.stringify({ skill }) });
      const data = await readJson<{ roadmap: WeekPlan[]; provider: string }>(response);
      setWeeks(data.roadmap); setProvider(data.provider); await loadHistory();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not generate roadmap'); }
    finally { setIsGenerating(false); }
  };

  return <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
    <section className="grid lg:grid-cols-[1fr_minmax(360px,520px)] gap-6 lg:gap-10 items-end"><div><p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">AI learning plan</p><h1 className="mt-3">Build a four-week roadmap.</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Generation is authenticated and rate-limited. NVIDIA is primary when configured, with OpenRouter fallback.</p></div><form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2"><input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Python for data science" className="ss-input flex-1" /><button type="submit" disabled={!skill.trim() || isGenerating} className="ss-button-primary disabled:opacity-50">{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{isGenerating ? 'Generating' : 'Generate'}</button></form></section>
    {(provider || error) && <div className={`min-h-11 px-4 py-3 flex items-center gap-3 border ss-hairline rounded-[9px] text-xs ${error ? 'text-red-500' : 'text-muted-foreground'}`}><span className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-[var(--signal)]'}`} />{error || `Current plan source: ${provider}`}</div>}
    <section className="grid xl:grid-cols-[1fr_280px] gap-8 lg:gap-12">
      <div className="border-t ss-hairline">{weeks.length ? weeks.map((week) => <article key={`${week.week}-${week.title}`} className="grid sm:grid-cols-[88px_1fr] border-b ss-hairline"><div className="py-5 sm:py-7 sm:border-r ss-hairline flex sm:block items-center justify-between gap-4 sm:pr-5"><span className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground font-bold">Week</span><span className="sm:mt-3 h-10 w-10 rounded-full grid place-items-center text-xs font-black bg-[var(--signal)] text-black">{String(week.week).padStart(2,'0')}</span></div><div className="pb-6 sm:p-7 sm:pr-0"><h2 className="text-lg">{week.title}</h2><div className="mt-5 space-y-3">{week.tasks.map((task) => <div key={task} className="flex items-start gap-3"><span className="mt-0.5 h-5 w-5 rounded-full border ss-hairline grid place-items-center shrink-0"><Circle className="h-2.5 w-2.5 text-muted-foreground" /></span><span className="text-sm">{task}</span></div>)}</div></div></article>) : <div className="min-h-[360px] grid place-items-center border-b ss-hairline text-center"><div><Map className="h-6 w-6 mx-auto text-muted-foreground" /><h2 className="mt-4 text-lg">No roadmap yet</h2><p className="mt-2 text-xs text-muted-foreground">Generate a plan or restore one from your saved history.</p></div></div>}</div>
      <aside><div className="pb-3 border-b ss-hairline"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Saved plans</p><h2 className="mt-1">History</h2></div><div className="divide-y divide-[var(--hairline)] border-b ss-hairline">{history.map((item) => <button key={item.id} onClick={() => { setSkill(item.skill); setWeeks(item.plan); setProvider(item.provider); }} className="w-full min-h-14 py-3 text-left"><span className="block text-xs font-bold">{item.skill}</span><span className="block mt-1 text-[10px] text-muted-foreground">{item.provider || item.model}</span></button>)}</div></aside>
    </section>
  </div>;
}
