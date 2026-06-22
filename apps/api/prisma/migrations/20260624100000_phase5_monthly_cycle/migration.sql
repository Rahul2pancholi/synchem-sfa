-- Phase 5: Leave policy, leave applications, expense statements

CREATE TABLE "leave_policies" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "leave_type" VARCHAR(10) NOT NULL,
    "annual_quota" INTEGER NOT NULL,
    "carry_forward_limit" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "leave_type" VARCHAR(10) NOT NULL,
    "policy_year" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leave_applications" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "leave_type" VARCHAR(10) NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "total_days" INTEGER NOT NULL,
    "reason" TEXT,
    "balance_before" INTEGER,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_statements" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "claim_month" INTEGER NOT NULL,
    "claim_year" INTEGER NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_statements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_statement_lines" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "statement_id" UUID NOT NULL,
    "expense_head_id" UUID,
    "description" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_statement_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "leave_policies_comp_code_leave_type_key" ON "leave_policies"("comp_code", "leave_type");
CREATE INDEX "leave_policies_comp_code_idx" ON "leave_policies"("comp_code");

CREATE UNIQUE INDEX "leave_balances_comp_code_emp_id_leave_type_policy_year_key" ON "leave_balances"("comp_code", "emp_id", "leave_type", "policy_year");
CREATE INDEX "leave_balances_comp_code_emp_id_idx" ON "leave_balances"("comp_code", "emp_id");

CREATE INDEX "leave_applications_comp_code_emp_id_from_date_idx" ON "leave_applications"("comp_code", "emp_id", "from_date");

CREATE UNIQUE INDEX "expense_statements_comp_code_emp_id_claim_month_claim_year_key" ON "expense_statements"("comp_code", "emp_id", "claim_month", "claim_year");
CREATE INDEX "expense_statements_comp_code_emp_id_idx" ON "expense_statements"("comp_code", "emp_id");

CREATE INDEX "expense_statement_lines_comp_code_statement_id_idx" ON "expense_statement_lines"("comp_code", "statement_id");

ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expense_statements" ADD CONSTRAINT "expense_statements_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expense_statement_lines" ADD CONSTRAINT "expense_statement_lines_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "expense_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense_statement_lines" ADD CONSTRAINT "expense_statement_lines_expense_head_id_fkey" FOREIGN KEY ("expense_head_id") REFERENCES "expense_heads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
