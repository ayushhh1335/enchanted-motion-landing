import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Camera, Check, ChevronRight, HandHeart, ImagePlus, KeyRound, Lock, Settings, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { ME_ID, defaultPhoto, majors, personById } from '@/content/dashboard-data';
import fallbackCover from '@/assets/students-laptop.jpg';
import { cn } from '@/lib/utils';
import { ListEditor } from './cvision/editors';
import { Avatar, Bar, ProfileLink, ViewLink, usd, usePhotoPicker } from './shared';
import {
  MIN_SKILLS, completionOf, useDashboard, useProfileSteps, type Identity, type LiveCampaign, type ProfileStepId,
} from './store';

type OpenProps = { open: boolean; onOpenChange: (open: boolean) => void };

const categories = ['Tuition', 'Books', 'Equipment', 'Travel', 'Study abroad', 'Housing', 'Exams', 'Internship'];
const forumCategories = ['Community', 'Major', 'Network', 'Startups', 'Travel', 'Causes'];

export function CampaignDialog({ open, onOpenChange }: OpenProps) {
  const { actions } = useDashboard();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('1500');
  const [category, setCategory] = useState('Travel');
  const [story, setStory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const picker = usePhotoPicker(([picked]) => setImage(picked ?? null));

  useEffect(() => {
    if (open) return;
    setTitle(''); setGoal('1500'); setCategory('Travel'); setStory(''); setImage(null);
  }, [open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(goal);
    if (!title.trim() || !(amount >= 50)) return;
    actions.createCampaign({ title: title.trim(), goal: Math.round(amount), category, story: story.trim(), image: image ?? fallbackCover });
    onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>Start a campaign</DialogTitle>
      <DialogDescription>Raise support for the costs college actually asks for.</DialogDescription>
      <form className="db-form" onSubmit={submit}>
        <button type="button" className="db-cover-pick" onClick={picker.open} style={image ? { backgroundImage: `url(${image})` } : undefined}>
          {image ? <span>Change cover</span> : <><ImagePlus /><span>Upload a cover photo</span></>}
        </button>
        {picker.element}
        <label className="db-field">Campaign title<input required value={title} maxLength={90} onChange={e => setTitle(e.target.value)} placeholder="e.g. Fund my summer research in Boston" /></label>
        <div className="db-field-row">
          <label className="db-field">Goal (USD)<input required type="number" min={50} step={10} value={goal} onChange={e => setGoal(e.target.value)} /></label>
          <label className="db-field">Category<Dropdown value={category} onChange={setCategory} options={categories} /></label>
        </div>
        <label className="db-field">Your story<textarea rows={4} value={story} maxLength={600} onChange={e => setStory(e.target.value)} placeholder="Tell supporters what this unlocks for you." /></label>
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="ink" type="submit">Publish campaign</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

const presets = [10, 25, 50, 100];

export function DonateDialog({ campaign, onClose }: { campaign: LiveCampaign | null; onClose: () => void }) {
  const { actions } = useDashboard();
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState('');
  useEffect(() => { if (campaign) { setAmount(25); setCustom(''); } }, [campaign]);
  if (!campaign) return null;
  const owner = personById(campaign.ownerId);
  const value = custom ? Number(custom) : amount;

  return <Dialog open onOpenChange={open => !open && onClose()}>
    <DialogContent className="db-dialog">
      <DialogTitle>Support {owner.name.split(' ')[0]}</DialogTitle>
      <DialogDescription>{campaign.title}</DialogDescription>
      <img className="db-donate-cover" src={campaign.image} alt="" />
      <div className="db-money"><b>{usd(campaign.raised)}</b><span>raised of {usd(campaign.goal)}</span></div>
      <Bar value={campaign.raised} max={campaign.goal} />
      <div className="db-presets" role="radiogroup" aria-label="Donation amount">
        {presets.map(item => <button key={item} type="button" role="radio" aria-checked={!custom && amount === item} onClick={() => { setAmount(item); setCustom(''); }}>{usd(item)}</button>)}
      </div>
      <label className="db-field">Other amount<input type="number" min={1} value={custom} onChange={e => setCustom(e.target.value)} placeholder="$ Enter amount" /></label>
      <p className="db-fine"><Lock /> Demo checkout. No card is charged. Live donations go through PayPal on byeuni.com.</p>
      <div className="db-dialog-actions">
        <Button variant="soft" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="ink" type="button" disabled={!(value >= 1)} onClick={() => { actions.donate(campaign.id, Math.round(value), campaign.title); onClose(); }}>Donate {value >= 1 ? usd(Math.round(value)) : ''}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

export function ForumDialog({ open, onOpenChange }: OpenProps) {
  const { actions } = useDashboard();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Community');
  const [image, setImage] = useState<string | null>(null);
  const picker = usePhotoPicker(([picked]) => setImage(picked ?? null));
  useEffect(() => { if (!open) { setName(''); setDescription(''); setImage(null); setCategory('Community'); } }, [open]);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>Start a forum</DialogTitle>
      <DialogDescription>Bring students together around a major, a cause, or a question.</DialogDescription>
      <form className="db-form" onSubmit={event => {
        event.preventDefault();
        if (!name.trim()) return;
        actions.createCommunity({ name: name.trim(), description: description.trim() || 'A new ByeUni forum.', category, image: image ?? fallbackCover });
        onOpenChange(false);
      }}>
        <button type="button" className="db-cover-pick" onClick={picker.open} style={image ? { backgroundImage: `url(${image})` } : undefined}>
          {image ? <span>Change image</span> : <><ImagePlus /><span>Add a forum image</span></>}
        </button>
        {picker.element}
        <label className="db-field">Forum name<input required value={name} maxLength={60} onChange={e => setName(e.target.value)} placeholder="e.g. Stanford Pre-Law Society" /></label>
        <label className="db-field">Category<Dropdown value={category} onChange={setCategory} options={forumCategories} /></label>
        <label className="db-field">Description<textarea rows={3} value={description} maxLength={300} onChange={e => setDescription(e.target.value)} placeholder="What is this forum for?" /></label>
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="ink" type="submit">Create forum</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function ProfileDialog({ open, onOpenChange }: OpenProps) {
  const { profile, actions } = useDashboard();
  const [headline, setHeadline] = useState(profile.headline);
  const [about, setAbout] = useState(profile.about);
  const [skills, setSkills] = useState(profile.skills);
  const [skill, setSkill] = useState('');
  useEffect(() => { if (open) { setHeadline(profile.headline); setAbout(profile.about); setSkills(profile.skills); } }, [open, profile]);

  function addSkill() {
    const value = skill.trim();
    if (value && !skills.some(item => item.toLowerCase() === value.toLowerCase())) setSkills(list => [...list, value]);
    setSkill('');
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>Edit your CVision</DialogTitle>
      <DialogDescription>This is what recruiters and supporters see first.</DialogDescription>
      <form className="db-form" onSubmit={event => {
        event.preventDefault();
        actions.updateProfile({ headline: headline.trim(), about: about.trim(), skills });
        onOpenChange(false);
      }}>
        <label className="db-field">Headline<input value={headline} maxLength={120} onChange={e => setHeadline(e.target.value)} /></label>
        <label className="db-field">About<textarea rows={4} value={about} maxLength={800} onChange={e => setAbout(e.target.value)} /></label>
        <div className="db-field">Skills
          <div className="db-skill-edit">
            {skills.map(item => <span key={item}>{item}<button type="button" aria-label={`Remove ${item}`} onClick={() => setSkills(list => list.filter(s => s !== item))}><X /></button></span>)}
          </div>
          <div className="db-inline-add">
            <input value={skill} onChange={e => setSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill and press Enter" />
            <Button variant="soft" type="button" onClick={addSkill}>Add</Button>
          </div>
        </div>
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="ink" type="submit">Save changes</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

const gradYears = ['2026', '2027', '2028', '2029', '2030'];

export function EditProfileDialog({ open, onOpenChange }: OpenProps) {
  const { account, profile, actions } = useDashboard();
  const pick = (): Identity => ({ firstName: account.firstName, lastName: account.lastName, username: account.username, major: account.major, gradYear: account.gradYear, photo: account.photo });
  const [identity, setIdentity] = useState<Identity>(pick);
  const [headline, setHeadline] = useState(profile.headline);
  const [about, setAbout] = useState(profile.about);
  const [skills, setSkills] = useState(profile.skills);
  const [skill, setSkill] = useState('');
  const [error, setError] = useState('');
  const picker = usePhotoPicker(([image]) => { if (image) setIdentity(d => ({ ...d, photo: image })); });

  useEffect(() => {
    if (!open) return;
    setIdentity(pick()); setHeadline(profile.headline); setAbout(profile.about); setSkills(profile.skills); setSkill(''); setError('');
    // Only reset when the dialog opens, so typing isn't wiped by unrelated store updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (key: keyof Identity) => (value: string) => { setIdentity(d => ({ ...d, [key]: value })); setError(''); };
  const set = (key: keyof Identity) => (event: { target: { value: string } }) => choose(key)(event.target.value);

  function addSkill() {
    const value = skill.trim();
    if (value && skills.length < 20 && !skills.some(item => item.toLowerCase() === value.toLowerCase())) setSkills(list => [...list, value]);
    setSkill('');
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = actions.saveProfile(identity, { headline, about, skills: skill.trim() ? [...skills, skill.trim()] : skills });
    if (result) setError(result);
    else onOpenChange(false);
  }

  const preview = { name: `${identity.firstName} ${identity.lastName}`, photo: identity.photo || defaultPhoto };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog db-edit-profile">
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>What classmates, recruiters, and donors see on your profile.</DialogDescription>
      <form className="db-form" onSubmit={submit} noValidate>
        <div className="db-edit-photo">
          <button type="button" className="ac-photo-btn" onClick={picker.open} aria-label="Change profile photo">
            <Avatar person={preview} size={72} />
            <span><Camera /></span>
          </button>
          <div>
            <strong>{preview.name.trim() || 'Your name'}</strong>
            <small>@{identity.username || 'username'}</small>
            <span className="db-edit-photo-actions">
              <button type="button" className="db-link" onClick={picker.open}>Change photo</button>
              {identity.photo ? <button type="button" className="db-link-muted" onClick={() => setIdentity(d => ({ ...d, photo: '' }))}>Remove</button> : null}
            </span>
          </div>
          {picker.element}
        </div>
        <div className="db-field-row">
          <label className="db-field">First name<input value={identity.firstName} maxLength={50} onChange={set('firstName')} autoComplete="given-name" required /></label>
          <label className="db-field">Last name<input value={identity.lastName} maxLength={50} onChange={set('lastName')} autoComplete="family-name" required /></label>
        </div>
        <label className="db-field">Username
          <span className="ac-prefixed"><em>byeuni.com/</em><input value={identity.username} maxLength={30} onChange={set('username')} autoComplete="username" /></span>
        </label>
        <label className="db-field">Headline<input value={headline} maxLength={120} onChange={e => setHeadline(e.target.value)} placeholder="e.g. CS @ Stanford · Building tools for students" /></label>
        <label className="db-field">About<textarea rows={4} value={about} maxLength={800} onChange={e => setAbout(e.target.value)} placeholder="What you study, what you're building, and what you need help with." /></label>
        <div className="db-field-row">
          <label className="db-field">Major<Dropdown value={identity.major} onChange={choose('major')} options={majors} /></label>
          <label className="db-field">Graduation year<Dropdown value={identity.gradYear} onChange={choose('gradYear')} options={gradYears} /></label>
        </div>
        <div className="db-field">Skills <small className="db-muted">{skills.length < MIN_SKILLS ? `Add ${MIN_SKILLS - skills.length} more to complete your profile` : `${skills.length} added`}</small>
          {skills.length ? <div className="db-skill-edit">
            {skills.map(item => <span key={item}>{item}<button type="button" aria-label={`Remove ${item}`} onClick={() => setSkills(list => list.filter(s => s !== item))}><X /></button></span>)}
          </div> : null}
          <div className="db-inline-add">
            <input value={skill} onChange={e => setSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill and press Enter" aria-label="Add a skill" />
            <Button variant="soft" type="button" onClick={addSkill}>Add</Button>
          </div>
        </div>
        <nav className="db-edit-more" aria-label="More account settings">
          <ViewLink view="settings" tab="details" onClick={() => onOpenChange(false)}><Settings /><span>Email, phone, and ZIP code</span><ChevronRight /></ViewLink>
          <ViewLink view="settings" tab="security" onClick={() => onOpenChange(false)}><KeyRound /><span>Password, deactivate, or delete account</span><ChevronRight /></ViewLink>
        </nav>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="ink" type="submit">Save profile</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

const stepActions: Record<ProfileStepId, [todo: string, done: string]> = {
  photo: ['Upload', 'Change'], headline: ['Write', 'Edit'], about: ['Write', 'Edit'], skills: ['Add', 'Edit'],
  experience: ['Add', 'Edit'], goals: ['Add', 'Edit'], story: ['Share', 'Add more'], paypal: ['Link', 'Manage'],
};

export function CompleteProfileDialog({ open, onOpenChange }: OpenProps) {
  const { actions } = useDashboard();
  const navigate = useNavigate();
  const steps = useProfileSteps();
  const [editing, setEditing] = useState(false);
  const [list, setList] = useState<'experience' | 'goals' | null>(null);
  const photo = usePhotoPicker(([image]) => { if (image) actions.setPhoto(image); });
  const story = usePhotoPicker(([image]) => { if (image) actions.addStory(image, ''); });
  const pct = completionOf(steps);
  const left = steps.filter(step => !step.done).length;

  function run(id: ProfileStepId) {
    if (id === 'photo') photo.open();
    else if (id === 'story') story.open();
    else if (id === 'experience' || id === 'goals') setList(id);
    else if (id === 'paypal') { onOpenChange(false); navigate({ to: '/dashboard', search: { view: 'settings', tab: 'paypal' } }); }
    else setEditing(true);
  }

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="db-dialog">
        <DialogTitle>Complete your profile</DialogTitle>
        <DialogDescription>{left ? `${left} step${left === 1 ? '' : 's'} left. Complete profiles get more connections and donations.` : 'Your profile is complete. Nice work!'}</DialogDescription>
        <div>
          <div className="db-completion"><span>Profile completion</span><b>{pct}%</b></div>
          <Bar value={pct} max={100} />
        </div>
        <ul className="db-steps">
          {steps.map(step => <li key={step.id} className={cn(step.done && 'is-done')}>
            <span className="db-step-mark" aria-label={step.done ? 'Done' : 'To do'}>{step.done ? <Check /> : null}</span>
            <div><strong>{step.label}</strong><small>{step.hint}</small></div>
            <Button variant={step.done ? 'ghost' : 'soft'} size="sm" onClick={() => run(step.id)}>{stepActions[step.id][step.done ? 1 : 0]}</Button>
          </li>)}
        </ul>
        {photo.element}
        {story.element}
        <div className="db-dialog-actions">
          <Button variant="ink" type="button" onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
    <EditProfileDialog open={editing} onOpenChange={setEditing} />
    {list ? <ListEditor kind={list} open onOpenChange={next => { if (!next) setList(null); }} /> : null}
  </>;
}

export function CampaignDetailDialog({ campaignId, onClose }: { campaignId: string | null; onClose: () => void }) {
  const { campaigns } = useDashboard();
  const [donating, setDonating] = useState(false);
  useEffect(() => { setDonating(false); }, [campaignId]);
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return null;
  if (donating) return <DonateDialog campaign={campaign} onClose={() => setDonating(false)} />;
  const owner = personById(campaign.ownerId);
  const mine = campaign.ownerId === ME_ID;
  const funded = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
  const share = () => navigator.clipboard?.writeText(`https://byeuni.com/campaign-detail.php?c=${campaign.id}`)
    .then(() => toast.success('Campaign link copied'), () => toast.error('Could not copy the link'));

  return <Dialog open onOpenChange={next => { if (!next) onClose(); }}>
    <DialogContent className="db-dialog db-campaign-detail">
      <img className="db-donate-cover" src={campaign.image} alt="" />
      <span className="db-tag">{campaign.category}</span>
      <DialogTitle>{campaign.title}</DialogTitle>
      <DialogDescription asChild>
        <div className="db-campaign-owner">
          <ProfileLink personId={owner.id} onClick={onClose} aria-label={`${owner.name}'s profile`}><Avatar person={owner} size={32} /></ProfileLink>
          <span>by <ProfileLink personId={owner.id} onClick={onClose} className="db-name-link">{mine ? 'you' : owner.name}</ProfileLink> · {owner.school}</span>
        </div>
      </DialogDescription>
      {campaign.story ? <p className="db-campaign-story">{campaign.story}</p> : null}
      <div className="db-money"><b>{usd(campaign.raised)}</b><span>raised of {usd(campaign.goal)}</span></div>
      <Bar value={campaign.raised} max={campaign.goal} />
      <dl className="db-mini-stats"><div><dt>Donors</dt><dd>{campaign.donors}</dd></div><div><dt>Days left</dt><dd>{campaign.daysLeft}</dd></div><div><dt>Funded</dt><dd>{funded}%</dd></div></dl>
      {campaign.myDonation ? <span className="db-tag is-mint"><Check /> You gave {usd(campaign.myDonation)}</span> : null}
      <div className="db-dialog-actions">
        <Button variant="soft" type="button" onClick={share}><Share2 /> Share</Button>
        {mine
          ? <Button variant="ink" asChild><ViewLink view="campaigns" onClick={onClose}>Manage in Fundraising <ChevronRight /></ViewLink></Button>
          : <Button variant="ink" type="button" onClick={() => setDonating(true)}><HandHeart /> Support {owner.name.split(' ')[0]}</Button>}
      </div>
    </DialogContent>
  </Dialog>;
}
