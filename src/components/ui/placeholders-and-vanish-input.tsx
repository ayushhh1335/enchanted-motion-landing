import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

type Particle = { x: number; y: number; r: number; color: string };

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSubmit' | 'placeholder'> & {
  placeholders: string[];
  value: string;
  onValueChange: (value: string) => void;
  /** Runs on Enter. Return false to keep the text instead of vanishing it. */
  onSubmit?: ((value: string) => boolean | void) | undefined;
  children?: ReactNode;
};

const SIZE = 800;

/**
 * Aceternity's placeholders-and-vanish input: hints rotate every few seconds, and on Enter the
 * typed text breaks into particles. Text is drawn in the input's own color so every theme works.
 */
export const PlaceholdersAndVanishInput = forwardRef<HTMLInputElement, Props>(function PlaceholdersAndVanishInput(
  { placeholders, value, onValueChange, onSubmit, className, children, onKeyDown, ...rest },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | null>(null);
  const [hint, setHint] = useState(0);
  const [vanishing, setVanishing] = useState(false);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);

  useEffect(() => {
    if (placeholders.length < 2) return;
    let timer: number | undefined;
    const stop = () => { if (timer) window.clearInterval(timer); timer = undefined; };
    const start = () => { stop(); timer = window.setInterval(() => setHint(i => (i + 1) % placeholders.length), 3000); };
    const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [placeholders.length]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  function draw(text: string) {
    const field = input.current;
    const ctx = canvas.current?.getContext('2d', { willReadFrequently: true });
    if (!field || !ctx || !canvas.current) return;
    canvas.current.width = SIZE;
    canvas.current.height = SIZE;
    ctx.clearRect(0, 0, SIZE, SIZE);
    const style = getComputedStyle(field);
    ctx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * 2}px ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 40);
    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const found: Particle[] = [];
    for (let y = 0; y < 80; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const i = 4 * (y * SIZE + x);
        if ((data[i + 3] ?? 0) > 0) found.push({ x, y, r: 1, color: `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, ${(data[i + 3] ?? 255) / 255})` });
      }
    }
    particles.current = found;
  }

  function animate(start: number) {
    const frame = (pos: number) => {
      raf.current = requestAnimationFrame(() => {
        const next: Particle[] = [];
        for (const dot of particles.current) {
          if (dot.x < pos) { next.push(dot); continue; }
          if (dot.r <= 0) continue;
          dot.x += Math.random() > 0.5 ? 1 : -1;
          dot.y += Math.random() > 0.5 ? 1 : -1;
          dot.r -= 0.05 * Math.random();
          next.push(dot);
        }
        particles.current = next;
        const ctx = canvas.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(pos, 0, SIZE, SIZE);
          for (const dot of next) {
            if (dot.x <= pos) continue;
            ctx.beginPath();
            ctx.rect(dot.x, dot.y, dot.r, dot.r);
            ctx.fillStyle = dot.color;
            ctx.strokeStyle = dot.color;
            ctx.stroke();
          }
        }
        if (next.length > 0) frame(pos - 8);
        else { setVanishing(false); onValueChange(''); }
      });
    };
    frame(start);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Enter' || vanishing) return;
    event.preventDefault();
    const text = value;
    if (onSubmit?.(text) === false || !text.trim()) return;
    draw(text);
    setVanishing(true);
    animate(particles.current.reduce((max, dot) => Math.max(max, dot.x), 0));
  }

  return <div className={cn('ui-vanish', vanishing && 'is-vanishing', className)}>
    <canvas ref={canvas} className="ui-vanish-canvas" aria-hidden="true" />
    <input
      {...rest}
      ref={input}
      type="text"
      value={value}
      onChange={event => { if (!vanishing) onValueChange(event.target.value); }}
      onKeyDown={handleKey}
    />
    <div className="ui-vanish-hint" aria-hidden="true">
      <AnimatePresence mode="wait">
        {!value && !vanishing ? <motion.p
          key={`hint-${hint}`}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
        >{placeholders[hint]}</motion.p> : null}
      </AnimatePresence>
    </div>
    {children}
  </div>;
});
