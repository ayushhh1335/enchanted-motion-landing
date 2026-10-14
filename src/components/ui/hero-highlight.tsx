import type { MouseEvent, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

/** Aceternity's hero highlight: a dot grid whose dots light up in the accent color around the pointer. */
export function HeroHighlight({ children, className, containerClassName }: { children: ReactNode; className?: string | undefined; containerClassName?: string | undefined }) {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const mask = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, black 0%, transparent 100%)`;

  function track(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return <div className={cn('ui-hh', containerClassName)} onMouseMove={track}>
    <div className="ui-hh-dots" aria-hidden="true" />
    <motion.div className="ui-hh-dots is-lit" aria-hidden="true" style={{ WebkitMaskImage: mask, maskImage: mask }} />
    <div className={cn('ui-hh-body', className)}>{children}</div>
  </div>;
}

/** The marker that sweeps behind a phrase once it scrolls into view. */
export function Highlight({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return <motion.span
    className={cn('ui-hh-mark', className)}
    initial={{ backgroundSize: '0% 100%' }}
    whileInView={{ backgroundSize: '100% 100%' }}
    viewport={{ once: true, margin: '0px 0px -20% 0px' }}
    transition={{ duration: 2, ease: 'linear', delay: 0.5 }}
  >{children}</motion.span>;
}
