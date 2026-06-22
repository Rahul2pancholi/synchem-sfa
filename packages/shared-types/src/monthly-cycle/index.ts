import { z } from 'zod';

export const LeaveTypeSchema = z.enum(['CL', 'SL', 'PL']);

export const CreateLeaveApplicationSchema = z.object({
  leaveType: LeaveTypeSchema,
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
});

export const UpsertLeavePolicySchema = z.object({
  leaveType: LeaveTypeSchema,
  annualQuota: z.number().int().min(0).max(365),
  carryForwardLimit: z.number().int().min(0).max(365).default(0),
  active: z.boolean().default(true),
});

export const ExpenseLineSchema = z.object({
  expenseHeadId: z.string().uuid().optional(),
  description: z.string().min(1).max(255),
  amount: z.number().nonnegative(),
});

export const CreateExpenseStatementSchema = z.object({
  claimMonth: z.number().int().min(1).max(12),
  claimYear: z.number().int().min(2020).max(2100),
  lines: z.array(ExpenseLineSchema).min(1),
});

export type LeaveType = z.infer<typeof LeaveTypeSchema>;
export type CreateLeaveApplicationRequest = z.infer<typeof CreateLeaveApplicationSchema>;
export type UpsertLeavePolicyRequest = z.infer<typeof UpsertLeavePolicySchema>;
export type CreateExpenseStatementRequest = z.infer<typeof CreateExpenseStatementSchema>;

export interface LeaveBalanceSummary {
  leaveType: LeaveType;
  policyYear: number;
  balance: number;
  annualQuota: number;
}

export interface LeaveApplicationSummary {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string | null;
  balanceBefore: number | null;
  approveStatus: string;
}

export interface LeavePolicySummary {
  id: string;
  leaveType: string;
  annualQuota: number;
  carryForwardLimit: number;
  active: boolean;
}

export interface ExpenseStatementSummary {
  id: string;
  claimMonth: number;
  claimYear: number;
  totalAmount: number;
  approveStatus: string;
  lineCount: number;
}

export interface ExpenseStatementLineSummary {
  id: string;
  expenseHeadId: string | null;
  description: string;
  amount: number;
}

export interface ExpenseStatementDetail extends ExpenseStatementSummary {
  lines: ExpenseStatementLineSummary[];
}
