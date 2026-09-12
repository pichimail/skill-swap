'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Circle, PlayCircle, Trophy, Loader2 } from 'lucide-react';

interface WeekPlan {
  week: number;
  title: string;
  tasks: string[];
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [skill, setSkill] = useState('');
  const [weeks, setWeeks] = useState<WeekPlan[]>([
    {
      week: 1,
      title: 'Foundations of React',
      tasks: ['Understand Components & JSX', 'Props vs State', 'Build a simple Counter App'],
    },
    {
      week: 2,
      title: 'Hooks & Side Effects',
      tasks: ['Mastering useState', 'Understanding useEffect lifecycle', 'Build a Todo List'],
    },
    {
      week: 3,
      title: 'Advanced State Management',
      tasks: ['Context API for global state', 'useReducer for complex logic', 'Refactoring'],
    },
    {
      week: 4,
      title: 'Final Project Integration',
      tasks: ['Connecting to a REST API', 'Handling Loading & Errors', 'Deploying to Vercel'],
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, userId: user?.uid }),
      });

      if (!res.ok) throw new Error('Failed to generate roadmap');

      const data = await res.json();
      if (data.roadmap) {
        setWeeks(data.roadmap);
      }
    } catch (error) {
      console.error(error);
      alert('Could not generate roadmap. Ensure your Nvidia API key is valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Learning Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated curriculum powered by Nvidia Llama 3.</p>
        </div>
        
        <form onSubmit={handleGenerate} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Python for Data Science"
            className="flex-1 sm:w-64 px-4 py-2 text-sm rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !skill.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate
          </button>
        </form>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {weeks.map((w, i) => {
            const status = i === 0 ? 'completed' : i === 1 ? 'current' : 'upcoming';
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border ${status === 'current' ? 'bg-card border-teal-500 shadow-lg shadow-teal-500/10' : 'bg-card border-border shadow-sm'}`}
              >
                {status === 'current' && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    In Progress
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                    status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                    status === 'current' ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    W{w.week}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{w.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {status === 'completed' ? '100% Completed' : status === 'current' ? '33% Completed' : 'Not Started'}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {w.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-3">
                      {status === 'completed' || (status === 'current' && j === 0) ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : status === 'current' && j === 1 ? (
                        <PlayCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        status === 'completed' || (status === 'current' && j === 0) ? 'text-muted-foreground line-through' :
                        status === 'current' && j === 1 ? 'text-foreground font-medium' :
                        'text-muted-foreground'
                      }`}>
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6 bg-card border border-border shadow-sm text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Your Progress</h3>
            <div className="mt-4 mb-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 w-1/3" />
            </div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <BookOpen className="h-8 w-8 text-white/80 mb-4" />
            <h3 className="font-semibold mb-2">AI Tutor</h3>
            <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
              Need help with the current topic? Ask the AI tutor to explain with analogies or code examples.
            </p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold shadow-sm hover:bg-white/90 transition-colors">
              Chat with Tutor
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
