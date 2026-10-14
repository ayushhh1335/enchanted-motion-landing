import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Aceternity's container scroll animation: a screen tilted back in 3D that stands up and settles as the
 * page scrolls, with the title drifting up ahead of it.
 */
export function ContainerScroll({ titleComponent, children, className }: { titleComponent: ReactNode; children: ReactNode; className?: string | undefined }) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container });
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : mobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -100]);

  return <div ref={container} className={cn('ui-cscroll', className)}>
    <div className="ui-cscroll-inner">
      <motion.div className="ui-cscroll-title" style={{ translateY: translate }}>{titleComponent}</motion.div>
      <motion.div className="ui-cscroll-card" style={{ rotateX: rotate, scale }}>
        <div className="ui-cscroll-screen">{children}</div>
      </motion.div>
    </div>
  </div>;
}
