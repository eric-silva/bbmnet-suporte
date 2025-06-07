
import { Settings, Bug, Lightbulb, Layers, Wrench, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketTypeIconProps {
  typeDesc: string; // Changed from type: TicketType to typeDesc: string
  size?: number;
}

export function TicketTypeIcon({ typeDesc, size = 4 }: TicketTypeIconProps) {
  const normalizedType = typeDesc.toLowerCase();
  let config;

  if (normalizedType.includes('intervenção') || normalizedType.includes('intervencao')) {
    config = { icon: <Settings />, label: typeDesc };
  } else if (normalizedType.includes('bug')) {
    config = { icon: <Bug />, label: typeDesc };
  } else if (normalizedType.includes('melhoria') || normalizedType.includes('feature request')) {
    config = { icon: <Lightbulb />, label: typeDesc };
  } else if (normalizedType.includes('backlog')) {
    config = { icon: <Layers />, label: typeDesc };
  } else if (normalizedType.includes('apoio técnico') || normalizedType.includes('apoio tecnico')) {
    config = { icon: <Wrench />, label: typeDesc };
  } else if (normalizedType.includes('question') || normalizedType.includes('pergunta')) {
     config = { icon: <HelpCircle />, label: typeDesc };
  } else {
    config = { icon: <MoreHorizontal />, label: typeDesc };
  }
  
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
