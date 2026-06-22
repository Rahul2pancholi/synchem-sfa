-- Phase 2: Tour Programme, Weekly Plan, Personal Order Booking

CREATE TABLE "tour_programmes" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "plan_month" INTEGER NOT NULL,
    "plan_year" INTEGER NOT NULL,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_programmes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tour_programme_days" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "tour_programme_id" UUID NOT NULL,
    "day_of_month" INTEGER NOT NULL,
    "route_id" UUID,
    "work_type" VARCHAR(20) NOT NULL DEFAULT 'FIELD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_programme_days_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weekly_plans" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "week_start_date" DATE NOT NULL,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weekly_plan_entries" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "weekly_plan_id" UUID NOT NULL,
    "plan_date" DATE NOT NULL,
    "doctor_id" UUID,
    "notes" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_plan_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "personal_order_bookings" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "party_type" VARCHAR(20) NOT NULL,
    "party_id" UUID NOT NULL,
    "order_date" DATE NOT NULL,
    "dcr_id" UUID,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_order_bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "personal_order_lines" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "pob_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tour_programmes_comp_code_emp_id_plan_month_plan_year_key" ON "tour_programmes"("comp_code", "emp_id", "plan_month", "plan_year");
CREATE INDEX "tour_programmes_comp_code_emp_id_idx" ON "tour_programmes"("comp_code", "emp_id");

CREATE UNIQUE INDEX "tour_programme_days_tour_programme_id_day_of_month_key" ON "tour_programme_days"("tour_programme_id", "day_of_month");
CREATE INDEX "tour_programme_days_comp_code_tour_programme_id_idx" ON "tour_programme_days"("comp_code", "tour_programme_id");

CREATE UNIQUE INDEX "weekly_plans_comp_code_emp_id_week_start_date_key" ON "weekly_plans"("comp_code", "emp_id", "week_start_date");
CREATE INDEX "weekly_plans_comp_code_emp_id_idx" ON "weekly_plans"("comp_code", "emp_id");

CREATE INDEX "weekly_plan_entries_comp_code_weekly_plan_id_plan_date_idx" ON "weekly_plan_entries"("comp_code", "weekly_plan_id", "plan_date");

CREATE INDEX "personal_order_bookings_comp_code_emp_id_order_date_idx" ON "personal_order_bookings"("comp_code", "emp_id", "order_date");
CREATE INDEX "personal_order_lines_comp_code_pob_id_idx" ON "personal_order_lines"("comp_code", "pob_id");

ALTER TABLE "tour_programmes" ADD CONSTRAINT "tour_programmes_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tour_programme_days" ADD CONSTRAINT "tour_programme_days_tour_programme_id_fkey" FOREIGN KEY ("tour_programme_id") REFERENCES "tour_programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weekly_plan_entries" ADD CONSTRAINT "weekly_plan_entries_weekly_plan_id_fkey" FOREIGN KEY ("weekly_plan_id") REFERENCES "weekly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "personal_order_bookings" ADD CONSTRAINT "personal_order_bookings_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "personal_order_lines" ADD CONSTRAINT "personal_order_lines_pob_id_fkey" FOREIGN KEY ("pob_id") REFERENCES "personal_order_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
