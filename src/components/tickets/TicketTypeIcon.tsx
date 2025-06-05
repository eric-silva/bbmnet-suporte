import type { TicketType } from '@/types';
import { Bug, Lightbulb, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketTypeIconProps {
  type: TicketType;
  size?: number;
}

export function TicketTypeIcon({ type, size = 4 }: TicketTypeIconProps) {
  const iconConfig = {
    Bug: { icon: <Bug />, label: 'Bug Report' },
    'Feature Request': { icon: <Lightbulb />, label: 'Feature Request' },
    Question: { icon: <HelpCircle />, label: 'Question' },
    Other: { icon: <MoreHorizontal />, label: 'Other' },
  };

  const config = iconConfig[type] || iconConfig.Other;
  const iconClassName = cn(`h-${size} w-${size}`, "text-muted-foreground");


  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className={iconClassName}>{config.icon}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
