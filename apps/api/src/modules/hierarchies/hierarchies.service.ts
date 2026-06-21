import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  CreateHierarchyRequestSchema,
  UpdateHierarchyRequestSchema,
  type HierarchySummary,
  type HierarchyTreeNode,
} from '@synchem-sfa/shared-types';
import {
  HIERARCHY_REPOSITORY,
  type HierarchyRecord,
  type HierarchyRepositoryPort,
} from './ports/hierarchy.repository.port';

@Injectable()
export class HierarchiesService {
  private readonly logger = new Logger(HierarchiesService.name);

  constructor(
    @Inject(HIERARCHY_REPOSITORY)
    private readonly hierarchyRepo: HierarchyRepositoryPort,
  ) {}

  async list(compCode: string) {
    const items = await this.hierarchyRepo.list(compCode);
    return apiSuccess({ items: items.map(toSummary) });
  }

  async getReportingTree(compCode: string) {
    const items = await this.hierarchyRepo.list(compCode);
    const activeItems = items.filter((item) => item.active);
    const tree = buildTree(activeItems);
    return apiSuccess({ tree });
  }

  async getById(compCode: string, id: string) {
    const item = await this.hierarchyRepo.findById(compCode, id);
    if (!item) {
      throw new NotFoundException('Hierarchy not found');
    }

    return apiSuccess(toSummary(item));
  }

  async create(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateHierarchyRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const existing = await this.hierarchyRepo.findByCode(compCode, parsed.data.hierarchyCode);
    if (existing) {
      throw new ConflictException('Hierarchy code already exists');
    }

    if (parsed.data.reportingHierarchyId) {
      await this.assertParent(compCode, parsed.data.reportingHierarchyId);
    }

    const created = await this.hierarchyRepo.create(compCode, parsed.data);
    this.logger.log({ module: 'hierarchies', action: 'create', compCode, id: created.id });

    return apiSuccess(toSummary(created), 201);
  }

  async update(compCode: string, id: string, body: Record<string, unknown>) {
    const parsed = UpdateHierarchyRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const current = await this.hierarchyRepo.findById(compCode, id);
    if (!current) {
      throw new NotFoundException('Hierarchy not found');
    }

    if (
      parsed.data.hierarchyCode &&
      parsed.data.hierarchyCode !== current.hierarchyCode
    ) {
      const duplicate = await this.hierarchyRepo.findByCode(compCode, parsed.data.hierarchyCode);
      if (duplicate) {
        throw new ConflictException('Hierarchy code already exists');
      }
    }

    if (parsed.data.reportingHierarchyId) {
      if (parsed.data.reportingHierarchyId === id) {
        throw new BadRequestException('Hierarchy cannot report to itself');
      }
      await this.assertParent(compCode, parsed.data.reportingHierarchyId);
    }

    const updated = await this.hierarchyRepo.update(compCode, id, parsed.data);
    this.logger.log({ module: 'hierarchies', action: 'update', compCode, id });

    return apiSuccess(toSummary(updated));
  }

  async deactivate(compCode: string, id: string) {
    const current = await this.hierarchyRepo.findById(compCode, id);
    if (!current) {
      throw new NotFoundException('Hierarchy not found');
    }

    const updated = await this.hierarchyRepo.deactivate(compCode, id);
    this.logger.log({ module: 'hierarchies', action: 'deactivate', compCode, id });

    return apiSuccess(toSummary(updated));
  }

  private async assertParent(compCode: string, parentId: string) {
    const parent = await this.hierarchyRepo.findById(compCode, parentId);
    if (!parent || !parent.active) {
      throw new BadRequestException('Invalid parent hierarchy');
    }
  }
}

function toSummary(record: HierarchyRecord): HierarchySummary {
  return {
    id: record.id,
    hierarchyCode: record.hierarchyCode,
    hierarchyType: record.hierarchyType,
    hierarchyLevel: record.hierarchyLevel,
    reportingHierarchyId: record.reportingHierarchyId,
    parentHierarchyCode: record.parentHierarchyCode,
    active: record.active,
  };
}

function buildTree(items: HierarchyRecord[]): HierarchyTreeNode[] {
  const nodes = new Map<string, HierarchyTreeNode>();

  for (const item of items) {
    nodes.set(item.id, { ...toSummary(item), children: [] });
  }

  const roots: HierarchyTreeNode[] = [];

  for (const item of items) {
    const node = nodes.get(item.id)!;
    if (item.reportingHierarchyId && nodes.has(item.reportingHierarchyId)) {
      nodes.get(item.reportingHierarchyId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
