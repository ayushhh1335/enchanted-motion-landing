import { useEffect } from 'react';
import { stagger, useAnimate, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Aceternity's text generate effect: words fade up out of a blur one after another, starting when the
 * paragraph scrolls into view. Words wrapped in *asterisks* get the `is-key` accent.
 */
export function TextGenerateEffect({ words, className, filter = true, duration = 0.5, delay = 0.08 }: {
  words: string;
  className?: string | undefined;
  filter?: boolean;
  duration?: number;
  /** Seconds between words. */
  delay?: number;
}) {
  const [scope, animate] = useAnimate<HTMLParagraphElement>();
  const inView = useInView(scope, { once: true, margin: '0px 0px -15% 0px' });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    void animate('span', { opacity: 1, filter: filter ? 'blur(0px)' : 'none' }, reduce ? { duration: 0 } : { duration, delay: stagger(delay) });
  }, [inView, animate, filter, duration, delay, reduce]);

  return <p ref={scope} className={cn('ui-tge', className)}>
    {words.split(' ').map((word, i) => {
      const key = /^\*.+\*[.,!?;:]*$/.test(word);
      return <span key={word + i} className={cn('ui-tge-word', key && 'is-key')} style={{ filter: filter ? 'blur(10px)' : 'none' }}>{key ? word.replace(/\*/g, '') : word}{' '}</span>;
    })}
  </p>;
}
