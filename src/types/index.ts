
// Base entity interface
export interface BaseEntity {
  id: string;
  descricao: string;
}

// Specific entity interfaces extending BaseEntity
export interface Prioridade extends BaseEntity {}
export interface Tipo extends BaseEntity {}
export interface Situacao extends BaseEntity {}
export interface Ambiente extends BaseEntity {}
export interface Origem extends BaseEntity {}

// These hardcoded arrays are no longer the source of truth for validation.
// The backend will validate descriptions against the database.
// They can be removed or kept for client-side suggestions if needed,
// but for now, we'll remove them to emphasize dynamic fetching.

export interface Usuario {
  id: string;
  nome: string;
  email: string; // Deve ser único
  hashedPassword?: string | null; // Armazenar hash da senha
  fotoUrl?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Ticket {
  id: string;
  problemDescription: string;
  
  prioridadeId: string;
  prioridade: Prioridade; // Relation to Prioridade model

  tipoId: string;
  tipo: Tipo; // Relation to Tipo model

  ambienteId: string;
  ambiente: Ambiente; // Relation to Ambiente model

  origemId: string;
  origem: Origem; // Relation to Origem model

  solicitanteId: string;
  solicitante: Usuario; // Relation to Usuario model for solicitante

  responsavelId?: string | null;
  responsavel?: Usuario | null; // Relation to Usuario model for responsavel

  evidencias: string;
  anexos?: string | null;
  inicioAtendimento?: string | null; // ISO date string
  terminoAtendimento?: string | null; // ISO date string
  resolutionDetails?: string | null;

  situacaoId: string;
  situacao: Situacao; // Relation to Situacao model

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// For forms and general use where only name/email is needed for an assignee for dropdowns
// export interface Assignee {
//   email: string;
//   name: string;
// }

// For TicketForm Zod schema and API communication
// This interface represents the data structure expected by the form and its Zod schema.
// The Zod schema itself is defined in TicketForm.tsx.
export interface TicketFormData {
  problemDescription: string;
  priority: string; // This will be the 'descricao' of Prioridade
  type: string;     // This will be the 'descricao' of Tipo
  responsavelEmail?: string | null;
  status?: string;   // This will be the 'descricao' of Situacao (optional for create)
  resolutionDetails?: string | null;
  evidencias: string;
  anexos?: string | null;
  ambiente: string; // This will be the 'descricao' of Ambiente
  origem: string;   // This will be the 'descricao' of Origem
}
