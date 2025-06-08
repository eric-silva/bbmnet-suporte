-- DropIndex
DROP INDEX "Menu_menuPrincipalId_idx";

-- DropIndex
DROP INDEX "Ticket_ambienteId_idx";

-- DropIndex
DROP INDEX "Ticket_origemId_idx";

-- DropIndex
DROP INDEX "Ticket_prioridadeId_idx";

-- DropIndex
DROP INDEX "Ticket_responsavelId_idx";

-- DropIndex
DROP INDEX "Ticket_situacaoId_idx";

-- DropIndex
DROP INDEX "Ticket_solicitanteId_idx";

-- DropIndex
DROP INDEX "Ticket_tipoId_idx";

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "path" TEXT NOT NULL DEFAULT '#';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "isAtivo" BOOLEAN NOT NULL DEFAULT true;
