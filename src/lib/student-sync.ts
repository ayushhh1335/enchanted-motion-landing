import { useEffect, useState } from 'react';
import type { Suggestion } from '@/content/admin-data';
import type { CvContent, CvProfile } from '@/content/cvision-data';
import type { Account } from '@/content/dashboard-data';

/**
 * The three demo dashboards keep separate stores, so anything a student sends to the
 * school or ByeUni goes through this shared browser-storage layer instead.
 */
const SUGGESTIONS_KEY = 'byeuni-suggestions-v1';
const DASHBOARD_KEY = 'byeuni-dashboard-v1';
const SYNC_EVENT = 'byeuni-sync';

export const SUGGESTION_MAX = 500;

export type SharedSuggestions = { added: Suggestion[]; deleted: string[] };

function readSuggestions(): SharedSuggestions {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    const saved = raw ? JSON.parse(raw) as Partial<SharedSuggestions> : {};
    return { added: Array.isArray(saved.added) ? saved.added : [], deleted: Array.isArray(saved.deleted) ? saved.deleted : [] };
  } catch {
    return { added: [], deleted: [] };
  }
}

function writeSuggestions(next: SharedSuggestions) {
  try { localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(next)); } catch { /* Kept for this page only. */ }
  window.dispatchEvent(new Event(SYNC_EVENT));
}

export function sendSuggestion(input: Pick<Suggestion, 'schoolId' | 'userId' | 'text'>): Suggestion {
  const suggestion: Suggestion = { ...input, id: `sg-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: Date.now() };
  const current = readSuggestions();
  writeSuggestions({ ...current, added: [suggestion, ...current.added] });
  return suggestion;
}

/** Hides suggestions everywhere, whether a student sent them or they came with the demo. */
export function deleteSharedSuggestions(ids: string[]) {
  if (!ids.length) return;
  const current = readSuggestions();
  writeSuggestions({
    added: current.added.filter(s => !ids.includes(s.id)),
    deleted: [...new Set([...current.deleted, ...ids.filter(id => !current.added.some(s => s.id === id))])],
  });
}

export function mergeSuggestions(base: Suggestion[], shared: SharedSuggestions, schoolId?: string): Suggestion[] {
  const sent = shared.added.filter(s => !schoolId || s.schoolId === schoolId);
  const ids = new Set(sent.map(s => s.id));
  return [...sent, ...base.filter(s => !ids.has(s.id))]
    .filter(s => !shared.deleted.includes(s.id))
    .sort((a, b) => b.at - a.at);
}

function useStorageSync<T>(read: () => T, key: string): T {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const refresh = () => setValue(read());
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) refresh(); };
    refresh();
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}

export const useSharedSuggestions = () => useStorageSync(readSuggestions, SUGGESTIONS_KEY);

/* ---------------- The signed-in demo student's own profile ---------------- */

export type LiveStudent = { profile: Partial<CvProfile>; content: Partial<CvContent>; account: Partial<Account> };

function readLiveStudent(): LiveStudent | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { profile?: Partial<CvProfile>; cv?: { content?: Partial<CvContent> }; account?: Partial<Account> };
    return { profile: saved.profile ?? {}, content: saved.cv?.content ?? {}, account: saved.account ?? {} };
  } catch {
    return null;
  }
}

/** What the demo student last saved on their dashboard and CVision, so consoles show their edits. */
export const useLiveStudent = () => useStorageSync(readLiveStudent, DASHBOARD_KEY);
