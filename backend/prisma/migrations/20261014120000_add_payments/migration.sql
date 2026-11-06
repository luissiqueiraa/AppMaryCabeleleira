-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'card', 'on_site');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'expired', 'refunded');

-- AlterTable: payOnSite (booleano) vira o par metodo + situacao do pagamento.
ALTER TABLE "appointments"
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'on_site',
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending';

-- Tudo que existe hoje foi combinado para pagar no salao. Os que ja foram
-- atendidos (completed) contam como pagos: o dinheiro entrou na recepcao.
UPDATE "appointments" SET "paymentStatus" = 'paid' WHERE "status" = 'completed';

ALTER TABLE "appointments" DROP COLUMN "payOnSite";

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(10,2) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "services" JSONB NOT NULL,
    "notes" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'mercadopago',
    "providerPaymentId" TEXT,
    "checkoutUrl" TEXT,
    "pixQrCode" TEXT,
    "pixQrCodeBase64" TEXT,
    "failureReason" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerPaymentId_key" ON "payments"("providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointmentId_key" ON "payments"("appointmentId");

-- CreateIndex
CREATE INDEX "payments_clientId_idx" ON "payments"("clientId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
