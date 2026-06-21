import { z } from 'zod';

export const HierarchyTypeSchema = z.enum(['AD', 'RM', 'ZM', 'MR']);

export const CreateHierarchyRequestSchema = z.object({
  hierarchyCode: z.string().min(1).max(50),
  hierarchyType: HierarchyTypeSchema,
  hierarchyLevel: z.number().int().min(1).max(10),
  reportingHierarchyId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const UpdateHierarchyRequestSchema = CreateHierarchyRequestSchema.partial();

export type CreateHierarchyRequest = z.infer<typeof CreateHierarchyRequestSchema>;
export type UpdateHierarchyRequest = z.infer<typeof UpdateHierarchyRequestSchema>;

export interface HierarchySummary {
  id: string;
  hierarchyCode: string;
  hierarchyType: string;
  hierarchyLevel: number;
  reportingHierarchyId: string | null;
  parentHierarchyCode: string | null;
  active: boolean;
}

export interface HierarchyTreeNode extends HierarchySummary {
  children: HierarchyTreeNode[];
}
