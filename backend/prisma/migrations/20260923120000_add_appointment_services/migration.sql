-- CreateTable
CREATE TABLE "appointmentServices" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointmentServices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointmentServices_serviceId_idx" ON "appointmentServices"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "appointmentServices_appointmentId_serviceId_key" ON "appointmentServices"("appointmentId", "serviceId");

-- AddForeignKey
ALTER TABLE "appointmentServices" ADD CONSTRAINT "appointmentServices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointmentServices" ADD CONSTRAINT "appointmentServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: cada agendamento existente vira um item com o proprio snapshot,
-- que ate aqui morava nas colunas de total do agendamento.
INSERT INTO "appointmentServices" ("id", "appointmentId", "serviceId", "durationMinutes", "price")
SELECT gen_random_uuid(), "id", "serviceId", "durationMinutes", "price" FROM "appointments";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_serviceId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "serviceId";
