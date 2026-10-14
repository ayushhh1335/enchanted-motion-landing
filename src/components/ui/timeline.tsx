import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export type TimelineEntry = { id: string; title: string; caption?: string; content: ReactNode };

/** Aceternity's timeline: sticky dates down the left and a beam that fills the rail as the page scrolls. */
export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string | undefined }) {
  const track = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 10%', 'end 50%'] });
  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => setHeight(node.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={track} className={cn('ui-timeline', className)}>
    {entries.map(entry => <section key={entry.id} className="ui-timeline-row" aria-labelledby={`ui-tl-${entry.id}`}>
      <div className="ui-timeline-mark">
        <span className="ui-timeline-dot" aria-hidden="true"><i /></span>
        <h3 id={`ui-tl-${entry.id}`}>{entry.title}{entry.caption ? <small>{entry.caption}</small> : null}</h3>
      </div>
      <div className="ui-timeline-body">{entry.content}</div>
    </section>)}
    <div className="ui-timeline-rail" style={{ height }} aria-hidden="true">
      <motion.div className="ui-timeline-beam" style={{ height: beamHeight, opacity: beamOpacity }} />
    </div>
  </div>;
}
