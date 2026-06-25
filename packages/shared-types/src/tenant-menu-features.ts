import type { TenantFeatureKey, TenantFeatureState } from './tenant-features';

/** Menu codes gated by platform tenant feature flags (unmapped = always allowed). */
export const MENU_CODE_TO_TENANT_FEATURE: Partial<Record<string, TenantFeatureKey>> = {
  TRN03: 'field_visits',
  APP01: 'field_visits',
  REP01: 'field_visits',
  REP02: 'field_visits',
  TRN04: 'doctor_orders',
  REP12: 'doctor_orders',
  TRN01: 'field_plans',
  TRN24: 'field_plans',
  TRN02: 'field_plans',
  APP04: 'field_plans',
  REP10: 'field_plans',
  MAS10: 'doctor_onboarding',
  MAS11: 'doctor_onboarding',
  TRN20: 'expense_claims',
  TRN21: 'expense_claims',
  REP05: 'expense_claims',
  MAS20203: 'expense_claims',
  MAS08: 'expense_claims',
  REP20: 'sales_reports',
  REP22: 'sales_reports',
  REP23: 'sales_reports',
  REP41712: 'sales_reports',
  REP18: 'sales_reports',
  REP13: 'sales_reports',
  REP04: 'sales_reports',
  ADM05: 'ai_assistant',
  TRN09: 'leave_hr',
  TRN10: 'leave_hr',
  SET03: 'leave_hr',
};

export function isMenuAllowedByTenantFeatures(
  menuCode: string,
  features: TenantFeatureState,
): boolean {
  const featureKey = MENU_CODE_TO_TENANT_FEATURE[menuCode];
  if (!featureKey) return true;
  return features[featureKey];
}

export function filterMenusByTenantFeatures<T extends { menuCode: string }>(
  menus: T[],
  features: TenantFeatureState,
): T[] {
  return menus.filter((menu) => isMenuAllowedByTenantFeatures(menu.menuCode, features));
}

export interface MenuTreeNodeLike {
  menuUrl: string | null;
  childMenus: MenuTreeNodeLike[] | null;
}

/** Remove folder nodes that have no visible children and no direct link. */
export function pruneEmptyMenuFolders<T extends MenuTreeNodeLike>(nodes: T[]): T[] {
  return nodes
    .map((node) => {
      const childMenus = node.childMenus?.length ? pruneEmptyMenuFolders(node.childMenus) : null;
      return { ...node, childMenus: childMenus?.length ? childMenus : null };
    })
    .filter((node) => Boolean(node.menuUrl) || (node.childMenus?.length ?? 0) > 0);
}
