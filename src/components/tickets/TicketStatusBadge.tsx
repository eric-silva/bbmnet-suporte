
import type { TicketStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CircleDot, Search, Loader2, CheckCircle2, XCircle, Archive, ListChecks, TestTube2, UserX, Info } from 'lucide-react';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const statusConfig = {
    'Para fazer': {
      label: 'Para fazer',
      icon: <CircleDot className="h-3 w-3" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
    },
    'Em Análise': {
      label: 'Em Análise',
      icon: <Search className="h-3 w-3" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white',
    },
    'Em Andamento': {
      label: 'Em Andamento',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      textColor: 'text-black',
    },
    'Pendente de Teste': {
        label: 'Pendente Teste',
        icon: <ListChecks className="h-3 w-3" />,
        color: 'bg-teal-500 hover:bg-teal-600',
        textColor: 'text-white',
    },
    'Em Teste': {
        label: 'Em Teste',
        icon: <TestTube2 className="h-3 w-3" />,
        color: 'bg-cyan-500 hover:bg-cyan-600',
        textColor: 'text-white',
    },
    'Finalizado': {
      label: 'Finalizado',
      icon: <CheckCircle2 className="h-3 w-3" />,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
    },
    'Reaberto': {
        label: 'Reaberto',
        icon: <Info className="h-3 w-3" />, // Using Info, could be RefreshCw
        color: 'bg-orange-500 hover:bg-orange-600',
        textColor: 'text-white',
    },
    'Aguardando BBM': {
        label: 'Aguardando BBM',
        icon: <UserX className="h-3 w-3" />, // Placeholder, adjust as needed
        color: 'bg-pink-500 hover:bg-pink-600',
        textColor: 'text-white',
    },
    'Abortado': {
        label: 'Abortado',
        icon: <XCircle className="h-3 w-3" />,
        color: 'bg-red-700 hover:bg-red-800',
        textColor: 'text-white',
    },
    // Fallback for any other status that might occur (e.g. "Open" from old data)
    'Open': { 
      label: 'Aberto (Legado)',
      icon: <CircleDot className="h-3 w-3" />,
      color: 'bg-gray-400 hover:bg-gray-500',
      textColor: 'text-white',
    },
     'Resolved': {
      label: 'Resolvido (Legado)',
      icon: <CheckCircle2 className="h-3 w-3" />,
      color: 'bg-gray-400 hover:bg-gray-500',
      textColor: 'text-white',
    },
    'Closed': {
      label: 'Fechado (Legado)',
      icon: <Archive className="h-3 w-3" />,
      color: 'bg-gray-400 hover:bg-gray-500',
      textColor: 'text-white',
    },
    'In Progress': {
        label: 'Em Progresso (Legado)',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        color: 'bg-gray-400 hover:bg-gray-500',
        textColor: 'text-white',
    }
  };
  
  const config = statusConfig[status] || statusConfig['Para fazer'];


  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2 py-0.5 text-xs capitalize border-none", config.color, config.textColor)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
