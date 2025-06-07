
import type { Assignee } from '@/types';

// Domínios permitidos (não usado ativamente no mock atual, mas pode ser útil no futuro)
export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"];

// Lista de usuários que podem ser atribuídos como responsáveis.
// Em um sistema real com Prisma, isso viria da tabela de Usuários.
// Por enquanto, mantemos como constante para popular o dropdown e resolver nomes.
export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland (Pitang)" },
  { email: "bob@novobbmnet.com.br", name: "Bob Construtor (NovoBBMNet)" },
  { email: "charlie@pitang.com", name: "Charlie Brown (Pitang)" },
  { email: "david@example.com", name: "David Copperfield (Exemplo)" },
  { email: "eva@example.com", name: "Eva Green (Exemplo)" },
];

// Credenciais mockadas para o sistema de login customizado
export const MOCK_CUSTOM_USER_CREDENTIALS = {
  email: "user@example.com",
  password: "password123",
};

// Dados do usuário mockado para a sessão após login customizado
export const MOCK_CUSTOM_USER_SESSION_DATA = {
  name: "Usuário Exemplo",
  email: MOCK_CUSTOM_USER_CREDENTIALS.email,
  id: "mock-user-id-123", // Este ID não é salvo no DB Prisma User model atualmente
};

// Usuário mock para criação de tickets (servidor) caso o solicitante não seja identificado pelo header.
// O ideal é que o solicitante SEMPRE venha do usuário autenticado via middleware.
export const FALLBACK_MOCK_USER = {
  name: "Usuário Sistema",
  email: "system@example.com",
};
