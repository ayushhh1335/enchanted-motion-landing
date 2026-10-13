import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact — ByeUni' }, { name: 'description', content: 'Send ByeUni your name, email, subject, and message.' }] }),
  component: ContactPage,
});

function ContactPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap auth-layout">
      <div className="sub-hero">
        <p className="eyebrow">Contact Us</p>
        <h1>Tell us what you need.</h1>
        <p>Please fill in the form. Messages go to the ByeUni contact desk.</p>
      </div>
      <section className="auth-card">
        <form className="auth-form" action="https://byeuni.com/contact-us/#wpcf7-f307-p45-o1" method="post">
          <input type="hidden" name="_wpcf7" value="307" />
          <input type="hidden" name="_wpcf7_version" value="6.1.7" />
          <input type="hidden" name="_wpcf7_locale" value="en_US" />
          <input type="hidden" name="_wpcf7_unit_tag" value="wpcf7-f307-p45-o1" />
          <input type="hidden" name="_wpcf7_container_post" value="45" />
          <label>Your name<input type="text" name="your-name" required maxLength={400} /></label>
          <label>Your email<input type="email" name="your-email" required maxLength={400} /></label>
          <label>Subject<input type="text" name="your-subject" required maxLength={400} /></label>
          <label>Your message<textarea name="your-message" rows={6} maxLength={2000} /></label>
          <Button variant="ink" size="hero" type="submit">Submit</Button>
        </form>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
