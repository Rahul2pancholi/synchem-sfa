-- CreateTable
CREATE TABLE "employee_monthly_targets" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "target_month" INTEGER NOT NULL,
    "target_year" INTEGER NOT NULL,
    "amount_target" DECIMAL(14,2) NOT NULL,
    "call_target" INTEGER,
    "pob_target" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_monthly_targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_monthly_targets_comp_code_target_month_target_year_idx" ON "employee_monthly_targets"("comp_code", "target_month", "target_year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_monthly_targets_comp_code_emp_id_target_month_target_key" ON "employee_monthly_targets"("comp_code", "emp_id", "target_month", "target_year");

-- AddForeignKey
ALTER TABLE "employee_monthly_targets" ADD CONSTRAINT "employee_monthly_targets_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
