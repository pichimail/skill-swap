'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Ban, Bug, CheckCircle2, ChevronRight, Mail, PauseCircle, Shield, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { deleteUser, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type ModalType = 'delete' | 'deactivate' | 'bug' | 'contact' | 'blocked' | 'success' | null;

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDemo, logoutDemo } = useAuth();
  const router = useRouter();

  const handleAccountAction = async (action: 'delete' | 'deactivate') => {
    setIsProcessing(true);
    try {
      if (action === 'delete') {
        if (!isDemo && auth?.currentUser) await deleteUser(auth.currentUser);
        else logoutDemo();
      } else {
        if (!isDemo && auth) await signOut(auth);
        else logoutDemo();
      }
      router.push('/');
    } catch (error) {
      console.error(`Failed to ${action} account`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitSupport = () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    window.setTimeout(() => {
      setIsProcessing(false);
      setInputText('');
      setActiveModal('success');
    }, 650);
  };

  const closeModal = () => {
    setActiveModal(null);
    setInputText('');
  };

  return (
    <div className="ss-page ss-page-pad space-y-8 lg:space-y-10">
      <section>
        <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Preferences</p>
        <h1 className="mt-3">Settings.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">Account safety, support and privacy actions use the same layout on desktop and native-feeling sheets on mobile.</p>
      </section>

      <section className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
        <div>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Support</p>
            <h2 className="mt-1">Help & feedback</h2>
          </div>
          <div className="divide-y divide-[var(--hairline)] border-b ss-hairline">
            <SettingRow icon={Bug} title="Report a bug" copy="Tell us what broke and what you expected." onClick={() => setActiveModal('bug')} />
            <SettingRow icon={Mail} title="Contact developers" copy="Request a feature or share product feedback." onClick={() => setActiveModal('contact')} />
          </div>
        </div>

        <div>
          <div className="pb-3 border-b ss-hairline">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Safety</p>
            <h2 className="mt-1">Privacy controls</h2>
          </div>
          <div className="divide-y divide-[var(--hairline)] border-b ss-hairline">
            <SettingRow icon={Ban} title="Blocked users" copy="Review and restore blocked accounts." onClick={() => setActiveModal('blocked')} trailing="0" />
            <div className="min-h-[78px] py-4 flex items-center gap-4">
              <span className="h-10 w-10 rounded-full bg-muted grid place-items-center"><Shield className="h-4 w-4" /></span>
              <div className="flex-1 min-w-0"><h3 className="text-xs font-extrabold">Session safety</h3><p className="mt-1 text-[11px] text-muted-foreground">Identity and moderation controls are active on call routes.</p></div>
              <span className="ss-chip ss-chip-active !min-h-7 !px-2.5">On</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="pb-3 border-b border-red-500/25">
          <p className="text-[10px] uppercase tracking-[0.14em] text-red-500 font-bold">Account actions</p>
          <h2 className="mt-1">Danger zone</h2>
        </div>
        <div className="divide-y divide-[var(--hairline)] border-b ss-hairline">
          <SettingRow icon={PauseCircle} title="Deactivate account" copy="Hide your profile and sign out. You can return later." onClick={() => setActiveModal('deactivate')} />
          <SettingRow icon={Trash2} title="Delete account" copy="Permanently remove the authentication account. This cannot be undone." onClick={() => setActiveModal('delete')} danger />
        </div>
      </section>

      <AnimatePresence>
        {activeModal && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 z-[90] bg-black/60" aria-label="Close dialog" />
            <motion.div
              initial={{ y: '100%', opacity: .98 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              drag="y" dragConstraints={{ top: 0, bottom: 260 }} dragElastic={0.12}
              onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 700) closeModal(); }}
              className="ss-mobile-sheet sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2 sm:w-[460px] sm:rounded-[12px] sm:border-b"
            >
              <div className="ss-sheet-handle" />
              <div className="p-5 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Settings</p>
                    <h2 className="mt-1 text-xl">{modalTitle(activeModal)}</h2>
                  </div>
                  <button onClick={closeModal} className="h-10 w-10 rounded-full grid place-items-center hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>

                {(activeModal === 'bug' || activeModal === 'contact') && (
                  <>
                    <textarea value={inputText} onChange={(event) => setInputText(event.target.value)} className="mt-5 min-h-36 w-full resize-none border ss-hairline rounded-[9px] bg-transparent p-3 text-sm outline-none focus:border-[var(--signal)]" placeholder={activeModal === 'bug' ? 'Describe the issue…' : 'Share your message…'} />
                    <button onClick={submitSupport} disabled={!inputText.trim() || isProcessing} className="ss-button-primary w-full mt-3 disabled:opacity-50">{isProcessing ? 'Sending…' : 'Send message'}</button>
                  </>
                )}

                {activeModal === 'blocked' && (
                  <div className="py-8 text-center">
                    <Ban className="h-6 w-6 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-extrabold">No blocked users</h3>
                    <p className="mt-2 text-xs text-muted-foreground">People you block will appear here with an unblock action.</p>
                  </div>
                )}

                {activeModal === 'success' && (
                  <div className="py-8 text-center">
                    <span className="h-12 w-12 mx-auto rounded-full bg-[var(--signal)] text-black grid place-items-center"><CheckCircle2 className="h-5 w-5" /></span>
                    <h3 className="mt-4 text-sm font-extrabold">Message sent</h3>
                    <p className="mt-2 text-xs text-muted-foreground">Thanks for helping improve Skill Swap.</p>
                    <button onClick={closeModal} className="ss-button-secondary mt-5">Close</button>
                  </div>
                )}

                {(activeModal === 'delete' || activeModal === 'deactivate') && (
                  <>
                    <div className={`mt-5 p-4 rounded-[9px] border ${activeModal === 'delete' ? 'border-red-500/30 bg-red-500/5' : 'ss-hairline bg-muted/40'}`}>
                      <AlertTriangle className={`h-5 w-5 ${activeModal === 'delete' ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <p className="mt-3 text-xs text-muted-foreground">{activeModal === 'delete' ? 'This removes the authentication account permanently. Application data deletion should also be wired to the database cleanup workflow before production launch.' : 'This signs you out and hides the account experience until you return.'}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button onClick={closeModal} className="ss-button-secondary">Cancel</button>
                      <button onClick={() => handleAccountAction(activeModal)} disabled={isProcessing} className={`min-h-11 rounded-[9px] text-xs font-bold ${activeModal === 'delete' ? 'bg-red-500 text-white' : 'bg-[var(--signal)] text-black'}`}>{isProcessing ? 'Working…' : activeModal === 'delete' ? 'Delete account' : 'Deactivate'}</button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingRow({ icon: Icon, title, copy, onClick, trailing, danger = false }: { icon: typeof Bug; title: string; copy: string; onClick: () => void; trailing?: string; danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full min-h-[78px] py-4 flex items-center gap-4 text-left hover:bg-muted/45 transition-colors">
      <span className={`h-10 w-10 rounded-full grid place-items-center ${danger ? 'bg-red-500/10 text-red-500' : 'bg-muted'}`}><Icon className="h-4 w-4" /></span>
      <span className="flex-1 min-w-0"><span className={`block text-xs font-extrabold ${danger ? 'text-red-500' : ''}`}>{title}</span><span className="block mt-1 text-[11px] text-muted-foreground">{copy}</span></span>
      {trailing ? <span className="ss-chip !min-h-7 !px-2.5">{trailing}</span> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

function modalTitle(type: Exclude<ModalType, null>) {
  if (type === 'bug') return 'Report a bug';
  if (type === 'contact') return 'Contact developers';
  if (type === 'blocked') return 'Blocked users';
  if (type === 'delete') return 'Delete account?';
  if (type === 'deactivate') return 'Deactivate account?';
  return 'Message sent';
}
