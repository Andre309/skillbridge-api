/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "serialNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_serialNumber_key" ON "users"("serialNumber");
