/*
  Warnings:

  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'PREPAID');

-- DropIndex
DROP INDEX "User_resetToken_key";

-- DropIndex
DROP INDEX "User_transactionId_key";

-- DropIndex
DROP INDEX "User_verifyToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry",
DROP COLUMN "transactionId",
DROP COLUMN "verifyToken",
DROP COLUMN "verifyTokenExpiry";

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "routingCode" TEXT,
    "courierName" TEXT NOT NULL,
    "shipmentStatus" "ShipmentStatus" NOT NULL DEFAULT 'BOOKED',
    "orderRef" TEXT,
    "paymentType" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "codAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" TEXT,
    "pieces" TEXT,
    "contents" TEXT,
    "senderName" TEXT NOT NULL,
    "senderPhone" TEXT,
    "senderAddress" TEXT,
    "senderCity" TEXT,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "receiverAddress" TEXT NOT NULL,
    "receiverCity" TEXT NOT NULL,
    "receiverProvince" TEXT,
    "receiverEmail" TEXT,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "dontOpen" BOOLEAN NOT NULL DEFAULT false,
    "callFirst" BOOLEAN NOT NULL DEFAULT false,
    "insurance" BOOLEAN NOT NULL DEFAULT false,
    "signature" BOOLEAN NOT NULL DEFAULT false,
    "specialInstructions" TEXT,
    "courierBookingId" TEXT,
    "courierResponse" JSONB,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimatedDelivery" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_userId_idx" ON "Shipment"("userId");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_shipmentStatus_idx" ON "Shipment"("shipmentStatus");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
