import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { findPost, posts } from '@/content/posts';

export const Route = createFileRoute('/blog/$slug')({
  head: ({ params }) => {
    const post = findPost(params.slug);
    return { meta: [{ title: post ? `${post.title} — ByeUni` : 'Blog — ByeUni' }, { name: 'description', content: post?.lede ?? 'A note from the ByeUni blog.' }] };
  },
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const post = findPost(slug);
  const index = posts.findIndex(item => item.slug === slug);
  const more = posts.filter(item => item.slug !== slug).slice(0, 2);
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap legal-copy">
      {post ? <>
        <div className="sub-hero">
          <p className="eyebrow"><Link to="/blog">Our Blog</Link> · {post.date}</p>
          <h1>{post.title}</h1>
          <p>{post.lede}</p>
        </div>
        {post.sections.map(section => <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>)}
        <p className="auth-switch">
          {index > 0 ? <Link to="/blog/$slug" params={{ slug: posts[index - 1].slug }}>Previous</Link> : null}
          {index > 0 && index < posts.length - 1 ? ' · ' : null}
          {index < posts.length - 1 ? <Link to="/blog/$slug" params={{ slug: posts[index + 1].slug }}>Next</Link> : null}
          {' · '}
          <Link to="/blog">All posts</Link>
        </p>
        <div className="blog-more">
          {more.map(item => <Link key={item.slug} to="/blog/$slug" params={{ slug: item.slug }} className="dir-card">
            <small>{item.date}</small>
            <h3>{item.title}</h3>
          </Link>)}
        </div>
      </> : <>
        <div className="sub-hero">
          <p className="eyebrow">Our Blog</p>
          <h1>That post is not on this site.</h1>
          <p>The list of notes lives on the blog page.</p>
        </div>
        <p className="auth-switch"><Link to="/blog">Back to Our Blog</Link></p>
      </>}
    </main>
    <SiteFooter />
  </div>;
}
