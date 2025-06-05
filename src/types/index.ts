
export type Priority = "Baixo" | "Normal" | "Alto" | "Crítico";
export const priorities: Priority[] = ["Baixo", "Normal", "Alto", "Crítico"];

export type TicketStatus = 
  | "Para fazer" 
  | "Em Análise" 
  | "Em Andamento" 
  | "Pendente de Teste" 
  | "Em Teste" 
  | "Finalizado" 
  | "Reaberto" 
  | "Aguardando BBM" 
  | "Abortado";
export const ticketStatuses: TicketStatus[] = [
  "Para fazer", 
  "Em Análise", 
  "Em Andamento", 
  "Pendente de Teste", 
  "Em Teste", 
  "Finalizado", 
  "Reaberto", 
  "Aguardando BBM", 
  "Abortado"
];

export type TicketType = "Intervenção" | "Bug" | "Melhoria" | "Backlog" | "Apoio Técnico";
export const ticketTypes: TicketType[] = ["Intervenção", "Bug", "Melhoria", "Backlog", "Apoio Técnico"];

export type Environment = "Homologação" | "Produção";
export const environments: Environment[] = ["Homologação", "Produção"];

export type Origin = "Sala de Negociação" | "Licitações" | "Cadastramento" | "Integração" | "Cadastro ADMIN";
export const origins: Origin[] = ["Sala de Negociação", "Licitações", "Cadastramento", "Integração", "Cadastro ADMIN"];

export interface Ticket {
  id: string;
  problemDescription: string;
  priority: Priority;
  type: TicketType;
  solicitanteEmail: string;
  solicitanteName: string;
  responsavelEmail: string | null; 
  status: TicketStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  inicioAtendimento?: string | null; // ISO date string
  terminoAtendimento?: string | null; // ISO date string
  evidencias: string; // Placeholder for file paths/links, mandatory
  anexos?: string; // Placeholder for file paths/links, optional
  ambiente: Environment;
  origem: Origin;
  resolutionDetails?: string;
}

export interface Assignee {
  email: string;
  name: string;
}
