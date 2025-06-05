export type Priority = "Low" | "Medium" | "High";
export const priorities: Priority[] = ["Low", "Medium", "High"];

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export const ticketStatuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

export type TicketType = "Bug" | "Feature Request" | "Question" | "Other";
export const ticketTypes: TicketType[] = ["Bug", "Feature Request", "Question", "Other"];

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
  resolutionDetails?: string;
}

export interface Assignee {
  email: string;
  name: string;
}
