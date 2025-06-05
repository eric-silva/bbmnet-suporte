# **App Name**: BBMNET Support Tracker

## Core Features:

- Microsoft Authentication: Secure user authentication via Microsoft email (domains: @pitang.com, @novobbmnet.com.br, @bbmnet.com.br).
- Ticket Creation: Create new support tickets with fields for Problem Description, Priority, Type, etc.  Solicitante (Requester) automatically populated, and a drop-down of permitted emails auto-filled for Responsavel (Assignee).
- Ticket Listing & Filtering: List support tickets in a sortable, filterable table based on all available columns. The filtering should be highly performant and run client-side. Use Nextjs server actions to ensure the client always has the most up-to-date state, if the dataset gets very large.
- Ticket Detail View: Detail view for each ticket row, with editable fields (except readonly fields like creation timestamp).
- Create Ticket Button: Button above the list to create new tickets.
- AI-Powered Assignee Suggestion: AI-powered tool to suggest appropriate Assignee (Responsavel) based on problem description analysis using a Large Language Model. The suggestion considers the assignee's expertise and current workload to suggest the best fit, with reasons.
- Discord Notification: When a ticket is created, automatically post a message to a designated Discord channel, including relevant information (problem, priority, etc.).

## Style Guidelines:

- Primary color: #567CBC, providing a calm, professional, and reliable feel.
- Background color: Very light periwinkle (#F0F4F8).
- Accent color: Muted lavender (#B7A5C3) to highlight key interactive elements.
- Body text: 'Inter' sans-serif. Headline text: 'Space Grotesk' sans-serif. Space Grotesk will give it a modern feel without being too cold, and the Inter is great for longform reading.
- Use minimalist, line-based icons to represent ticket status, priority, and type. All iconography should have a high level of contrast from its background to maximize readability.
- Use a clean, card-based layout for tickets to provide a clear visual hierarchy. Cards should use shadows and spacing to create a sense of depth.
- Use subtle transitions when displaying the detail view of a ticket to avoid disrupting the user.