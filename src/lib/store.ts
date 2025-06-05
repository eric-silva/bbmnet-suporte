
import type { Ticket } from '@/types';
import { MOCK_USER, PERMITTED_ASSIGNEES } from './constants';

// Repositório em memória para tickets
let tickets: Ticket[] = [
  {
    id: 'TKT-001',
    problemDescription: 'Botão de login não funciona no navegador Safari. Usuários não conseguem acessar suas contas.',
    priority: 'Crítico',
    type: 'Bug',
    solicitanteEmail: MOCK_USER.email,
    solicitanteName: MOCK_USER.name,
    responsavelEmail: PERMITTED_ASSIGNEES[0]?.email || null,
    status: 'Para fazer',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    evidencias: "Captura de tela do erro no Safari anexa via link: http://example.com/safari-bug.png",
    ambiente: "Produção",
    origem: "Sala de Negociação",
    inicioAtendimento: null,
    terminoAtendimento: null,
  },
  {
    id: 'TKT-002',
    problemDescription: 'Necessidade de funcionalidade para exportar para CSV o relatório de usuários. Isso ajudará na análise mensal.',
    priority: 'Alto',
    type: 'Melhoria',
    solicitanteEmail: 'outro@example.com',
    solicitanteName: 'Outro Usuário',
    responsavelEmail: PERMITTED_ASSIGNEES[1]?.email || null,
    status: 'Em Andamento',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    inicioAtendimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    terminoAtendimento: null,
    evidencias: "Documento de requisitos: http://example.com/export-csv-req.pdf",
    ambiente: "Homologação",
    origem: "Licitações",
  },
  {
    id: 'TKT-003',
    problemDescription: 'Como faço para redefinir minha senha? Não consigo encontrar a opção na página de configurações.',
    priority: 'Normal',
    type: 'Apoio Técnico',
    solicitanteEmail: MOCK_USER.email,
    solicitanteName: MOCK_USER.name,
    responsavelEmail: PERMITTED_ASSIGNEES[2]?.email || null,
    status: 'Finalizado',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    resolutionDetails: 'Instruções fornecidas para redefinir a senha através do link de e-mail.',
    evidencias: "Usuário relatou dificuldade em encontrar a opção.",
    ambiente: "Produção",
    origem: "Cadastramento",
    inicioAtendimento: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    terminoAtendimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getTicketsStore = (): Ticket[] => tickets;

export const addTicketToStore = (ticket: Ticket): void => {
  tickets.unshift(ticket); 
};

export const updateTicketInStore = (updatedTicket: Ticket): boolean => {
  const index = tickets.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updatedTicket };
    return true;
  }
  return false;
};

export const findTicketById = (id: string): Ticket | undefined => {
  return tickets.find(t => t.id === id);
};

export const generateTicketId = (): string => {
  // Encontra o maior número de ID existente para evitar colisões se a lista for reordenada.
  let maxIdNumber = 0;
  tickets.forEach(ticket => {
    if (ticket.id.startsWith('TKT-')) {
      const idNumber = parseInt(ticket.id.split('-')[1] || '0', 10);
      if (idNumber > maxIdNumber) {
        maxIdNumber = idNumber;
      }
    }
  });
  const newIdNumber = maxIdNumber + 1;
  return `TKT-${String(newIdNumber).padStart(3, '0')}`;
};
