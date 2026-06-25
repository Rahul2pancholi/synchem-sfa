import { z } from 'zod';

/** Platform super-admin toggles these per tenant (compCode). */
export const TENANT_FEATURE_KEYS = [
  'field_visits',
  'doctor_orders',
  'field_plans',
  'doctor_onboarding',
  'expense_claims',
  'sales_reports',
  'ai_assistant',
  'leave_hr',
] as const;

export type TenantFeatureKey = (typeof TENANT_FEATURE_KEYS)[number];

export interface TenantFeatureDefinition {
  key: TenantFeatureKey;
  labelKey: string;
  descriptionKey: string;
}

export const TENANT_FEATURE_DEFINITIONS: TenantFeatureDefinition[] = [
  {
    key: 'field_visits',
    labelKey: 'platform.features.fieldVisits.label',
    descriptionKey: 'platform.features.fieldVisits.desc',
  },
  {
    key: 'doctor_orders',
    labelKey: 'platform.features.doctorOrders.label',
    descriptionKey: 'platform.features.doctorOrders.desc',
  },
  {
    key: 'field_plans',
    labelKey: 'platform.features.fieldPlans.label',
    descriptionKey: 'platform.features.fieldPlans.desc',
  },
  {
    key: 'doctor_onboarding',
    labelKey: 'platform.features.doctorOnboarding.label',
    descriptionKey: 'platform.features.doctorOnboarding.desc',
  },
  {
    key: 'expense_claims',
    labelKey: 'platform.features.expenseClaims.label',
    descriptionKey: 'platform.features.expenseClaims.desc',
  },
  {
    key: 'sales_reports',
    labelKey: 'platform.features.salesReports.label',
    descriptionKey: 'platform.features.salesReports.desc',
  },
  {
    key: 'ai_assistant',
    labelKey: 'platform.features.aiAssistant.label',
    descriptionKey: 'platform.features.aiAssistant.desc',
  },
  {
    key: 'leave_hr',
    labelKey: 'platform.features.leaveHr.label',
    descriptionKey: 'platform.features.leaveHr.desc',
  },
];

export const UpdateTenantFeaturesSchema = z.object({
  features: z.record(z.enum(TENANT_FEATURE_KEYS), z.boolean()),
});

export type TenantFeatureState = Record<TenantFeatureKey, boolean>;

export type TenantFeaturePresetId = 'full' | 'field' | 'lite';

export interface TenantFeaturePreset {
  id: TenantFeaturePresetId;
  labelKey: string;
  features: TenantFeatureState;
}

export function defaultTenantFeatures(): TenantFeatureState {
  return Object.fromEntries(
    TENANT_FEATURE_KEYS.map((key) => [key, true]),
  ) as TenantFeatureState;
}

export const TENANT_FEATURE_PRESETS: TenantFeaturePreset[] = [
  {
    id: 'full',
    labelKey: 'platform.preset.full',
    features: defaultTenantFeatures(),
  },
  {
    id: 'field',
    labelKey: 'platform.preset.field',
    features: {
      field_visits: true,
      doctor_orders: true,
      field_plans: true,
      doctor_onboarding: true,
      expense_claims: false,
      sales_reports: true,
      ai_assistant: true,
      leave_hr: false,
    },
  },
  {
    id: 'lite',
    labelKey: 'platform.preset.lite',
    features: {
      field_visits: true,
      doctor_orders: true,
      field_plans: true,
      doctor_onboarding: false,
      expense_claims: false,
      sales_reports: false,
      ai_assistant: false,
      leave_hr: false,
    },
  },
];
