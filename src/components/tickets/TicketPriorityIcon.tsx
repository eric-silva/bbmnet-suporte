import type { Priority } from '@/types';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketPriorityIconProps {
  priority: Priority;
  size?: number;
}

export function TicketPriorityIcon({ priority, size = 4 }: TicketPriorityIconProps) {
  const iconConfig = {
    Low: { icon: <ArrowDown />, color: 'text-green-600', label: 'Low Priority' },
    Medium: { icon: <Minus />, color: 'text-yellow-600', label: 'Medium Priority' },
    High: { icon: <AlertTriangle />, color: 'text-red-600', label: 'High Priority' },
  };

  const config = iconConfig[priority] || iconConfig.Medium;
  const iconClassName = cn(`h-${size} w-${size}`, config.color);

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
