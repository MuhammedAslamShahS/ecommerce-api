ALTER TABLE "Product"
ALTER COLUMN "launchDate" DROP NOT NULL;

ALTER TABLE "Product"
ADD COLUMN "description" TEXT,
ADD COLUMN "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "brand" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Product"
SET
    "description" = COALESCE("description", "overview"),
    "brand" = COALESCE("brand", "seller"),
    "category" = COALESCE("category", ("brandDetails")[2], ("brandDetails")[1]);
