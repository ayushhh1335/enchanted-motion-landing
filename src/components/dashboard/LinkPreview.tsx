import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';
import { TooltipCard } from '@/components/ui/tooltip-card';

const LINK = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const TRAILING = /[.,;:!?)\]}'"]+$/;

type FoundLink = { text: string; href: string };

function parse(raw: string): FoundLink | null {
  const text = raw.replace(TRAILING, '');
  const href = text.startsWith('www.') ? `https://${text}` : text;
  try {
    const url = new URL(href);
    return url.hostname.includes('.') ? { text, href: url.href } : null;
  } catch {
    return null;
  }
}

/** Unique links in a post, in the order they were typed. */
export function findLinks(text: string, limit = 3): FoundLink[] {
  const seen = new Set<string>();
  const found: FoundLink[] = [];
  for (const match of text.matchAll(LINK)) {
    const link = parse(match[0]);
    if (!link || seen.has(link.href)) continue;
    seen.add(link.href);
    found.push(link);
    if (found.length === limit) break;
  }
  return found;
}

const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, '');
const pathOf = (href: string) => {
  const { pathname, search } = new URL(href);
  return `${pathname === '/' ? '' : pathname}${search}` || '/';
};

/** Screenshot from microlink.io, as in Aceternity's link preview; a favicon card stands in when it can't load. */
export function LinkPreviewCard({ href }: { href: string }) {
  const [shot, setShot] = useState<'loading' | 'ready' | 'failed'>('loading');
  const host = hostOf(href);
  const src = `https://api.microlink.io/?url=${encodeURIComponent(href)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1200&viewport.height=750`;
  return <div className="lp-card">
    <div className="lp-shot">
      {shot !== 'failed' ? <img src={src} alt="" onLoad={() => setShot('ready')} onError={() => setShot('failed')} className={shot === 'ready' ? 'is-ready' : ''} /> : null}
      {shot === 'loading' ? <span className="lp-shimmer" aria-hidden="true" /> : null}
      {shot === 'failed' ? <span className="lp-fallback"><Globe /><b>{host}</b></span> : null}
    </div>
    <div className="lp-meta">
      <img className="lp-favicon" src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} alt="" />
      <span><strong>{host}</strong><small>{pathOf(href)}</small></span>
      <ArrowUpRight aria-hidden="true" />
    </div>
  </div>;
}

/** A link that previews its page in a tooltip card on hover or focus. */
export function PreviewLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <TooltipCard content={<LinkPreviewCard href={href} />}>
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  </TooltipCard>;
}

/** Post text with its links turned into previewing links. */
export function LinkedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const link = parse(match[0]);
    const start = match.index ?? 0;
    if (!link) continue;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<PreviewLink key={start} href={link.href} className="db-post-link">{link.text}</PreviewLink>);
    last = start + link.text.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function LinkChips({ links }: { links: FoundLink[] }) {
  if (!links.length) return null;
  return <div className="db-compose-links" aria-label="Links in this post">
    {links.map(link => <PreviewLink key={link.href} href={link.href} className="db-link-chip">
      <img src={`https://www.google.com/s2/favicons?domain=${hostOf(link.href)}&sz=32`} alt="" />
      <span><strong>{hostOf(link.href)}</strong><small>{pathOf(link.href)}</small></span>
      <ArrowUpRight aria-hidden="true" />
    </PreviewLink>)}
  </div>;
}
