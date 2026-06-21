import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  CreateHierarchyInput,
  HierarchyRecord,
  HierarchyRepositoryPort,
  UpdateHierarchyInput,
} from '../ports/hierarchy.repository.port';

@Injectable()
export class PrismaHierarchyRepository implements HierarchyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(compCode: string): Promise<HierarchyRecord[]> {
    const rows = await this.prisma.hierarchy.findMany({
      where: { compCode },
      orderBy: [{ hierarchyLevel: 'asc' }, { hierarchyCode: 'asc' }],
      include: { parent: { select: { hierarchyCode: true } } },
    });

    return rows.map(toRecord);
  }

  async findById(compCode: string, id: string): Promise<HierarchyRecord | null> {
    const row = await this.prisma.hierarchy.findFirst({
      where: { id, compCode },
      include: { parent: { select: { hierarchyCode: true } } },
    });

    return row ? toRecord(row) : null;
  }

  async findByCode(compCode: string, hierarchyCode: string): Promise<HierarchyRecord | null> {
    const row = await this.prisma.hierarchy.findFirst({
      where: { compCode, hierarchyCode },
      include: { parent: { select: { hierarchyCode: true } } },
    });

    return row ? toRecord(row) : null;
  }

  async create(compCode: string, input: CreateHierarchyInput): Promise<HierarchyRecord> {
    const row = await this.prisma.hierarchy.create({
      data: {
        compCode,
        hierarchyCode: input.hierarchyCode,
        hierarchyType: input.hierarchyType,
        hierarchyLevel: input.hierarchyLevel,
        reportingHierarchyId: input.reportingHierarchyId ?? null,
        active: input.active ?? true,
      },
      include: { parent: { select: { hierarchyCode: true } } },
    });

    return toRecord(row);
  }

  async update(compCode: string, id: string, input: UpdateHierarchyInput): Promise<HierarchyRecord> {
    const row = await this.prisma.hierarchy.update({
      where: { id },
      data: {
        hierarchyCode: input.hierarchyCode,
        hierarchyType: input.hierarchyType,
        hierarchyLevel: input.hierarchyLevel,
        reportingHierarchyId: input.reportingHierarchyId,
        active: input.active,
      },
      include: { parent: { select: { hierarchyCode: true } } },
    });

    if (row.compCode !== compCode) {
      throw new Error('Tenant mismatch after hierarchy update');
    }

    return toRecord(row);
  }

  async deactivate(compCode: string, id: string): Promise<HierarchyRecord> {
    return this.update(compCode, id, { active: false });
  }
}

function toRecord(row: {
  id: string;
  compCode: string;
  hierarchyCode: string;
  hierarchyType: string;
  hierarchyLevel: number;
  reportingHierarchyId: string | null;
  active: boolean;
  parent?: { hierarchyCode: string } | null;
}): HierarchyRecord {
  return {
    id: row.id,
    compCode: row.compCode,
    hierarchyCode: row.hierarchyCode,
    hierarchyType: row.hierarchyType,
    hierarchyLevel: row.hierarchyLevel,
    reportingHierarchyId: row.reportingHierarchyId,
    parentHierarchyCode: row.parent?.hierarchyCode ?? null,
    active: row.active,
  };
}
