
'use client';

import React, { useEffect, useTransition, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Usuario, UsuarioFormData } from '@/types';
import { Loader2, UploadCloud, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const baseUsuarioFormSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  fotoUrl: z.string().optional().nullable().or(z.literal('')), // Changed from .url() to allow Data URIs
  isAtivo: z.boolean().default(true).optional(),
});

const createUsuarioFormSchema = baseUsuarioFormSchema.extend({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  confirmPassword: z.string().min(6, 'Confirme a senha.'),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof createUsuarioFormSchema>;

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSubmit: (data: UsuarioFormData, usuarioId?: string) => Promise<{ success: boolean; error?: any; usuario?: Usuario }>;
  onCancel: () => void;
  formMode: 'create' | 'edit';
}

export function UsuarioForm({ usuario, onSubmit, onCancel, formMode }: UsuarioFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const currentFormSchema = formMode === 'create' ? createUsuarioFormSchema : baseUsuarioFormSchema;

  const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
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
        password: '',
        confirmPassword: '',
      });
      setImagePreview(usuario.fotoUrl || null);
      setFileName(null);
    } else if (formMode === 'create') {
      reset({
        nome: '',
        email: '',
        password: '',
        confirmPassword: '',
        fotoUrl: '',
        isAtivo: true,
      });
      setImagePreview(null);
      setFileName(null);
    }
  }, [usuario, formMode, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Arquivo Muito Grande",
          description: "Por favor, selecione uma imagem menor que 2MB.",
          variant: "destructive",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue('fotoUrl', result, { shouldValidate: true });
        setFileName(file.name);
      };
      reader.onerror = () => {
        toast({
          title: "Erro ao Ler Arquivo",
          description: "Não foi possível ler o arquivo de imagem.",
          variant: "destructive",
        });
      }
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user clears selection), reset to existing or null
      const existingFotoUrl = formMode === 'edit' && usuario?.fotoUrl ? usuario.fotoUrl : null;
      setImagePreview(existingFotoUrl);
      setValue('fotoUrl', existingFotoUrl || '', { shouldValidate: true });
      setFileName(null);
    }
  };

  const handleFormSubmit = (data: FormValues) => {
    startTransition(async () => {
      const dataToSend: UsuarioFormData = {
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl, // This will be the Base64 string from setValue or existing URL
        isAtivo: data.isAtivo,
      };
      if (formMode === 'create') {
         dataToSend.isAtivo = true;
         dataToSend.password = data.password;
      }

      await onSubmit(dataToSend, usuario?.id);
    });
  };

  const currentImageSrc = imagePreview || (formMode === 'edit' && usuario?.fotoUrl) || null;


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
          <div className="flex flex-col items-center space-y-3">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-muted flex items-center justify-center bg-muted">
              {currentImageSrc ? (
                <Image src={currentImageSrc} alt="Foto do usuário" layout="fill" objectFit="cover" />
              ) : (
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <div className="w-full max-w-xs">
              <Label htmlFor="fotoFile" className="sr-only">Carregar foto</Label>
              <Input
                id="fotoFile"
                type="file"
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageChange}
                className="mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending}
              />
              {fileName && <p className="text-xs text-muted-foreground mt-1 text-center truncate">{fileName}</p>}
              <Input type="hidden" {...register('fotoUrl')} />
               {errors.fotoUrl && <p className="text-sm text-destructive mt-1">{errors.fotoUrl.message}</p>}
            </div>
          </div>


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

          {formMode === 'create' && (
            <>
              <div>
                <Label htmlFor="password">Senha <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="mt-1"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isPending}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="mt-1"
                  placeholder="Repita a senha"
                  disabled={isPending}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}

          {formMode === 'edit' && (
            <div className="flex items-center space-x-2 mt-2">
               <Controller
                name="isAtivo"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="isAtivo"
                        checked={field.value === undefined ? true : field.value}
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
