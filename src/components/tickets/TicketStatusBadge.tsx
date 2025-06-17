
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CircleDot, Search, Loader2, CheckCircle2, XCircle, Archive, ListChecks, TestTube2, UserX, Info, HelpCircle } from 'lucide-react';

interface TicketStatusBadgeProps {
  statusDesc: string; // Changed from status: TicketStatus to statusDesc: string
}

export function TicketStatusBadge({ statusDesc }: TicketStatusBadgeProps) {
  // Normalize the input description for case-insensitive matching if needed
  const normalizedStatusDesc = statusDesc.toLowerCase();

  let config;

  // Match based on normalized description
  if (normalizedStatusDesc.includes('para fazer') || normalizedStatusDesc.includes('open') || normalizedStatusDesc.includes('aberto')) {
    config = { label: 'Para Fazer', icon: <CircleDot className="h-3 w-3" />, color: 'bg-blue-500 hover:bg-blue-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('em análise') || normalizedStatusDesc.includes('em analise')) {
    config = { label: 'Em Análise', icon: <Search className="h-3 w-3" />, color: 'bg-purple-500 hover:bg-purple-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('em andamento') || normalizedStatusDesc.includes('in progress')) {
    config = { label: 'Em Andamento', icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'bg-yellow-500 hover:bg-yellow-600', textColor: 'text-black' };
  } else if (normalizedStatusDesc.includes('pendente de teste') || normalizedStatusDesc.includes('pendente teste')) {
    config = { label: 'Pendente Teste', icon: <ListChecks className="h-3 w-3" />, color: 'bg-teal-500 hover:bg-teal-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('em teste')) {
    config = { label: 'Em Teste', icon: <TestTube2 className="h-3 w-3" />, color: 'bg-cyan-500 hover:bg-cyan-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('finalizado') || normalizedStatusDesc.includes('resolved')) {
    config = { label: 'Finalizado', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-500 hover:bg-green-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('reaberto')) {
    config = { label: 'Reaberto', icon: <Info className="h-3 w-3" />, color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('aguardando bbm')) {
    config = { label: 'Aguardando BBM', icon: <UserX className="h-3 w-3" />, color: 'bg-pink-500 hover:bg-pink-600', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('abortado')) {
    config = { label: 'Abortado', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-700 hover:bg-red-800', textColor: 'text-white' };
  } else if (normalizedStatusDesc.includes('closed') || normalizedStatusDesc.includes('fechado')) {
    config = { label: 'Fechado', icon: <Archive className="h-3 w-3" />, color: 'bg-gray-400 hover:bg-gray-500', textColor: 'text-white' };
  } else { // Fallback for unknown statuses
    config = { label: statusDesc, icon: <HelpCircle className="h-3 w-3" />, color: 'bg-gray-500 hover:bg-gray-600', textColor: 'text-white' };
  }

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2 py-0.5 text-xs capitalize border-none", config.color, config.textColor)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
