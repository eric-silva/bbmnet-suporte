
// src/lib/store.ts
// Este arquivo está obsoleto e será substituído pelo uso do Prisma ORM.
// O repositório em memória para tickets não é mais necessário.
// As operações de dados (get, add, update, find, generateId)
// serão tratadas pelos API routes usando o Prisma Client.

// export {}; // Mantém o arquivo como um módulo se todo o conteúdo for removido.

// Comentando o conteúdo antigo para referência, mas não deve ser usado.
/*
import type { Ticket } from '@/types';
import { MOCK_USER, PERMITTED_ASSIGNEES } from './constants';

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
  // ... outros tickets mockados ...
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
*/

console.warn("src/lib/store.ts is deprecated and should be removed. Data is now managed by Prisma.");

export {};
