
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

// Type guard to check if a key is a direct property of Ticket
function isDirectTicketKey(key: string): key is keyof Omit<Ticket, 'prioridade' | 'tipo' | 'ambiente' | 'origem' | 'solicitante' | 'responsavel' | 'situacao'> {
  const directKeys: (keyof Omit<Ticket, 'prioridade' | 'tipo' | 'ambiente' | 'origem' | 'solicitante' | 'responsavel' | 'situacao'>)[] = [
    'id', 'problemDescription', 'evidencias', 'anexos', 
    'inicioAtendimento', 'terminoAtendimento', 'resolutionDetails', 
    'createdAt', 'updatedAt', 'prioridadeId', 'tipoId', 'ambienteId', 'origemId', 
    'solicitanteId', 'responsavelId', 'situacaoId'
  ];
  return directKeys.includes(key as any);
}

function aggregateTickets(
  tickets: Ticket[], 
  key: ChartableFieldKey, // Keep this as the specific keys we want to chart
  maxCategories: number = 10
): ChartDataItem[] {
  const counts: Record<string, number> = {};
  tickets.forEach(ticket => {
    let keyValue: string | null | undefined;

    // Access nested properties for relational fields
    if (key === 'prioridade') keyValue = ticket.prioridade?.descricao;
    else if (key === 'situacao') keyValue = ticket.situacao?.descricao;
    else if (key === 'tipo') keyValue = ticket.tipo?.descricao;
    else if (key === 'ambiente') keyValue = ticket.ambiente?.descricao;
    else if (key === 'origem') keyValue = ticket.origem?.descricao;
    else if (key === 'responsavelEmail') keyValue = ticket.responsavel?.email; // Using email as value, name for label later
    else if (key === 'solicitanteName') keyValue = ticket.solicitante?.nome;
    else if (isDirectTicketKey(key)) { // Fallback for direct keys, though our chartableFields are relational
        keyValue = String(ticket[key]);
    }
    
    const finalKeyValue = String(keyValue || 'Não especificado');
    counts[finalKeyValue] = (counts[finalKeyValue] || 0) + 1;
  });

  let sortedEntries = Object.entries(counts)
    .sort(([, aValue], [, bValue]) => bValue - aValue);

  let othersValue = 0;
  if (sortedEntries.length > maxCategories) {
    othersValue = sortedEntries.slice(maxCategories - 1).reduce((acc, [, value]) => acc + value, 0);
    sortedEntries = sortedEntries.slice(0, maxCategories - 1);
  }

  const aggregatedData = sortedEntries.map(([name, value], index) => {
    let displayName = name;
    if (key === 'responsavelEmail' && name !== 'Não especificado') {
        // Attempt to find the responsible person's name for display
        const responsibleTicket = tickets.find(t => t.responsavel?.email === name);
        displayName = responsibleTicket?.responsavel?.nome || name; // Show name if found, else email
    }
    return {
        name: displayName, // Use displayName for the chart label
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
    };
});


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
        config[item.name] = { // Use item.name which is now potentially the display name
            label: item.name,
            color: item.fill,
        };
    });
    return config;
}


type ChartableFieldKey = 'prioridade' | 'situacao' | 'tipo' | 'ambiente' | 'origem' | 'responsavelEmail' | 'solicitanteName';


interface ChartableField {
  value: ChartableFieldKey;
  label: string; 
  titlePrefix: string; 
  description: string;
  maxCategories?: number;
}

const chartableFields: ChartableField[] = [
  { value: 'prioridade', label: 'Prioridade', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por nível de prioridade.' },
  { value: 'situacao', label: 'Situação', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por status atual.' },
  { value: 'tipo', label: 'Tipo', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por tipo de solicitação.' },
  { value: 'ambiente', label: 'Ambiente', titlePrefix: 'Tickets por', description: 'Distribuição de tickets entre ambientes.'},
  { value: 'origem', label: 'Origem', titlePrefix: 'Tickets por', description: 'Distribuição de tickets por origem do problema.'},
  { value: 'responsavelEmail', label: 'Responsável', titlePrefix: 'Tickets por', description: 'Top 5 responsáveis com mais tickets (por e-mail).', maxCategories: 6 }, 
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
        let errorJson;
        let errorMessage = `HTTP error! Status: ${response.status} ${response.statusText || ''}`;
        try {
          errorJson = await response.json();
          if (errorJson && errorJson.message) {
            errorMessage = errorJson.message;
             if (process.env.NODE_ENV !== 'production' && errorJson.details) {
                 const detailsString = typeof errorJson.details === 'string' ? errorJson.details : JSON.stringify(errorJson.details);
                 errorMessage += ` (Detalhes: ${detailsString})`;
            }
          }
        } catch (e) {
          // console.warn("Não foi possível analisar a resposta de erro como JSON:", e);
        }
        throw new Error(errorMessage);
      }
      const fetchedTickets = await response.json();
      setAllTickets(fetchedTickets);
    } catch (error) {
      console.error("Falha ao buscar tickets para gráficos:", error);
      let userFriendlyDescription = "Não foi possível carregar os dados dos tickets para os gráficos.";
      if (error instanceof Error) {
        userFriendlyDescription = error.message;
        if (error.message.includes("Status: 500") || error.message.toLowerCase().includes("prisma")) {
          userFriendlyDescription = "Ocorreu um erro inesperado no servidor ao buscar os tickets. Verifique os logs do servidor para mais detalhes ou tente novamente. Erro: " + error.message;
        } else if (error.message.includes("HTTP error!")) {
          userFriendlyDescription = "Falha na comunicação com o servidor ao buscar os tickets. Detalhes: " + error.message;
        }
      }
      toast({
        title: "Erro ao Buscar Tickets",
        description: userFriendlyDescription,
        variant: "destructive",
      });
      setAllTickets([]); 
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
      
      const data = aggregateTickets(allTickets, value as ChartableFieldKey, maxCategories);
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
          <h1 className="text-3xl font-bold font-headline text-foreground text-center sm:text-left">Tickets de Gráficos</h1>
          <div className="flex items-center gap-2">
            <Link href="/tickets" passHref>
              <Button variant="outline" className="font-headline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Tickets
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
              disabled={isLoadingTickets || (allTickets.length === 0 && !isLoadingTickets)}
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
          {isLoadingTickets && allTickets.length === 0 ? ( 
             <Card className="h-[450px] flex flex-col items-center justify-center text-center shadow-lg charts-page-controls-print-hide">
              <CardHeader>
                <CardTitle>Carregando Dados...</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                 <Skeleton className="w-full h-[250px] rounded-lg" />
                <p className="text-muted-foreground mt-4">Buscando tickets para os gráficos.</p>
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
                <CardTitle>{allTickets.length === 0 && !isLoadingTickets ? 'Sem Dados para Gráficos' : 'Nenhum Gráfico Selecionado'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {allTickets.length === 0 && !isLoadingTickets
                    ? 'Não há tickets disponíveis para gerar visualizações no momento.'
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
