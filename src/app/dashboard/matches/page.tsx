'use client';

import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">Browse Matches</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the perfect partner to exchange skills with.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search by skill..." 
            className="h-10 w-full rounded-lg px-3 py-2 text-sm pl-9 outline-none text-foreground bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="w-full bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm"
      >
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">No users available right now</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Skill Swap is currently empty. As new learners join the platform and set up their profiles, they will automatically appear here. Check back later to find your perfect match!
        </p>
        <button 
          disabled
          className="px-6 py-2.5 bg-muted text-muted-foreground text-sm font-medium rounded-lg cursor-not-allowed"
        >
          Waiting for users...
        </button>
      </motion.div>
    </div>
  );
}
