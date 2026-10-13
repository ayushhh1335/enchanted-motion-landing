import { useEffect, useState, type FormEvent } from 'react';
import { ImagePlus, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { personById } from '@/content/dashboard-data';
import fallbackCover from '@/assets/students-laptop.jpg';
import { Bar, usd, usePhotoPicker } from './shared';
import { useDashboard, type LiveCampaign } from './store';

type OpenProps = { open: boolean; onOpenChange: (open: boolean) => void };

const categories = ['Tuition', 'Books', 'Equipment', 'Travel', 'Study abroad', 'Housing', 'Exams', 'Internship'];

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
          <label className="db-field">Category<select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
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
        <label className="db-field">Category<select value={category} onChange={e => setCategory(e.target.value)}>{['Community', 'Major', 'Network', 'Startups', 'Travel', 'Causes'].map(item => <option key={item}>{item}</option>)}</select></label>
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
