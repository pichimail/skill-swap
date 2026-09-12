'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Video, BookOpen, ChevronDown, Sun, Moon } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Footer from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Mouse tracking for interactive dots
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <AnimatedBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-[#f4f7fb]/80 dark:bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-sky-500/20">S</div>
              <span className="text-xl font-medium tracking-tight text-foreground">SkillSwap</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="#how-to-use" className="hover:text-foreground transition-colors">How to Use</Link>
              <Link href="#faqs" className="hover:text-foreground transition-colors">FAQs</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <Link href="/auth/signin" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:inline-flex">
              Log in
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex h-9 items-center justify-center rounded bg-[#0f172a] dark:bg-primary px-5 text-sm font-medium text-white dark:text-primary-foreground hover:opacity-90 transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 pb-32">
        {/* Hero Section */}
        <section 
          className="relative min-h-[calc(100vh-72px)] flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Subtle cursor glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 hidden lg:block opacity-40 dark:opacity-20 transition-opacity duration-300"
            animate={{
              background: isHovering
                ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56,189,248,0.1), transparent 80%)`
                : `radial-gradient(400px circle at 50% 50%, rgba(56,189,248,0.05), transparent 80%)`
            }}
          />

          <div className="container relative z-10 mx-auto px-6 text-center -mt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-medium text-sm mb-12 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                Null Node Active
              </motion.div>
              
              <motion.h1 
                className="text-[clamp(3.5rem,8vw,6rem)] font-black tracking-tighter leading-[1.05] text-[#0f172a] dark:text-white mb-10"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
              >
                <div className="flex flex-wrap justify-center gap-x-[clamp(10px,2vw,25px)] drop-shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                  {"Null Node".split(" ").map((word, i) => (
                    <motion.span
                      key={`l1-${i}`}
                      variants={{
                        hidden: { opacity: 0, y: 50, rotateX: -90 },
                        show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }
                      }}
                      whileHover={{ scale: 1.15, y: -15, color: "#38bdf8", textShadow: "0px 20px 30px rgba(56,189,248,0.6)" }}
                      className="inline-block cursor-pointer origin-bottom transition-colors"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </motion.h1>
            </motion.div>

            <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed mb-10 font-medium">
              Skill Swap sits directly in your browser, connecting you with learners globally in <strong className="font-semibold text-slate-900">HD video calls</strong>, enforcing safety, and auto-generating AI curriculums before your first session.
            </p>

            <motion.div 
              className="flex justify-center mt-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/auth/signin" className="relative group inline-block">
                {/* Glowing animated background layer */}
                <div className="absolute -inset-1 bg-sky-400 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                {/* Actual Button */}
                <button className="relative flex h-14 items-center justify-center rounded-lg bg-[#0f172a] px-10 text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="container mx-auto px-6 mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            {/* Mock Dashboard Header */}
            <div className="h-14 border-b border-slate-100 flex items-center px-4 bg-white/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
            </div>
            
            {/* School (Jackie Chan Video) Section */}
            <div className="p-10 border-t border-border">
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-border">
                <video 
                  controls 
                  playsInline
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                  src="https://res.cloudinary.com/bkgyexox/video/authenticated/s--gmhGj8z9--/v1789042026/chinna/d28d0245-695d-4276-9945-6b189e62c20d/files/generated/5d9484d0-d052-4fb0-984f-613853b49b50-result.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How it Works Section */}
        <section id="how-to-use" className="container mx-auto px-6 pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground font-medium">Three simple steps to start mastering any skill.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100" />
            
            {[
              { step: '01', title: 'Create Profile', desc: 'List the skills you want to learn and the skills you can teach.' },
              { step: '02', title: 'Get Matched', desc: 'Our algorithm instantly pairs you with someone who is the perfect inverse match.' },
              { step: '03', title: 'Swap Skills', desc: 'Jump into a video call, use the AI roadmap, and start exchanging knowledge.' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-xl font-bold text-slate-900 mb-6 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about Skill Swap.</p>
          </motion.div>
          
          <div className="bg-card p-10 md:p-14 rounded-[2.5rem] border border-border shadow-2xl">
            <Accordion className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-b-2">
                <AccordionTrigger className="text-left font-bold text-xl md:text-2xl text-foreground py-6 hover:no-underline">Is Skill Swap really free?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                  Yes! Skill Swap is 100% free forever. We believe in democratizing education through peer-to-peer exchange. There are no hidden fees or premium tiers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b-2">
                <AccordionTrigger className="text-left font-bold text-xl md:text-2xl text-foreground py-6 hover:no-underline">How does the AI Moderation work?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                  Our AI runs entirely in your browser during video calls. If a face is not detected for 5 seconds, the call is automatically disconnected to ensure safety and prevent inappropriate behavior.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-transparent">
                <AccordionTrigger className="text-left font-bold text-xl md:text-2xl text-foreground py-6 hover:no-underline">What is the Llama 3 Roadmap?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6 leading-relaxed">
                  When you match with a partner, our backend uses Nvidia Llama 3 to instantly generate a 4-week structured curriculum so you both know exactly what to learn and teach.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#0f172a] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight relative z-10">
              Ready to swap skills?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10">
              Join thousands of learners exchanging knowledge globally for free.
            </p>
            <Link 
              href="/auth/signin" 
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-slate-900 transition-transform hover:scale-105 active:scale-95 relative z-10 shadow-xl"
            >
              Get Started Now
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
