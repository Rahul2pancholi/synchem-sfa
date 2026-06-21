export interface TenantSettingsRepositoryPort {
  getSettingsMap(compCode: string): Promise<Record<string, string>>;
}

export const TENANT_SETTINGS_REPOSITORY = Symbol('TENANT_SETTINGS_REPOSITORY');
