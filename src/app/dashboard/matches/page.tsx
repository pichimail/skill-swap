'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal, Users, Video, ArrowRight } from 'lucide-react';

const filters = ['For you', 'Video ready', 'Beginner friendly', 'This week', 'Same timezone'];

export default function MatchesPage() {
  return (
    <div className="ss-page ss-page-pad space-y-7 lg:space-y-9">
      <section className="grid md:grid-cols-[1fr_minmax(260px,360px)] gap-5 items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Discovery</p>
          <h1 className="mt-3">Find your next skill swap.</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Search by skill, availability and session style. Match cards will populate from the live user and skills tables.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="search" placeholder="Search skills or people" className="ss-input pl-10 pr-12" />
          <button aria-label="Open filters" className="absolute right-1 top-1/2 -translate-y-1/2 min-h-9 min-w-9 grid place-items-center rounded-full hover:bg-muted"><SlidersHorizontal className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="ss-chip-rail" aria-label="Match filters">
        {filters.map((filter, index) => <button key={filter} className={`ss-chip ${index === 0 ? 'ss-chip-active' : ''}`}>{filter}</button>)}
      </section>

      <section className="border-y ss-hairline">
        <div className="min-h-[360px] lg:min-h-[420px] py-10 md:py-16 flex flex-col items-start md:items-center md:text-center justify-center">
          <span className="h-12 w-12 rounded-full bg-muted grid place-items-center"><Users className="h-5 w-5 text-muted-foreground" /></span>
          <h2 className="mt-4 text-xl font-extrabold">No live matches yet</h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">The discovery surface is ready for backend data. As users add teach/learn skills, matching results can render here without changing the layout.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/dashboard/profile" className="ss-button-primary">Complete profile <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/dashboard/call" className="ss-button-secondary"><Video className="h-4 w-4" /> Open call room</Link>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 border-b ss-hairline">
        {[
          ['01', 'Add teach skills', 'Tell the matcher what you can offer.'],
          ['02', 'Add learn skills', 'Set the topics you want to practice.'],
          ['03', 'Start swapping', 'Accept a match and move into messages or a call.'],
        ].map(([step, title, copy]) => (
          <div key={step} className="py-5 sm:px-5 sm:first:pl-0 border-t sm:border-t-0 sm:border-l first:border-l-0 ss-hairline">
            <span className="text-[10px] font-black text-muted-foreground">{step}</span>
            <h3 className="mt-2 text-sm font-extrabold">{title}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
