
import { ArrowDown, Minus, ArrowUp, AlertTriangle, ChevronUpSquare, HelpCircle, ArrowUpWideNarrow } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketPriorityIconProps {
  priorityDesc: string; // Changed from priority: Priority to priorityDesc: string
  size?: number;
}

export function TicketPriorityIcon({ priorityDesc, size = 4 }: TicketPriorityIconProps) {
  const normalizedPriority = priorityDesc.toLowerCase();
  let config;

  if (normalizedPriority.includes('baixa') || normalizedPriority.includes('low')) {
    config = { icon: <ArrowDown />, color: 'text-green-600', label: `Prioridade ${priorityDesc}` };
  } else if (normalizedPriority.includes('média') || normalizedPriority.includes('medium')) {
    config = { icon: <Minus />, color: 'text-yellow-600', label: `Prioridade ${priorityDesc}` };
  } else if (normalizedPriority.includes('alta') || normalizedPriority.includes('high')) {
    config = { icon: <ArrowUp />, color: 'text-orange-600', label: `Prioridade ${priorityDesc}` };
  } else if (normalizedPriority.includes('crítica') || normalizedPriority.includes('critical')) {
    config = { icon: <ArrowUpWideNarrow />, color: 'text-red-600', label: `Prioridade ${priorityDesc}` };
  } else {
    config = { icon: <HelpCircle />, color: 'text-gray-500', label: `Prioridade ${priorityDesc}` };
  }
  
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
