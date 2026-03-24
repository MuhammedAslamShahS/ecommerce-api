/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `WatchlistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_productId_key" ON "WatchlistItem"("userId", "productId");
