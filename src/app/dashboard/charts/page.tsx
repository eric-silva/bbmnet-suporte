
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketCountChart, type ChartDataItem } from '@/components/charts/TicketCountChart';
import { SaveToPdfButton } from '@/components/charts/SaveToPdfButton';
import type { Ticket } from '@/types';
import { type ChartConfig } from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/components/auth/AppProviders';
import { useToast } from "@/hooks/use-toast";


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
  label: string; 
  titlePrefix: string; 
  description: string;
  maxCategories?: number;
}

const chartableFields: ChartableField[] = [
  { value: 'priority', label: 'Prioridade', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por nível de prioridade.' },
  { value: 'status', label: 'Situação', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por status atual.' },
  { value: 'type', label: 'Tipo', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por tipo de solicitação.' },
  { value: 'ambiente', label: 'Ambiente', titlePrefix: 'Tickets por', description: 'Distribuição de tickets entre ambientes.'},
  { value: 'origem', label: 'Origem', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por origem do problema.'},
  { value: 'responsavelEmail', label: 'Responsável', titlePrefix: 'Tickets por', description: 'Top 5 responsáveis com mais tickets.', maxCategories: 6 }, 
  { value: 'solicitanteName', label: 'Solicitante', titlePrefix: 'Tickets por', description: 'Top 5 solicitantes com mais tickets.', maxCategories: 6 }, 
];

const CLEAR_SELECTION_VALUE = "clear-selection";

export default function ChartsPage() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedFieldInfo, setSelectedFieldInfo] = useState<ChartableField | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[] | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isProcessingChart, setIsProcessingChart] = useState(false);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const { getAuthHeaders } = useSession();
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      const response = await fetch('/api/tickets', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedTickets = await response.json();
      setAllTickets(fetchedTickets);
    } catch (error) {
      console.error("Falha ao buscar tickets:", error);
      toast({
        title: "Erro ao buscar tickets",
        description: "Não foi possível carregar os dados dos tickets para os gráficos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTickets(false);
    }
  }, [getAuthHeaders, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (selectedFieldInfo && allTickets.length > 0) {
      setIsProcessingChart(true);
      const { value, maxCategories } = selectedFieldInfo;
      
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
  const isChartReady = !!(selectedFieldInfo && chartData && chartConfig && !isProcessingChart && !isLoadingTickets && allTickets.length > 0);


  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 charts-page-controls-print-hide">
          <h1 className="text-3xl font-bold font-headline text-foreground text-center sm:text-left">Dashboard de Gráficos</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" passHref>
              <Button variant="outline" className="font-headline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <SaveToPdfButton isChartReady={isChartReady} />
          </div>
        </div>

        <Card className="mb-8 shadow-lg charts-page-controls-print-hide">
          <CardHeader>
            <CardTitle>Selecionar Visualização</CardTitle>
            <CardDescription>Escolha qual aspecto dos tickets você gostaria de visualizar em formato de gráfico.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              onValueChange={handleFieldChange} 
              value={selectedFieldInfo?.value || CLEAR_SELECTION_VALUE}
              disabled={isLoadingTickets || allTickets.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[280px] h-10">
                <SelectValue placeholder={isLoadingTickets ? "Carregando dados..." : (allTickets.length === 0 ? "Sem tickets para analisar" : "Selecione um tipo de gráfico...")} />
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
            {isLoadingTickets && <p className="text-sm text-muted-foreground mt-2">Carregando dados dos tickets...</p>}
            {!isLoadingTickets && allTickets.length === 0 && <p className="text-sm text-muted-foreground mt-2">Não há tickets cadastrados para gerar gráficos.</p>}
          </CardContent>
        </Card>

        <div id="chart-to-print-area" ref={chartAreaRef}>
          {isLoadingTickets ? (
             <Card className="h-[450px] flex flex-col items-center justify-center text-center shadow-lg charts-page-controls-print-hide">
              <CardHeader>
                <CardTitle>Carregando Dados...</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                <p className="text-muted-foreground">Buscando tickets para os gráficos.</p>
              </CardContent>
            </Card>
          ) : isProcessingChart ? (
            <Card className="h-[450px] flex flex-col items-center justify-center text-center shadow-lg charts-page-controls-print-hide">
              <CardHeader>
                <CardTitle>Processando Gráfico...</CardTitle>
              </CardHeader>
              <CardContent>
                 <Skeleton className="w-full h-[300px] rounded-lg" />
              </CardContent>
            </Card>
          ) : isChartReady ? (
            <TicketCountChart 
              title={currentChartTitle} 
              data={chartData!} 
              chartConfig={chartConfig!} 
              description={currentChartDescription} 
            />
          ) : (
            <Card className="h-[450px] flex flex-col items-center justify-center text-center shadow-lg">
              <CardHeader>
                <CardTitle>{allTickets.length === 0 ? 'Sem Dados para Gráficos' : 'Nenhum Gráfico Selecionado'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {allTickets.length === 0 
                    ? 'Não há tickets disponíveis para gerar visualizações.'
                    : 'Por favor, selecione um tipo de gráfico no menu acima para visualizar os dados.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
