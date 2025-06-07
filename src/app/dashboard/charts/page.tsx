
'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTickets } from '@/app/actions/tickets';
import { TicketCountChart, type ChartDataItem } from '@/components/charts/TicketCountChart';
import { SaveToPdfButton } from '@/components/charts/SaveToPdfButton';
import type { Ticket } from '@/types';
import { type ChartConfig } from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CHART_COLORS = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))", 
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(210 40% 96.1%)",
  "hsl(142.1 70.6% 45.3%)",
  "hsl(346.8 77.2% 49.8%)",
];

function aggregateTickets<K extends keyof Ticket>(
  tickets: Ticket[], 
  key: K,
  maxCategories: number = 10
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
    othersValue = sortedEntries.slice(maxCategories - 1).reduce((acc, [, value]) => acc + value, 0);
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

type ChartableFieldKey = 'priority' | 'status' | 'type' | 'ambiente' | 'origem' | 'responsavelEmail' | 'solicitanteName';

interface ChartableField {
  value: ChartableFieldKey;
  label: string; // Used for the Select item display
  titlePrefix: string; // Used for the chart title, e.g., "Tickets por"
  description: string;
  maxCategories?: number;
}

const chartableFields: ChartableField[] = [
  { value: 'priority', label: 'Prioridade', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por nível de prioridade.' },
  { value: 'status', label: 'Situação', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por status atual.' },
  { value: 'type', label: 'Tipo', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por tipo de solicitação.' },
  { value: 'ambiente', label: 'Ambiente', titlePrefix: 'Tickets por', description: 'Distribuição de tickets entre ambientes.'},
  { value: 'origem', label: 'Origem', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por origem do problema.'},
  { value: 'responsavelEmail', label: 'Responsável', titlePrefix: 'Tickets por', description: 'Top 5 responsáveis com mais tickets.', maxCategories: 6 }, // 5 + Outros
  { value: 'solicitanteName', label: 'Solicitante', titlePrefix: 'Tickets por', description: 'Top 5 solicitantes com mais tickets.', maxCategories: 6 }, // 5 + Outros
];

const CLEAR_SELECTION_VALUE = "clear-selection";

export default function ChartsPage() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedFieldInfo, setSelectedFieldInfo] = useState<ChartableField | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[] | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isProcessingChart, setIsProcessingChart] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      setIsLoadingTickets(true);
      try {
        const fetchedTickets = await getTickets();
        setAllTickets(fetchedTickets);
      } catch (error) {
        console.error("Falha ao buscar tickets:", error);
        // Consider adding a toast notification here
      } finally {
        setIsLoadingTickets(false);
      }
    }
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedFieldInfo && allTickets.length > 0) {
      setIsProcessingChart(true);
      const { value, maxCategories } = selectedFieldInfo;
      
      // Ensure 'value' is a valid key for Ticket before calling aggregateTickets
      const data = aggregateTickets(allTickets, value as keyof Ticket, maxCategories);
      setChartData(data);
      setChartConfig(generateChartConfig(data));
      setIsProcessingChart(false);
    } else {
      setChartData(null);
      setChartConfig(null);
    }
  }, [selectedFieldInfo, allTickets]);

  const handleFieldChange = (selectedValue: string) => {
    if (selectedValue === CLEAR_SELECTION_VALUE) {
        setSelectedFieldInfo(null);
        return;
    }
    const field = chartableFields.find(f => f.value === selectedValue);
    setSelectedFieldInfo(field || null);
  };

  const currentChartTitle = selectedFieldInfo ? `${selectedFieldInfo.titlePrefix} ${selectedFieldInfo.label}` : 'Selecione um Gráfico';
  const currentChartDescription = selectedFieldInfo ? selectedFieldInfo.description : 'Escolha uma categoria para visualizar a distribuição dos tickets.';

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold font-headline text-foreground text-center sm:text-left">Dashboard de Gráficos</h1>
          <SaveToPdfButton />
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Selecionar Visualização</CardTitle>
            <CardDescription>Escolha qual aspecto dos tickets você gostaria de visualizar em formato de gráfico.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              onValueChange={handleFieldChange} 
              value={selectedFieldInfo?.value || CLEAR_SELECTION_VALUE}
            >
              <SelectTrigger className="w-full sm:w-[280px] h-10">
                <SelectValue placeholder="Selecione um tipo de gráfico..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipos de Gráfico</SelectLabel>
                  <SelectItem value={CLEAR_SELECTION_VALUE}>Nenhum (Limpar)</SelectItem>
                  {chartableFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.titlePrefix} {field.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoadingTickets ? (
          <div className="flex justify-center items-center h-[300px]">
            <Skeleton className="h-12 w-1/2" />
            <p className="ml-4 text-muted-foreground">Carregando dados dos tickets...</p>
          </div>
        ) : isProcessingChart ? (
          <div className="flex justify-center items-center h-[450px]">
             <Skeleton className="w-full h-[400px] rounded-lg" />
          </div>
        ) : selectedFieldInfo && chartData && chartConfig ? (
          <TicketCountChart 
            title={currentChartTitle} 
            data={chartData} 
            chartConfig={chartConfig} 
            description={currentChartDescription} 
          />
        ) : (
          <Card className="h-[450px] flex flex-col items-center justify-center text-center shadow-lg">
            <CardHeader>
              <CardTitle>Nenhum Gráfico Selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Por favor, selecione um tipo de gráfico no menu acima para visualizar os dados.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
