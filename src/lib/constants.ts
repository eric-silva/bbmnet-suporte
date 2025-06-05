
import type { Assignee } from '@/types';

// Domínios permitidos para login (se aplicável) e para e-mails de responsáveis.
export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"];

// Lista de usuários que podem ser atribuídos como responsáveis.
// Certifique-se que os e-mails aqui usam os domínios @pitang.com ou @novobbmnet.com.br conforme solicitado.
export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland (Pitang)" },
  { email: "bob@novobbmnet.com.br", name: "Bob Construtor (NovoBBMNet)" },
  { email: "charlie@pitang.com", name: "Charlie Brown (Pitang)" },
  { email: "david@example.com", name: "David Copperfield (Exemplo)" }, // Usuário de exemplo para teste
  { email: "eva@example.com", name: "Eva Green (Exemplo)" }, // Usuário de exemplo para teste
];

// Usuário mock para simular o login. O e-mail deve pertencer a um dos ALLOWED_DOMAINS.
export const MOCK_USER = {
  name: "Usuário de Teste",
  email: "user@example.com", 
  image: "https://placehold.co/100x100.png",
};
