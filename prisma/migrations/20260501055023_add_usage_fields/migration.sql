-- CreateEnum
CREATE TYPE "VerificationAction" AS ENUM ('CONFIRMED', 'RECHECKED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "verifyToken" TEXT,
    "verifyTokenExpiry" TIMESTAMP(3),
    "password" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "image" TEXT,
    "whatsapp" TEXT,
    "isSetupComplete" BOOLEAN NOT NULL DEFAULT false,
    "businessName" TEXT,
    "businessType" TEXT NOT NULL DEFAULT 'STOCK',
    "ownerName" TEXT,
    "city" TEXT,
    "monthlyRent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monthlySalaries" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monthlyHosting" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monthlyInternet" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "packagingCost" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "printingCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "activeCouriers" TEXT[],
    "salesChannels" JSONB,
    "courierRates" JSONB,
    "planType" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionId" TEXT,
    "transactionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "paymentMethod" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "seoGensToday" INTEGER NOT NULL DEFAULT 0,
    "reportsDownloadedToday" INTEGER NOT NULL DEFAULT 0,
    "totalPdfsDownloaded" INTEGER NOT NULL DEFAULT 0,
    "lastPdfDownload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compressionsToday" INTEGER NOT NULL DEFAULT 0,
    "calculationsToday" INTEGER NOT NULL DEFAULT 0,
    "bgRemovalsToday" INTEGER NOT NULL DEFAULT 0,
    "lastUsageReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "description" TEXT,
    "productionCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimatedTime" TEXT DEFAULT '3-5 Days',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "actionTaken" "VerificationAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastTry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "averageCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBatch" (
    "id" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "supplier" TEXT,
    "initialQty" INTEGER NOT NULL,
    "remainingQty" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "costPerItem" DOUBLE PRECISION NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "StockBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "productCost" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "packagingCost" DOUBLE PRECISION NOT NULL,
    "fixedCostShare" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "netProfit" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "serviceId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_transactionId_key" ON "User"("transactionId");

-- CreateIndex
CREATE INDEX "VerificationLog_phoneNumber_idx" ON "VerificationLog"("phoneNumber");

-- CreateIndex
CREATE INDEX "VerificationLog_userId_idx" ON "VerificationLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "VerificationToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_email_key" ON "RateLimit"("email");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBatch" ADD CONSTRAINT "StockBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
