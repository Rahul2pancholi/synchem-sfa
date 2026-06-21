-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "companies" (
    "comp_code" VARCHAR(10) NOT NULL,
    "comp_name" VARCHAR(255) NOT NULL,
    "comp_address" TEXT,
    "industry_type" VARCHAR(20) NOT NULL DEFAULT 'SYN',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    "logo_path" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("comp_code")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "setting_key" VARCHAR(20) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "data_type" VARCHAR(20) NOT NULL DEFAULT 'string',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "role_type" VARCHAR(10) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" UUID NOT NULL,
    "menu_code" VARCHAR(20) NOT NULL,
    "menu_name" VARCHAR(255) NOT NULL,
    "menu_url" VARCHAR(500),
    "menu_type" VARCHAR(10),
    "parent_menu_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menu_permissions" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "role_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT false,
    "can_add" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_preview" BOOLEAN NOT NULL DEFAULT false,
    "can_print" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hierarchies" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "hierarchy_code" VARCHAR(50) NOT NULL,
    "hierarchy_type" VARCHAR(20) NOT NULL,
    "hierarchy_level" INTEGER NOT NULL,
    "reporting_hierarchy_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hierarchies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "employee_code" VARCHAR(20),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "mobile_no" VARCHAR(20),
    "role_id" UUID NOT NULL,
    "hierarchy_id" UUID,
    "head_quarter_id" UUID,
    "reporting_manager_id" UUID,
    "division_id" UUID,
    "mpin_hash" VARCHAR(255),
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "is_check_in_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_geo_fencing_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_token" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "state_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "state_id" UUID NOT NULL,
    "city_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "head_quarters" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "hq_name" VARCHAR(100) NOT NULL,
    "state_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "head_quarters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "head_quarter_id" UUID NOT NULL,
    "route_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "route_id" UUID,
    "doctor_name" VARCHAR(255) NOT NULL,
    "specialist_id" UUID,
    "qualification_id" UUID,
    "mobile_no" VARCHAR(20),
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retailers" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "route_id" UUID,
    "retailer_name" VARCHAR(255) NOT NULL,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "retailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "brand_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "brand_id" UUID,
    "product_name" VARCHAR(255) NOT NULL,
    "product_code" VARCHAR(50),
    "division_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_call_reports" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "client_id" UUID,
    "work_date" DATE NOT NULL,
    "head_quarter_id" UUID,
    "route_id" UUID,
    "approve_status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_call_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcr_doctor_visits" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "dcr_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "client_id" UUID,
    "visit_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcr_doctor_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcr_retailer_visits" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "dcr_id" UUID NOT NULL,
    "retailer_id" UUID NOT NULL,
    "client_id" UUID,
    "visit_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcr_retailer_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_queue_items" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "submitted_by" UUID NOT NULL,
    "approver_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_batches" (
    "id" UUID NOT NULL,
    "sync_batch_id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "device_id" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'applied',
    "request_json" JSONB NOT NULL,
    "response_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_client_mappings" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "client_id" UUID NOT NULL,
    "server_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_client_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_check_ins" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "event_type" VARCHAR(20) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gps_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "request_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_settings_comp_code_idx" ON "company_settings"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_comp_code_setting_key_key" ON "company_settings"("comp_code", "setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "platform_users_email_key" ON "platform_users"("email");

-- CreateIndex
CREATE INDEX "roles_comp_code_idx" ON "roles"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_comp_code_role_name_key" ON "roles"("comp_code", "role_name");

-- CreateIndex
CREATE UNIQUE INDEX "menus_menu_code_key" ON "menus"("menu_code");

-- CreateIndex
CREATE INDEX "role_menu_permissions_comp_code_role_id_idx" ON "role_menu_permissions"("comp_code", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_menu_permissions_comp_code_role_id_menu_id_key" ON "role_menu_permissions"("comp_code", "role_id", "menu_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_comp_code_emp_id_idx" ON "refresh_tokens"("comp_code", "emp_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "hierarchies_comp_code_idx" ON "hierarchies"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "hierarchies_comp_code_hierarchy_code_key" ON "hierarchies"("comp_code", "hierarchy_code");

-- CreateIndex
CREATE INDEX "employees_comp_code_head_quarter_id_idx" ON "employees"("comp_code", "head_quarter_id");

-- CreateIndex
CREATE INDEX "employees_comp_code_role_id_idx" ON "employees"("comp_code", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_comp_code_user_name_key" ON "employees"("comp_code", "user_name");

-- CreateIndex
CREATE INDEX "states_comp_code_idx" ON "states"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "states_comp_code_state_name_key" ON "states"("comp_code", "state_name");

-- CreateIndex
CREATE INDEX "cities_comp_code_idx" ON "cities"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "cities_comp_code_state_id_city_name_key" ON "cities"("comp_code", "state_id", "city_name");

-- CreateIndex
CREATE INDEX "head_quarters_comp_code_idx" ON "head_quarters"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "head_quarters_comp_code_hq_name_key" ON "head_quarters"("comp_code", "hq_name");

-- CreateIndex
CREATE INDEX "routes_comp_code_head_quarter_id_idx" ON "routes"("comp_code", "head_quarter_id");

-- CreateIndex
CREATE UNIQUE INDEX "routes_comp_code_head_quarter_id_route_name_key" ON "routes"("comp_code", "head_quarter_id", "route_name");

-- CreateIndex
CREATE INDEX "doctors_comp_code_route_id_idx" ON "doctors"("comp_code", "route_id");

-- CreateIndex
CREATE INDEX "retailers_comp_code_route_id_idx" ON "retailers"("comp_code", "route_id");

-- CreateIndex
CREATE INDEX "brands_comp_code_idx" ON "brands"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "brands_comp_code_brand_name_key" ON "brands"("comp_code", "brand_name");

-- CreateIndex
CREATE INDEX "products_comp_code_idx" ON "products"("comp_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_comp_code_product_code_key" ON "products"("comp_code", "product_code");

-- CreateIndex
CREATE INDEX "daily_call_reports_comp_code_emp_id_work_date_idx" ON "daily_call_reports"("comp_code", "emp_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_call_reports_comp_code_client_id_key" ON "daily_call_reports"("comp_code", "client_id");

-- CreateIndex
CREATE INDEX "dcr_doctor_visits_comp_code_dcr_id_idx" ON "dcr_doctor_visits"("comp_code", "dcr_id");

-- CreateIndex
CREATE UNIQUE INDEX "dcr_doctor_visits_comp_code_client_id_key" ON "dcr_doctor_visits"("comp_code", "client_id");

-- CreateIndex
CREATE INDEX "dcr_retailer_visits_comp_code_dcr_id_idx" ON "dcr_retailer_visits"("comp_code", "dcr_id");

-- CreateIndex
CREATE UNIQUE INDEX "dcr_retailer_visits_comp_code_client_id_key" ON "dcr_retailer_visits"("comp_code", "client_id");

-- CreateIndex
CREATE INDEX "approval_queue_items_comp_code_entity_type_entity_id_idx" ON "approval_queue_items"("comp_code", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approval_queue_items_comp_code_entity_type_status_idx" ON "approval_queue_items"("comp_code", "entity_type", "status");

-- CreateIndex
CREATE INDEX "approval_queue_items_comp_code_approver_id_status_idx" ON "approval_queue_items"("comp_code", "approver_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sync_batches_sync_batch_id_key" ON "sync_batches"("sync_batch_id");

-- CreateIndex
CREATE INDEX "sync_batches_comp_code_emp_id_idx" ON "sync_batches"("comp_code", "emp_id");

-- CreateIndex
CREATE INDEX "sync_client_mappings_comp_code_server_id_idx" ON "sync_client_mappings"("comp_code", "server_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_client_mappings_comp_code_client_id_entity_type_key" ON "sync_client_mappings"("comp_code", "client_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "gps_check_ins_client_id_key" ON "gps_check_ins"("client_id");

-- CreateIndex
CREATE INDEX "gps_check_ins_comp_code_emp_id_recorded_at_idx" ON "gps_check_ins"("comp_code", "emp_id", "recorded_at");

-- CreateIndex
CREATE INDEX "audit_logs_comp_code_entity_type_entity_id_idx" ON "audit_logs"("comp_code", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_comp_code_created_at_idx" ON "audit_logs"("comp_code", "created_at");

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_parent_menu_id_fkey" FOREIGN KEY ("parent_menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_permissions" ADD CONSTRAINT "role_menu_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_permissions" ADD CONSTRAINT "role_menu_permissions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hierarchies" ADD CONSTRAINT "hierarchies_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hierarchies" ADD CONSTRAINT "hierarchies_reporting_hierarchy_id_fkey" FOREIGN KEY ("reporting_hierarchy_id") REFERENCES "hierarchies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_hierarchy_id_fkey" FOREIGN KEY ("hierarchy_id") REFERENCES "hierarchies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_head_quarter_id_fkey" FOREIGN KEY ("head_quarter_id") REFERENCES "head_quarters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "head_quarters" ADD CONSTRAINT "head_quarters_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_head_quarter_id_fkey" FOREIGN KEY ("head_quarter_id") REFERENCES "head_quarters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_call_reports" ADD CONSTRAINT "daily_call_reports_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcr_doctor_visits" ADD CONSTRAINT "dcr_doctor_visits_dcr_id_fkey" FOREIGN KEY ("dcr_id") REFERENCES "daily_call_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcr_retailer_visits" ADD CONSTRAINT "dcr_retailer_visits_dcr_id_fkey" FOREIGN KEY ("dcr_id") REFERENCES "daily_call_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_batches" ADD CONSTRAINT "sync_batches_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_batches" ADD CONSTRAINT "sync_batches_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_check_ins" ADD CONSTRAINT "gps_check_ins_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

