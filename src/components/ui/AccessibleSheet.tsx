'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  widthClass?: string;
};

export function AccessibleSheet({ open, onClose, title, description, children, widthClass = 'sm:w-[480px]' }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button aria-label="Close dialog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] bg-black/60" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ y: '100%', opacity: .98 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            drag="y" dragConstraints={{ top: 0, bottom: 260 }} dragElastic={0.12}
            onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 700) onClose(); }}
            className={`ss-mobile-sheet sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2 ${widthClass} sm:rounded-[12px] sm:border-b outline-none`}
          >
            <div className="ss-sheet-handle" aria-hidden="true" />
            <div className="p-5 pt-3">
              <div className="flex items-start justify-between gap-3">
                <div><h2 id={titleId} className="text-xl">{title}</h2>{description && <p id={descriptionId} className="mt-2 text-xs text-muted-foreground">{description}</p>}</div>
                <button onClick={onClose} className="min-h-11 min-w-11 rounded-full grid place-items-center hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
