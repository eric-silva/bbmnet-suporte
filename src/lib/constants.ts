
import type { Assignee } from '@/types';

// Domínios permitidos (não usado ativamente no mock atual, mas pode ser útil no futuro)
export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"];

// Lista de usuários que podem ser atribuídos como responsáveis no TicketForm.
// Esta lista é separada do mecanismo de login agora.
export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland (Pitang)" },
  { email: "bob@novobbmnet.com.br", name: "Bob Construtor (NovoBBMNet)" },
  { email: "charlie@pitang.com", name: "Charlie Brown (Pitang)" },
  { email: "david@example.com", name: "David Copperfield (Exemplo)" },
  { email: "eva@example.com", name: "Eva Green (Exemplo)" },
  // Adicione outros usuários conforme necessário para o dropdown de responsáveis
  // Se quiser que usuários criados via /cadastros/usuarios apareçam aqui,
  // o TicketForm precisaria buscar de /api/usuarios.
];


// Usuário mock para criação de tickets (servidor) caso o solicitante não seja identificado pelo header.
// O ideal é que o solicitante SEMPRE venha do usuário autenticado via middleware.
export const FALLBACK_MOCK_USER = {
  name: "Usuário Sistema",
  email: "system@example.com",
};

// MOCK_CUSTOM_USER_CREDENTIALS e MOCK_CUSTOM_USER_SESSION_DATA removidos
// pois o login agora usa /api/auth/mock-login que verifica a tabela Usuario.
