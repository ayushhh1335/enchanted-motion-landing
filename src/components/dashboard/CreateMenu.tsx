import { useState, type ReactNode } from 'react';
import { HandHeart, ImagePlus, PenSquare, UserPlus, UsersRound } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CampaignDialog, ForumDialog } from './dialogs';
import { InviteDialog } from './home-widgets';
import { usePhotoPicker } from './shared';
import { useDashboard } from './store';

/** Everything a student can start, opened from the sidebar dock. */
export function CreateMenu({ onCompose, children, side = 'bottom', align = 'end', onOpenChange }: {
  onCompose: () => void;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  onOpenChange?: (open: boolean) => void;
}) {
  const { actions } = useDashboard();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [forumOpen, setForumOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const storyPicker = usePhotoPicker(([image]) => { if (image) actions.addStory(image, ''); });

  return <>
    <DropdownMenu onOpenChange={open => onOpenChange?.(open)}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} sideOffset={10} className="db-menu db-create-menu">
        <DropdownMenuItem onSelect={onCompose}><PenSquare /><span><strong>Post</strong><small>Share an update, photos, or a win</small></span></DropdownMenuItem>
        <DropdownMenuItem onSelect={storyPicker.open}><ImagePlus /><span><strong>Story</strong><small>A photo that disappears in a day</small></span></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setCampaignOpen(true)}><HandHeart /><span><strong>Campaign</strong><small>Raise funds for your studies</small></span></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setForumOpen(true)}><UsersRound /><span><strong>Forum</strong><small>Start a group for your campus</small></span></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setInviteOpen(true)}><UserPlus /><span><strong>Invite friends</strong><small>Earn 20 Vibeys per signup</small></span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {storyPicker.element}
    <CampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
    <ForumDialog open={forumOpen} onOpenChange={setForumOpen} />
    <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
  </>;
}
