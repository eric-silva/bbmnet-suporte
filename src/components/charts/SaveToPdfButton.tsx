
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
  const { session } = useSession(); // Obter a sessão do usuário
  
  const handleSave = () => {
    if (!isChartReady) {
      toast({
        title: "Nenhum gráfico carregado",
        description: "Por favor, selecione e carregue um gráfico antes de salvar.",
        variant: "default",
      });
      return;
    }

    const printPreview = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    
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

      // Criar conteúdo do rodapé
      const now = new Date();
      const formattedDateTime = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
      const userName = session.user?.name || 'Usuário Desconhecido';
      const systemName = 'BBMNET Suporte'; // Nome do sistema
      const footerText = `Gerado em ${formattedDateTime} por ${userName} no sistema ${systemName}.`;

      printPreview.document.write('<html><head><title>Imprimir Gráfico</title>');
      printPreview.document.write('<style>');
      printPreview.document.write(existingStyles);
      // Estilos específicos para a impressão, incluindo o rodapé
      printPreview.document.write(`
        @media print {
          body { 
            margin: 20px; 
            padding-bottom: 60px; /* Espaço para o rodapé */
            position: relative; 
            min-height: 98vh; /* Garante que o corpo seja alto o suficiente */
          }
          #chart-to-print-area { 
            width: 100%; 
            height: auto; /* Altura automática para o conteúdo */
            visibility: visible !important;
          }
          #chart-to-print-area * {
             visibility: visible !important; /* Garante que conteúdo interno seja visível */
          }
          /* Ocultar elementos não desejados na impressão */
          .charts-page-controls-print-hide, 
          .app-header-print-hide, 
          .app-footer-print-hide,
          .no-print { 
            display: none !important; 
            visibility: hidden !important;
          }
          /* Estilo do rodapé de impressão */
          .print-footer-info { 
            position: fixed; /* Posição fixa na parte inferior da viewport de impressão */
            bottom: 10px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            font-family: Arial, sans-serif; /* Fonte genérica para impressão */
            color: #555;
            border-top: 1px solid #bbb;
            padding-top: 8px;
            margin-top: 10px; /* Espaço acima do rodapé */
            visibility: visible !important; /* Garante que o rodapé seja visível */
            z-index: 1000; /* Garante que o rodapé esteja acima de outros elementos */
          }
        }
      `);
      printPreview.document.write('</style></head><body>');
      
      if (chartArea) {
        // Escreve o conteúdo da área do gráfico em uma div com o mesmo ID para manter estilos
        printPreview.document.write('<div id="chart-to-print-area">');
        printPreview.document.write(chartArea.innerHTML);
        printPreview.document.write('</div>');
      } else {
        printPreview.document.write('<p>Erro: Área do gráfico não encontrada.</p>');
      }

      // Escreve a div do rodapé
      printPreview.document.write(`<div class="print-footer-info">${footerText}</div>`);
      
      printPreview.document.write('</body></html>');
      printPreview.document.close(); 
      printPreview.focus(); 
      
      // Adiciona um pequeno atraso para garantir que o conteúdo e os estilos sejam renderizados
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
      }, 750); // Atraso pode ser ajustado se necessário

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
      disabled={!isChartReady} // Botão desabilitado se o gráfico não estiver pronto
    >
      <FileDown className="mr-2 h-4 w-4" /> 
      Salvar em PDF
    </Button>
  );
}
