import { BadRequestException, ConflictException } from '@nestjs/common';
import { HierarchiesService } from './hierarchies.service';
import type { HierarchyRecord, HierarchyRepositoryPort } from './ports/hierarchy.repository.port';

describe('HierarchiesService', () => {
  const compCode = 'SYN';

  const records: HierarchyRecord[] = [
    {
      id: 'ad-id',
      compCode,
      hierarchyCode: 'AD-INDORE',
      hierarchyType: 'AD',
      hierarchyLevel: 1,
      reportingHierarchyId: null,
      parentHierarchyCode: null,
      active: true,
    },
    {
      id: 'rm-id',
      compCode,
      hierarchyCode: 'RM-INDORE',
      hierarchyType: 'RM',
      hierarchyLevel: 2,
      reportingHierarchyId: 'ad-id',
      parentHierarchyCode: 'AD-INDORE',
      active: true,
    },
  ];

  const repo: HierarchyRepositoryPort = {
    list: jest.fn().mockResolvedValue(records),
    findById: jest.fn(async (_compCode, id) => records.find((row) => row.id === id) ?? null),
    findByCode: jest.fn(async (_compCode, code) => records.find((row) => row.hierarchyCode === code) ?? null),
    create: jest.fn(async (code, input) => ({
      id: 'new-id',
      compCode: code,
      hierarchyCode: input.hierarchyCode,
      hierarchyType: input.hierarchyType,
      hierarchyLevel: input.hierarchyLevel,
      reportingHierarchyId: input.reportingHierarchyId ?? null,
      parentHierarchyCode: null,
      active: input.active ?? true,
    })),
    update: jest.fn(async (code, id, input) => {
      const current = records.find((row) => row.id === id)!;
      return { ...current, ...input };
    }),
    deactivate: jest.fn(async (code, id) => {
      const current = records.find((row) => row.id === id)!;
      return { ...current, active: false };
    }),
  };

  const service = new HierarchiesService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds reporting tree from active hierarchies', async () => {
    const result = await service.getReportingTree(compCode);
    expect(result.data.tree).toHaveLength(1);
    expect(result.data.tree[0].children).toHaveLength(1);
    expect(result.data.tree[0].hierarchyCode).toBe('AD-INDORE');
  });

  it('rejects duplicate hierarchy code on create', async () => {
    await expect(
      service.create(compCode, {
        hierarchyCode: 'AD-INDORE',
        hierarchyType: 'AD',
        hierarchyLevel: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects self-parent on update', async () => {
    await expect(
      service.update(compCode, 'rm-id', { reportingHierarchyId: 'rm-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
