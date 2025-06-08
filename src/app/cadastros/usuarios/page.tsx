
'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, { useEffect, useState, useCallback } from 'react';
import type { Usuario, UsuarioFormData } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/components/auth/AppProviders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUsuarioColumns } from '@/components/usuarios/UsuarioColumns';
import { UsuarioDataTable } from '@/components/usuarios/UsuarioDataTable';
import { CreateUsuarioButton } from '@/components/usuarios/CreateUsuarioButton';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  
  const { toast } = useToast();
  const { getAuthHeaders } = useSession();

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usuarios', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const fetchedUsuarios: Usuario[] = await response.json();
      setUsuarios(fetchedUsuarios);
    } catch (error: any) {
      console.error("Falha ao buscar usuários:", error);
      toast({
        title: "Erro ao Buscar Usuários",
        description: error.message || 'Falha ao conectar com o servidor.',
        variant: "destructive",
      });
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsEditModalOpen(true);
  };

  const handleDeletePrompt = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
  };

  const confirmDeleteUsuario = async () => {
    if (!usuarioToDelete) return;
    try {
      const response = await fetch(`/api/usuarios/${usuarioToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Usuário Excluído",
        description: `O usuário ${usuarioToDelete.nome} foi excluído com sucesso.`,
      });
      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro ao Excluir Usuário",
        description: error.message || "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } finally {
      setUsuarioToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: UsuarioFormData, usuarioId?: string) => {
    const url = usuarioId ? `/api/usuarios/${usuarioId}` : '/api/usuarios';
    const method = usuarioId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = errorData.errors 
          ? Object.values(errorData.errors).flat().join('\\n') 
          : errorData.message;
        throw new Error(errorMessages || `HTTP error! status: ${response.status}`);
      }
      
      const savedUsuario: Usuario = await response.json();
      toast({
        title: usuarioId ? "Usuário Atualizado" : "Usuário Criado",
        description: `O usuário ${savedUsuario.nome} foi ${usuarioId ? 'atualizado' : 'criado'} com sucesso.`,
      });
      setIsEditModalOpen(false);
      setSelectedUsuario(null);
      fetchUsuarios();
      return { success: true, usuario: savedUsuario };
    } catch (error: any) {
      toast({
        title: `Erro ao ${usuarioId ? 'Atualizar' : 'Criar'} Usuário`,
        description: error.message || 'Falha ao conectar com o servidor.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };
  
  const columns = React.useMemo(() => getUsuarioColumns(handleEdit, handleDeletePrompt), []);

  if (isLoading && usuarios.length === 0) { 
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-foreground">Cadastro de Usuários</h1>
        <CreateUsuarioButton onUsuarioCreated={fetchUsuarios} />
      </div>
      <UsuarioDataTable columns={columns} data={usuarios} />

      {selectedUsuario && (
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) setSelectedUsuario(null);
        }}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
             <VisuallyHidden><DialogTitle>Editar Usuário</DialogTitle></VisuallyHidden>
            <UsuarioForm
              usuario={selectedUsuario}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedUsuario(null);
              }}
              formMode="edit"
            />
          </DialogContent>
        </Dialog>
      )}

      {usuarioToDelete && (
        <AlertDialog open={!!usuarioToDelete} onOpenChange={(isOpen) => !isOpen && setUsuarioToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário "{usuarioToDelete.nome}" ({usuarioToDelete.email})? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUsuarioToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUsuario} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
