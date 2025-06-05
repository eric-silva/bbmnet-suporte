import type { Ticket } from '@/types';
import { MOCK_USER, PERMITTED_ASSIGNEES } from './constants';

// In-memory store for tickets
let tickets: Ticket[] = [
  {
    id: 'TKT-001',
    problemDescription: 'Login button not working on Safari browser. Users are unable to access their accounts.',
    priority: 'High',
    type: 'Bug',
    solicitanteEmail: MOCK_USER.email,
    solicitanteName: MOCK_USER.name,
    responsavelEmail: PERMITTED_ASSIGNEES[0]?.email || null,
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-002',
    problemDescription: 'Need an export to CSV feature for the user report. This will help in monthly analysis.',
    priority: 'Medium',
    type: 'Feature Request',
    solicitanteEmail: 'another@example.com',
    solicitanteName: 'Another User',
    responsavelEmail: PERMITTED_ASSIGNEES[1]?.email || null,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'TKT-003',
    problemDescription: 'How do I reset my password? I cannot find the option in the settings page.',
    priority: 'Low',
    type: 'Question',
    solicitanteEmail: MOCK_USER.email,
    solicitanteName: MOCK_USER.name,
    responsavelEmail: PERMITTED_ASSIGNEES[2]?.email || null,
    status: 'Resolved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    resolutionDetails: 'Provided instructions to reset password via email link.',
  },
];

export const getTicketsStore = (): Ticket[] => tickets;

export const addTicketToStore = (ticket: Ticket): void => {
  tickets.unshift(ticket); // Add to the beginning of the array
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

// Helper to generate unique IDs for new tickets
export const generateTicketId = (): string => {
  const latestTicket = tickets.length > 0 ? tickets[0] : null;
  let newIdNumber = 1;
  if (latestTicket && latestTicket.id.startsWith('TKT-')) {
    const lastIdNumber = parseInt(latestTicket.id.split('-')[1] || '0', 10);
    newIdNumber = lastIdNumber + 1;
  }
  return `TKT-${String(newIdNumber).padStart(3, '0')}`;
};
