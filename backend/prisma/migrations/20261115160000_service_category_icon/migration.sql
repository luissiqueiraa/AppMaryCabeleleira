-- Ícone por categoria, escolhido no painel. Antes o ícone da vitrine vinha de
-- um mapa fixo no frontend com os quatro slugs originais, então categoria nova
-- caía sempre na tesoura.

ALTER TABLE "service_categories" ADD COLUMN "icon" TEXT;

-- Preserva o que a vitrine já mostrava para as quatro originais.
UPDATE "service_categories" SET "icon" = 'scissors' WHERE "slug" = 'hair';
UPDATE "service_categories" SET "icon" = 'droplet'  WHERE "slug" = 'nails';
UPDATE "service_categories" SET "icon" = 'sun'      WHERE "slug" = 'makeup';
UPDATE "service_categories" SET "icon" = 'wind'     WHERE "slug" = 'brows';
