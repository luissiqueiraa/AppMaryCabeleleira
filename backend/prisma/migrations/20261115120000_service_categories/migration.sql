-- Categorias de serviço deixam de ser um enum no código e passam a ser dados,
-- para o salão criar as suas. A migração preserva o que já existe: cada valor
-- de texto da coluna antiga vira uma categoria, e os serviços são religados a
-- ela pelo slug.

CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");
CREATE INDEX "service_categories_active_idx" ON "service_categories"("active");
CREATE INDEX "service_categories_deletedAt_idx" ON "service_categories"("deletedAt");

-- As quatro que o código oferecia. Os slugs são os mesmos de antes, para os
-- ícones da homepage continuarem casando.
INSERT INTO "service_categories" ("id", "name", "slug", "sortOrder") VALUES
    (gen_random_uuid(), 'Cabelo', 'hair', 1),
    (gen_random_uuid(), 'Unhas', 'nails', 2),
    (gen_random_uuid(), 'Maquiagem', 'makeup', 3),
    (gen_random_uuid(), 'Sobrancelha', 'brows', 4);

ALTER TABLE "services" ADD COLUMN "categoryId" TEXT;

UPDATE "services" s
   SET "categoryId" = c."id"
  FROM "service_categories" c
 WHERE c."slug" = s."category";

-- A coluna antiga era texto livre no banco: se algum serviço tiver um valor
-- fora dos quatro, ele não pode ficar sem categoria nem travar a migração.
INSERT INTO "service_categories" ("id", "name", "slug", "sortOrder")
SELECT gen_random_uuid(), 'Outros', 'outros', 99
 WHERE EXISTS (SELECT 1 FROM "services" WHERE "categoryId" IS NULL);

UPDATE "services"
   SET "categoryId" = (SELECT "id" FROM "service_categories" WHERE "slug" = 'outros')
 WHERE "categoryId" IS NULL;

ALTER TABLE "services" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "services"
    ADD CONSTRAINT "services_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");

DROP INDEX IF EXISTS "services_category_idx";
ALTER TABLE "services" DROP COLUMN "category";
