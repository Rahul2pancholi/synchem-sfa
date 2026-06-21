-- Phase 1 master tables: LOVs, stockist, and foreign keys

CREATE TABLE "product_divisions" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "division_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_divisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "designations" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "designation_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dosages" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "dosage_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "specialists" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "specialist_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qualifications" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "qualification_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "holiday_name" VARCHAR(100) NOT NULL,
    "holiday_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_heads" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "head_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_heads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_templates" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "template_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stockists" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "route_id" UUID,
    "stockist_name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stockists_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_divisions_comp_code_division_name_key" ON "product_divisions"("comp_code", "division_name");
CREATE INDEX "product_divisions_comp_code_idx" ON "product_divisions"("comp_code");

CREATE UNIQUE INDEX "designations_comp_code_designation_name_key" ON "designations"("comp_code", "designation_name");
CREATE INDEX "designations_comp_code_idx" ON "designations"("comp_code");

CREATE UNIQUE INDEX "dosages_comp_code_dosage_name_key" ON "dosages"("comp_code", "dosage_name");
CREATE INDEX "dosages_comp_code_idx" ON "dosages"("comp_code");

CREATE UNIQUE INDEX "specialists_comp_code_specialist_name_key" ON "specialists"("comp_code", "specialist_name");
CREATE INDEX "specialists_comp_code_idx" ON "specialists"("comp_code");

CREATE UNIQUE INDEX "qualifications_comp_code_qualification_name_key" ON "qualifications"("comp_code", "qualification_name");
CREATE INDEX "qualifications_comp_code_idx" ON "qualifications"("comp_code");

CREATE UNIQUE INDEX "holidays_comp_code_holiday_date_holiday_name_key" ON "holidays"("comp_code", "holiday_date", "holiday_name");
CREATE INDEX "holidays_comp_code_idx" ON "holidays"("comp_code");

CREATE UNIQUE INDEX "expense_heads_comp_code_head_name_key" ON "expense_heads"("comp_code", "head_name");
CREATE INDEX "expense_heads_comp_code_idx" ON "expense_heads"("comp_code");

CREATE UNIQUE INDEX "expense_templates_comp_code_template_name_key" ON "expense_templates"("comp_code", "template_name");
CREATE INDEX "expense_templates_comp_code_idx" ON "expense_templates"("comp_code");

CREATE INDEX "stockists_comp_code_route_id_idx" ON "stockists"("comp_code", "route_id");

ALTER TABLE "product_divisions" ADD CONSTRAINT "product_divisions_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "designations" ADD CONSTRAINT "designations_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dosages" ADD CONSTRAINT "dosages_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expense_heads" ADD CONSTRAINT "expense_heads_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expense_templates" ADD CONSTRAINT "expense_templates_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stockists" ADD CONSTRAINT "stockists_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stockists" ADD CONSTRAINT "stockists_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "employees" ADD CONSTRAINT "employees_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "product_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "product_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "qualifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "head_quarters" ADD CONSTRAINT "head_quarters_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "brands" ADD CONSTRAINT "brands_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
