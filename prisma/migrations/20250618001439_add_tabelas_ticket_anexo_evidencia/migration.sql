-- CreateTable
CREATE TABLE "TicketAnexo" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nomeObjeto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketAnexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEvidencia" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nomeObjeto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketEvidencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketAnexo" ADD CONSTRAINT "TicketAnexo_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvidencia" ADD CONSTRAINT "TicketEvidencia_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
