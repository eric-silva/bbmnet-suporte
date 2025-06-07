
import type { Assignee } from '@/types';

// Domínios permitidos (não usado ativamente no mock atual, mas pode ser útil no futuro)
export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"];

// Lista de usuários que podem ser atribuídos como responsáveis.
export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland (Pitang)" },
  { email: "bob@novobbmnet.com.br", name: "Bob Construtor (NovoBBMNet)" },
  { email: "charlie@pitang.com", name: "Charlie Brown (Pitang)" },
  { email: "david@example.com", name: "David Copperfield (Exemplo)" },
  { email: "eva@example.com", name: "Eva Green (Exemplo)" },
];

// Usuário mock para criação de tickets (servidor) e fallback.
export const MOCK_USER = {
  name: "Usuário Mock Padrão",
  email: "mock.user@example.com",
  image: "https://placehold.co/100x100.png",
};

// Credenciais mockadas para o sistema de login customizado
export const MOCK_CUSTOM_USER_CREDENTIALS = {
  email: "user@example.com",
  password: "password123",
};

// Dados do usuário mockado para a sessão após login customizado
export const MOCK_CUSTOM_USER_SESSION_DATA = {
  name: "Usuário Exemplo",
  email: MOCK_CUSTOM_USER_CREDENTIALS.email,
  id: "mock-user-id-123",
};
