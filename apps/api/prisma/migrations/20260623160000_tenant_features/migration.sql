-- Per-tenant feature flags (platform super-admin)
CREATE TABLE IF NOT EXISTS tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comp_code VARCHAR(10) NOT NULL REFERENCES companies(comp_code) ON DELETE CASCADE,
  feature_key VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comp_code, feature_key)
);

CREATE INDEX IF NOT EXISTS tenant_features_comp_code_idx ON tenant_features (comp_code);
