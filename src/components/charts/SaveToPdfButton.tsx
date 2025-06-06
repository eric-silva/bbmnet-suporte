
'use client';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function SaveToPdfButton() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Funcionalidade Indisponível",
      description: "A opção de salvar gráficos em PDF ainda não foi implementada.",
      variant: "default", // ou "info" se tiver um variant para isso
      duration: 3000,
    });
  };

  return (
    <Button onClick={handleSave} variant="outline" className="font-headline">
      <FileDown className="mr-2 h-4 w-4" /> 
      Salvar em PDF
    </Button>
  );
}
