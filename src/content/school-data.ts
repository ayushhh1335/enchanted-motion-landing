import {
  seedCampaigns, seedSchools, seedUsers,
  type AdminCampaign, type AdminUser, type Report, type School, type Suggestion,
} from '@/content/admin-data';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const now = () => Date.now();
const daysAgo = (n: number) => now() - n * DAY;
const daysAhead = (n: number) => now() + n * DAY;
const hoursAgo = (n: number) => now() - n * HOUR;

export const SCHOOL_ID = 'stanford';

export type SchoolProfile = { firstName: string; lastName: string; title: string; email: string; phone: string };
export const seedProfile: SchoolProfile = {
  firstName: 'Laura', lastName: 'Chen', title: 'Director of Student Affairs', email: 'lchen@stanford.edu', phone: '(650) 555-0110',
};

export const seedSchool: School = seedSchools.find(s => s.id === SCHOOL_ID)!;

/** Roster entries are platform users; `invited` marks students who haven't finished sign-up yet. */
export type SchoolStudent = AdminUser & { invited?: boolean | undefined };

const fromPlatform = seedUsers.filter(u => u.schoolId === SCHOOL_ID && u.type === 'fundraiser');
const base = { type: 'fundraiser' as const, schoolId: SCHOOL_ID, enabled: true, suspended: false };

export const seedStudents: SchoolStudent[] = [
  ...fromPlatform,
  { ...base, id: 'diego', name: 'Diego Hernandez', email: 'diego.hernandez@stanford.edu', phone: '(650) 555-0177', city: 'Palo Alto, CA', photo: 'p3', major: 'Mechanical Engineering', vibeys: 515, createdAt: daysAgo(160), lastActive: hoursAgo(6) },
  { ...base, id: 'sofia', name: 'Sofia Nguyen', email: 'sofia.nguyen@stanford.edu', phone: '(408) 555-0123', city: 'San Jose, CA', photo: 'p2', major: 'Biology', vibeys: 720, createdAt: daysAgo(140), lastActive: hoursAgo(2) },
  { ...base, id: 'zoe', name: 'Zoe Mitchell', email: 'zoe.mitchell@stanford.edu', phone: '(650) 555-0158', city: 'Menlo Park, CA', photo: 'p5', major: 'Psychology', vibeys: 260, createdAt: daysAgo(96), lastActive: daysAgo(1) },
  { ...base, id: 'aiden', name: 'Aiden Park', email: 'aiden.park@stanford.edu', phone: '(650) 555-0136', city: 'Stanford, CA', photo: 'p6', major: 'Economics', vibeys: 180, createdAt: daysAgo(70), lastActive: hoursAgo(11) },
  { ...base, id: 'jasmine', name: 'Jasmine Brooks', email: 'jasmine.brooks@stanford.edu', phone: '(650) 555-0194', city: 'Stanford, CA', photo: 'p8', major: 'Data Science', vibeys: 890, createdAt: daysAgo(230), lastActive: hoursAgo(3) },
  { ...base, id: 'grace-w', name: 'Grace Washington', email: 'grace.washington@stanford.edu', phone: '(415) 555-0172', city: 'San Francisco, CA', major: 'Political Science', vibeys: 330, createdAt: daysAgo(120), lastActive: daysAgo(2) },
  { ...base, id: 'kai', name: 'Kai Nakamura', email: 'kai.nakamura@stanford.edu', phone: '(650) 555-0149', city: 'Mountain View, CA', major: 'Product Design', vibeys: 145, createdAt: daysAgo(44), lastActive: daysAgo(3) },
  { ...base, id: 'ben', name: 'Ben Foster', email: 'ben.foster@stanford.edu', phone: '(650) 555-0103', city: 'Palo Alto, CA', major: 'Finance', vibeys: 40, createdAt: daysAgo(15), lastActive: hoursAgo(4) },
  { ...base, id: 'ryan', name: "Ryan O'Connor", email: 'ryan.oconnor@stanford.edu', phone: '(650) 555-0115', city: 'Redwood City, CA', major: 'Computer Science', vibeys: 60, createdAt: daysAgo(260), lastActive: daysAgo(64), enabled: false },
  { ...base, id: 'maya', name: 'Maya Robinson', email: 'maya.robinson@stanford.edu', phone: '(650) 555-0188', city: 'Stanford, CA', major: 'Nursing', vibeys: 0, createdAt: daysAgo(1), lastActive: daysAgo(1), invited: true },
];

const platformCampaigns = seedCampaigns.filter(c => fromPlatform.some(u => u.id === c.ownerId));

export const seedSchoolCampaigns: AdminCampaign[] = [
  ...platformCampaigns,
  { id: 'camp-bike', title: 'Solar-powered bike repair station for Escondido Village', ownerId: 'diego', category: 'Community', visibility: 'Public', cover: 'lab', start: daysAgo(14), end: daysAhead(24), goal: 3500, raised: 1960, donors: 44, likes: 131, status: 'active', createdAt: daysAgo(15), story: 'A free, solar-powered repair stand with tools and an air pump for grad housing.' },
  { id: 'camp-monterey', title: 'Field research trip to Monterey Bay', ownerId: 'sofia', category: 'Travel', visibility: 'Public', cover: 'future', start: daysAgo(20), end: daysAhead(10), goal: 1800, raised: 1420, donors: 37, likes: 97, status: 'active', createdAt: daysAgo(21), story: 'Our marine biology lab is sampling kelp forest recovery. This covers van rental, gear, and two nights at Hopkins Marine Station.' },
  { id: 'camp-wids', title: 'Send 10 students to the Women in Data Science conference', ownerId: 'jasmine', category: 'Conference', visibility: 'Public', cover: 'team', start: daysAgo(6), end: daysAhead(34), goal: 4000, raised: 950, donors: 19, likes: 64, status: 'active', createdAt: daysAgo(7), story: 'Registration and travel for ten first- and second-year students in our Women in Data club.' },
  { id: 'camp-mun', title: 'Model UN team to Geneva', ownerId: 'grace-w', category: 'Travel', visibility: 'Private', cover: 'seoul', start: daysAhead(5), end: daysAhead(45), goal: 6000, raised: 0, donors: 0, likes: 0, status: 'draft', createdAt: daysAgo(3), story: 'Our delegation was invited to the Geneva International Model UN conference in spring.' },
  { id: 'camp-ben', title: 'Help me pay off my parking tickets ASAP', ownerId: 'ben', category: 'Other', visibility: 'Public', cover: 'campus', start: daysAgo(3), end: daysAhead(27), goal: 2500, raised: 25, donors: 1, likes: 2, status: 'active', createdAt: daysAgo(4), story: 'Venmo me directly for faster processing, I will pay you back double next quarter.' },
];

export type ForumPost = { id: string; authorId: string; text: string; at: number };
export type SchoolForum = {
  id: string; title: string; ownerId: string; description: string; members: number; posts: number; isPrivate: boolean;
  createdAt: number; removed: boolean; recent: ForumPost[];
};

export const seedSchoolForums: SchoolForum[] = [
  { id: 'f-cs', title: 'CS Majors Network', ownerId: 'me', description: 'Internship leads, hackathon teams, and CS106 survival tips.', members: 2140, posts: 318, isPrivate: false, createdAt: daysAgo(200), removed: false, recent: [
    { id: 'fp-1', authorId: 'jasmine', text: 'Anyone want to team up for TreeHacks? Looking for a frontend person.', at: hoursAgo(5) },
    { id: 'fp-2', authorId: 'me', text: 'HackMIT team is booked. Thanks to everyone who donated!', at: daysAgo(1) },
  ] },
  { id: 'f-green', title: 'Green Campus Collective', ownerId: 'chloe', description: 'Sustainability projects, garden shifts, and composting.', members: 860, posts: 142, isPrivate: false, createdAt: daysAgo(160), removed: false, recent: [
    { id: 'fp-3', authorId: 'chloe', text: 'Garden harvest day is Saturday at 10. Bring gloves.', at: daysAgo(2) },
  ] },
  { id: 'f-wids', title: 'Women in Data', ownerId: 'jasmine', description: 'Study groups, mentorship, and conference trips.', members: 412, posts: 96, isPrivate: false, createdAt: daysAgo(110), removed: false, recent: [
    { id: 'fp-4', authorId: 'hannah', text: 'Happy to review anyone’s NeurIPS workshop submission this week.', at: daysAgo(1) },
  ] },
  { id: 'f-bike', title: 'Bike Kitchen', ownerId: 'diego', description: 'Fix your bike, borrow tools, learn to true a wheel.', members: 233, posts: 51, isPrivate: false, createdAt: daysAgo(80), removed: false, recent: [
    { id: 'fp-5', authorId: 'diego', text: 'Repair station prototype is up behind EV building 3!', at: hoursAgo(20) },
  ] },
  { id: 'f-premed', title: 'Pre-Health Study Circle', ownerId: 'sofia', description: 'MCAT prep, shadowing tips, and clinical volunteering.', members: 615, posts: 140, isPrivate: true, createdAt: daysAgo(130), removed: false, recent: [] },
  { id: 'f-money', title: 'Easy Money Club 💸', ownerId: 'ben', description: 'Make $500 a week from your dorm. DM for the link.', members: 9, posts: 14, isPrivate: false, createdAt: daysAgo(5), removed: false, recent: [
    { id: 'fp-6', authorId: 'ben', text: 'Send $40 for the starter pack and get your first payout in 24 hours.', at: daysAgo(2) },
  ] },
];

export type SchoolReportKind = 'forum' | 'comment' | 'user';
export type SchoolReport = Omit<Report, 'kind'> & { kind: SchoolReportKind };

export const seedSchoolReports: SchoolReport[] = [
  { id: 'sr-1', kind: 'forum', targetId: 'f-money', authorId: 'ben', excerpt: 'Make $500 a week from your dorm. DM for the link.', reporterId: 'hannah', reason: 'Spam or scam', at: hoursAgo(3), status: 'open' },
  { id: 'sr-2', kind: 'comment', targetId: 'fp-6', authorId: 'ben', excerpt: 'Send $40 for the starter pack and get your first payout in 24 hours.', reporterId: 'sofia', reason: 'Spam or scam', at: hoursAgo(9), status: 'open' },
  { id: 'sr-3', kind: 'user', targetId: 'ben', authorId: 'ben', excerpt: 'Keeps messaging first-years asking them to Venmo him.', reporterId: 'zoe', reason: 'Harassment or unwanted contact', at: daysAgo(1), status: 'open' },
  { id: 'sr-4', kind: 'comment', targetId: 'c-aiden-1', authorId: 'aiden', excerpt: 'lol nobody is going to fund a bike stand, this is a waste', reporterId: 'diego', reason: 'Bullying', at: daysAgo(2), status: 'open' },
  { id: 'sr-5', kind: 'user', targetId: 'kai', authorId: 'kai', excerpt: 'Profile says Stanford but I have never seen them on campus.', reporterId: 'aiden', reason: 'Fake profile', at: daysAgo(12), status: 'dismissed', resolution: 'Confirmed enrollment with the Registrar.' },
];

export type SchoolUpdate = { id: string; title: string; description: string; eventDate: number; createdAt: number };

export const seedUpdates: SchoolUpdate[] = [
  { id: 'up-1', title: 'Fall Career Fair at Tresidder Union', description: 'Over 120 employers, including 30 startups hiring interns. Bring printed résumés and your student ID.', eventDate: daysAhead(6), createdAt: daysAgo(2) },
  { id: 'up-2', title: 'Finals week: Green Library open 24 hours', description: 'Green and Lathrop libraries stay open around the clock from Dec 5 to Dec 13. Free coffee after 10 pm.', eventDate: daysAhead(21), createdAt: daysAgo(4) },
  { id: 'up-3', title: 'Undergraduate travel grants: applications open', description: 'VPUE grants of up to $1,500 for conferences and competitions. Apply by the end of the month; ByeUni campaigns can cover the rest.', eventDate: daysAhead(17), createdAt: daysAgo(9) },
  { id: 'up-4', title: 'Wellness Week with Counseling & Psychological Services', description: 'Drop-in counseling, therapy dogs on White Plaza, and free yoga at Roble Gym.', eventDate: daysAgo(12), createdAt: daysAgo(25) },
];

export const seedSchoolSuggestions: Suggestion[] = [
  { id: 'sg-1', schoolId: SCHOOL_ID, userId: 'chloe', text: 'Please add more study spaces open past midnight during finals.', at: daysAgo(2) },
  { id: 'sg-2', schoolId: SCHOOL_ID, userId: 'hannah', text: 'Late-night study rooms in Green Library would help a lot.', at: daysAgo(4) },
  { id: 'sg-3', schoolId: SCHOOL_ID, userId: 'me', text: 'More hackathon travel grants for undergrads.', at: daysAgo(6) },
  { id: 'sg-4', schoolId: SCHOOL_ID, userId: 'chloe', text: 'Composting bins in every dorm kitchen.', at: daysAgo(9) },
  { id: 'sg-s5', schoolId: SCHOOL_ID, userId: 'zoe', text: 'Extend counseling hours during midterms; the wait is two weeks right now.', at: daysAgo(1) },
  { id: 'sg-s6', schoolId: SCHOOL_ID, userId: 'diego', text: 'A late-night shuttle from the engineering quad to Escondido Village.', at: daysAgo(3) },
  { id: 'sg-s7', schoolId: SCHOOL_ID, userId: 'sofia', text: 'Free MCAT prep sessions for first-gen pre-med students.', at: daysAgo(5) },
  { id: 'sg-s8', schoolId: SCHOOL_ID, userId: 'jasmine', text: 'Conference travel grants should cover registration too, not just flights.', at: daysAgo(8) },
  { id: 'sg-s9', schoolId: SCHOOL_ID, userId: 'kai', text: 'Recycling bins next to every printer in the d.school.', at: daysAgo(13) },
];

export type ActivityEntry = { id: string; at: number; text: string; tone: 'mint' | 'sky' | 'sun' | 'rose' };
export const seedActivity: ActivityEntry[] = [
  { id: 'ac-1', at: daysAgo(2), text: 'Posted “Fall Career Fair at Tresidder Union”', tone: 'mint' },
  { id: 'ac-2', at: daysAgo(12), text: 'Dismissed fake-profile report on Kai Nakamura', tone: 'sky' },
  { id: 'ac-3', at: daysAgo(15), text: 'Deactivated Ryan O’Connor (left Stanford)', tone: 'sun' },
];
