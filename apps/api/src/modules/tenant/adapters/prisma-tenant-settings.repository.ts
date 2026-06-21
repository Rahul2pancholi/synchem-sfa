import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type { TenantSettingsRepositoryPort } from '../ports/tenant-settings.repository.port';

@Injectable()
export class PrismaTenantSettingsRepository implements TenantSettingsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getSettingsMap(compCode: string): Promise<Record<string, string>> {
    const rows = await this.prisma.companySetting.findMany({
      where: { compCode },
    });

    return Object.fromEntries(rows.map((row) => [row.settingKey, row.settingValue]));
  }
}
