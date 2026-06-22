-- Insights chatbot admin configuration (per tenant)

CREATE TABLE "insights_chat_configs" (
    "comp_code" VARCHAR(10) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" VARCHAR(20) NOT NULL DEFAULT 'openai',
    "model" VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
    "api_key_ciphertext" TEXT,
    "api_key_iv" VARCHAR(32),
    "system_prompt" TEXT NOT NULL DEFAULT '',
    "intent_prompt" TEXT NOT NULL DEFAULT '',
    "narration_prompt" TEXT NOT NULL DEFAULT '',
    "updated_by_employee_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_chat_configs_pkey" PRIMARY KEY ("comp_code")
);

ALTER TABLE "insights_chat_configs" ADD CONSTRAINT "insights_chat_configs_comp_code_fkey" FOREIGN KEY ("comp_code") REFERENCES "companies"("comp_code") ON DELETE RESTRICT ON UPDATE CASCADE;
