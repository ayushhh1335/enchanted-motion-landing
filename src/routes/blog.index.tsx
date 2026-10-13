import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { posts } from '@/content/posts';

export const Route = createFileRoute('/blog/')({
  head: () => ({ meta: [{ title: 'Our Blog — ByeUni' }, { name: 'description', content: 'Notes on portfolios, campus belonging, and funding college costs on ByeUni.' }] }),
  component: BlogPage,
});

function BlogPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap">
      <div className="sub-hero">
        <p className="eyebrow">Our Blog</p>
        <h1>Notes for the semester you are in.</h1>
        <p>Portfolios, belonging, and the practical side of funding college costs. Open any post to read it here.</p>
      </div>
      <div className="blog-list">
        {posts.map(post => <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="dir-card">
          <small>{post.date}</small>
          <h3>{post.title}</h3>
          <p>{post.lede}</p>
          <span>Read</span>
        </Link>)}
      </div>
    </main>
    <SiteFooter />
  </div>;
}
