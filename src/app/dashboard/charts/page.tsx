
import { getTickets } from '@/app/actions/tickets';
import { TicketCountChart, type ChartDataItem } from '@/components/charts/TicketCountChart';
import { SaveToPdfButton } from '@/components/charts/SaveToPdfButton';
import type { Ticket } from '@/types';
import { type ChartConfig } from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


const CHART_COLORS = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))", 
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(210 40% 96.1%)", // Light Gray as an example for more colors
  "hsl(142.1 70.6% 45.3%)", // Green
  "hsl(346.8 77.2% 49.8%)", // Pink
];

function aggregateTickets<K extends keyof Ticket>(
  tickets: Ticket[], 
  key: K,
  maxCategories: number = 10 // Limit categories to prevent overly cluttered charts
): ChartDataItem[] {
  const counts: Record<string, number> = {};
  tickets.forEach(ticket => {
    const keyValue = String(ticket[key] || 'Não especificado');
    counts[keyValue] = (counts[keyValue] || 0) + 1;
  });

  let sortedEntries = Object.entries(counts)
    .sort(([, aValue], [, bValue]) => bValue - aValue);

  let othersValue = 0;
  if (sortedEntries.length > maxCategories) {
    othersValue = sortedEntries.slice(maxCategories -1).reduce((acc, [, value]) => acc + value, 0);
    sortedEntries = sortedEntries.slice(0, maxCategories - 1);
  }

  const aggregatedData = sortedEntries.map(([name, value], index) => ({
    name,
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  if (othersValue > 0) {
    aggregatedData.push({
        name: "Outros",
        value: othersValue,
        fill: CHART_COLORS[aggregatedData.length % CHART_COLORS.length]
    });
  }
  
  return aggregatedData;
}

function generateChartConfig(data: ChartDataItem[]): ChartConfig {
    const config: ChartConfig = {};
    data.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
}


export default async function ChartsPage() {
  const tickets = await getTickets();

  const ticketsByPriority = aggregateTickets(tickets, 'priority');
  const priorityChartConfig = generateChartConfig(ticketsByPriority);

  const ticketsByStatus = aggregateTickets(tickets, 'status');
  const statusChartConfig = generateChartConfig(ticketsByStatus);
  
  const ticketsByType = aggregateTickets(tickets, 'type');
  const typeChartConfig = generateChartConfig(ticketsByType);

  const ticketsByEnvironment = aggregateTickets(tickets, 'ambiente');
  const environmentChartConfig = generateChartConfig(ticketsByEnvironment);

  const ticketsByOrigin = aggregateTickets(tickets, 'origem');
  const originChartConfig = generateChartConfig(ticketsByOrigin);
  
  const ticketsByAssignee = aggregateTickets(tickets, 'responsavelEmail', 5); // Show top 5 assignees + Others
  const assigneeChartConfig = generateChartConfig(ticketsByAssignee);

  const ticketsByRequester = aggregateTickets(tickets, 'solicitanteName', 5); // Show top 5 requesters + Others
  const requesterChartConfig = generateChartConfig(ticketsByRequester);


  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold font-headline text-foreground text-center sm:text-left">Dashboard de Gráficos</h1>
          <SaveToPdfButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <TicketCountChart title="Tickets por Prioridade" data={ticketsByPriority} chartConfig={priorityChartConfig} description="Distribuição de tickets por nível de prioridade." />
          <TicketCountChart title="Tickets por Situação" data={ticketsByStatus} chartConfig={statusChartConfig} description="Distribuição de tickets por status atual." />
          <TicketCountChart title="Tickets por Tipo" data={ticketsByType} chartConfig={typeChartConfig} description="Distribuição de tickets por tipo de solicitação." />
          <TicketCountChart title="Tickets por Ambiente" data={ticketsByEnvironment} chartConfig={environmentChartConfig} description="Distribuição de tickets entre ambientes."/>
          <TicketCountChart title="Tickets por Origem" data={ticketsByOrigin} chartConfig={originChartConfig} description="Distribuição de tickets por origem do problema."/>
          <TicketCountChart title="Tickets por Responsável" data={ticketsByAssignee} chartConfig={assigneeChartConfig} description="Top 5 responsáveis com mais tickets."/>
          <TicketCountChart title="Tickets por Solicitante" data={ticketsByRequester} chartConfig={requesterChartConfig} description="Top 5 solicitantes com mais tickets."/>
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

