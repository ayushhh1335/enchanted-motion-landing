import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

const GAP = 14;
const EDGE = 8;

/**
 * Aceternity's tooltip card: a card that unfolds next to the cursor and follows it. It renders in a
 * portal at fixed coordinates so cards and posts with hidden overflow can't clip it.
 */
export function TooltipCard({ content, children, className, width = 280 }: { content: ReactNode; children: ReactNode; className?: string | undefined; width?: number }) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [height, setHeight] = useState(0);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !body.current) return;
    const node = body.current;
    const measure = () => setHeight(node.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  const follow = (event: MouseEvent<HTMLElement>) => setPoint({ x: event.clientX, y: event.clientY });
  const fromFocus = (event: FocusEvent<HTMLElement>) => {
    const rect = event.target.getBoundingClientRect();
    setPoint({ x: rect.left, y: rect.bottom });
    setOpen(true);
  };

  let left = point.x + GAP;
  let top = point.y + GAP;
  if (typeof window !== 'undefined') {
    if (left + width > window.innerWidth - EDGE) left = point.x - width - GAP;
    if (top + height > window.innerHeight - EDGE) top = point.y - height - GAP;
    left = Math.max(EDGE, left);
    top = Math.max(EDGE, top);
  }

  return <span
    className={cn('ui-tcard-anchor', className)}
    onMouseEnter={event => { follow(event); setOpen(true); }}
    onMouseMove={follow}
    onMouseLeave={() => setOpen(false)}
    onFocus={fromFocus}
    onBlur={() => setOpen(false)}
  >
    {children}
    {typeof document !== 'undefined' ? createPortal(<AnimatePresence>
      {open ? <motion.div
        className="ui-tcard"
        role="tooltip"
        initial={{ height: 0, opacity: 1 }}
        animate={{ height, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ left, top, width }}
      >
        <div ref={body} className="ui-tcard-body">{content}</div>
      </motion.div> : null}
    </AnimatePresence>, document.body) : null}
  </span>;
}
