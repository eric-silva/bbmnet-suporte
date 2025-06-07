
import type { Assignee } from '@/types';

// Domínios permitidos para e-mails de responsáveis (não mais usado para login).
export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"];

// Lista de usuários que podem ser atribuídos como responsáveis.
export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland (Pitang)" },
  { email: "bob@novobbmnet.com.br", name: "Bob Construtor (NovoBBMNet)" },
  { email: "charlie@pitang.com", name: "Charlie Brown (Pitang)" },
  { email: "david@example.com", name: "David Copperfield (Exemplo)" },
  { email: "eva@example.com", name: "Eva Green (Exemplo)" },
];

// Usuário mock - não mais usado para simular o login do usuário atual,
// mas ainda pode ser usado em `actions/tickets.ts` como fallback ou para solicitantes padrão.
export const MOCK_USER = {
  name: "Usuário Mock Padrão",
  email: "mock.user@example.com", 
  image: "https://placehold.co/100x100.png", // Não usado ativamente no UserNav com MSAL por padrão
};
