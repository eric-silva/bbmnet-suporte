'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Ticket, Priority, TicketStatus, TicketType, Assignee } from '@/types';
import { priorities, ticketStatuses, ticketTypes } from '@/types';
import { getPermittedAssignees } from '@/app/actions/tickets';
import { AiAssigneeSuggestion } from './AiAssigneeSuggestion';
import { useSession } from '@/components/auth/AppProviders';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ticketFormSchema = z.object({
  problemDescription: z.string().min(10, 'Problem description must be at least 10 characters.'),
  priority: z.enum(priorities),
  type: z.enum(ticketTypes),
  responsavelEmail: z.string().email({ message: "Invalid email address." }).nullable().or(z.literal('')),
  status: z.enum(ticketStatuses).optional(), // Optional for create, required for edit
  resolutionDetails: z.string().optional(),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  ticket?: Ticket | null;
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: any; ticket?: Ticket }>;
  onCancel: () => void;
  formMode: 'create' | 'edit';
}

export function TicketForm({ ticket, onSubmit, onCancel, formMode }: TicketFormProps) {
  const { session } = useSession();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      problemDescription: ticket?.problemDescription || '',
      priority: ticket?.priority || 'Medium',
      type: ticket?.type || 'Bug',
      responsavelEmail: ticket?.responsavelEmail || '',
      status: ticket?.status || 'Open',
      resolutionDetails: ticket?.resolutionDetails || '',
    },
  });

  const problemDescriptionValue = watch('problemDescription');

  useEffect(() => {
    async function fetchAssignees() {
      const fetchedAssignees = await getPermittedAssignees();
      setAssignees(fetchedAssignees);
    }
    fetchAssignees();
  }, []);

  useEffect(() => {
    if (ticket) {
      reset({
        problemDescription: ticket.problemDescription,
        priority: ticket.priority,
        type: ticket.type,
        responsavelEmail: ticket.responsavelEmail || '',
        status: ticket.status,
        resolutionDetails: ticket.resolutionDetails || '',
      });
    } else {
      reset({
        problemDescription: '',
        priority: 'Medium',
        type: 'Bug',
        responsavelEmail: '',
        status: 'Open',
        resolutionDetails: '',
      });
    }
  }, [ticket, reset]);

  const handleFormSubmit = (data: TicketFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // For zod schema, empty string for email should be null
      if (data.responsavelEmail === '') {
        formData.set('responsavelEmail', ''); // Keep it empty for server to interpret as null
      }

      const result = await onSubmit(formData);
      if (result.success) {
        toast({
          title: formMode === 'create' ? "Ticket Created" : "Ticket Updated",
          description: `Ticket ${result.ticket?.id} has been successfully ${formMode === 'create' ? 'created' : 'updated'}.`,
          variant: 'default',
        });
      } else {
         const errorMessages = result.error ? 
          typeof result.error === 'string' ? result.error : 
          Object.values(result.error).flat().join(', ')
          : 'An unknown error occurred.';
        toast({
          title: "Error",
          description: `Failed to ${formMode === 'create' ? 'create' : 'update'} ticket: ${errorMessages}`,
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
            {formMode === 'create' ? 'Create New Support Ticket' : `Edit Ticket ${ticket?.id || ''}`}
          </CardTitle>
          {formMode === 'create' && <CardDescription>Fill in the details below to submit a new support ticket.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {formMode === 'edit' && ticket && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div><strong>Solicitante:</strong> {ticket.solicitanteName} ({ticket.solicitanteEmail})</div>
              <div><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
              <div><strong>Updated At:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          )}

          <div>
            <Label htmlFor="problemDescription">Problem Description</Label>
            <Textarea
              id="problemDescription"
              {...register('problemDescription')}
              className="mt-1 min-h-[120px]"
              placeholder="Describe the issue in detail..."
            />
            {errors.problemDescription && <p className="text-sm text-destructive mt-1">{errors.problemDescription.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="priority" className="mt-1">
                      <SelectValue placeholder="Select priority" />
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
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue placeholder="Select type" />
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
          
          <div>
            <Label htmlFor="responsavelEmail">Assignee (Responsável)</Label>
            <Controller
              name="responsavelEmail"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value === 'unassigned' ? '' : value)} value={field.value || 'unassigned'}>
                  <SelectTrigger id="responsavelEmail" className="mt-1">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map(a => <SelectItem key={a.email} value={a.email}>{a.name} ({a.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.responsavelEmail && <p className="text-sm text-destructive mt-1">{errors.responsavelEmail.message}</p>}
          </div>

          {problemDescriptionValue && problemDescriptionValue.length > 0 && (
             <AiAssigneeSuggestion
              problemDescription={problemDescriptionValue}
              currentAssignee={watch('responsavelEmail')}
              onSuggestionAccept={handleAiSuggestionAccept}
              disabled={isPending}
            />
          )}

          {formMode === 'edit' && (
            <>
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <SelectTrigger id="status" className="mt-1">
                        <SelectValue placeholder="Select status" />
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
                <Label htmlFor="resolutionDetails">Resolution Details</Label>
                <Textarea
                  id="resolutionDetails"
                  {...register('resolutionDetails')}
                  className="mt-1"
                  placeholder="Enter resolution details if applicable..."
                  disabled={isPending}
                />
                {errors.resolutionDetails && <p className="text-sm text-destructive mt-1">{errors.resolutionDetails.message}</p>}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="font-headline">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formMode === 'create' ? 'Create Ticket' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
