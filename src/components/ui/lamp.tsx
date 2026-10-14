import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const grow = { delay: 0.3, duration: 0.8, ease: 'easeInOut' } as const;

/** Aceternity's lamp: two conic beams open out from a glowing bar and light the content beneath them. */
export function LampContainer({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return <div className={cn('ui-lamp', className)}>
    <div className="ui-lamp-light" aria-hidden="true">
      <motion.div className="ui-lamp-cone is-left" initial={{ opacity: 0.5, width: '15rem' }} whileInView={{ opacity: 1, width: '30rem' }} viewport={{ once: true }} transition={grow}>
        <i className="is-bottom" /><i className="is-side" />
      </motion.div>
      <motion.div className="ui-lamp-cone is-right" initial={{ opacity: 0.5, width: '15rem' }} whileInView={{ opacity: 1, width: '30rem' }} viewport={{ once: true }} transition={grow}>
        <i className="is-side" /><i className="is-bottom" />
      </motion.div>
      <div className="ui-lamp-floor" />
      <div className="ui-lamp-haze" />
      <div className="ui-lamp-glow" />
      <motion.div className="ui-lamp-core" initial={{ width: '8rem' }} whileInView={{ width: '16rem' }} viewport={{ once: true }} transition={grow} />
      <motion.div className="ui-lamp-bar" initial={{ width: '15rem' }} whileInView={{ width: '30rem' }} viewport={{ once: true }} transition={grow} />
      <div className="ui-lamp-cap" />
    </div>
    <div className="ui-lamp-body">{children}</div>
  </div>;
}
