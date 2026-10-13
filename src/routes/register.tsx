import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/register')({
  head: () => ({ meta: [{ title: 'Register — ByeUni' }, { name: 'description', content: 'Create a ByeUni account with your name, email, vibe tag, and campus zip code.' }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap auth-layout">
      <div className="sub-hero">
        <p className="eyebrow">Start a Byeuni</p>
        <h1>Start your ByeUni.</h1>
        <p>Create the account that holds your campus, your people, and your CVision. New accounts earn 50 Vibeys.</p>
      </div>
      <section className="auth-card">
        <form className="auth-form" action="https://byeuni.com/register.php" method="post">
          <input type="hidden" name="register" value="action" />
          <input type="hidden" name="user_id" value="0" />
          <label>First name<input type="text" name="first_name" required placeholder="First name" /></label>
          <label>Last name<input type="text" name="last_name" required placeholder="Last name" /></label>
          <label>Email<input type="email" name="email" required placeholder="Email address" /></label>
          <label>Confirm email<input type="email" name="confirm_email" required placeholder="Email address" /></label>
          <label>Vibe tag<input type="text" name="username" required placeholder="Choose your @Vibe Tag" /></label>
          <label>Zip code<input type="text" name="zip" required placeholder="Enter your Zip Code" /></label>
          <label>Password<input type="password" name="password" required minLength={6} autoComplete="new-password" placeholder="Password" /></label>
          <label>Confirm password<input type="password" name="confirm_password" required minLength={6} autoComplete="new-password" placeholder="Confirm Password" /></label>
          <Button variant="ink" size="hero" type="submit">Register</Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  </div>;
}
