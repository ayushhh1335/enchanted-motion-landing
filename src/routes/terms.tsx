import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms — ByeUni' }, { name: 'description', content: 'The ByeUni LLC terms that apply when you use the platform, community, and related services.' }] }),
  component: TermsPage,
});

function TermsPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap legal-copy">
      <div className="sub-hero">
        <p className="eyebrow">Terms of Service</p>
        <h1>Terms of service</h1>
        <p>Last revised January 12, 2023. This is a short guide to the ByeUni LLC terms. The full terms are the agreement.</p>
      </div>
      <section>
        <h2>The services</h2>
        <p>ByeUni provides the platform through byeuni.com and the mobile apps, including the community and related services. Organizers, beneficiaries, donors, and people who comment are users of those services.</p>
        <p>If you are in the United States, you contract with ByeUni LLC in Delaware. ByeUni can update portions of the terms, and continued use follows the current version.</p>
      </section>
      <section>
        <h2>Disputes</h2>
        <p>Except where the disputes section says otherwise, disagreements are resolved by binding individual arbitration. Using the services includes a waiver of a jury trial and of class actions. Read that section in the full terms before you rely on this summary.</p>
      </section>
      <p className="auth-switch"><a href="https://byeuni.com/byeuni-llc-terms-of-service/">Read the full terms</a> · <Link to="/contact">Questions? Contact us</Link></p>
    </main>
    <SiteFooter />
  </div>;
}