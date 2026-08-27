/*
  Warnings:

  - Added the required column `category` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");
