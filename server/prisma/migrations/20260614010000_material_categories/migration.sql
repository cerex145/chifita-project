CREATE TABLE "MaterialCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaterialCategory_name_key" ON "MaterialCategory"("name");

INSERT INTO "MaterialCategory" ("id", "name")
VALUES
  (gen_random_uuid(), 'Microeconomía'),
  (gen_random_uuid(), 'Macroeconomía'),
  (gen_random_uuid(), 'Econometría'),
  (gen_random_uuid(), 'Finanzas'),
  (gen_random_uuid(), 'Historia Económica'),
  (gen_random_uuid(), 'Otros')
ON CONFLICT ("name") DO NOTHING;
