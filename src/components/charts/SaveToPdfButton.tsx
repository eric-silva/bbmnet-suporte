
'use client';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function SaveToPdfButton() {
  const { toast } = useToast();
  
  const handleSave = () => {
    // Basic print functionality, relies on browser's "Save as PDF"
    // For a more robust solution, libraries like html2canvas and jspdf would be needed.
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
      // Add specific print styles to ensure only the chart is prominent
      printPreview.document.write(`
        @media print {
          body { margin: 20px; }
          #chart-to-print-area { width: 100%; height: auto; }
          .charts-page-controls-print-hide, 
          .app-header-print-hide, 
          .app-footer-print-hide { display: none !important; }
        }
      `);
      printPreview.document.write('</style></head><body>');
      if (chartArea) {
        printPreview.document.write(chartArea.innerHTML);
      } else {
        printPreview.document.write('<p>Erro: Área do gráfico não encontrada.</p>');
      }
      printPreview.document.write('</body></html>');
      printPreview.document.close(); // Necessary for IE >= 10
      printPreview.focus(); // Necessary for IE >= 10
      
      // Delay print to allow content to render in the new window
      setTimeout(() => {
        printPreview.print();
        // Optionally close the window after printing, but some browsers block this.
        // printPreview.close(); 
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
    <Button onClick={handleSave} variant="outline" className="font-headline">
      <FileDown className="mr-2 h-4 w-4" /> 
      Salvar em PDF
    </Button>
  );
}

    