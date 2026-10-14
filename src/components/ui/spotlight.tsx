import { useId } from 'react';
import { cn } from '@/lib/utils';

type SpotlightProps = { className?: string | undefined; fill?: string; strength?: number };

/**
 * Aceternity's spotlight: a soft beam that sweeps in from the top-left once and stays on what it lights.
 * Lives inside a `position: relative` box; `className` moves where the beam lands.
 */
export function Spotlight({ className, fill = 'var(--spotlight)', strength = 0.21 }: SpotlightProps) {
  const filter = `ui-spotlight-${useId().replace(/[^\w-]/g, '')}`;
  return <svg className={cn('ui-spotlight animate-spotlight', className)} viewBox="0 0 3787 2842" fill="none" aria-hidden="true" focusable="false">
    <g filter={`url(#${filter})`}>
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        style={{ fill, fillOpacity: strength }}
      />
    </g>
    <defs>
      <filter id={filter} x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="151" result="beam" />
      </filter>
    </defs>
  </svg>;
}

/** For cards: clips the beam to the card's rounded box and paints it under the card's content. The card needs `has-spotlight`. */
export function SpotlightLayer(props: SpotlightProps) {
  return <span className="ui-spotlight-layer" aria-hidden="true"><Spotlight {...props} /></span>;
}
