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

// Helper to find assignee name
const getAssigneeName = (email: string | null) => {
  if (!email) return 'Unassigned';
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
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
    header: 'Problem Description',
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
        Priority
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
        Type
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
        Status
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
    header: 'Requester',
  },
  {
    accessorKey: 'responsavelEmail',
    header: 'Assignee',
    cell: ({ row }) => getAssigneeName(row.getValue('responsavelEmail')),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created At
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
        <span className="sr-only">Edit Ticket</span>
      </Button>
    ),
  },
];
