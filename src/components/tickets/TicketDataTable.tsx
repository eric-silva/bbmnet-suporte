
'use client';

import React, { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Ticket, BaseEntity } from '@/types';
import { ChevronDown } from 'lucide-react';
import { DataTableFacetedFilter } from './DataTableFacetedFilter';
import { useSession } from '@/components/auth/AppProviders';


interface TicketDataTableProps {
  columns: ColumnDef<Ticket>[];
  data: Ticket[];
}

export function TicketDataTable({ columns, data }: TicketDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const [statusOptions, setStatusOptions] = useState<{label: string, value: string}[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<{label: string, value: string}[]>([]);
  const [typeOptions, setTypeOptions] = useState<{label: string, value: string}[]>([]);
  const { getAuthHeaders } = useSession();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const headers = getAuthHeaders();
        const [statusesRes, prioritiesRes, typesRes] = await Promise.all([
          fetch('/api/meta/situacoes', { headers }),
          fetch('/api/meta/priorities', { headers }),
          fetch('/api/meta/tipos', { headers }),
        ]);

        if (!statusesRes.ok) {
          const errorText = await statusesRes.text();
          throw new Error(`Failed to fetch statuses: ${statusesRes.status} ${statusesRes.statusText}. Response: ${errorText}`);
        }
        if (!prioritiesRes.ok) {
          const errorText = await prioritiesRes.text();
          throw new Error(`Failed to fetch priorities: ${prioritiesRes.status} ${prioritiesRes.statusText}. Response: ${errorText}`);
        }
        if (!typesRes.ok) {
          const errorText = await typesRes.text();
          throw new Error(`Failed to fetch types: ${typesRes.status} ${typesRes.statusText}. Response: ${errorText}`);
        }

        const statusesData = await statusesRes.json();
        const prioritiesData = await prioritiesRes.json();
        const typesData = await typesRes.json();

        if (!Array.isArray(statusesData)) {
            console.error("Fetched statuses is not an array:", statusesData);
            throw new Error("Invalid data format for statuses. Expected an array.");
        }
        if (!Array.isArray(prioritiesData)) {
            console.error("Fetched priorities is not an array:", prioritiesData);
            throw new Error("Invalid data format for priorities. Expected an array.");
        }
        if (!Array.isArray(typesData)) {
            console.error("Fetched types is not an array:", typesData);
            throw new Error("Invalid data format for types. Expected an array.");
        }
        
        const statuses: BaseEntity[] = statusesData;
        const priorities: BaseEntity[] = prioritiesData;
        const types: BaseEntity[] = typesData;

        setStatusOptions(statuses.map(s => ({ label: s.descricao, value: s.descricao })));
        setPriorityOptions(priorities.map(p => ({ label: p.descricao, value: p.descricao })));
        setTypeOptions(types.map(t => ({ label: t.descricao, value: t.descricao })));
      } catch (error) {
        console.error("Failed to fetch filter options for table:", error);
        // Optionally, set options to empty arrays or show a toast message
        setStatusOptions([]);
        setPriorityOptions([]);
        setTypeOptions([]);
      }
    };
    fetchFilterOptions();
  }, [getAuthHeaders]);


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString', 
  });
  
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  const columnDisplayNames: Record<string, string> = {
    'id': 'ID',
    'problemDescription': 'Descrição do Problema',
    'prioridade.descricao': 'Prioridade',
    'tipo.descricao': 'Tipo',
    'situacao.descricao': 'Situação',
    'solicitante.nome': 'Solicitante',
    'responsavel.nome': 'Responsável',
    'ambiente.descricao': 'Ambiente',
    'origem.descricao': 'Origem',
    'createdAt': 'Abertura',
    'actions': 'Ações',
    'select': 'Selecionar',
  };


  return (
    <div className="space-y-4 p-4 bg-card rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Filtrar todas as colunas..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm h-10"
        />
        <div className="flex items-center gap-2">
          {table.getColumn("situacao.descricao") && statusOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("situacao.descricao")}
              title="Situação"
              options={statusOptions}
            />
          )}
          {table.getColumn("prioridade.descricao") && priorityOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("prioridade.descricao")}
              title="Prioridade"
              options={priorityOptions}
            />
          )}
          {table.getColumn("tipo.descricao") && typeOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("tipo.descricao")}
              title="Tipo"
              options={typeOptions}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto h-10">
                Colunas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnDisplayNames[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isFiltered ? "Nenhum ticket corresponde aos seus filtros." : "Nenhum ticket encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
