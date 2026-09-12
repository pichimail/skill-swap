'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, Zap, Video } from 'lucide-react';

const fadeUp = (d = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { delay: d, duration: 0.4 } },
});

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Your Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your learning progress and teaching impact.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', val: '0', icon: Video, color: 'text-primary' },
          { label: 'Hours Learned', val: '0h', icon: Clock, color: 'text-emerald-500' },
          { label: 'Hours Taught', val: '0h', icon: TrendingUp, color: 'text-amber-500' },
          { label: 'Skill Points', val: '0', icon: Zap, color: 'text-purple-500' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp(i * 0.1)} initial="hidden" animate="visible" className="p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeUp(0.4)} initial="hidden" animate="visible" className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="font-semibold text-foreground mb-6">Learning Growth</h2>
          <div className="h-48 w-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
             <TrendingUp className="h-6 w-6 mb-2 opacity-20" />
             <p className="text-sm">Not enough data yet.</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp(0.5)} initial="hidden" animate="visible" className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="font-semibold text-foreground mb-6">Top Skills Taught</h2>
          <div className="h-48 w-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
             <Award className="h-6 w-6 mb-2 opacity-20" />
             <p className="text-sm">Complete your first session.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
