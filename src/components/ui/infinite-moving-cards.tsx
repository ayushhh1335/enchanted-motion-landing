import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type MovingCard = { id: string; quote: string; name: string; title: string; avatar?: ReactNode };

const speeds = { fast: '30s', normal: '50s', slow: '90s' } as const;

/**
 * Aceternity's infinite moving cards: a looping row of quote cards that fades out at both edges and
 * pauses on hover. The second copy of the row is hidden from assistive tech.
 */
export function InfiniteMovingCards({ items, direction = 'left', speed = 'normal', pauseOnHover = true, className }: {
  items: MovingCard[];
  direction?: 'left' | 'right';
  speed?: keyof typeof speeds;
  pauseOnHover?: boolean;
  className?: string | undefined;
}) {
  const style = { '--ui-imc-duration': speeds[speed], '--ui-imc-direction': direction === 'left' ? 'normal' : 'reverse' } as CSSProperties;
  const card = (item: MovingCard, copy: boolean) => <li key={`${item.id}${copy ? '-copy' : ''}`} className="ui-imc-card" aria-hidden={copy || undefined}>
    <blockquote>
      <p>{item.quote}</p>
      <footer>
        {item.avatar}
        <span><strong>{item.name}</strong><small>{item.title}</small></span>
      </footer>
    </blockquote>
  </li>;
  return <div className={cn('ui-imc', className)} style={style}>
    <ul className={cn('ui-imc-track', pauseOnHover && 'is-pausable')}>
      {items.map(item => card(item, false))}
      {items.map(item => card(item, true))}
    </ul>
  </div>;
}
