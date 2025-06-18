/*
  Warnings:

  - You are about to drop the column `anexos` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `evidencias` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_menuPrincipalId_fkey";

-- DropForeignKey
ALTER TABLE "TicketAnexo" DROP CONSTRAINT "TicketAnexo_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketEvidencia" DROP CONSTRAINT "TicketEvidencia_ticketId_fkey";

-- AlterTable
ALTER TABLE "Menu" ALTER COLUMN "path" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "anexos",
DROP COLUMN "evidencias";

-- AlterTable
ALTER TABLE "TicketAnexo" ALTER COLUMN "tipo" SET DEFAULT 'outro';

-- AlterTable
ALTER TABLE "TicketEvidencia" ALTER COLUMN "tipo" SET DEFAULT 'outro';

-- CreateIndex
CREATE INDEX "TicketAnexo_ticketId_idx" ON "TicketAnexo"("ticketId");

-- CreateIndex
CREATE INDEX "TicketEvidencia_ticketId_idx" ON "TicketEvidencia"("ticketId");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_menuPrincipalId_fkey" FOREIGN KEY ("menuPrincipalId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvidencia" ADD CONSTRAINT "TicketEvidencia_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAnexo" ADD CONSTRAINT "TicketAnexo_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
