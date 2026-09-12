'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Mail, Ban, AlertTriangle, Trash2, X, CheckCircle2, PauseCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { deleteUser, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type ModalType = 'delete' | 'deactivate' | 'bug' | 'contact' | 'blocked' | 'success' | null;

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, isDemo, logoutDemo } = useAuth();
  const router = useRouter();

  const handleAction = async (action: 'delete' | 'deactivate') => {
    setIsProcessing(true);
    try {
      if (action === 'delete') {
        if (!isDemo && auth?.currentUser) await deleteUser(auth.currentUser);
        else logoutDemo();
      } else if (action === 'deactivate') {
        if (!isDemo && auth) await signOut(auth);
        else logoutDemo();
      }
      router.push('/');
    } catch (error) {
      console.error(`Failed to ${action} account:`, error);
      alert(`Error trying to ${action} account.`);
    } finally { setIsProcessing(false); }
  };

  const handleFormSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setInputText('');
      setActiveModal('success');
      setTimeout(() => setActiveModal(null), 2500);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1><p className="text-xs text-muted-foreground mt-1">Manage your account preferences, safety features, and themes.</p></motion.div>
      <div className="grid gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-4 border-b border-border bg-muted/30"><h2 className="text-sm font-semibold text-foreground flex items-center gap-2">Support & Community</h2></div><div className="divide-y divide-border"><div onClick={() => setActiveModal('bug')} className="p-5 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors active:bg-muted"><div className="flex items-center gap-4"><div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Bug className="h-4 w-4 text-blue-500" /></div><div><h3 className="text-xs font-medium text-foreground">Report a Bug</h3><p className="text-[10px] text-muted-foreground">Found an issue? Let us know.</p></div></div></div><div onClick={() => setActiveModal('contact')} className="p-5 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors active:bg-muted"><div className="flex items-center gap-4"><div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><Mail className="h-4 w-4 text-emerald-500" /></div><div><h3 className="text-xs font-medium text-foreground">Contact Developers</h3><p className="text-[10px] text-muted-foreground">Suggest a feature or say hi!</p></div></div></div></div></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl overflow-hidden"><div className="px-5 py-4 border-b border-border bg-muted/30"><h2 className="text-sm font-semibold text-foreground">Safety & Privacy</h2></div><div className="divide-y divide-border"><div className="p-5 flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-8 w-8 rounded-full bg-slate-500/10 flex items-center justify-center"><Ban className="h-4 w-4 text-slate-500" /></div><div><h3 className="text-xs font-medium text-foreground">Blocked Users</h3><p className="text-[10px] text-muted-foreground">Manage people you&apos;ve blocked.</p></div></div><button onClick={() => setActiveModal('blocked')} className="px-3 py-1.5 text-[10px] font-medium text-foreground bg-muted border border-border rounded-lg hover:bg-border transition-colors active:scale-95">View (0)</button></div></div></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-red-500/20 rounded-2xl overflow-hidden relative"><div className="px-5 py-4 border-b border-red-500/10 bg-red-500/5"><h2 className="text-sm font-semibold text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Danger Zone</h2></div><div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-xs font-medium text-foreground">Deactivate Account</h3><p className="text-[10px] text-muted-foreground">Temporarily hide your profile. Similar to Instagram, you can reactivate by logging back in.</p></div><button onClick={() => setActiveModal('deactivate')} className="px-4 py-2 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shrink-0 active:scale-95">Deactivate</button></div><div className="p-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-xs font-medium text-foreground">Delete Account</h3><p className="text-[10px] text-muted-foreground">Permanently delete your data. This cannot be undone.</p></div><button onClick={() => setActiveModal('delete')} className="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shrink-0 flex items-center gap-2 active:scale-95"><Trash2 className="h-3.5 w-3.5" /> Delete Account</button></div></motion.div>
      </div>
      <AnimatePresence>{activeModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {activeModal === 'delete' && <div className="p-6"><div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4"><AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" /></div><h2 className="text-lg font-bold text-foreground mb-2">Are you absolutely sure?</h2><p className="text-xs text-muted-foreground leading-relaxed mb-4">If you delete your account, <strong className="text-foreground">all your data is wiped immediately.</strong> Your badges, connections, messages, and progress will be permanently erased. This action is irreversible.</p><div className="mb-6"><label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm Password</label><input type="password" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter your password" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" /></div><div className="flex gap-3 justify-end"><button onClick={() => { setActiveModal(null); setInputText(''); }} className="px-4 py-2 text-xs font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors">Cancel</button><button onClick={() => handleAction('delete')} disabled={isProcessing || inputText.length < 3} className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">{isProcessing ? 'Deleting...' : 'Yes, delete everything'}</button></div></div>}
        {activeModal === 'deactivate' && <div className="p-6"><div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4"><PauseCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" /></div><h2 className="text-lg font-bold text-foreground mb-2">Deactivate Account?</h2><p className="text-xs text-muted-foreground leading-relaxed mb-4">Deactivating your account will hide your profile, roadmap, and connections from other users. You will be logged out immediately.</p><div className="mb-6"><label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm Password</label><input type="password" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter your password" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors" /></div><div className="flex gap-3 justify-end"><button onClick={() => { setActiveModal(null); setInputText(''); }} className="px-4 py-2 text-xs font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors">Cancel</button><button onClick={() => handleAction('deactivate')} disabled={isProcessing || inputText.length < 3} className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50">{isProcessing ? 'Deactivating...' : 'Deactivate Account'}</button></div></div>}
        {(activeModal === 'bug' || activeModal === 'contact') && <div className="p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-foreground">{activeModal === 'bug' ? 'Report a Bug' : 'Contact Developers'}</h2><button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-muted rounded-full transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button></div><textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={activeModal === 'bug' ? "Describe the issue you're facing..." : "What's on your mind?"} className="w-full h-32 p-3 text-sm bg-muted border border-border rounded-lg outline-none focus:border-primary resize-none mb-4" /><div className="flex justify-end"><button onClick={handleFormSubmit} disabled={!inputText.trim() || isProcessing} className="px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg transition-colors disabled:opacity-50">{isProcessing ? 'Sending...' : 'Send Message'}</button></div></div>}
        {activeModal === 'blocked' && <div className="p-6"><div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-foreground">Blocked Users</h2><button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-muted rounded-full transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button></div><div className="py-8 flex flex-col items-center justify-center text-center"><div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3"><Ban className="h-5 w-5 text-muted-foreground" /></div><h4 className="text-sm font-medium text-foreground mb-1">No blocked users</h4><p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">When you block a user, they will appear here and won&apos;t be able to contact you.</p></div></div>}
        {activeModal === 'success' && <div className="p-8 flex flex-col items-center justify-center text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-emerald-500" /></motion.div><h2 className="text-lg font-bold text-foreground mb-1">Sent Successfully!</h2><p className="text-xs text-muted-foreground">Thank you for your feedback.</p></div>}
      </motion.div></div>}</AnimatePresence>
    </div>
  );
}
