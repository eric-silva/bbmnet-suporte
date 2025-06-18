
'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
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
import type { Ticket, Prioridade, Tipo, Situacao, Ambiente, Origem, TicketFormData, TicketEvidencia, TicketAnexo } from '@/types';
import { AiAssigneeSuggestion } from './AiAssigneeSuggestion';
import { useSession } from '@/components/auth/AppProviders';
import { Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Usuario } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { simulateDownloadFromBucket } from '@/lib/utils';


const ticketFormSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().min(1, "Selecione uma prioridade."),
  type: z.string().min(1, "Selecione um tipo."),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')).default('').optional(),
  status: z.string().min(1, "Selecione uma situação.").optional(),
  resolutionDetails: z.string().optional().nullable(),
  evidencias: z.array(z.string()).min(1, 'Pelo menos uma evidência (nome de arquivo) é obrigatória.'), // original filenames
  anexos: z.array(z.string()).optional().nullable(), // original filenames
  ambiente: z.string().min(1, "Selecione um ambiente."),
  origem: z.string().min(1, "Selecione uma origem."),
});


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

  const [assigneeOptions, setAssigneeOptions] = useState<Usuario[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<Prioridade[]>([]);
  const [typeOptions, setTypeOptions] = useState<Tipo[]>([]);
  const [statusOptions, setStatusOptions] = useState<Situacao[]>([]);
  const [environmentOptions, setEnvironmentOptions] = useState<Ambiente[]>([]);
  const [originOptions, setOriginOptions] = useState<Origem[]>([]);

  // State for displaying existing files (from fetched ticket object)
  const [existingEvidencias, setExistingEvidencias] = useState<TicketEvidencia[]>([]);
  const [existingAnexos, setExistingAnexos] = useState<TicketAnexo[]>([]);


  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      problemDescription: '',
      priority: '',
      type: '',
      responsavelEmail: '',
      status: '',
      resolutionDetails: '',
      evidencias: [], // Initialize as empty array for original filenames
      anexos: [],   // Initialize as empty array for original filenames
      ambiente: '',
      origem: '',
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
      
      const assigneesData = await assigneesRes.json();
      const prioritiesData = await prioritiesRes.json();
      const typesData = await typesRes.json();
      const statusesData = await statusesRes.json();
      const environmentsData = await environmentsRes.json();
      const originsData = await originsRes.json();

      setAssigneeOptions(assigneesData);
      setPriorityOptions(prioritiesData);
      setTypeOptions(typesData);
      setStatusOptions(statusesData);
      setEnvironmentOptions(environmentsData);
      setOriginOptions(originsData);

      const initialValues: Partial<TicketFormData> = {
        problemDescription: ticket?.problemDescription || '',
        priority: ticket?.prioridade.descricao || prioritiesData.find((p: Prioridade) => p.descricao === "Normal")?.descricao || prioritiesData[0]?.descricao || '',
        type: ticket?.tipo.descricao || typesData.find((t: Tipo) => t.descricao === "Bug")?.descricao || typesData[0]?.descricao || '',
        responsavelEmail: ticket?.responsavel?.email || '',
        status: ticket?.situacao.descricao || statusesData.find((s: Situacao) => s.descricao === "Para fazer")?.descricao || statusesData[0]?.descricao || '',
        resolutionDetails: ticket?.resolutionDetails || '',
        ambiente: ticket?.ambiente.descricao || environmentsData.find((e: Ambiente) => e.descricao === "Produção")?.descricao || environmentsData[0]?.descricao || '',
        origem: ticket?.origem.descricao || originsData.find((o: Origem) => o.descricao === "Sala de Negociação")?.descricao || originsData[0]?.descricao || '',
        evidencias: [], // Holds original filenames for form value
        anexos: [],     // Holds original filenames for form value
      };

      if (formMode === 'edit' && ticket) {
        setExistingEvidencias(ticket.ticketEvidencias || []);
        initialValues.evidencias = (ticket.ticketEvidencias || []).map(ev => ev.nome);

        setExistingAnexos(ticket.ticketAnexos || []);
        initialValues.anexos = (ticket.ticketAnexos || []).map(an => an.nome);
      }
      reset(initialValues as TicketFormData);

    } catch (error) {
      console.error("Failed to fetch form metadata:", error);
      toast({ title: "Erro ao carregar dados", description: `Não foi possível carregar opções para o formulário. ${(error as Error).message}`, variant: "destructive" });
    }
  }, [getAuthHeaders, toast, formMode, ticket, reset]);


  useEffect(() => {
    fetchAllMetaData();
  }, [fetchAllMetaData]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'evidencias' | 'anexos') => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filenames = Array.from(files).map(file => file.name);
      setValue(fieldName, filenames, { shouldValidate: true });
      // Clear existing display states as new files replace them for submission
      if (fieldName === 'evidencias') setExistingEvidencias([]);
      if (fieldName === 'anexos') setExistingAnexos([]);
    } else {
      // If files are cleared, and it's edit mode, revert to displaying original ticket files
      if (formMode === 'edit' && ticket) {
        if (fieldName === 'evidencias') {
          setValue('evidencias', (ticket.ticketEvidencias || []).map(ev => ev.nome), { shouldValidate: true });
          setExistingEvidencias(ticket.ticketEvidencias || []);
        }
        if (fieldName === 'anexos') {
          setValue('anexos', (ticket.ticketAnexos || []).map(an => an.nome), { shouldValidate: true });
          setExistingAnexos(ticket.ticketAnexos || []);
        }
      } else {
         setValue(fieldName, [], { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = (data: TicketFormData) => {
    startTransition(async () => {
      const dataToSend = { ...data };
      if (formMode === 'create' && !dataToSend.status && statusOptions.length > 0) {
        dataToSend.status = statusOptions.find(s => s.descricao === "Para fazer")?.descricao || statusOptions[0]?.descricao || '';
      }

      // If in edit mode and the file input for evidences/anexos was not touched (so form value is still original names of existing files),
      // ensure we are sending these original filenames. If new files were selected, data.evidencias/anexos already have new names.
      if (formMode === 'edit' && ticket) {
        const currentFormEvidencias = watch('evidencias');
        const originalEvidenciasNames = (ticket.ticketEvidencias || []).map(e => e.nome);
        // If form evidences are same as original, it means user didn't select new files via input for evidences.
        // So, we rely on currentFormEvidencias (which would be original names). This is already correct.

        // Similar logic for anexos if needed, but file input onChange handles replacement.
      }


      const result = await onSubmit(dataToSend, ticket?.id);
      if (result.success) {
        toast({
          title: formMode === 'create' ? "Ticket Criado" : "Ticket Atualizado",
          description: `Ticket ${result.ticket?.numeroTicket || result.ticket?.id} foi ${formMode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
          variant: 'default',
        });
        // onCancel(); // Parent should handle closing
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

  const isLoadingOptions = priorityOptions.length === 0 || typeOptions.length === 0 || statusOptions.length === 0 || environmentOptions.length === 0 || originOptions.length === 0;

  // Get current filenames from form state (these are original filenames)
  const currentFormEvidenciasFilenames = watch('evidencias');
  const currentFormAnexosFilenames = watch('anexos');


  const renderFilesList = (
    filesToDisplay: TicketEvidencia[] | TicketAnexo[], // These are full objects from existing ticket
    selectedFilenames: string[] | null | undefined, // These are original filenames from file input
    fieldType: 'evidencias' | 'anexos'
  ) => {
    const label = fieldType === 'evidencias' ? 'Evidências' : 'Anexos';
    let displayItems: { nome: string, nomeObjeto?: string }[] = [];

    // If new files are selected via input, those take precedence for display.
    // Otherwise, show existing files from the ticket.
    if (selectedFilenames && selectedFilenames.length > 0 && 
        (fieldType === 'evidencias' ? existingEvidencias.length === 0 : existingAnexos.length === 0) ) {
       // This condition means: new files were selected, AND we cleared the 'existingXxx' state
       // because the file input was interacted with.
      displayItems = selectedFilenames.map(name => ({ nome: name }));
    } else if (filesToDisplay.length > 0) {
      displayItems = filesToDisplay.map(file => ({ nome: file.nome, nomeObjeto: file.nomeObjeto }));
    } else if (selectedFilenames && selectedFilenames.length > 0) {
      // Fallback if filesToDisplay is empty but selectedFilenames has items (e.g. create mode)
      displayItems = selectedFilenames.map(name => ({ nome: name }));
    }


    if (displayItems.length === 0) return null;

    return (
      <div className="mt-2 space-y-1 text-sm">
        <p className="font-medium text-muted-foreground">
          {filesToDisplay.length > 0 && selectedFilenames?.length === 0 ? `Arquivos de ${label.toLowerCase()} existentes:` : `Arquivos de ${label.toLowerCase()} selecionados:`}
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {displayItems.map((item, index) => (
            <li key={`${fieldType}-${index}-${item.nome}`} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
              <span className="truncate flex items-center" title={item.nome}>
                <FileText className="h-4 w-4 mr-2 shrink-0" />
                {item.nome}
              </span>
              {item.nomeObjeto && formMode === 'edit' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    toast({ title: "Simulando Download...", description: `Preparando para baixar "${item.nome}" (${item.nomeObjeto})`});
                    const result = await simulateDownloadFromBucket(item.nomeObjeto);
                    toast({ title: result.success ? "Download Simulado" : "Falha na Simulação", description: result.message});
                  }}
                  className="ml-2 text-primary hover:text-primary/80"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {formMode === 'create' ? 'Criar Novo Ticket de Suporte' : `Editar Ticket ${ticket?.numeroTicket || ticket?.id || ''}`}
          </CardTitle>
          {formMode === 'create' && <CardDescription>Preencha os detalhes abaixo para submeter um novo ticket de suporte.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {formMode === 'edit' && ticket && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm p-4 border rounded-md bg-muted/50">
              <div><strong>Nº Ticket:</strong> {ticket.numeroTicket}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="priority">Prioridade <span className="text-destructive">*</span></Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending || priorityOptions.length === 0}>
                    <SelectTrigger id="priority" className="mt-1">
                      <SelectValue placeholder={priorityOptions.length === 0 ? "Carregando..." : "Selecione a prioridade"} />
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
                      <SelectValue placeholder={typeOptions.length === 0 ? "Carregando..." : "Selecione o tipo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(t => <SelectItem key={t.id} value={t.descricao}>{t.descricao}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
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
                      <SelectValue placeholder={originOptions.length === 0 ? "Carregando..." : "Selecione a origem"} />
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

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="w-full max-w-xs">
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
                {environmentOptions.length === 0 && <Label className="text-sm text-muted-foreground">Carregando...</Label>}
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
          </div>

          <div>
            <Label htmlFor="evidenciasFile">Evidências (Arquivos) <span className="text-destructive">*</span></Label>
            <Input
              id="evidenciasFile"
              type="file"
              multiple
              className="mt-1"
              onChange={(e) => handleFileChange(e, 'evidencias')}
              disabled={isPending}
            />
            {renderFilesList(existingEvidencias, currentFormEvidenciasFilenames, 'evidencias')}
            {errors.evidencias && <p className="text-sm text-destructive mt-1">{errors.evidencias.message}</p>}
          </div>

          <div>
            <Label htmlFor="anexosFile">Anexos (Arquivos)</Label>
            <Input
              id="anexosFile"
              type="file"
              multiple
              className="mt-1"
              onChange={(e) => handleFileChange(e, 'anexos')}
              disabled={isPending}
            />
             {renderFilesList(existingAnexos, currentFormAnexosFilenames, 'anexos')}
            {errors.anexos && <p className="text-sm text-destructive mt-1">{errors.anexos.message}</p>}
          </div>

          {formMode === 'edit' && (
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
                      <SelectValue placeholder={assigneeOptions.length === 0 ? "Carregando..." : "Selecione o responsável"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Não atribuído</SelectItem>
                      {assigneeOptions.map(a => <SelectItem key={a.id} value={a.email}>{a.nome} ({a.email})</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.responsavelEmail && <p className="text-sm text-destructive mt-1">{errors.responsavelEmail.message}</p>}
            </div>
          )}

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
                        <SelectValue placeholder={statusOptions.length === 0 ? "Carregando..." : "Selecione a situação"} />
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
          <Button type="submit" disabled={isPending || isLoadingOptions} className="font-headline">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingOptions && !isPending && formMode === 'create' ? 'Carregando opções...' : (formMode === 'create' ? 'Criar Ticket' : 'Salvar Alterações')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
