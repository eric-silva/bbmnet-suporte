/*
  Warnings:

  - A unique constraint covering the columns `[numeroTicket]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroTicket` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_ambienteId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_origemId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_prioridadeId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_situacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tipoId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "numeroTicket" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_numeroTicket_key" ON "Ticket"("numeroTicket");
