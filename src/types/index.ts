
// Base entity type
export interface BaseEntity {
  id: string;
  descricao: string;
}

// Specific entity types based on BaseEntity
export type Prioridade = BaseEntity;
export type Tipo = BaseEntity;
export type Situacao = BaseEntity;
export type Ambiente = BaseEntity;
export type Origem = BaseEntity;

// Values for initial seeding/dropdowns - these should match what's in your DB after seeding
export const prioridadeValues: string[] = ["Baixo", "Normal", "Alto", "Crítico"];
export const tipoValues: string[] = ["Intervenção", "Bug", "Melhoria", "Backlog", "Apoio Técnico"];
export const situacaoValues: string[] = [
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
export const ambienteValues: string[] = ["Homologação", "Produção"];
export const origemValues: string[] = ["Sala de Negociação", "Licitações", "Cadastramento", "Integração", "Cadastro ADMIN"];


export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Ticket {
  id: string;
  problemDescription: string;
  
  prioridadeId: string;
  prioridade: Prioridade;

  tipoId: string;
  tipo: Tipo;

  ambienteId: string;
  ambiente: Ambiente;

  origemId: string;
  origem: Origem;

  solicitanteId: string;
  solicitante: Usuario;

  responsavelId?: string | null;
  responsavel?: Usuario | null;

  evidencias: string;
  anexos?: string | null;
  inicioAtendimento?: string | null; // ISO date string
  terminoAtendimento?: string | null; // ISO date string
  resolutionDetails?: string | null;

  situacaoId: string;
  situacao: Situacao;

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// For forms and general use where only name/email is needed for an assignee
export interface Assignee {
  email: string;
  name: string;
}
