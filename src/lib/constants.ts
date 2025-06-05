import type { Assignee } from '@/types';

export const ALLOWED_DOMAINS = ["pitang.com", "novobbmnet.com.br", "bbmnet.com.br", "example.com"]; // Added example.com for testing

export const PERMITTED_ASSIGNEES: Assignee[] = [
  { email: "alice@pitang.com", name: "Alice Wonderland" },
  { email: "bob@novobbmnet.com.br", name: "Bob The Builder" },
  { email: "charlie@bbmnet.com.br", name: "Charlie Brown" },
  { email: "david@example.com", name: "David Copperfield (Test)" },
  { email: "eva@example.com", name: "Eva Green (Test)" },
];

export const MOCK_USER = {
  name: "Test User",
  email: "user@example.com", // Make sure this domain is in ALLOWED_DOMAINS for mock to work
  image: "https://placehold.co/100x100.png",
};
