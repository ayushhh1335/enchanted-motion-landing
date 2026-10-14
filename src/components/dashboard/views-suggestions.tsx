import { useState } from 'react';
import { Lightbulb, Send, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { seedSchools, seedSuggestions } from '@/content/admin-data';
import { ME_ID, me } from '@/content/dashboard-data';
import { SUGGESTION_MAX, deleteSharedSuggestions, mergeSuggestions, sendSuggestion, useSharedSuggestions } from '@/lib/student-sync';
import { EmptyState, PanelHead, agoText } from './shared';
import { ViewHeader } from './views-social';

const prompts = ['Longer library hours during finals', 'More mental health counselors', 'A late-night campus shuttle', 'Travel grants for hackathons'];

/** Suggestions go to the student's school admin and to ByeUni through shared browser storage. */
export function SuggestionsView() {
  const shared = useSharedSuggestions();
  const [text, setText] = useState('');
  const school = seedSchools.find(s => s.name === me.school);
  const mine = mergeSuggestions(seedSuggestions, shared).filter(s => s.userId === ME_ID);
  const trimmed = text.trim();

  function submit() {
    if (!school) return;
    if (trimmed.length < 10) { toast.error('Add a little more detail so your school knows what to change.'); return; }
    sendSuggestion({ schoolId: school.id, userId: ME_ID, text: trimmed });
    setText('');
    toast.success(`Sent to ${school.short}`, { description: 'Your school admin and ByeUni can read it now.' });
  }

  function withdraw(id: string) {
    deleteSharedSuggestions([id]);
    toast.success('Suggestion withdrawn');
  }

  return <div className="db-view">
    <ViewHeader title="Suggestions" subtitle={school ? `Ideas to make ${school.name} better. Your school admin reads every one.` : 'Ideas for your school.'} />
    {school ? <article className="db-panel db-suggest">
      <form className="db-form" onSubmit={event => { event.preventDefault(); submit(); }}>
        <label className="db-field">Your suggestion for {school.short}
          <textarea rows={4} value={text} maxLength={SUGGESTION_MAX} onChange={event => setText(event.target.value)} placeholder="What would make campus life better?" />
          <small className="db-count">{text.length}/{SUGGESTION_MAX}</small>
        </label>
        <div className="db-filter-row">{prompts.map(prompt => <button key={prompt} type="button" className="db-chip" onClick={() => setText(prompt)}>{prompt}</button>)}</div>
        <div className="db-suggest-foot">
          <small className="db-muted">Sent with your name. {school.short}’s admins and the ByeUni team can see it.</small>
          <Button type="submit" variant="ink" disabled={!trimmed}><Send /> Send suggestion</Button>
        </div>
      </form>
    </article> : <EmptyState icon={Lightbulb} title="Add your school first" body="Suggestions go to your school’s admins. Add your school in Settings to send one." />}
    <article className="db-panel">
      <PanelHead title={`Your suggestions${mine.length ? ` (${mine.length})` : ''}`} />
      {mine.length ? <ul className="db-suggest-list">{mine.map(s => <li key={s.id}>
        <span className="db-suggest-icon"><Lightbulb /></span>
        <div><p>“{s.text}”</p><small>Sent {agoText(s.at)} · {seedSchools.find(x => x.id === s.schoolId)?.short ?? 'Your school'}</small></div>
        <button type="button" className="db-icon-btn" aria-label="Withdraw suggestion" onClick={() => withdraw(s.id)}><Undo2 /></button>
      </li>)}</ul> : <p className="db-muted">Nothing sent yet. Your first idea could be the one that changes campus.</p>}
    </article>
  </div>;
}
