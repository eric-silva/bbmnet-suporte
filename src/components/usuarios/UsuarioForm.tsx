
'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Usuario, UsuarioFormData } from '@/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const usuarioFormSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  fotoUrl: z.string().url('URL da foto inválida.').optional().nullable().or(z.literal('')),
  isAtivo: z.boolean().default(true).optional(),
});

// To ensure the form data matches what the API expects, especially for optional fields
type FormValues = z.infer<typeof usuarioFormSchema>;


interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSubmit: (data: UsuarioFormData, usuarioId?: string) => Promise<{ success: boolean; error?: any; usuario?: Usuario }>;
  onCancel: () => void;
  formMode: 'create' | 'edit';
}

export function UsuarioForm({ usuario, onSubmit, onCancel, formMode }: UsuarioFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      fotoUrl: '',
      isAtivo: true,
    },
  });

  useEffect(() => {
    if (formMode === 'edit' && usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        fotoUrl: usuario.fotoUrl || '',
        isAtivo: usuario.isAtivo,
      });
    } else if (formMode === 'create') {
      reset({
        nome: '',
        email: '',
        fotoUrl: '',
        isAtivo: true, // Default for new users
      });
    }
  }, [usuario, formMode, reset]);

  const handleFormSubmit = (data: FormValues) => {
    startTransition(async () => {
      // Ensure isAtivo is explicitly sent, even if undefined from form (though schema defaults it)
      const dataToSend: UsuarioFormData = {
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl || null, // API expects null for empty optional URL
        isAtivo: data.isAtivo,
      };
      if (formMode === 'create') {
         dataToSend.isAtivo = true; // Ensure active on creation if not specified
      }


      const result = await onSubmit(dataToSend, usuario?.id);
      // Toast notifications are handled by the parent page (UsuariosPage)
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {formMode === 'create' ? 'Criar Novo Usuário' : `Editar Usuário: ${usuario?.nome || ''}`}
          </CardTitle>
          <CardDescription>
            {formMode === 'create' ? 'Preencha os detalhes abaixo para adicionar um novo usuário.' : 'Atualize os dados do usuário.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label>
            <Input
              id="nome"
              {...register('nome')}
              className="mt-1"
              placeholder="Nome completo do usuário"
              disabled={isPending}
            />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1"
              placeholder="exemplo@dominio.com"
              disabled={isPending}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="fotoUrl">URL da Foto</Label>
            <Input
              id="fotoUrl"
              type="url"
              {...register('fotoUrl')}
              className="mt-1"
              placeholder="https://exemplo.com/foto.jpg (opcional)"
              disabled={isPending}
            />
            {errors.fotoUrl && <p className="text-sm text-destructive mt-1">{errors.fotoUrl.message}</p>}
          </div>

          {formMode === 'edit' && (
            <div className="flex items-center space-x-2 mt-2">
               <Controller
                name="isAtivo"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="isAtivo"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                        aria-labelledby="isAtivo-label"
                    />
                )}
                />
              <Label htmlFor="isAtivo" id="isAtivo-label">
                Usuário Ativo
              </Label>
            </div>
          )}
           {errors.isAtivo && <p className="text-sm text-destructive mt-1">{errors.isAtivo.message}</p>}


        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="font-headline">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formMode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
