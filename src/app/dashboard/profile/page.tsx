'use client';

import { motion } from 'framer-motion';
import { Camera, Edit3, Shield, Star, MapPin, Link as LinkIcon, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const displayName = user?.displayName || 'New User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const email = user?.email || 'No email provided';

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-teal-400 to-blue-500 w-full" />
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-card bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-md">{initials}</div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-card border border-border rounded-full text-muted-foreground hover:text-foreground shadow-sm transition-colors"><Camera className="h-4 w-4" /></button>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"><Edit3 className="h-4 w-4" /> Edit Profile</button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">{displayName} <Shield className="h-5 w-5 text-emerald-500" /></h1>
            <p className="text-muted-foreground mt-1">{email}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> Earth</span><span className="flex items-center gap-1 text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded border border-border">New Member</span></div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm"><h2 className="text-lg font-semibold text-foreground mb-4">About Me</h2><p className="text-sm text-muted-foreground leading-relaxed italic">Bio has not been set yet.</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-foreground">Skill Exchange</h2></div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-muted border border-border flex flex-col items-center justify-center text-center py-8"><h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">I Can Teach</h3><p className="text-xs text-muted-foreground">No skills added yet.</p></div>
              <div className="p-4 rounded-xl bg-muted border border-border flex flex-col items-center justify-center text-center py-8"><h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">I Want To Learn</h3><p className="text-xs text-muted-foreground">No skills added yet.</p></div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8"><div className="bg-card p-6 rounded-2xl border border-border shadow-sm"><h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Achievements</h2><div className="flex flex-col items-center justify-center py-6 text-center"><Award className="h-10 w-10 text-muted-foreground mb-3 opacity-20" /><p className="text-sm font-semibold text-foreground">No Badges Yet</p><p className="text-xs text-muted-foreground mt-1">Complete your first session to start earning badges!</p></div></div></motion.div>
      </div>
    </div>
  );
}
