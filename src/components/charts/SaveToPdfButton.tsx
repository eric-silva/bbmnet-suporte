
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
            size: A4 portrait;
            margin: 15mm; /* Margens da página: 15mm em todos os lados */
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
            width: 100%; /* Div que contém o card do gráfico */
            overflow: hidden; 
            display: flex;
            align-items: stretch; /* Alterado para stretch para o card preencher */
            justify-content: stretch; /* Alterado para stretch */
            box-sizing: border-box;
          }

          /* Estilos para o Card (que é o filho direto de #chart-to-print-area) */
          #chart-to-print-area > div { 
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            box-shadow: none !important;
            border: 0.5pt solid #999 !important; /* Borda fina para o card */
            margin: 0 !important;
            padding: 0 !important; 
            box-sizing: border-box !important;
            background-color: white !important; /* Garante fundo branco para o card */
          }

          /* Estilos para CardHeader, CardContent, CardFooter dentro do Card impresso */
          #chart-to-print-area > div > div:nth-child(1), /* CardHeader */
          #chart-to-print-area > div > div:nth-child(3)  /* CardFooter */ {
            padding: 5mm !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            background-color: white !important;
          }
          #chart-to-print-area > div > div:nth-child(1) { /* CardHeader */
             border-bottom: 0.5pt solid #eee;
          }
           #chart-to-print-area > div > div:nth-child(3) { /* CardFooter */
             border-top: 0.5pt solid #eee;
             font-size: 8pt !important;
             flex-direction: column !important;
             align-items: center !important;
             text-align: center;
          }


          #chart-to-print-area > div > div:nth-child(2) /* CardContent */ {
            padding: 5mm !important; 
            flex-grow: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            background-color: white !important;
          }

          #chart-to-print-area > div > div:nth-child(1) > [class*="card-title"],
          #chart-to-print-area > div > div:nth-child(1) > [class*="card-description"] {
            text-align: center !important;
            font-size: 10pt !important;
            color: black !important;
          }
          #chart-to-print-area > div > div:nth-child(1) > [class*="card-title"] {
            font-size: 12pt !important;
            font-weight: bold;
            margin-bottom: 2mm !important;
          }
         

          #chart-to-print-area .recharts-responsive-container,
          #chart-to-print-area svg.recharts-surface {
            max-width: 100%;
            max-height: 100%;
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
          }

          .print-footer-info {
            width: 100%;
            text-align: center;
            font-size: 9pt;
            font-family: Arial, sans-serif;
            color: #333;
            border-top: 0.5pt solid #999;
            padding-top: 5mm;
            margin-top: 5mm; 
            flex-shrink: 0;
            box-sizing: border-box;
            visibility: visible !important;
          }
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
        // Criamos um div limpo para o card, em vez de copiar o innerHTML diretamente de um div que pode ter outros estilos/filhos
        const chartCardClone = chartArea.querySelector('div[class*="card"]'); // Tentamos pegar o card original
        if(chartCardClone) {
            printPreview.document.write('<div id="chart-to-print-area">');
            printPreview.document.write(chartCardClone.outerHTML); // Copiamos o HTML do card
            printPreview.document.write('</div>');
        } else {
            // Fallback se não encontrar o card específico, copia o chartArea como antes
            printPreview.document.write('<div id="chart-to-print-area">');
            printPreview.document.write(chartArea.innerHTML);
            printPreview.document.write('</div>');
        }

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
