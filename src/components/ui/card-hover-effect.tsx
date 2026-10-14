import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type HoverCardItem = { id: string; title: string; description: string; icon?: ReactNode };

/** Aceternity's card hover effect: a highlight slides from card to card under the pointer. */
export function HoverEffect({ items, className }: { items: HoverCardItem[]; className?: string | undefined }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const layoutId = useId();
  return <div className={cn('ui-hover', className)}>
    {items.map((item, i) => <div key={item.id} className="ui-hover-cell" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
      <AnimatePresence>
        {hovered === i ? <motion.span
          className="ui-hover-bg"
          layoutId={layoutId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
        /> : null}
      </AnimatePresence>
      <article className="ui-hover-card">
        {item.icon ? <span className="ui-hover-icon">{item.icon}</span> : null}
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </article>
    </div>)}
  </div>;
}
