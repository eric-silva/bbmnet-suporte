
'use client';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SaveToPdfButtonProps {
  isChartReady: boolean;
}

export function SaveToPdfButton({ isChartReady }: SaveToPdfButtonProps) {
  const { toast } = useToast();
  
  const handleSave = () => {
    if (!isChartReady) {
      toast({
        title: "Nenhum gráfico carregado",
        description: "Por favor, selecione e carregue um gráfico antes de salvar.",
        variant: "default", // Or "destructive" if you prefer
      });
      return;
    }

    const printPreview = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    
    if (printPreview) {
      const chartArea = document.getElementById('chart-to-print-area');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            console.warn('Cannot access stylesheet rules:', e);
            return '';
          }
        })
        .filter(css => css)
        .join('\n');

      printPreview.document.write('<html><head><title>Imprimir Gráfico</title>');
      printPreview.document.write('<style>');
      printPreview.document.write(styles);
      printPreview.document.write(`
        @media print {
          body { margin: 20px; }
          #chart-to-print-area { width: 100%; height: auto; }
          .charts-page-controls-print-hide, 
          .app-header-print-hide, 
          .app-footer-print-hide,
          .no-print { display: none !important; }
        }
      `);
      printPreview.document.write('</style></head><body>');
      if (chartArea) {
        printPreview.document.write(chartArea.innerHTML);
      } else {
        printPreview.document.write('<p>Erro: Área do gráfico não encontrada.</p>');
      }
      printPreview.document.write('</body></html>');
      printPreview.document.close(); 
      printPreview.focus(); 
      
      setTimeout(() => {
        printPreview.print();
      }, 500);

    } else {
       toast({
        title: "Falha ao Abrir Pré-visualização",
        description: "O seu navegador pode ter bloqueado a janela de pré-visualização. Verifique as configurações de pop-up.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleSave} 
      variant="outline" 
      className="font-headline"
      disabled={!isChartReady}
    >
      <FileDown className="mr-2 h-4 w-4" /> 
      Salvar em PDF
    </Button>
  );
}
