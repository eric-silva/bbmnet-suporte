
'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Not used, but kept for consistency if needed later
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
import type { Ticket, Priority, TicketStatus, TicketType, Assignee, Environment, Origin } from '@/types';
import { priorities, ticketStatuses, ticketTypes } from '@/types'; // environments and origins will be fetched
import { AiAssigneeSuggestion } from './AiAssigneeSuggestion';
import { useSession } from '@/components/auth/AppProviders';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ticketFormSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.enum(priorities as [string, ...string[]], { errorMap: () => ({ message: "Selecione uma prioridade válida."}) }),
  type: z.enum(ticketTypes as [string, ...string[]], { errorMap: () => ({ message: "Selecione um tipo válido."}) }),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')),
  status: z.enum(ticketStatuses as [string, ...string[]], { errorMap: () => ({ message: "Selecione um status válido."}) }).optional(),
  resolutionDetails: z.string().optional(),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório. Por favor, descreva ou cole links para as evidências.'),
  anexos: z.string().optional(),
  // environment and origin values will be dynamic based on fetch
  ambiente: z.string().min(1, "Selecione um ambiente válido."),
  origem: z.string().min(1, "Selecione uma origem válida."),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  ticket?: Ticket | null;
  onSubmit: (data: FormData, ticketId?: string) => Promise<{ success: boolean; error?: any; ticket?: Ticket }>;
  onCancel: () => void;
  formMode: 'create' | 'edit';
}

export function TicketForm({ ticket, onSubmit, onCancel, formMode }: TicketFormProps) {
  const { session, getAuthHeaders } = useSession();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [fetchedEnvironments, setFetchedEnvironments] = useState<Environment[]>([]);
  const [fetchedOrigins, setFetchedOrigins] = useState<Origin[]>([]);
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      problemDescription: ticket?.problemDescription || '',
      priority: ticket?.priority || 'Normal',
      type: ticket?.type || 'Bug',
      responsavelEmail: ticket?.responsavelEmail || '',
      status: ticket?.status || (formMode === 'create' ? 'Para fazer' : undefined),
      resolutionDetails: ticket?.resolutionDetails || '',
      evidencias: ticket?.evidencias || '',
      anexos: ticket?.anexos || '',
      ambiente: ticket?.ambiente || '', // Default to empty, will be set by fetch
      origem: ticket?.origem || '',   // Default to empty, will be set by fetch
    },
  });

  const problemDescriptionValue = watch('problemDescription');
  const currentResponsavelEmail = watch('responsavelEmail');


  const fetchMetadata = useCallback(async () => {
    try {
      const [assigneesRes, envsRes, orgsRes] = await Promise.all([
        fetch('/api/meta/assignees', { headers: getAuthHeaders() }),
        fetch('/api/meta/environments', { headers: getAuthHeaders() }),
        fetch('/api/meta/origins', { headers: getAuthHeaders() }),
      ]);

      if (!assigneesRes.ok || !envsRes.ok || !orgsRes.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const fetchedAssignees = await assigneesRes.json();
      const envs = await envsRes.json();
      const orgs = await orgsRes.json();
      
      setAssignees(fetchedAssignees);
      setFetchedEnvironments(envs);
      setFetchedOrigins(orgs);

      // Set default values after fetching if in create mode or if current value is not in fetched list
      if (formMode === 'create' || (envs.length > 0 && !envs.includes(watch('ambiente')))) {
        setValue('ambiente', envs[0] || '');
      }
      if (formMode === 'create' || (orgs.length > 0 && !orgs.includes(watch('origem')))) {
        setValue('origem', orgs[0] || '');
      }

    } catch (error) {
      console.error("Failed to fetch form metadata:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar opções para o formulário.", variant: "destructive" });
    }
  }, [getAuthHeaders, toast, formMode, setValue, watch]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (ticket) {
      reset({
        problemDescription: ticket.problemDescription,
        priority: ticket.priority,
        type: ticket.type,
        responsavelEmail: ticket.responsavelEmail || '',
        status: ticket.status,
        resolutionDetails: ticket.resolutionDetails || '',
        evidencias: ticket.evidencias,
        anexos: ticket.anexos || '',
        ambiente: ticket.ambiente,
        origem: ticket.origem,
      });
    } else if (formMode === 'create') {
        // Default for create mode, ensure status is set if not already.
        // Environment and origin defaults are handled after fetch.
         reset(currentValues => ({
            ...currentValues, // Keep other potential defaults or user input
            problemDescription: '',
            priority: 'Normal',
            type: 'Bug',
            responsavelEmail: '',
            status: 'Para fazer',
            resolutionDetails: '',
            evidencias: '',
            anexos: '',
            ambiente: fetchedEnvironments.length > 0 ? fetchedEnvironments[0] : '',
            origem: fetchedOrigins.length > 0 ? fetchedOrigins[0] : '',
        }));
    }
  }, [ticket, reset, formMode, fetchedEnvironments, fetchedOrigins]);


  const handleFormSubmit = (data: TicketFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'responsavelEmail' && value === '') {
            // API expects null for unassigned, not empty string from select
            formData.append(key, ''); // API will handle empty string to null if necessary
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Ensure status is included for edit mode, or default for create mode
      if (formMode === 'edit' && data.status) {
         formData.set('status', data.status);
      } else if (formMode === 'create' && !data.status) {
         formData.set('status', 'Para fazer');
      }


      const result = await onSubmit(formData, ticket?.id);
      if (result.success) {
        toast({
          title: formMode === 'create' ? "Ticket Criado" : "Ticket Atualizado",
          description: `Ticket ${result.ticket?.id} foi ${formMode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
          variant: 'default',
        });
      } else {
         const errorMessages = result.error ? 
          typeof result.error === 'string' ? result.error : 
          (result.error.errors ? JSON.stringify(result.error.errors) : JSON.stringify(result.error))
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
              <div><strong>Solicitante:</strong> {ticket.solicitanteName} ({ticket.solicitanteEmail})</div>
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <SelectTrigger id="priority" className="mt-1">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                    disabled={isPending || fetchedEnvironments.length === 0}
                  >
                    {fetchedEnvironments.map(env => (
                      <div key={env} className="flex items-center space-x-2">
                        <RadioGroupItem value={env} id={`ambiente-${env.replace(/\s+/g, '-')}`} />
                        <Label htmlFor={`ambiente-${env.replace(/\s+/g, '-')}`}>{env}</Label>
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
                    disabled={isPending || fetchedOrigins.length === 0}
                  >
                    <SelectTrigger id="origem" className="mt-1">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {fetchedOrigins.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
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
                  disabled={isPending || assignees.length === 0}
                >
                  <SelectTrigger id="responsavelEmail" className="mt-1">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {assignees.map(a => <SelectItem key={a.email} value={a.email}>{a.name} ({a.email})</SelectItem>)}
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <SelectTrigger id="status" className="mt-1">
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          <Button type="submit" disabled={isPending || (fetchedEnvironments.length === 0 && fetchedOrigins.length === 0)} className="font-headline">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formMode === 'create' ? 'Criar Ticket' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
