
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit2 } from 'lucide-react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityIcon } from './TicketPriorityIcon';
import { TicketTypeIcon } from './TicketTypeIcon';
import { Checkbox } from '@/components/ui/checkbox';

export const getTicketColumns = (
  onEdit: (ticket: Ticket) => void
): ColumnDef<Ticket>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'numeroTicket', // Changed from 'id'
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nº Ticket
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.numeroTicket}</div>, // Display numeroTicket
  },
  {
    accessorKey: 'problemDescription',
    header: 'Descrição do Problema',
    cell: ({ row }) => {
      const description = row.original.problemDescription;
      return <div className="truncate max-w-xs" title={description}>{description}</div>;
    },
  },
  {
    id: 'prioridade.descricao', 
    accessorKey: 'prioridade.descricao',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Prioridade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketPriorityIcon priorityDesc={row.original.prioridade.descricao} />,
    filterFn: (row, id, value) => {
      return value.includes(row.original.prioridade.descricao)
    },
  },
  {
    id: 'tipo.descricao', 
    accessorKey: 'tipo.descricao',
    header: ({ column }) => (
       <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketTypeIcon typeDesc={row.original.tipo.descricao} />,
    filterFn: (row, id, value) => {
      return value.includes(row.original.tipo.descricao)
    },
  },
  {
    id: 'situacao.descricao', 
    accessorKey: 'situacao.descricao',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Situação
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketStatusBadge statusDesc={row.original.situacao.descricao} />,
    filterFn: (row, id, value) => {
      return value.includes(row.original.situacao.descricao)
    },
  },
  {
    accessorKey: 'solicitante.nome',
    header: 'Solicitante',
    cell: ({ row }) => row.original.solicitante.nome,
  },
  {
    accessorKey: 'responsavel.nome',
    header: 'Responsável',
    cell: ({ row }) => row.original.responsavel?.nome || 'Não atribuído',
  },
  {
    accessorKey: 'ambiente.descricao',
    header: 'Ambiente',
    cell: ({ row }) => row.original.ambiente.descricao,
  },
  {
    accessorKey: 'origem.descricao',
    header: 'Origem',
    cell: ({ row }) => row.original.origem.descricao,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Abertura
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Editar Ticket</span>
      </Button>
    ),
  },
];
