import { z } from 'zod';

export const ApprovalEntityTypeSchema = z.enum([
  'DCR',
  'RTP',
  'WEEKLY_PLAN',
  'LEAVE',
  'EXPENSE',
]);

export const ApprovalDecisionRequestSchema = z.object({
  remarks: z.string().max(500).optional(),
});

export type ApprovalEntityType = z.infer<typeof ApprovalEntityTypeSchema>;

export interface ApprovalEntityConfig {
  entityType: ApprovalEntityType;
  menuCode: string;
  labelKey: string;
}

export const APPROVAL_ENTITY_CONFIG: Record<ApprovalEntityType, ApprovalEntityConfig> = {
  DCR: { entityType: 'DCR', menuCode: 'APP01', labelKey: 'approval.dcr.title' },
  RTP: { entityType: 'RTP', menuCode: 'TRN02', labelKey: 'approval.rtp.title' },
  WEEKLY_PLAN: {
    entityType: 'WEEKLY_PLAN',
    menuCode: 'APP04',
    labelKey: 'approval.weekly.title',
  },
  LEAVE: { entityType: 'LEAVE', menuCode: 'TRN10', labelKey: 'approval.leave.title' },
  EXPENSE: { entityType: 'EXPENSE', menuCode: 'TRN21', labelKey: 'approval.expense.title' },
};

export interface ApprovalPendingItem {
  id: string;
  entityType: ApprovalEntityType;
  entityId: string;
  status: string;
  submittedAt: string;
  submittedBy: string;
  submitterName: string;
  submitterUserName: string;
  summary: string;
  remarks: string | null;
}

export interface ApprovalSummary {
  dcr: number;
  rtp: number;
  weeklyPlan: number;
  leave: number;
  expense: number;
  total: number;
}
