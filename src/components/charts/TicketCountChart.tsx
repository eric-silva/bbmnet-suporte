
'use client';

import React from 'react';
import { TrendingUp } from "lucide-react"
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart";

export interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

interface TicketCountChartProps {
  data: ChartDataItem[];
  title: string;
  description?: string;
  chartConfig: ChartConfig;
}

export function TicketCountChart({ data, title, description, chartConfig }: TicketCountChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
       <Card className="flex flex-col h-full shadow-md">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pb-0">
          <p className="text-muted-foreground">Não há dados para exibir para esta seleção.</p>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
           <div className="leading-none text-muted-foreground">
            Nenhum ticket encontrado.
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription className="text-center max-w-md mx-auto">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px] md:max-h-[450px]"
        >
          <RechartsPieChart>
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60} 
              outerRadius={120}
              strokeWidth={2}
              labelLine={false}
              label={({ name, percent, x, y, textAnchor, payload }) => {
                const RADIAN = Math.PI / 180;
                const radius = 120 + 30; // Outer radius + label offset
                const lx = x + (radius * Math.cos(-payload.midAngle * RADIAN));
                const ly = y + (radius * Math.sin(-payload.midAngle * RADIAN));
                return (
                  <text
                    x={lx}
                    y={ly}
                    fill="hsl(var(--foreground))"
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="text-xs"
                  >
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                  </text>
                );
              }}
            >
              {data.map((entry) => (
                 <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs" />} />
          </RechartsPieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total: {totalValue} tickets
          {totalValue > 0 && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="leading-none text-muted-foreground">
          Exibindo distribuição de tickets.
        </div>
      </CardFooter>
    </Card>
  );
}

