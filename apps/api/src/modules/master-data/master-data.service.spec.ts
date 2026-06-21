import { BadRequestException } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

describe('MasterDataService', () => {
  const prisma = {
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const service = new MasterDataService(prisma);

  it('rejects bulk import without rows', async () => {
    await expect(service.bulkImport('SYN', 'cities', { rows: [] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
