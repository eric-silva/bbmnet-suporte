
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit2 } from 'lucide-react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityIcon } from './TicketPriorityIcon';
import { TicketTypeIcon } from './TicketTypeIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';

const getAssigneeName = (email: string | null) => {
  if (!email) return 'Não atribuído';
  const assignee = PERMITTED_ASSIGNEES.find(a => a.email === email);
  return assignee ? assignee.name : email;
};


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
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'problemDescription',
    header: 'Descrição do Problema',
    cell: ({ row }) => {
      const description = row.getValue('problemDescription') as string;
      return <div className="truncate max-w-xs" title={description}>{description}</div>;
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Prioridade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketPriorityIcon priority={row.getValue('priority')} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
       <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketTypeIcon type={row.getValue('type')} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Situação
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TicketStatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'solicitanteName',
    header: 'Solicitante',
  },
  {
    accessorKey: 'responsavelEmail',
    header: 'Responsável',
    cell: ({ row }) => getAssigneeName(row.getValue('responsavelEmail')),
  },
    {
    accessorKey: 'ambiente',
    header: 'Ambiente',
  },
  {
    accessorKey: 'origem',
    header: 'Origem',
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
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
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
