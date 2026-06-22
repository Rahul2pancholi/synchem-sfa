import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { apiSuccess, CreateExpenseStatementSchema } from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { ApprovalService } from '../approvals/approval.service';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
  ) {}

  async listStatements(compCode: string, empId: string) {
    const rows = await this.prisma.expenseStatement.findMany({
      where: { compCode, empId },
      orderBy: [{ claimYear: 'desc' }, { claimMonth: 'desc' }],
      include: { _count: { select: { lines: true } } },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        claimMonth: row.claimMonth,
        claimYear: row.claimYear,
        totalAmount: Number(row.totalAmount),
        approveStatus: row.approveStatus,
        lineCount: row._count.lines,
      })),
    });
  }

  async getStatement(compCode: string, empId: string, id: string) {
    const row = await this.prisma.expenseStatement.findFirst({
      where: { compCode, empId, id },
      include: { lines: true },
    });
    if (!row) throw new NotFoundException('Expense statement not found');

    return apiSuccess({
      id: row.id,
      claimMonth: row.claimMonth,
      claimYear: row.claimYear,
      totalAmount: Number(row.totalAmount),
      approveStatus: row.approveStatus,
      lineCount: row.lines.length,
      lines: row.lines.map((line) => ({
        id: line.id,
        expenseHeadId: line.expenseHeadId,
        description: line.description,
        amount: Number(line.amount),
      })),
    });
  }

  async createStatement(compCode: string, empId: string, body: unknown) {
    const parsed = CreateExpenseStatementSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const existing = await this.prisma.expenseStatement.findFirst({
      where: {
        compCode,
        empId,
        claimMonth: parsed.data.claimMonth,
        claimYear: parsed.data.claimYear,
      },
    });
    if (existing) {
      throw new ConflictException('Expense statement already exists for this month');
    }

    const totalAmount = parsed.data.lines.reduce((sum, line) => sum + line.amount, 0);

    const created = await this.prisma.$transaction(async (tx) => {
      const statement = await tx.expenseStatement.create({
        data: {
          compCode,
          empId,
          claimMonth: parsed.data.claimMonth,
          claimYear: parsed.data.claimYear,
          totalAmount,
          approveStatus: 'DRAFT',
        },
      });

      for (const line of parsed.data.lines) {
        await tx.expenseStatementLine.create({
          data: {
            compCode,
            statementId: statement.id,
            expenseHeadId: line.expenseHeadId ?? null,
            description: line.description,
            amount: line.amount,
          },
        });
      }

      return statement;
    });

    return apiSuccess({ id: created.id }, 201);
  }

  async submitStatement(compCode: string, empId: string, id: string) {
    await this.assertStatement(compCode, empId, id);
    await this.approvals.submitForApproval(compCode, 'EXPENSE', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  private async assertStatement(compCode: string, empId: string, id: string) {
    const row = await this.prisma.expenseStatement.findFirst({
      where: { compCode, empId, id },
    });
    if (!row) throw new NotFoundException('Expense statement not found');
    return row;
  }
}
