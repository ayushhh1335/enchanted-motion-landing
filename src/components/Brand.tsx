import { useId } from 'react';

/** Colors come from the --logo-* tokens, which follow the theme or the chosen logo style. */
export function LogoMark() {
  const id = useId().replace(/[^\w-]/g, '');
  return <svg className="bj-mark" viewBox="0 0 40 52" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-stem`} x2="0" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--logo-stem-a)' }} /><stop offset="1" style={{ stopColor: 'var(--logo-stem-b)' }} />
      </linearGradient>
      <linearGradient id={`${id}-rise`}>
        <stop offset="0" style={{ stopColor: 'var(--logo-rise-a)' }} /><stop offset="1" style={{ stopColor: 'var(--logo-rise-b)' }} />
      </linearGradient>
    </defs>
    <rect width="20" height="51.7" rx="10" fill={`url(#${id}-stem)`} />
    <rect x="-2.1" y="24.85" width="44.2" height="20" rx="10" transform="rotate(-34.35 20 34.85)" fill={`url(#${id}-rise)`} fillOpacity=".86" />
  </svg>;
}

export function Wordmark() {
  return <span className="bj-word" aria-hidden="true">byeun<span className="bj-i">ı</span></span>;
}
