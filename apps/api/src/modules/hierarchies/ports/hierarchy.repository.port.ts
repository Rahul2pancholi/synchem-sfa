export interface HierarchyRecord {
  id: string;
  compCode: string;
  hierarchyCode: string;
  hierarchyType: string;
  hierarchyLevel: number;
  reportingHierarchyId: string | null;
  parentHierarchyCode: string | null;
  active: boolean;
}

export interface CreateHierarchyInput {
  hierarchyCode: string;
  hierarchyType: string;
  hierarchyLevel: number;
  reportingHierarchyId?: string | null;
  active?: boolean;
}

export interface UpdateHierarchyInput {
  hierarchyCode?: string;
  hierarchyType?: string;
  hierarchyLevel?: number;
  reportingHierarchyId?: string | null;
  active?: boolean;
}

export interface HierarchyRepositoryPort {
  list(compCode: string): Promise<HierarchyRecord[]>;
  findById(compCode: string, id: string): Promise<HierarchyRecord | null>;
  findByCode(compCode: string, hierarchyCode: string): Promise<HierarchyRecord | null>;
  create(compCode: string, input: CreateHierarchyInput): Promise<HierarchyRecord>;
  update(compCode: string, id: string, input: UpdateHierarchyInput): Promise<HierarchyRecord>;
  deactivate(compCode: string, id: string): Promise<HierarchyRecord>;
}

export const HIERARCHY_REPOSITORY = Symbol('HIERARCHY_REPOSITORY');
