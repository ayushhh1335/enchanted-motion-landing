import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { motion, useReducedMotion } from 'motion/react';
import { Copy, Quote as QuoteMark, Settings2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalTitle } from '@/components/ui/animated-modal';
import { readSession, type DemoRole } from '@/lib/demo-session';
import { markQuoteSeen, quoteDue, todaysQuote, useSharedQuotes } from '@/lib/student-sync';

const OPEN_EVENT = 'byeuni-quote-open';

/** Opens today's quote again from a menu. */
export const openQuoteOfTheDay = () => window.dispatchEvent(new Event(OPEN_EVENT));

const notes: Record<DemoRole, string> = {
  student: 'Every ByeUni student sees this quote today.',
  school: 'Your students see this quote on their home feed today.',
  admin: 'Students and school admins see this quote today.',
};

/** Today's quote from the admin library, shown once a day and after each sign-in, on all three dashboards. */
export function QuoteOfTheDay({ role }: { role: DemoRole }) {
  const quote = todaysQuote(useSharedQuotes());
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const hasQuote = Boolean(quote);

  useEffect(() => {
    if (!hasQuote || !quoteDue(role, readSession()?.signedInAt ?? 0)) return;
    const timer = window.setTimeout(() => { setOpen(true); markQuoteSeen(role); }, 700);
    return () => window.clearTimeout(timer);
  }, [role, hasQuote]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  if (!quote) return null;

  function copy() {
    if (!quote) return;
    navigator.clipboard?.writeText(`“${quote.text}” — ${quote.author}`).then(() => toast.success('Quote copied'), () => toast.error('Could not copy the quote'));
  }

  return <Modal open={open} onOpenChange={setOpen}>
    <ModalBody className="qotd">
      <ModalContent className="qotd-body">
        <span className="qotd-eyebrow"><Sparkles /> Quote of the day · {format(new Date(), 'EEEE, MMM d')}</span>
        <QuoteMark className="qotd-mark" aria-hidden="true" />
        <ModalTitle className="qotd-text">
          {quote.text.split(' ').map((word, i) => <motion.span
            key={`${word}-${i}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
          >{word} </motion.span>)}
        </ModalTitle>
        <ModalDescription asChild>
          <motion.p className="qotd-author" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + quote.text.split(' ').length * 0.05 }}>— {quote.author}</motion.p>
        </ModalDescription>
      </ModalContent>
      <ModalFooter className="qotd-foot">
        <small>{notes[role]}</small>
        {role === 'admin'
          ? <Button variant="soft" asChild><Link to="/admin" search={{ section: 'quotes' }} onClick={() => setOpen(false)}><Settings2 /> Manage</Link></Button>
          : <Button variant="soft" onClick={copy}><Copy /> Copy</Button>}
        <Button variant="ink" onClick={() => setOpen(false)}>{role === 'student' ? 'Let’s go' : 'Continue'}</Button>
      </ModalFooter>
    </ModalBody>
  </Modal>;
}
