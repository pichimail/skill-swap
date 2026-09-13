'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, Circle, Loader2, Map, Play, Sparkles } from 'lucide-react';

type WeekPlan = { week: number; title: string; tasks: string[] };

const starterWeeks: WeekPlan[] = [
  { week: 1, title: 'Foundations of React', tasks: ['Understand Components & JSX', 'Props vs State', 'Build a simple Counter App'] },
  { week: 2, title: 'Hooks & Side Effects', tasks: ['Master useState', 'Understand useEffect lifecycle', 'Build a Todo List'] },
  { week: 3, title: 'Advanced State Management', tasks: ['Context API for global state', 'useReducer for complex logic', 'Refactor app state'] },
  { week: 4, title: 'Final Project Integration', tasks: ['Connect to a REST API', 'Handle loading & errors', 'Deploy to Vercel'] },
];

export default function RoadmapPage() {
  const { user } = useAuth();
  const [skill, setSkill] = useState('');
  const [weeks, setWeeks] = useState<WeekPlan[]>(starterWeeks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!skill.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, userId: user?.uid }),
      });
      const data = await response.json();
      if (!response.ok || !data.roadmap) throw new Error(data.error || 'Roadmap generation failed');
      setWeeks(data.roadmap);
      setProvider(data.provider || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section className="grid lg:grid-cols-[1fr_minmax(360px,520px)] gap-6 lg:gap-10 items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">AI learning plan</p>
          <h1 className="mt-3">Build a four-week roadmap.</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">NVIDIA generates first. OpenRouter is used automatically when the primary model cannot complete the request.</p>
        </div>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2">
          <input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="e.g. Python for data science" className="ss-input flex-1" />
          <button type="submit" disabled={!skill.trim() || isGenerating} className="ss-button-primary disabled:opacity-50">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Generating' : 'Generate'}
          </button>
        </form>
      </section>

      {(provider || error) && (
        <div className={`min-h-11 px-4 py-3 flex items-center gap-3 border ss-hairline rounded-[9px] text-xs ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
          <span className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-[var(--signal)]'}`} />
          {error ? error : `Roadmap generated via ${provider}`}
        </div>
      )}

      <section className="grid xl:grid-cols-[1fr_280px] gap-8 lg:gap-12">
        <div className="border-t ss-hairline">
          {weeks.map((week, index) => {
            const state = index === 0 ? 'done' : index === 1 ? 'current' : 'upcoming';
            return (
              <article key={`${week.week}-${week.title}`} className="grid sm:grid-cols-[88px_1fr] border-b ss-hairline">
                <div className="py-5 sm:py-7 sm:border-r ss-hairline flex sm:block items-center justify-between gap-4 sm:pr-5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground font-bold">Week</span>
                  <span className={`sm:mt-3 h-10 w-10 rounded-full grid place-items-center text-xs font-black ${state === 'current' ? 'bg-[var(--signal)] text-black' : 'bg-muted text-foreground'}`}>{String(week.week).padStart(2, '0')}</span>
                </div>
                <div className="pb-6 sm:p-7 sm:pr-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg">{week.title}</h2>
                      <p className="mt-1 text-[11px] text-muted-foreground">{state === 'done' ? 'Complete' : state === 'current' ? 'In progress' : 'Upcoming'}</p>
                    </div>
                    {state === 'current' && <span className="ss-chip ss-chip-active !min-h-7 !px-2.5">Current</span>}
                  </div>
                  <div className="mt-5 space-y-3">
                    {week.tasks.map((task, taskIndex) => {
                      const completed = state === 'done' || (state === 'current' && taskIndex === 0);
                      const playing = state === 'current' && taskIndex === 1;
                      return (
                        <div key={task} className="flex items-start gap-3 min-h-8">
                          <span className={`mt-0.5 h-5 w-5 rounded-full grid place-items-center shrink-0 ${completed ? 'bg-foreground text-background' : playing ? 'bg-[var(--signal)] text-black' : 'border ss-hairline'}`}>
                            {completed ? <Check className="h-3 w-3" /> : playing ? <Play className="h-3 w-3 fill-current" /> : <Circle className="h-2.5 w-2.5 text-muted-foreground" />}
                          </span>
                          <span className={`text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-8">
          <div>
            <div className="pb-3 border-b ss-hairline">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Progress</p>
              <h2 className="mt-1">Plan status</h2>
            </div>
            <div className="py-5 border-b ss-hairline">
              <div className="flex items-center justify-between text-xs font-bold"><span>25% complete</span><span>1 / 4 weeks</span></div>
              <div className="mt-4 h-2 bg-muted overflow-hidden rounded-full"><div className="h-full w-1/4 bg-[var(--signal)]" /></div>
            </div>
          </div>
          <div>
            <div className="pb-3 border-b ss-hairline flex items-center justify-between">
              <div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Tutor</p><h2 className="mt-1">Need help?</h2></div>
              <Map className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="py-5 border-b ss-hairline text-xs text-muted-foreground">The tutor surface can use the same NVIDIA → OpenRouter provider chain when its backend endpoint is added.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
