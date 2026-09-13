'use client';

import { Camera, Edit3, MapPin, ShieldCheck, Award, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const displayName = user?.displayName || 'New User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const email = user?.email || 'No email provided';

  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section className="border-b ss-hairline pb-7 lg:pb-9">
        <div className="h-20 sm:h-28 bg-[var(--signal)] ss-chamfer" />
        <div className="-mt-8 sm:-mt-10 px-1 sm:px-4 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
          <div className="relative w-fit">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] border-background bg-foreground text-background grid place-items-center text-xl sm:text-2xl font-black">{initials}</div>
            <button aria-label="Change profile photo" className="absolute -right-1 bottom-1 h-9 w-9 rounded-full border ss-hairline bg-background grid place-items-center"><Camera className="h-4 w-4" /></button>
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl truncate">{displayName}</h1>
              <ShieldCheck className="h-5 w-5 text-[var(--foreground)]" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate">{email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Earth</span>
              <span className="ss-chip !min-h-7 !px-2.5">New member</span>
            </div>
          </div>
          <button className="ss-button-primary sm:mb-1"><Edit3 className="h-4 w-4" /> Edit profile</button>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
        <div className="space-y-9">
          <div>
            <div className="flex items-center justify-between pb-3 border-b ss-hairline">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">About</p>
                <h2 className="mt-1">Profile summary</h2>
              </div>
              <button className="min-h-10 min-w-10 grid place-items-center rounded-full hover:bg-muted"><Edit3 className="h-4 w-4" /></button>
            </div>
            <p className="py-6 text-sm text-muted-foreground border-b ss-hairline">Add a short bio about the skills you enjoy teaching, what you want to learn, and how you prefer to collaborate.</p>
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b ss-hairline">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Skill exchange</p>
                <h2 className="mt-1">Teach & learn</h2>
              </div>
              <button className="ss-button-secondary !min-h-9 !px-3"><Plus className="h-4 w-4" /> Add skill</button>
            </div>
            <div className="grid sm:grid-cols-2 border-b ss-hairline">
              <div className="py-6 sm:pr-6 sm:border-r ss-hairline">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">I can teach</p>
                <p className="mt-4 text-sm font-bold">No skills added</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Add at least one skill so other learners can discover you.</p>
              </div>
              <div className="py-6 sm:pl-6 border-t sm:border-t-0 ss-hairline">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">I want to learn</p>
                <p className="mt-4 text-sm font-bold">No skills added</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Your learning interests improve match relevance.</p>
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Achievements</p>
            <h2 className="mt-1">Badges</h2>
          </div>
          <div className="py-8 border-b ss-hairline text-center">
            <span className="h-12 w-12 mx-auto rounded-full bg-muted grid place-items-center"><Award className="h-5 w-5 text-muted-foreground" /></span>
            <h3 className="mt-4 text-sm font-extrabold">No badges yet</h3>
            <p className="mt-2 text-[11px] text-muted-foreground">Complete and verify your first skill-swap session to start earning badges.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
