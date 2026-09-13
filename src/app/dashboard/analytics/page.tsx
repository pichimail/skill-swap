'use client';

import { Award, Clock3, TrendingUp, Video, Zap } from 'lucide-react';

const stats = [
  { label: 'Total sessions', value: '0', icon: Video },
  { label: 'Hours learned', value: '0h', icon: Clock3 },
  { label: 'Hours taught', value: '0h', icon: TrendingUp },
  { label: 'Skill points', value: '0', icon: Zap },
];

export default function AnalyticsPage() {
  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section>
        <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Progress</p>
        <h1 className="mt-3">Your analytics.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">Session activity, learning time and teaching impact will accumulate here as your exchange history grows.</p>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 border-y ss-hairline">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`py-5 px-0 sm:px-5 ${index % 2 === 1 ? 'border-l' : ''} xl:border-l xl:first:border-l-0 ${index > 1 ? 'border-t xl:border-t-0' : ''} ss-hairline`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-5 text-3xl font-black tracking-[-0.05em]">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-8 lg:gap-10">
        <div>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Learning growth</p>
            <h2 className="mt-1">Weekly activity</h2>
          </div>
          <div className="min-h-[250px] py-10 grid place-items-center border-b ss-hairline">
            <div className="text-center max-w-xs">
              <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-sm font-extrabold">Not enough data yet</h3>
              <p className="mt-2 text-xs text-muted-foreground">Complete sessions and the chart can render real learning-time events here.</p>
            </div>
          </div>
        </div>

        <div>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Skills</p>
            <h2 className="mt-1">Top skills taught</h2>
          </div>
          <div className="min-h-[250px] py-10 grid place-items-center border-b ss-hairline">
            <div className="text-center max-w-xs">
              <Award className="h-6 w-6 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-sm font-extrabold">No teaching history</h3>
              <p className="mt-2 text-xs text-muted-foreground">Skill rankings will come from completed session and analytics-event data.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
