ALTER TABLE "WatchlistItem" RENAME TO "WishlistItem";

ALTER TYPE "WatchlistStatus" RENAME TO "WishlistStatus";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'WatchlistItem_pkey'
    ) THEN
        ALTER TABLE "WishlistItem"
            RENAME CONSTRAINT "WatchlistItem_pkey" TO "WishlistItem_pkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'WatchlistItem_userId_fkey'
    ) THEN
        ALTER TABLE "WishlistItem"
            RENAME CONSTRAINT "WatchlistItem_userId_fkey" TO "WishlistItem_userId_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'WatchlistItem_productId_fkey'
    ) THEN
        ALTER TABLE "WishlistItem"
            RENAME CONSTRAINT "WatchlistItem_productId_fkey" TO "WishlistItem_productId_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class
        WHERE relname = 'WatchlistItem_userId_productId_key'
    ) THEN
        ALTER INDEX "WatchlistItem_userId_productId_key"
            RENAME TO "WishlistItem_userId_productId_key";
    END IF;
END $$;
