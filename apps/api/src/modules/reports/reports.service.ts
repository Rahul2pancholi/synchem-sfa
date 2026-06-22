import { Injectable } from '@nestjs/common';
import { apiSuccess, ReportFilterSchema } from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dcrSummary(compCode: string, query: unknown) {
    const parsed = ReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;

    const employees = await this.prisma.employee.findMany({
      where: { compCode, active: true },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });

    const dcrs = await this.prisma.dailyCallReport.findMany({
      where: {
        compCode,
        ...(month && year
          ? {
              workDate: {
                gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
                lt: new Date(
                  month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`,
                ),
              },
            }
          : {}),
      },
      include: { _count: { select: { doctorVisits: true } } },
    });

    const byEmp = new Map<
      string,
      { total: number; approved: number; pending: number; doctorVisits: number }
    >();

    for (const dcr of dcrs) {
      const current = byEmp.get(dcr.empId) ?? {
        total: 0,
        approved: 0,
        pending: 0,
        doctorVisits: 0,
      };
      current.total += 1;
      if (dcr.approveStatus === 'APPROVED') current.approved += 1;
      if (dcr.approveStatus === 'SUBMITTED' || dcr.approveStatus === 'PENDING') {
        current.pending += 1;
      }
      current.doctorVisits += dcr._count.doctorVisits;
      byEmp.set(dcr.empId, current);
    }

    const items = employees
      .map((emp) => {
        const stats = byEmp.get(emp.id);
        if (!stats) return null;
        return {
          empId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName ?? ''}`.trim(),
          employeeCode: emp.employeeCode,
          totalDcrs: stats.total,
          approvedDcrs: stats.approved,
          pendingDcrs: stats.pending,
          totalDoctorVisits: stats.doctorVisits,
        };
      })
      .filter(Boolean);

    return apiSuccess({ items });
  }

  async expenseSummary(compCode: string, query: unknown) {
    const parsed = ReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;

    const rows = await this.prisma.expenseStatement.findMany({
      where: {
        compCode,
        ...(month ? { claimMonth: month } : {}),
        ...(year ? { claimYear: year } : {}),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
    });

    return apiSuccess({
      items: rows.map((row) => ({
        empId: row.empId,
        employeeName: `${row.employee.firstName} ${row.employee.lastName ?? ''}`.trim(),
        employeeCode: row.employee.employeeCode,
        claimMonth: row.claimMonth,
        claimYear: row.claimYear,
        totalAmount: Number(row.totalAmount),
        approveStatus: row.approveStatus,
      })),
    });
  }

  async employeePob(compCode: string, query: unknown) {
    const parsed = ReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;

    const rows = await this.prisma.personalOrderBooking.findMany({
      where: {
        compCode,
        ...(month && year
          ? {
              orderDate: {
                gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
                lt: new Date(
                  month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`,
                ),
              },
            }
          : {}),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
    });

    const byEmp = new Map<string, { count: number; total: number; employee: (typeof rows)[0]['employee'] }>();
    for (const row of rows) {
      const current = byEmp.get(row.empId) ?? { count: 0, total: 0, employee: row.employee };
      current.count += 1;
      current.total += Number(row.totalAmount);
      byEmp.set(row.empId, current);
    }

    return apiSuccess({
      items: [...byEmp.entries()].map(([empId, stats]) => ({
        empId,
        employeeName: `${stats.employee.firstName} ${stats.employee.lastName ?? ''}`.trim(),
        employeeCode: stats.employee.employeeCode,
        orderCount: stats.count,
        totalAmount: stats.total,
      })),
    });
  }
}
