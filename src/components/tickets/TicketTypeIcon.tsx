
import type { TicketType } from '@/types';
import { Settings, Bug, Lightbulb, Layers, Wrench, HelpCircle, MoreHorizontal } from 'lucide-react'; // Added Settings, Layers, Wrench
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketTypeIconProps {
  type: TicketType;
  size?: number;
}

export function TicketTypeIcon({ type, size = 4 }: TicketTypeIconProps) {
  const iconConfig = {
    Intervenção: { icon: <Settings />, label: 'Intervenção' },
    Bug: { icon: <Bug />, label: 'Bug' },
    Melhoria: { icon: <Lightbulb />, label: 'Melhoria' },
    Backlog: { icon: <Layers />, label: 'Backlog' },
    'Apoio Técnico': { icon: <Wrench />, label: 'Apoio Técnico' },
    // Fallbacks for old values if they exist in data
    'Feature Request': { icon: <Lightbulb />, label: 'Solicitação de Funcionalidade (Legado)' },
    Question: { icon: <HelpCircle />, label: 'Pergunta (Legado)' },
    Other: { icon: <MoreHorizontal />, label: 'Outro (Legado)' },
  };

  const config = iconConfig[type] || { icon: <MoreHorizontal />, label: type }; // Fallback to type itself if unknown
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

