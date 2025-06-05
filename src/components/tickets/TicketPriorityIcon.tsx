
import type { Priority } from '@/types';
import { ArrowDown, Minus, ArrowUp, AlertTriangle, ChevronUpSquare } from 'lucide-react'; // ChevronUpSquare for Critico
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TicketPriorityIconProps {
  priority: Priority;
  size?: number;
}

export function TicketPriorityIcon({ priority, size = 4 }: TicketPriorityIconProps) {
  const iconConfig = {
    Baixo: { icon: <ArrowDown />, color: 'text-green-600', label: 'Prioridade Baixa' },
    Normal: { icon: <Minus />, color: 'text-yellow-600', label: 'Prioridade Normal' },
    Alto: { icon: <ArrowUp />, color: 'text-orange-600', label: 'Prioridade Alta' }, // Changed from AlertTriangle to ArrowUp for 'Alto'
    Critico: { icon: <ChevronUpSquare />, color: 'text-red-600', label: 'Prioridade Crítica' }, // Using ChevronUpSquare for 'Critico'
    // Fallbacks for old values if they exist in data
    Low: { icon: <ArrowDown />, color: 'text-green-600', label: 'Prioridade Baixa (Legado)' },
    Medium: { icon: <Minus />, color: 'text-yellow-600', label: 'Prioridade Normal (Legado)' },
    High: { icon: <ArrowUp />, color: 'text-orange-600', label: 'Prioridade Alta (Legado)' },
  };

  const config = iconConfig[priority] || iconConfig.Normal; // Default to Normal if somehow unknown
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
