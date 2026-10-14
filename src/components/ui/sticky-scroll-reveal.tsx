import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '@/lib/utils';

export type StickyChapter = {
  id: string;
  eyebrow?: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  /** The picture that holds the sticky frame while this chapter is read. */
  content: ReactNode;
  tone: 'mint' | 'sky' | 'sun' | 'rose';
};

/**
 * Aceternity's sticky scroll reveal, driven by the page scroll: chapters scroll past on the left while one
 * frame stays pinned on the right and changes picture and color with the chapter being read.
 * Narrow screens show each picture under its chapter instead.
 */
export function StickyScroll({ chapters, className }: { chapters: StickyChapter[]; className?: string | undefined }) {
  const list = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: list, offset: ['start center', 'end center'] });

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    setActive(Math.min(chapters.length - 1, Math.max(0, Math.floor(latest * chapters.length))));
  });

  const current = chapters[active];
  return <div className={cn('ui-sticky', className)}>
    <div ref={list} className="ui-sticky-list">
      {chapters.map((chapter, i) => <article key={chapter.id} id={chapter.id} className={cn('ui-sticky-item', i === active && 'is-active')} aria-labelledby={`ui-sticky-${chapter.id}`}>
        <motion.div className="ui-sticky-copy" initial={false} animate={{ opacity: i === active ? 1 : 0.3 }} transition={{ duration: 0.35 }}>
          {chapter.eyebrow ? <p className="ui-sticky-eyebrow">{chapter.eyebrow}</p> : null}
          <h3 id={`ui-sticky-${chapter.id}`}>{chapter.title}</h3>
          <div className="ui-sticky-text">{chapter.description}</div>
          {chapter.action ? <div className="ui-sticky-action">{chapter.action}</div> : null}
        </motion.div>
        <div className={cn('ui-sticky-inline', `is-${chapter.tone}`)}>{chapter.content}</div>
      </article>)}
    </div>
    <div className="ui-sticky-aside" aria-hidden="true">
      <div className={cn('ui-sticky-frame', current && `is-${current.tone}`)}>
        {chapters.map((chapter, i) => <motion.div
          key={chapter.id}
          className="ui-sticky-scene"
          initial={false}
          animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 0.96, y: i === active ? 0 : i < active ? -16 : 16 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >{chapter.content}</motion.div>)}
      </div>
    </div>
  </div>;
}
