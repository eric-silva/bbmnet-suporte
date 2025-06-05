import type { TicketStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CircleDot, Loader2, CheckCircle2, XCircle, Archive } from 'lucide-react'; // Using CircleDot for Open

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const statusConfig = {
    Open: {
      label: 'Open',
      icon: <CircleDot className="h-3 w-3" />,
      color: 'bg-blue-500 hover:bg-blue-600', // Using Tailwind direct colors for distinctiveness
      textColor: 'text-white',
    },
    'In Progress': {
      label: 'In Progress',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      textColor: 'text-black',
    },
    Resolved: {
      label: 'Resolved',
      icon: <CheckCircle2 className="h-3 w-3" />,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
    },
    Closed: {
      label: 'Closed',
      icon: <Archive className="h-3 w-3" />, // Using Archive for Closed
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white',
    },
  };

  const config = statusConfig[status] || statusConfig.Open;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2 py-0.5 text-xs capitalize border-none", config.color, config.textColor)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
