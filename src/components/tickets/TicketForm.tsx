
'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Ticket, Assignee, BaseEntity } from '@/types';
import { prioridadeValues, tipoValues, ambienteValues, origemValues, situacaoValues } from '@/types';
import { AiAssigneeSuggestion } from './AiAssigneeSuggestion';
import { useSession } from '@/components/auth/AppProviders';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Updated Zod schema - values are string descriptions
const ticketFormSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().refine(val => prioridadeValues.includes(val), { message: "Selecione uma prioridade válida."}),
  type: z.string().refine(val => tipoValues.includes(val), { message: "Selecione um tipo válido."}),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')),
  status: z.string().refine(val => situacaoValues.includes(val), { message: "Selecione uma situação válida."}).optional(),
  resolutionDetails: z.string().optional().nullable(),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório. Por favor, descreva ou cole links para as evidências.'),
  anexos: z.string().optional().nullable(),
  ambiente: z.string().refine(val => ambienteValues.includes(val), { message: "Selecione um ambiente válido."}),
  origem: z.string().refine(val => origemValues.includes(val), { message: "Selecione uma origem válida."}),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  ticket?: Ticket | null;
  onSubmit: (data: TicketFormData, ticketId?: string) => Promise<{ success: boolean; error?: any; ticket?: Ticket }>;
  onCancel: () => void;
  formMode: 'create' | 'edit';
}

export function TicketForm({ ticket, onSubmit, onCancel, formMode }: TicketFormProps) {
  const { getAuthHeaders } = useSession();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [assigneeOptions, setAssigneeOptions] = useState<Assignee[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<BaseEntity[]>([]);
  const [typeOptions, setTypeOptions] = useState<BaseEntity[]>([]);
  const [statusOptions, setStatusOptions] = useState<BaseEntity[]>([]);
  const [environmentOptions, setEnvironmentOptions] = useState<BaseEntity[]>([]);
  const [originOptions, setOriginOptions] = useState<BaseEntity[]>([]);
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      problemDescription: ticket?.problemDescription || '',
      priority: ticket?.prioridade.descricao || prioridadeValues[1], // Default to "Normal"
      type: ticket?.tipo.descricao || tipoValues[1], // Default to "Bug"
      responsavelEmail: ticket?.responsavel?.email || '',
      status: ticket?.situacao.descricao || (formMode === 'create' ? situacaoValues[0] : undefined), // Default to "Para fazer"
      resolutionDetails: ticket?.resolutionDetails || '',
      evidencias: ticket?.evidencias || '',
      anexos: ticket?.anexos || '',
      ambiente: ticket?.ambiente.descricao || ambienteValues[0],
      origem: ticket?.origem.descricao || origemValues[0],
    },
  });

  const problemDescriptionValue = watch('problemDescription');
  const currentResponsavelEmail = watch('responsavelEmail');

  const fetchAllMetaData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [
        assigneesRes, prioritiesRes, typesRes, statusesRes, environmentsRes, originsRes
      ] = await Promise.all([
        fetch('/api/meta/assignees', { headers }),
        fetch('/api/meta/priorities', { headers }),
        fetch('/api/meta/tipos', { headers }),
        fetch('/api/meta/situacoes', { headers }),
        fetch('/api/meta/environments', { headers }),
        fetch('/api/meta/origins', { headers }),
      ]);

      if (!assigneesRes.ok) throw new Error('Failed to fetch assignees');
      if (!prioritiesRes.ok) throw new Error('Failed to fetch priorities');
      if (!typesRes.ok) throw new Error('Failed to fetch types');
      if (!statusesRes.ok) throw new Error('Failed to fetch statuses');
      if (!environmentsRes.ok) throw new Error('Failed to fetch environments');
      if (!originsRes.ok) throw new Error('Failed to fetch origins');

      setAssigneeOptions(await assigneesRes.json());
      setPriorityOptions(await prioritiesRes.json());
      setTypeOptions(await typesRes.json());
      setStatusOptions(await statusesRes.json());
      const fetchedEnvs = await environmentsRes.json();
      setEnvironmentOptions(fetchedEnvs);
      const fetchedOrigins = await originsRes.json();
      setOriginOptions(fetchedOrigins);
      
      // Set default values after fetching if in create mode or if current value is not in fetched list
      if (formMode === 'create') {
        if (fetchedEnvs.length > 0 && !watch('ambiente')) setValue('ambiente', fetchedEnvs[0].descricao);
        if (fetchedOrigins.length > 0 && !watch('origem')) setValue('origem', fetchedOrigins[0].descricao);
        if (priorityOptions.length > 0 && !watch('priority')) setValue('priority', priorityOptions.find(p=>p.descricao === "Normal")?.descricao || priorityOptions[0]?.descricao || '');
        if (typeOptions.length > 0 && !watch('type')) setValue('type', typeOptions.find(t=>t.descricao === "Bug")?.descricao || typeOptions[0]?.descricao || '');
        if (statusOptions.length > 0 && !watch('status')) setValue('status', statusOptions.find(s=>s.descricao === "Para fazer")?.descricao || statusOptions[0]?.descricao || '');

      }

    } catch (error) {
      console.error("Failed to fetch form metadata:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar opções para o formulário.", variant: "destructive" });
    }
  }, [getAuthHeaders, toast, formMode, setValue, watch, priorityOptions, typeOptions, statusOptions]);


  useEffect(() => {
    fetchAllMetaData();
  }, [fetchAllMetaData]);
  
  useEffect(() => {
    if (ticket) {
      reset({
        problemDescription: ticket.problemDescription,
        priority: ticket.prioridade.descricao,
        type: ticket.tipo.descricao,
        responsavelEmail: ticket.responsavel?.email || '',
        status: ticket.situacao.descricao,
        resolutionDetails: ticket.resolutionDetails || '',
        evidencias: ticket.evidencias,
        anexos: ticket.anexos || '',
        ambiente: ticket.ambiente.descricao,
        origem: ticket.origem.descricao,
      });
    } else if (formMode === 'create') {
        reset(currentValues => ({
            ...currentValues,
            problemDescription: '',
            priority: priorityOptions.find(p => p.descricao === "Normal")?.descricao || priorityOptions[0]?.descricao || '',
            type: typeOptions.find(t => t.descricao === "Bug")?.descricao || typeOptions[0]?.descricao || '',
            responsavelEmail: '',
            status: statusOptions.find(s => s.descricao === "Para fazer")?.descricao || statusOptions[0]?.descricao || '',
            resolutionDetails: '',
            evidencias: '',
            anexos: '',
            ambiente: environmentOptions[0]?.descricao || '',
            origem: originOptions[0]?.descricao || '',
        }));
    }
  }, [ticket, reset, formMode, priorityOptions, typeOptions, statusOptions, environmentOptions, originOptions]);


  const handleFormSubmit = (data: TicketFormData) => {
    startTransition(async () => {
      const result = await onSubmit(data, ticket?.id); // Pass TicketFormData directly
      if (result.success) {
        toast({
          title: formMode === 'create' ? "Ticket Criado" : "Ticket Atualizado",
          description: `Ticket ${result.ticket?.id} foi ${formMode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
          variant: 'default',
        });
      } else {
         const errorMessages = result.error ? 
          (typeof result.error === 'string' ? result.error : 
          (result.error.errors ? JSON.stringify(result.error.errors) : 
          (result.error.message ? result.error.message : JSON.stringify(result.error))))
          : 'Ocorreu um erro desconhecido.';
        toast({
          title: "Erro",
          description: `Falha ao ${formMode === 'create' ? 'criar' : 'atualizar'} ticket: ${errorMessages}`,
          variant: 'destructive',
        });
      }
    });
  };

  const handleAiSuggestionAccept = (suggestedEmail: string) => {
    setValue('responsavelEmail', suggestedEmail, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {formMode === 'create' ? 'Criar Novo Ticket de Suporte' : `Editar Ticket ${ticket?.id || ''}`}
          </CardTitle>
          {formMode === 'create' && <CardDescription>Preencha os detalhes abaixo para submeter um novo ticket de suporte.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {formMode === 'edit' && ticket && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm p-4 border rounded-md bg-muted/50">
              <div><strong>Solicitante:</strong> {ticket.solicitante.nome} ({ticket.solicitante.email})</div>
              <div><strong>Abertura:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
              {ticket.inicioAtendimento && <div><strong>Início Atendimento:</strong> {new Date(ticket.inicioAtendimento).toLocaleString()}</div>}
              {ticket.terminoAtendimento && <div><strong>Término Atendimento:</strong> {new Date(ticket.terminoAtendimento).toLocaleString()}</div>}
              <div><strong>Última Atualização:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          )}

          <div>
            <Label htmlFor="problemDescription">Descrição do Problema <span className="text-destructive">*</span></Label>
            <Textarea
              id="problemDescription"
              {...register('problemDescription')}
              className="mt-1 min-h-[120px]"
              placeholder="Descreva o problema detalhadamente..."
              disabled={isPending}
            />
            {errors.problemDescription && <p className="text-sm text-destructive mt-1">{errors.problemDescription.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="priority">Prioridade <span className="text-destructive">*</span></Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending || priorityOptions.length === 0}>
                    <SelectTrigger id="priority" className="mt-1">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(p => <SelectItem key={p.id} value={p.descricao}>{p.descricao}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>}
            </div>

            <div>
              <Label htmlFor="type">Tipo <span className="text-destructive">*</span></Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending || typeOptions.length === 0}>
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(t => <SelectItem key={t.id} value={t.descricao}>{t.descricao}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="ambiente">Ambiente <span className="text-destructive">*</span></Label>
              <Controller
                name="ambiente"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4 mt-2"
                    disabled={isPending || environmentOptions.length === 0}
                  >
                    {environmentOptions.map(env => (
                      <div key={env.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={env.descricao} id={`ambiente-${env.id}`} />
                        <Label htmlFor={`ambiente-${env.id}`}>{env.descricao}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.ambiente && <p className="text-sm text-destructive mt-1">{errors.ambiente.message}</p>}
            </div>

            <div>
              <Label htmlFor="origem">Origem <span className="text-destructive">*</span></Label>
              <Controller
                name="origem"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    disabled={isPending || originOptions.length === 0}
                  >
                    <SelectTrigger id="origem" className="mt-1">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {originOptions.map(o => <SelectItem key={o.id} value={o.descricao}>{o.descricao}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.origem && <p className="text-sm text-destructive mt-1">{errors.origem.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="evidencias">Evidências <span className="text-destructive">*</span></Label>
            <Textarea
              id="evidencias"
              {...register('evidencias')}
              className="mt-1 min-h-[100px]"
              placeholder="Descreva ou cole links para as evidências (imagens, vídeos, documentos). Campo obrigatório."
              disabled={isPending}
            />
            {errors.evidencias && <p className="text-sm text-destructive mt-1">{errors.evidencias.message}</p>}
          </div>

          <div>
            <Label htmlFor="anexos">Anexos</Label>
            <Textarea
              id="anexos"
              {...register('anexos')}
              className="mt-1 min-h-[100px]"
              placeholder="Descreva ou cole links para anexos adicionais (opcional)."
              disabled={isPending}
            />
            {errors.anexos && <p className="text-sm text-destructive mt-1">{errors.anexos.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="responsavelEmail">Responsável</Label>
            <Controller
              name="responsavelEmail"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => field.onChange(value === 'unassigned' ? '' : value)} 
                  value={field.value || 'unassigned'}
                  disabled={isPending || assigneeOptions.length === 0}
                >
                  <SelectTrigger id="responsavelEmail" className="mt-1">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {assigneeOptions.map(a => <SelectItem key={a.email} value={a.email}>{a.name} ({a.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.responsavelEmail && <p className="text-sm text-destructive mt-1">{errors.responsavelEmail.message}</p>}
          </div>

          {problemDescriptionValue && problemDescriptionValue.length >= 20 && (
             <AiAssigneeSuggestion
              problemDescription={problemDescriptionValue}
              currentAssignee={currentResponsavelEmail}
              onSuggestionAccept={handleAiSuggestionAccept}
              disabled={isPending}
            />
          )}

          {formMode === 'edit' && (
            <>
              <div>
                <Label htmlFor="status">Situação <span className="text-destructive">*</span></Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || statusOptions.length === 0}>
                      <SelectTrigger id="status" className="mt-1">
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s.id} value={s.descricao}>{s.descricao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>
              <div>
                <Label htmlFor="resolutionDetails">Detalhes da Resolução</Label>
                <Textarea
                  id="resolutionDetails"
                  {...register('resolutionDetails')}
                  className="mt-1"
                  placeholder="Insira os detalhes da resolução, se aplicável..."
                  disabled={isPending}
                />
                {errors.resolutionDetails && <p className="text-sm text-destructive mt-1">{errors.resolutionDetails.message}</p>}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || environmentOptions.length === 0 || originOptions.length === 0 || priorityOptions.length === 0 || typeOptions.length === 0 || statusOptions.length === 0 } className="font-headline">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formMode === 'create' ? 'Criar Ticket' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
