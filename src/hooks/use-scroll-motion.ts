import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = 'expo.out';
const HEADER_OFFSET = -88;
let activeLenis: Lenis | null = null;

/** Scroll to a section, smoothly through Lenis when it is running. */
export function scrollToSection(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  if (activeLenis) activeLenis.scrollTo(target, { offset: HEADER_OFFSET });
  else target.scrollIntoView();
}

const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/**
 * Page-wide motion: Lenis smooth scroll driven by the GSAP ticker, plus ScrollTrigger effects
 * wired up by selector / data attributes so markup stays declarative:
 *   data-reveal   stagger the container's text blocks in
 *   data-stagger  stagger the container's direct children in as they enter
 *   data-speed    scroll parallax (yPercent per unit of scroll)
 *   data-count    count the number in the element's text up from 0
 *   data-magnetic pull toward the pointer
 * Every h2 inside .bj-page gets a masked line reveal. Skipped entirely for reduced motion.
 */
export function useScrollMotion() {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    html.classList.add('has-motion', 'motion-pending');

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: HEADER_OFFSET }, prevent: node => !!node.closest('[role=dialog]') });
    activeLenis = lenis;
    const tick = (t: number) => lenis.raf(t * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const cleanups: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };
    const fine = window.matchMedia('(pointer: fine)').matches;

    // Radix dialogs lock the body; pause Lenis so the page behind stays put.
    const lockWatch = new MutationObserver(() => (document.body.hasAttribute('data-scroll-locked') ? lenis.stop() : lenis.start()));
    lockWatch.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });

    // Content height changes (images, filters, accordion) move every trigger below them.
    let refreshId = 0;
    const resizeWatch = new ResizeObserver(() => { clearTimeout(refreshId); refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 200); });
    const page = document.querySelector('.bj-page, .lp-page');
    if (page) resizeWatch.observe(page);

    const ctx = gsap.context(() => {
      // Header: floats as a pill once scrolled, tucks away while scrolling down.
      const header = document.querySelector<HTMLElement>('.bj-header');
      const syncHeader = (self: ScrollTrigger) => {
        header?.classList.toggle('is-scrolled', self.scroll() > 40);
        header?.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 480);
      };
      // onRefresh covers loads that restore a scroll position without a scroll event.
      if (header) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: syncHeader, onRefresh: syncHeader });

      // Containers whose text blocks rise in one after another (headings handle themselves).
      q('[data-reveal]').forEach(box => {
        const items = q(':scope > :not(div):not(h2), :scope > div > :not(h2)', box);
        if (!items.length) return;
        gsap.from(items, { y: 28, autoAlpha: 0, duration: 1, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: box, start: 'top 85%', once: true } });
      });

      // Grids: children enter in batches as they reach the viewport.
      const tiles = q('[data-stagger] > :not([data-reveal])');
      gsap.set(tiles, { y: 60, autoAlpha: 0 });
      ScrollTrigger.batch(tiles, {
        start: 'top 92%', once: true,
        onEnter: batch => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, ease: EASE, stagger: 0.09, overwrite: true }),
      });

      q('[data-speed]').forEach(el => gsap.to(el, {
        yPercent: () => -Number(el.dataset['speed']) * 100, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      }));

      q('.bj-bar > span, .goal-bar > span').forEach(bar => gsap.from(bar, {
        width: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: bar, start: 'top 95%', once: true },
      }));

      q('[data-count]').forEach(el => {
        const text = el.textContent ?? '';
        const match = text.match(/\d[\d,.]*/);
        if (!match) return;
        const end = parseFloat(match[0].replace(/,/g, ''));
        const digits = (match[0].split('.')[1] ?? '').length;
        const fmt = (v: number) => text.replace(match[0], v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }));
        const state = { v: 0 };
        el.textContent = fmt(0);
        cleanups.push(() => { el.textContent = text; });
        gsap.to(state, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(state.v); }, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
      });

      q('[data-clip]').forEach(img => gsap.from(img, {
        clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15, duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: img, start: 'top 88%', once: true },
      }));

      // Hero: copy drifts up faster than the product, which settles flat as you scroll.
      if (document.querySelector('.bj-hero')) {
        gsap.to('.bj-copy', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.bj-hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.bj-app', { scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.bj-hero', start: 'center center', end: 'bottom top', scrub: true } });
      }

      // Campus film opens from a rounded inset to full bleed, while the picture eases back from a zoom.
      const film = { trigger: '.bj-film', start: 'top bottom', end: 'top top', scrub: true };
      gsap.fromTo('.bj-film-frame', { clipPath: 'inset(7% 9% 7% 9% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: film });
      gsap.fromTo('.bj-film-video', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: film });

      // Marquee loop that speeds up, reverses and leans with scroll velocity.
      const track = document.querySelector<HTMLElement>('.bj-marquee-track');
      if (track) {
        const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
        const handler = ({ velocity, direction }: Lenis) => {
          gsap.to(loop, { timeScale: (direction || 1) * (1 + Math.min(Math.abs(velocity) / 6, 5)), duration: 0.4, overwrite: true });
          skew(gsap.utils.clamp(-8, 8, -velocity * 0.4));
        };
        lenis.on('scroll', handler);
      }

      // Journey: horizontal scroll through the four steps while the section is pinned.
      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());
      mm.add('(min-width: 1101px)', () => {
        const section = document.querySelector<HTMLElement>('#journey');
        const path = section?.querySelector<HTMLElement>('.path');
        if (!section || !path) return;
        const distance = () => path.scrollWidth - (section.clientWidth - parseFloat(getComputedStyle(section).paddingLeft) * 2);
        const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true } });
        tl.to(path, { x: () => -distance(), ease: 'none' }, 0).from('.path-progress span', { scaleX: 0, ease: 'none' }, 0);
      });

      // Closing card grows to full width and rounds off as it arrives.
      if (document.querySelector('.bj-close')) gsap.from('.bj-close', { scale: 0.9, borderRadius: 64, ease: 'none', scrollTrigger: { trigger: '.bj-close', start: 'top bottom', end: 'top 45%', scrub: true } });
      if (document.querySelector('.bj-wordmark')) gsap.from('.bj-wordmark span', { yPercent: 100, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: '.bj-wordmark', start: 'top bottom', end: 'bottom bottom', scrub: true } });

      if (fine) {
        q('[data-magnetic]').forEach(el => {
          const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          on(el, 'pointermove', e => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35); });
          on(el, 'pointerleave', () => { x(0); y(0); });
        });
        const hero = document.querySelector<HTMLElement>('.bj-hero');
        const stage = document.querySelector<HTMLElement>('.bj-stage');
        if (hero && stage) {
          const rx = gsap.quickTo(stage, 'rotationX', { duration: 1, ease: 'power3' });
          const ry = gsap.quickTo(stage, 'rotationY', { duration: 1, ease: 'power3' });
          on(hero, 'pointermove', e => { const r = hero.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 8); rx(-((e.clientY - r.top) / r.height - 0.5) * 6); });
          on(hero, 'pointerleave', () => { rx(0); ry(0); });
        }
      }
    });

    // Split text needs final font metrics, but never hold the hero back for long.
    let dead = false;
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(() => {
      if (dead) return;
      ctx.add(() => {
        // autoSplit re-splits on resize; the returned tween's progress carries over to the new split.
        if (document.querySelector('.bj-hero')) {
          SplitText.create('.bj-copy h1', {
            type: 'lines,words', mask: 'lines', linesClass: 'sl', autoSplit: true,
            onSplit: self => gsap.from(self.words, { yPercent: 115, rotate: 4, stagger: 0.07, duration: 1.2, ease: EASE, delay: 0.1 }),
          });
          gsap.timeline({ defaults: { ease: EASE, duration: 1.2 } })
            .from('.bj-pill', { y: -14, autoAlpha: 0, duration: 0.8 })
            .from('.bj-copy h1 em', { '--marker': 0, duration: 1, ease: 'power3.inOut' }, 0.75)
            .from('.bj-lead, .bj-cta > *, .bj-social', { y: 22, autoAlpha: 0, stagger: 0.08 }, 0.5)
            .from('.bj-app', { y: 90, rotationX: 16, autoAlpha: 0, duration: 1.6, transformPerspective: 1400 }, 0.25)
            .from('.bj-scene', { scale: 0.4, autoAlpha: 0, duration: 1.6 }, 0.6)
            .from('.bj-chip', { scale: 0.6, autoAlpha: 0, stagger: 0.15, ease: 'back.out(2)', duration: 0.8 }, 1)
            .from('.bj-marquee', { autoAlpha: 0, y: 40, duration: 1 }, 0.9);
        }

        q('.bj-page h2').forEach(h2 => SplitText.create(h2, {
          type: 'lines', mask: 'lines', linesClass: 'sl', autoSplit: true,
          onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: h2, start: 'top 88%', once: true } }),
        }));
      });
      html.classList.remove('motion-pending');
      ScrollTrigger.refresh();
    });

    return () => {
      dead = true;
      ctx.revert(); // first: reverting re-renders tweens at 0, which would clobber restored text
      cleanups.forEach(fn => fn());
      lockWatch.disconnect();
      resizeWatch.disconnect();
      clearTimeout(refreshId);
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
      html.classList.remove('has-motion', 'motion-pending');
    };
  }, []);
}
