'use client';

import Link from 'next/link';
import { MessageSquare, Search, Users, ArrowRight } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="ss-page min-h-[calc(100dvh-56px)] lg:min-h-[calc(100dvh-64px)] grid lg:grid-cols-[320px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r ss-hairline p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Inbox</p>
            <h1 className="mt-1 text-xl lg:text-2xl">Messages</h1>
          </div>
          <span className="h-9 min-w-9 px-2 rounded-full bg-[var(--signal)] text-black grid place-items-center text-[10px] font-black">0</span>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="ss-input pl-10" placeholder="Search conversations" aria-label="Search conversations" />
        </div>
        <div className="mt-5 py-7 border-y ss-hairline text-center lg:text-left">
          <Users className="h-5 w-5 mx-auto lg:mx-0 text-muted-foreground" />
          <p className="mt-3 text-xs font-extrabold">No conversations yet</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Accepted matches will appear in this rail.</p>
        </div>
      </aside>

      <section className="min-h-[430px] p-5 md:p-8 flex items-center justify-center">
        <div className="max-w-sm text-center">
          <span className="h-14 w-14 mx-auto rounded-full bg-muted grid place-items-center"><MessageSquare className="h-6 w-6 text-muted-foreground" /></span>
          <h2 className="mt-4 text-xl font-extrabold">Start with a match.</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Messages are tied to matched skill-exchange partners. Once a conversation exists, this space becomes the full chat view on desktop and a native full-screen thread on mobile.</p>
          <Link href="/dashboard/matches" className="ss-button-primary mt-5">Browse matches <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
