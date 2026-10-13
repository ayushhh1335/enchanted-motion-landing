export type Section = { heading: string; paragraphs: string[] };

export type Post = {
  slug: string;
  title: string;
  date: string;
  href: string;
  lede: string;
  sections: Section[];
};

export const posts: Post[] = [
  {
    slug: 'digital-portfolios',
    title: 'The ultimate guide to digital portfolios for students',
    date: 'June 11, 2026',
    href: 'https://byeuni.com/digital-portfolio-for-students/',
    lede: 'A GPA is one number. A paper résumé is a list. A digital portfolio is the page you keep updating with the work, the people, and the proof behind both.',
    sections: [
      {
        heading: 'What a student portfolio actually is',
        paragraphs: [
          'It is a page that can hold a project, a class, a photo, a short film, or a note from a mentor. It changes when the semester changes. It is not a file you export once and forget.',
          'On ByeUni that page is a CVision. It can stay public or private, and it sits next to your campus, your major, and any campaign you are running.',
        ],
      },
      {
        heading: 'Why a traditional résumé falls short',
        paragraphs: [
          'Most students are asked for a résumé before they have a job history. The format rewards titles and dates, so a robotics build, a forum thread, or a semester of tutoring never quite fits.',
          'People who might hire you, fund you, or invite you onto a team want to see the work. A living page lets them do that without a PDF.',
        ],
      },
      {
        heading: 'Show the whole student',
        paragraphs: [
          'Put the class, the project, and the person in one place. A photo of the build, a paragraph on what broke, and a line from a mentor say more than a bullet that says “team member.”',
          'Engagement belongs on the same page. Forums, chats, and updates show that other students already know the work. Vibeys mark the habits — showing up, posting, helping — that a résumé cannot list.',
        ],
      },
      {
        heading: 'How to build it',
        paragraphs: [
          'Collect the artifacts first: photos, clips, links, and one sentence on what you did. Then open a ByeUni profile and decide what is public.',
          'Write the story in plain language. What you tried, what changed, and what you want next. Keep it interactive: new posts, new photos, and a campaign when money is part of the goal.',
          'The page gets more useful every time you update it. Start before graduation, not the week you need it.',
        ],
      },
    ],
  },
  {
    slug: 'retention-tools',
    title: '7 mistakes with higher-education retention tools',
    date: 'June 4, 2026',
    href: 'https://byeuni.com/7-mistakes-youre-making-with-higher-education-retention-tools-and-how-to-fix-them/',
    lede: 'A dashboard that counts logins does not tell you whether a student feels they belong. These are the misses we see, and the fix that sits next to them.',
    sections: [
      {
        heading: 'Waiting for a failing grade',
        paragraphs: [
          'Many tools wake up after a student is already in trouble. By then the class, the housing, or the friend group may already be gone.',
          'A useful system notices the quiet weeks earlier: no posts, no campaign update, no one in the same major on the profile.',
        ],
      },
      {
        heading: 'Ignoring peer connection',
        paragraphs: [
          'Advising appointments matter. So does the student in the same program who already took the class. Retention tools that never introduce those two people are only half a product.',
          'ByeUni matches by campus and major so that introduction is the default, not an extra program.',
        ],
      },
      {
        heading: 'Data without an identity',
        paragraphs: [
          'A row in a report is not a student. A CVision gives the work a name, a photo, and a next step, so staff and classmates are looking at a person rather than a risk score.',
        ],
      },
      {
        heading: 'Forgetting that showing up can feel good',
        paragraphs: [
          'If the only feedback is a warning, students avoid the tool. Small recognition — a login streak, a first post, a first campaign — gives people a reason to return before anything is wrong.',
        ],
      },
      {
        heading: 'Splitting money from the rest of campus life',
        paragraphs: [
          'A student who cannot buy the book is also the student who stops coming. Financial help and academic connection belong in the same profile, not in two logins that never meet.',
        ],
      },
      {
        heading: 'One message for every student',
        paragraphs: [
          'A campus-wide email is easy to ignore. A note from someone in your major, about your goal, is not. Tools should make the specific message easier than the blast.',
        ],
      },
      {
        heading: 'Treating software as the whole answer',
        paragraphs: [
          'An app does not create belonging. It can make the people, the goal, and the record easier to find. Belonging is still the part that keeps a student enrolled.',
        ],
      },
    ],
  },
  {
    slug: 'post-geographic-academy',
    title: 'The post-geographic academy',
    date: 'May 21, 2026',
    href: 'https://byeuni.com/the-post-geographic-academy-reimagining-the-campus-as-a-distributed-network/',
    lede: 'College used to mean one quad. A lot of the useful campus is now a network of people in the same school and the same major, wherever they happen to be sitting.',
    sections: [
      {
        heading: 'A campus with more than one address',
        paragraphs: [
          'Lectures, jobs, family, and hybrid classes already pull students off the quad. The institution is still real. The daily campus is whoever can actually be reached.',
        ],
      },
      {
        heading: 'Three layers that still matter',
        paragraphs: [
          'Place still matters: a school, a city, a zip. People matter: the major, the class, the friend. The record matters: the portfolio and the goal that travel with the student.',
          'A post-geographic campus keeps all three. It does not pretend the map pin was the only thing holding the experience together.',
        ],
      },
      {
        heading: 'How ByeUni holds that campus',
        paragraphs: [
          'Networks introduce students who share a school and a major, so collaboration stays local even when the chat starts online.',
          'CVision is the identity that updates: classes, photos, video, and notes from mentors. Forums and chats are where the question about this week’s assignment actually gets asked.',
        ],
      },
      {
        heading: 'Belonging, and the bill',
        paragraphs: [
          'Students stay when they can name someone who would notice if they disappeared, and when a money problem does not have to be solved in a separate system.',
          'Campaigns for books, rent, travel, and exams sit on the same profile as the people. The future campus is distributed. It is still a community.',
        ],
      },
    ],
  },
  {
    slug: 'crowdfunding-college',
    title: 'How to pay for college costs with crowdfunding',
    date: 'April 28, 2026',
    href: 'https://byeuni.com/crowdfunding-for-college-textbooks-and-housing/',
    lede: 'Textbooks, rent, and housing show up before a paycheck does. A campaign lets people who already know you help with one named cost.',
    sections: [
      {
        heading: 'Name the cost',
        paragraphs: [
          '“Help me with college” is hard to answer. “The book list for this lab” or “the deposit on a room” is not. Pick one expense and say what the money will do.',
        ],
      },
      {
        heading: 'Ask the people who already care',
        paragraphs: [
          'Family, friends, and classmates want a way to participate. A page with a photo, a short reason, and a goal gives them that way without a long explanation in a group text.',
          'Share the link directly first. Social posts help after the people closest to you have seen it.',
        ],
      },
      {
        heading: 'You do not wait for the total',
        paragraphs: [
          'On ByeUni, gifts go to your PayPal as they arrive, once the account is verified. Support does not sit until a public goal is finished.',
          'Keep the page current. An update is often what brings someone back with a second gift.',
        ],
      },
    ],
  },
  {
    slug: 'successful-fundraiser',
    title: 'How to run a successful fundraiser on Byeuni',
    date: 'April 21, 2026',
    href: 'https://byeuni.com/%F0%9F%9A%80-how-to-run-a-successful-fundraiser-on-byeuni/',
    lede: 'Nine habits show up on campaigns that actually move: a clear title, a real story, and updates the people who gave you can see.',
    sections: [
      {
        heading: 'Title, story, and pictures',
        paragraphs: [
          'The title should say what the money is for. The story should say why it matters to you, in a few paragraphs, not a slogan.',
          'Add photos and, if you can, a short video. People share a face and a project more easily than a number.',
        ],
      },
      {
        heading: 'A goal people can understand',
        paragraphs: [
          'Set a number that matches the cost. Books, an exam fee, a month of rent, and a piece of equipment are easier to support than an open-ended total.',
        ],
      },
      {
        heading: 'Share it in more than one place',
        paragraphs: [
          'Put the ByeUni profile where you already talk to people: text, email, class chats, and then social. Go past the feed. A direct ask to someone who knows the work still outperforms a public post.',
          'Be specific. “This covers the sensor kit” is easier to answer than “anything helps.”',
        ],
      },
      {
        heading: 'Updates and thanks',
        paragraphs: [
          'Post when something changes. A useful campaign often runs 45 to 90 days, with energy at the start and at the close.',
          'Thank people from the dashboard as gifts come in. The thank-you is part of the fundraiser, not a chore after it.',
        ],
      },
    ],
  },
];

export function findPost(slug: string) {
  return posts.find(post => post.slug === slug);
}
