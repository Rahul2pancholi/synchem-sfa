-- Doctor creation request workflow (MAS10 → MAS11)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS doctors_comp_code_approve_status_idx
  ON doctors (comp_code, approve_status);
