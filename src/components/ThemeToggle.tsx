import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('byeuni-theme'); } catch { /* Theme still works without storage. */ }
    const preferred = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(preferred);
    document.documentElement.classList.toggle('dark', preferred);
    // Other controls (dashboard settings) can flip the theme too.
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('byeuni-theme', next ? 'dark' : 'light'); } catch { /* Preference is optional. */ }
  }
  return <Button variant="ghost" size="icon" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggle}>{dark ? <Sun /> : <Moon />}</Button>;
}
