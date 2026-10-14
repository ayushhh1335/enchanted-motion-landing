import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Aceternity's flip words: one word at a time, each letter blurring in while the last word flies off. */
export function FlipWords({ words, duration = 3000, className }: { words: string[]; duration?: number; className?: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const reduce = useReducedMotion();
  const word = words[index % words.length] ?? '';

  useEffect(() => {
    if (animating || words.length < 2) return;
    const id = window.setTimeout(() => {
      setIndex(i => (i + 1) % words.length);
      setAnimating(!reduce);
    }, duration);
    return () => window.clearTimeout(id);
  }, [animating, duration, reduce, words.length]);

  return <span className={cn('ui-flip', className)}>
    <span className="sr-only">{words.join(', ')}</span>
    {reduce ? <span className="ui-flip-word" aria-hidden="true">{word}</span> : <AnimatePresence onExitComplete={() => setAnimating(false)}>
      <motion.span
        key={word}
        className="ui-flip-word"
        aria-hidden="true"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        exit={{ opacity: 0, y: -40, x: 40, filter: 'blur(8px)', scale: 2, position: 'absolute' }}
      >
        {word.split(' ').map((part, w) => <motion.span
          key={part + w}
          className="ui-flip-part"
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: w * 0.3, duration: 0.3 }}
        >
          {part.split('').map((letter, l) => <motion.span
            key={part + l}
            className="ui-flip-letter"
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: w * 0.3 + l * 0.05, duration: 0.2 }}
          >{letter}</motion.span>)}
          {w < word.split(' ').length - 1 ? <span className="ui-flip-letter">&nbsp;</span> : null}
        </motion.span>)}
      </motion.span>
    </AnimatePresence>}
  </span>;
}
