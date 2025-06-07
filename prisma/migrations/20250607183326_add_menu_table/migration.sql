-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "nomeIcone" TEXT NOT NULL,
    "menuPrincipalId" TEXT,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Menu_menuPrincipalId_idx" ON "Menu"("menuPrincipalId");

-- CreateIndex
CREATE INDEX "Ticket_prioridadeId_idx" ON "Ticket"("prioridadeId");

-- CreateIndex
CREATE INDEX "Ticket_tipoId_idx" ON "Ticket"("tipoId");

-- CreateIndex
CREATE INDEX "Ticket_ambienteId_idx" ON "Ticket"("ambienteId");

-- CreateIndex
CREATE INDEX "Ticket_origemId_idx" ON "Ticket"("origemId");

-- CreateIndex
CREATE INDEX "Ticket_solicitanteId_idx" ON "Ticket"("solicitanteId");

-- CreateIndex
CREATE INDEX "Ticket_responsavelId_idx" ON "Ticket"("responsavelId");

-- CreateIndex
CREATE INDEX "Ticket_situacaoId_idx" ON "Ticket"("situacaoId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_prioridadeId_fkey" FOREIGN KEY ("prioridadeId") REFERENCES "Prioridade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "Tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ambienteId_fkey" FOREIGN KEY ("ambienteId") REFERENCES "Ambiente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "Origem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_situacaoId_fkey" FOREIGN KEY ("situacaoId") REFERENCES "Situacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_menuPrincipalId_fkey" FOREIGN KEY ("menuPrincipalId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
