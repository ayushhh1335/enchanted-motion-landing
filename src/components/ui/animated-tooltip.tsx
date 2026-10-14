import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export type AnimatedTooltipItem = { id: string; name: string; designation: string; avatar: ReactNode };

/** Overlapping faces; hovering one swings a name tag above it that tilts with the cursor (Aceternity animated tooltip). */
export function AnimatedTooltip({ items, className }: { items: AnimatedTooltipItem[]; className?: string | undefined }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const x = useMotionValue(0);
  const frame = useRef<number | null>(null);
  const spring = { stiffness: 100, damping: 15 };
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), spring);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), spring);

  function track(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - rect.left - rect.width / 2;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => x.set(offset));
  }

  return <span className={cn('ui-atip', className)}>
    {items.map(item => <span
      key={item.id}
      className={cn('ui-atip-item', hovered === item.id && 'is-hovered')}
      onMouseEnter={() => setHovered(item.id)}
      onMouseLeave={() => setHovered(null)}
      onMouseMove={track}
    >
      <AnimatePresence>
        {hovered === item.id ? <motion.span
          role="tooltip"
          className="ui-atip-tag"
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 10 } }}
          exit={{ opacity: 0, y: 20, scale: 0.6 }}
          style={{ translateX, rotate }}
        >
          <i className="ui-atip-glow is-a" aria-hidden="true" />
          <i className="ui-atip-glow is-b" aria-hidden="true" />
          <b>{item.name}</b>
          <small>{item.designation}</small>
        </motion.span> : null}
      </AnimatePresence>
      {item.avatar}
    </span>)}
  </span>;
}
