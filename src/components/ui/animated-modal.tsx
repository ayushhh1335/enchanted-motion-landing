import { createContext, useContext, useState, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalState = { open: boolean; setOpen: (open: boolean) => void };
const ModalContext = createContext<ModalState | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within <Modal>');
  return context;
}

/**
 * Aceternity's animated modal, built on Radix Dialog so focus, Escape, and scroll locking
 * work like the other dialogs. Pass `open` to control it from outside.
 */
export function Modal({ open: controlled, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  const [inner, setInner] = useState(false);
  const open = controlled ?? inner;
  const setOpen = (next: boolean) => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return <ModalContext.Provider value={{ open, setOpen }}>
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>{children}</DialogPrimitive.Root>
  </ModalContext.Provider>;
}

export function ModalTrigger({ children, className, asChild = false }: { children: ReactNode; className?: string; asChild?: boolean }) {
  return <DialogPrimitive.Trigger asChild={asChild} className={cn(!asChild && 'ui-amodal-trigger', className)}>{children}</DialogPrimitive.Trigger>;
}

export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useModal();
  const reduce = useReducedMotion();
  return <AnimatePresence>
    {open ? <DialogPrimitive.Portal forceMount>
      <DialogPrimitive.Overlay asChild forceMount>
        <motion.div className="ui-amodal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      </DialogPrimitive.Overlay>
      <div className="ui-amodal-stage">
        <DialogPrimitive.Content asChild forceMount>
          <motion.div
            className={cn('ui-amodal', className)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotateX: 40, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, rotateX: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          >
            <DialogPrimitive.Close className="ui-amodal-close" aria-label="Close"><X /></DialogPrimitive.Close>
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal> : null}
  </AnimatePresence>;
}

export function ModalContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('ui-amodal-content', className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('ui-amodal-footer', className)}>{children}</div>;
}

export const ModalTitle = DialogPrimitive.Title;
export const ModalDescription = DialogPrimitive.Description;
export const ModalClose = DialogPrimitive.Close;
