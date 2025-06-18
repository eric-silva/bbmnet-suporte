
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

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  hashedPassword?: string | null;
  fotoUrl?: string | null;
  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketEvidencia {
  id: string;
  nome: string;
  nomeObjeto: string;
  tipo: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAnexo {
  id: string;
  nome: string;
  nomeObjeto: string;
  tipo: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  numeroTicket: string;
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

  // evidencias: string; // Replaced by ticketEvidencias
  // anexos?: string | null; // Replaced by ticketAnexos
  ticketEvidencias: TicketEvidencia[];
  ticketAnexos: TicketAnexo[];

  inicioAtendimento?: string | null;
  terminoAtendimento?: string | null;
  resolutionDetails?: string | null;

  situacaoId: string;
  situacao: Situacao;

  createdAt: string;
  updatedAt: string;
}

// For TicketForm Zod schema and API communication
// evidencias and anexos here will be arrays of *original filenames* from the form.
export interface TicketFormData {
  problemDescription: string;
  priority: string;
  type: string;
  responsavelEmail?: string | null;
  status?: string;
  resolutionDetails?: string | null;
  evidencias: string[]; // Array of original filenames
  anexos?: string[] | null; // Array of original filenames
  ambiente: string;
  origem: string;
}

// For UsuarioForm Zod schema and API communication
export interface UsuarioFormData {
  nome: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  fotoUrl?: string | null; // Can be Base64 Data URI or null
  isAtivo?: boolean;
}


// For Menu
export interface MenuItem {
  id: string;
  titulo: string;
  nomeIcone: string;
  menuPrincipalId: string | null;
  isAtivo: boolean;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StructuredMenuItem extends MenuItem {
  subMenus: MenuItem[];
}
