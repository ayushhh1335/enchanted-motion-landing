import { createFileRoute } from '@tanstack/react-router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/faqs')({
  head: () => ({ meta: [{ title: 'FAQs — ByeUni' }, { name: 'description', content: 'Answers about ByeUni, payouts, mentors, and getting started.' }] }),
  component: FaqPage,
});

const faqs = [
  ['What is ByeUni?', 'ByeUni is a platform where college students build their story, connect with mentors and classmates, and receive financial support in one place.'],
  ['How do I receive money?', 'After you connect a PayPal account, support is sent directly to you. ByeUni does not hold the gift until a goal is reached.'],
  ['How long does it take to get paid?', 'Once PayPal is set up and verified, funds can arrive as soon as someone gives.'],
  ['Is it safe?', 'Payments run through PayPal, so card and bank details stay with PayPal rather than on a student profile.'],
  ['How do I connect with mentors?', 'Create a CVision profile, share your goals, and take part in the community. A fuller profile makes it easier for the right people to find you.'],
  ['Is ByeUni free?', 'Creating an account and building your profile is free.'],
  ['How do I get started?', 'Register, connect PayPal when you are ready to receive support, and start sharing the work.'],
];

function FaqPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap legal-copy">
      <div className="sub-hero">
        <p className="eyebrow">Byeuni FAQ’s</p>
        <h1>Your questions, answered.</h1>
        <p>The same questions students ask first on ByeUni: payouts, PayPal, mentors, and getting started.</p>
      </div>
      <Accordion type="single" collapsible>
        {faqs.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>)}
      </Accordion>
      <p className="auth-switch"><a href="https://byeuni.com/byeuni-faqs/">Read the FAQs on ByeUni</a></p>
    </main>
    <SiteFooter />
  </div>;
}
