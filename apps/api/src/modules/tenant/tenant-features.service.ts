import { Injectable } from '@nestjs/common';
import {
  defaultTenantFeatures,
  TENANT_FEATURE_KEYS,
  type TenantFeatureState,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

@Injectable()
export class TenantFeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeatureState(compCode: string): Promise<TenantFeatureState> {
    const rows = await this.prisma.tenantFeature.findMany({ where: { compCode } });
    const features = defaultTenantFeatures();

    for (const row of rows) {
      if (TENANT_FEATURE_KEYS.includes(row.featureKey as (typeof TENANT_FEATURE_KEYS)[number])) {
        features[row.featureKey as keyof TenantFeatureState] = row.enabled;
      }
    }

    return features;
  }

  async isCompanyActive(compCode: string): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { compCode },
      select: { active: true },
    });
    return company?.active ?? false;
  }

  async isFeatureEnabled(compCode: string, featureKey: keyof TenantFeatureState): Promise<boolean> {
    const features = await this.getFeatureState(compCode);
    return features[featureKey];
  }
}
