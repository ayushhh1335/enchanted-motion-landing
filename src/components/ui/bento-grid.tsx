import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Aceternity's bento grid: a three-column grid of feature tiles; tiles span columns through `className`. */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return <div className={cn('ui-bento', className)}>{children}</div>;
}

/** A tile: an illustration on top, then icon, title, and description, which nudge right on hover. */
export function BentoGridItem({ header, icon, title, description, className }: {
  header?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  className?: string | undefined;
}) {
  return <article className={cn('ui-bento-item', className)}>
    {header ? <div className="ui-bento-header">{header}</div> : null}
    <div className="ui-bento-copy">
      {icon ? <span className="ui-bento-icon">{icon}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </article>;
}
