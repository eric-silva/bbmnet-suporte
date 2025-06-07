
'use client';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/components/auth/AppProviders';

interface SaveToPdfButtonProps {
  isChartReady: boolean;
}

export function SaveToPdfButton({ isChartReady }: SaveToPdfButtonProps) {
  const { toast } = useToast();
  const { session } = useSession();
  
  const handleSave = () => {
    if (!isChartReady) {
      toast({
        title: "Nenhum gráfico carregado",
        description: "Por favor, selecione e carregue um gráfico antes de salvar.",
        variant: "default",
      });
      return;
    }

    const printPreview = window.open('', 'PRINT', 'height=800,width=1100,top=50,left=50');
    
    if (printPreview) {
      const chartArea = document.getElementById('chart-to-print-area');
      const existingStyles = Array.from(document.styleSheets)
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

      const now = new Date();
      const formattedDateTime = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
      const userName = session.user?.name || 'Usuário Desconhecido';
      const systemName = 'BBMNET Suporte';
      const footerText = `Gerado em ${formattedDateTime} por ${userName} no sistema ${systemName}.`;

      printPreview.document.write('<html><head><title>Imprimir Gráfico</title>');
      printPreview.document.write('<style>');
      printPreview.document.write(existingStyles); // Apply existing styles first
      // Specific print styles for the preview window
      printPreview.document.write(`
        @media print {
          @page {
            size: A4 portrait; /* Or 'letter portrait', or 'auto' */
            margin: 15mm; /* Adjust margins as needed */
          }
          html, body {
            height: 100%; 
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; 
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            color: black !important;
          }
          #chart-to-print-area-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%; /* Fill the page within margins */
            box-sizing: border-box;
          }
          #chart-to-print-area {
            flex-grow: 1; 
            width: 100%;
            overflow: hidden; 
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }
          #chart-to-print-area .recharts-responsive-container,
          #chart-to-print-area svg.recharts-surface {
            max-width: 100%;
            max-height: 100%; /* Ensure chart fits in its flex container */
            width: 100% !important; /* Override inline styles if any */
            height: 100% !important; /* Override inline styles if any */
          }
          .print-footer-info {
            width: 100%;
            text-align: center;
            font-size: 9pt; /* Use points for print font size */
            font-family: Arial, sans-serif;
            color: #333;
            border-top: 0.5pt solid #999; /* Use points for border width */
            padding-top: 5mm;
            margin-top: 5mm; 
            flex-shrink: 0;
            box-sizing: border-box;
            visibility: visible !important;
          }
          /* Ensure these are hidden in the print preview */
          .charts-page-controls-print-hide, 
          .app-header-print-hide, 
          .app-footer-print-hide,
          .no-print { 
            display: none !important; 
            visibility: hidden !important;
          }
        }
      `);
      printPreview.document.write('</style></head><body>');
      
      printPreview.document.write('<div id="chart-to-print-area-wrapper">');
      if (chartArea) {
        printPreview.document.write('<div id="chart-to-print-area">');
        printPreview.document.write(chartArea.innerHTML);
        printPreview.document.write('</div>');
      } else {
        printPreview.document.write('<p>Erro: Área do gráfico não encontrada.</p>');
      }
      printPreview.document.write(`<div class="print-footer-info">${footerText}</div>`);
      printPreview.document.write('</div>'); // Close chart-to-print-area-wrapper
      
      printPreview.document.write('</body></html>');
      printPreview.document.close(); 
      printPreview.focus(); 
      
      setTimeout(() => {
        try {
          printPreview.print();
        } catch (e) {
          console.error("Erro durante a tentativa de impressão:", e);
          toast({
            title: "Erro ao Imprimir",
            description: "Não foi possível iniciar a impressão. Verifique o console do navegador para mais detalhes.",
            variant: "destructive",
          });
        }
      }, 750);

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
