-- CreateTable
CREATE TABLE "login_events" (
    "id" UUID NOT NULL,
    "comp_code" VARCHAR(10) NOT NULL,
    "emp_id" UUID,
    "user_name" VARCHAR(100),
    "login_status" VARCHAR(20) NOT NULL,
    "channel" VARCHAR(20) NOT NULL DEFAULT 'web',
    "device_id" VARCHAR(100),
    "device_type" VARCHAR(20),
    "os_name" VARCHAR(50),
    "os_version" VARCHAR(50),
    "browser_name" VARCHAR(50),
    "browser_version" VARCHAR(50),
    "app_version" VARCHAR(50),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "accept_language" VARCHAR(100),
    "request_id" VARCHAR(100),
    "refresh_token_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_events_comp_code_emp_id_created_at_idx" ON "login_events"("comp_code", "emp_id", "created_at");

-- CreateIndex
CREATE INDEX "login_events_comp_code_created_at_idx" ON "login_events"("comp_code", "created_at");

-- CreateIndex
CREATE INDEX "login_events_comp_code_device_id_idx" ON "login_events"("comp_code", "device_id");

-- CreateIndex
CREATE INDEX "login_events_comp_code_login_status_created_at_idx" ON "login_events"("comp_code", "login_status", "created_at");

-- AddForeignKey
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
