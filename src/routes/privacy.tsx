import { createFileRoute } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy — ByeUni' }, { name: 'description', content: 'How ByeUni collects, uses, and shares information when you use the platform.' }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap legal-copy">
      <div className="sub-hero">
        <p className="eyebrow">Privacy Policy</p>
        <h1>Privacy notice</h1>
        <p>Last updated September 10, 2025. This page summarizes the ByeUni LLC notice. The full text is the binding version.</p>
      </div>
      <section>
        <h2>Who it covers</h2>
        <p>ByeUni LLC and its affiliates explain how they collect, use, and disclose information when you use the apps, start or support a fundraiser, donate, or otherwise use the services. “You” may be a student user or a client, depending on the relationship.</p>
      </section>
      <section>
        <h2>What to know before you continue</h2>
        <p>Using the services means you have read that ByeUni may collect, use, and disclose information as described in the notice. Where the law allows it, the English version controls if a translation differs.</p>
        <p>The notice does not cover the privacy practices of organizations that run their own sites and only use ByeUni tools, except where ByeUni collects information directly.</p>
      </section>
      <p className="auth-switch"><a href="https://byeuni.com/privacy-policy-2/">Read the full privacy notice</a></p>
    </main>
    <SiteFooter />
  </div>;
}
