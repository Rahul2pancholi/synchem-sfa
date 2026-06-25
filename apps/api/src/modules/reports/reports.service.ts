import { Injectable } from '@nestjs/common';
import { apiSuccess, ReportFilterSchema, SalesSummaryFilterSchema, TargetAchievementFilterSchema, VisitSummaryFilterSchema, MissedCallsFilterSchema, MonthlyCoveredDoctorFilterSchema, RtpSummaryFilterSchema, DoctorReportFilterSchema, EmployeeAttendanceFilterSchema, EmployeeAnalysisFilterSchema } from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private monthDateRange(month: number, year: number) {
    return {
      gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
      lt: new Date(
        month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`,
      ),
    };
  }

  private pct(actual: number, target: number) {
    return target > 0 ? Math.round((actual / target) * 100) : 0;
  }

  private dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private leaveDaysInMonth(fromDate: Date, toDate: Date, month: number, year: number) {
    const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const monthEnd = new Date(
      month === 12 ? `${year + 1}-01-01T00:00:00.000Z` : `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00.000Z`,
    );
    const rangeStart = fromDate > monthStart ? fromDate : monthStart;
    const rangeEnd = toDate < new Date(monthEnd.getTime() - 86_400_000) ? toDate : new Date(monthEnd.getTime() - 86_400_000);
    if (rangeStart > rangeEnd) {
      return 0;
    }

    let days = 0;
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      days += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }

  private async plannedDoctorCallsByEmp(
    compCode: string,
    dateRange: { gte: Date; lt: Date },
    filters: { empId?: string; headQuarterId?: string },
  ) {
    const plans = await this.prisma.weeklyPlan.findMany({
      where: {
        compCode,
        approveStatus: 'APPROVED',
        ...(filters.empId ? { empId: filters.empId } : {}),
        ...(filters.headQuarterId ? { employee: { headQuarterId: filters.headQuarterId } } : {}),
        entries: { some: { planDate: dateRange } },
      },
      include: {
        entries: {
          where: { planDate: dateRange, doctorId: { not: null } },
        },
      },
    });

    const byEmp = new Map<string, number>();
    for (const plan of plans) {
      byEmp.set(plan.empId, (byEmp.get(plan.empId) ?? 0) + plan.entries.length);
    }
    return byEmp;
  }

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
        ...(month && year ? { workDate: this.monthDateRange(month, year) } : {}),
      },
      include: { _count: { select: { doctorVisits: true, retailerVisits: true } } },
    });

    const plannedByEmp =
      month && year
        ? await this.plannedDoctorCallsByEmp(compCode, this.monthDateRange(month, year), {})
        : new Map<string, number>();

    const byEmp = new Map<
      string,
      {
        total: number;
        approved: number;
        pending: number;
        doctorVisits: number;
        retailerVisits: number;
        approvedDoctorVisits: number;
      }
    >();

    for (const dcr of dcrs) {
      const current = byEmp.get(dcr.empId) ?? {
        total: 0,
        approved: 0,
        pending: 0,
        doctorVisits: 0,
        retailerVisits: 0,
        approvedDoctorVisits: 0,
      };
      current.total += 1;
      if (dcr.approveStatus === 'APPROVED') {
        current.approved += 1;
        current.approvedDoctorVisits += dcr._count.doctorVisits;
      }
      if (dcr.approveStatus === 'SUBMITTED' || dcr.approveStatus === 'PENDING') {
        current.pending += 1;
      }
      current.doctorVisits += dcr._count.doctorVisits;
      current.retailerVisits += dcr._count.retailerVisits;
      byEmp.set(dcr.empId, current);
    }

    const items = employees
      .map((emp) => {
        const stats = byEmp.get(emp.id);
        if (!stats) return null;
        const plannedDoctorCalls = plannedByEmp.get(emp.id) ?? 0;
        return {
          empId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName ?? ''}`.trim(),
          employeeCode: emp.employeeCode,
          totalDcrs: stats.total,
          approvedDcrs: stats.approved,
          pendingDcrs: stats.pending,
          totalDoctorVisits: stats.doctorVisits,
          totalRetailerVisits: stats.retailerVisits,
          approvedDoctorVisits: stats.approvedDoctorVisits,
          plannedDoctorCalls,
          coveragePct: this.pct(stats.approvedDoctorVisits, plannedDoctorCalls),
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

  async salesSummary(compCode: string, query: unknown) {
    const parsed = SalesSummaryFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;
    const divisionId = parsed.success ? parsed.data.divisionId : undefined;
    const productId = parsed.success ? parsed.data.productId : undefined;
    const hasLineFilter = Boolean(divisionId || productId);

    const productDivisionById = new Map(
      (
        await this.prisma.product.findMany({
          where: { compCode, deletedAt: null },
          select: { id: true, divisionId: true },
        })
      ).map((product) => [product.id, product.divisionId] as const),
    );

    const rows = await this.prisma.personalOrderBooking.findMany({
      where: {
        compCode,
        ...(empId ? { empId } : {}),
        ...(headQuarterId ? { employee: { headQuarterId } } : {}),
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
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            headQuarterId: true,
            headQuarter: { select: { hqName: true } },
          },
        },
        lines: true,
      },
    });

    const lineMatchesFilters = (line: { productId: string }) => {
      if (productId && line.productId !== productId) return false;
      if (divisionId && productDivisionById.get(line.productId) !== divisionId) return false;
      return true;
    };

    type EmpStats = {
      employee: (typeof rows)[0]['employee'];
      orderIds: Set<string>;
      approvedOrderIds: Set<string>;
      totalQty: number;
      totalAmount: number;
      approvedAmount: number;
    };

    const byEmp = new Map<string, EmpStats>();

    for (const pob of rows) {
      const matchingLines = pob.lines.filter(lineMatchesFilters);

      if (hasLineFilter && matchingLines.length === 0) {
        continue;
      }

      const lineQty = matchingLines.reduce((sum, line) => sum + line.qty, 0);
      const lineAmount = hasLineFilter
        ? matchingLines.reduce((sum, line) => sum + Number(line.amount), 0)
        : Number(pob.totalAmount);
      const isApproved = pob.approveStatus === 'APPROVED';

      const current = byEmp.get(pob.empId) ?? {
        employee: pob.employee,
        orderIds: new Set<string>(),
        approvedOrderIds: new Set<string>(),
        totalQty: 0,
        totalAmount: 0,
        approvedAmount: 0,
      };

      current.orderIds.add(pob.id);
      if (isApproved) {
        current.approvedOrderIds.add(pob.id);
        current.approvedAmount += lineAmount;
      }
      current.totalQty += hasLineFilter ? lineQty : pob.lines.reduce((sum, line) => sum + line.qty, 0);
      current.totalAmount += lineAmount;
      byEmp.set(pob.empId, current);
    }

    const items = [...byEmp.entries()]
      .map(([empId, stats]) => ({
        empId,
        employeeName: `${stats.employee.firstName} ${stats.employee.lastName ?? ''}`.trim(),
        employeeCode: stats.employee.employeeCode,
        headQuarterId: stats.employee.headQuarterId,
        headQuarterName: stats.employee.headQuarter?.hqName ?? null,
        orderCount: stats.orderIds.size,
        totalQty: stats.totalQty,
        totalAmount: stats.totalAmount,
        approvedAmount: stats.approvedAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const summary = items.reduce(
      (acc, row) => {
        acc.totalQty += row.totalQty;
        acc.totalAmount += row.totalAmount;
        acc.approvedAmount += row.approvedAmount;
        return acc;
      },
      { orderCount: 0, totalQty: 0, totalAmount: 0, approvedOrderCount: 0, approvedAmount: 0 },
    );

    summary.orderCount = rows.filter((pob) => {
      if (hasLineFilter) {
        return pob.lines.some(lineMatchesFilters);
      }
      return true;
    }).length;

    summary.approvedOrderCount = rows.filter((pob) => {
      if (pob.approveStatus !== 'APPROVED') return false;
      if (!hasLineFilter) return true;
      return pob.lines.some(lineMatchesFilters);
    }).length;

    return apiSuccess({ summary, items });
  }

  async targetAchievement(compCode: string, query: unknown) {
    const parsed = TargetAchievementFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          amountTarget: 0,
          actualAmount: 0,
          achievementPct: 0,
          callTarget: 0,
          actualCalls: 0,
          callAchievementPct: 0,
        },
        items: [],
      });
    }

    const dateRange = this.monthDateRange(month, year);

    const targets = await this.prisma.employeeMonthlyTarget.findMany({
      where: {
        compCode,
        targetMonth: month,
        targetYear: year,
        ...(empId ? { empId } : {}),
        ...(headQuarterId ? { employee: { headQuarterId } } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            headQuarter: { select: { hqName: true } },
          },
        },
      },
    });

    const approvedPobs = await this.prisma.personalOrderBooking.findMany({
      where: {
        compCode,
        approveStatus: 'APPROVED',
        orderDate: dateRange,
        ...(empId ? { empId } : {}),
        ...(headQuarterId ? { employee: { headQuarterId } } : {}),
      },
      select: { empId: true, totalAmount: true },
    });

    const dcrs = await this.prisma.dailyCallReport.findMany({
      where: {
        compCode,
        approveStatus: 'APPROVED',
        workDate: dateRange,
        ...(empId ? { empId } : {}),
        ...(headQuarterId ? { employee: { headQuarterId } } : {}),
      },
      include: { _count: { select: { doctorVisits: true } } },
    });

    const actualAmountByEmp = new Map<string, { amount: number; pobCount: number }>();
    for (const pob of approvedPobs) {
      const current = actualAmountByEmp.get(pob.empId) ?? { amount: 0, pobCount: 0 };
      current.amount += Number(pob.totalAmount);
      current.pobCount += 1;
      actualAmountByEmp.set(pob.empId, current);
    }

    const actualCallsByEmp = new Map<string, number>();
    for (const dcr of dcrs) {
      actualCallsByEmp.set(dcr.empId, (actualCallsByEmp.get(dcr.empId) ?? 0) + dcr._count.doctorVisits);
    }

    const targetByEmp = new Map(targets.map((row) => [row.empId, row]));
    const empIds = new Set<string>([
      ...targets.map((row) => row.empId),
      ...approvedPobs.map((row) => row.empId),
      ...dcrs.map((row) => row.empId),
    ]);

    const missingEmpIds = [...empIds].filter((id) => !targetByEmp.has(id));
    const extraEmployees =
      missingEmpIds.length > 0
        ? await this.prisma.employee.findMany({
            where: { compCode, id: { in: missingEmpIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              headQuarter: { select: { hqName: true } },
            },
          })
        : [];

    const employeeById = new Map(extraEmployees.map((row) => [row.id, row]));
    for (const target of targets) {
      employeeById.set(target.empId, target.employee);
    }

    const pct = (actual: number, target: number) =>
      target > 0 ? Math.round((actual / target) * 100) : 0;

    const items = [...empIds]
      .map((id) => {
        const target = targetByEmp.get(id);
        const employee = employeeById.get(id);
        const actual = actualAmountByEmp.get(id) ?? { amount: 0, pobCount: 0 };
        const actualCalls = actualCallsByEmp.get(id) ?? 0;
        const amountTarget = target ? Number(target.amountTarget) : 0;
        const callTarget = target?.callTarget ?? null;
        const pobTarget = target?.pobTarget ?? null;

        if (!employee) {
          return null;
        }

        const employeeName = `${employee.firstName} ${employee.lastName ?? ''}`.trim();

        return {
          empId: id,
          employeeName,
          employeeCode: employee.employeeCode,
          headQuarterName: employee.headQuarter?.hqName ?? null,
          amountTarget,
          actualAmount: actual.amount,
          achievementPct: pct(actual.amount, amountTarget),
          gapAmount: amountTarget - actual.amount,
          callTarget,
          actualCalls,
          callAchievementPct: callTarget ? pct(actualCalls, callTarget) : null,
          pobTarget,
          actualPobCount: actual.pobCount,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter((row) => row.amountTarget > 0 || row.actualAmount > 0 || row.actualCalls > 0)
      .sort((a, b) => b.achievementPct - a.achievementPct);

    const summary = items.reduce(
      (acc, row) => {
        acc.amountTarget += row.amountTarget;
        acc.actualAmount += row.actualAmount;
        acc.callTarget += row.callTarget ?? 0;
        acc.actualCalls += row.actualCalls;
        return acc;
      },
      {
        amountTarget: 0,
        actualAmount: 0,
        achievementPct: 0,
        callTarget: 0,
        actualCalls: 0,
        callAchievementPct: 0,
      },
    );

    summary.achievementPct = pct(summary.actualAmount, summary.amountTarget);
    summary.callAchievementPct = pct(summary.actualCalls, summary.callTarget);

    return apiSuccess({ summary, items });
  }

  async visitSummary(compCode: string, query: unknown) {
    const parsed = VisitSummaryFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          doctorVisits: 0,
          retailerVisits: 0,
          totalVisits: 0,
          plannedDoctorCalls: 0,
          coveragePct: 0,
        },
        items: [],
      });
    }

    const dateRange = this.monthDateRange(month, year);
    const filters = { empId, headQuarterId };

    const dcrs = await this.prisma.dailyCallReport.findMany({
      where: {
        compCode,
        approveStatus: 'APPROVED',
        workDate: dateRange,
        ...(empId ? { empId } : {}),
        ...(headQuarterId ? { employee: { headQuarterId } } : {}),
      },
      include: {
        _count: { select: { doctorVisits: true, retailerVisits: true } },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            headQuarter: { select: { hqName: true } },
          },
        },
      },
    });

    const plannedByEmp = await this.plannedDoctorCallsByEmp(compCode, dateRange, filters);

    type EmployeeInfo = {
      id: string;
      firstName: string;
      lastName: string | null;
      employeeCode: string | null;
      headQuarter: { hqName: string } | null;
    };

    type VisitStats = {
      employee?: EmployeeInfo;
      doctorVisits: number;
      retailerVisits: number;
    };

    const byEmp = new Map<string, VisitStats>();
    for (const dcr of dcrs) {
      const current = byEmp.get(dcr.empId) ?? {
        employee: dcr.employee,
        doctorVisits: 0,
        retailerVisits: 0,
      };
      current.doctorVisits += dcr._count.doctorVisits;
      current.retailerVisits += dcr._count.retailerVisits;
      byEmp.set(dcr.empId, current);
    }

    const missingEmpIds = [...plannedByEmp.keys()].filter((id) => !byEmp.has(id));
    if (missingEmpIds.length > 0) {
      const employees = await this.prisma.employee.findMany({
        where: { compCode, id: { in: missingEmpIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          headQuarter: { select: { hqName: true } },
        },
      });
      for (const employee of employees) {
        byEmp.set(employee.id, { employee, doctorVisits: 0, retailerVisits: 0 });
      }
    }

    const items = [...byEmp.entries()]
      .map(([id, stats]) => {
        if (!stats.employee) return null;
        const plannedDoctorCalls = plannedByEmp.get(id) ?? 0;
        return {
          empId: id,
          employeeName: `${stats.employee.firstName} ${stats.employee.lastName ?? ''}`.trim(),
          employeeCode: stats.employee.employeeCode,
          headQuarterName: stats.employee.headQuarter?.hqName ?? null,
          doctorVisits: stats.doctorVisits,
          retailerVisits: stats.retailerVisits,
          totalVisits: stats.doctorVisits + stats.retailerVisits,
          plannedDoctorCalls,
          coveragePct: this.pct(stats.doctorVisits, plannedDoctorCalls),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter((row) => row.totalVisits > 0 || row.plannedDoctorCalls > 0)
      .sort((a, b) => b.totalVisits - a.totalVisits);

    const summary = items.reduce(
      (acc, row) => {
        acc.doctorVisits += row.doctorVisits;
        acc.retailerVisits += row.retailerVisits;
        acc.totalVisits += row.totalVisits;
        acc.plannedDoctorCalls += row.plannedDoctorCalls;
        return acc;
      },
      {
        doctorVisits: 0,
        retailerVisits: 0,
        totalVisits: 0,
        plannedDoctorCalls: 0,
        coveragePct: 0,
      },
    );

    summary.coveragePct = this.pct(summary.doctorVisits, summary.plannedDoctorCalls);

    return apiSuccess({ summary, items });
  }

  private async buildMissedCallsData(
    compCode: string,
    month: number,
    year: number,
    filters: { empId?: string; headQuarterId?: string },
  ) {
    const dateRange = this.monthDateRange(month, year);

    const [plannedEntries, doctorVisits] = await Promise.all([
      this.prisma.weeklyPlanEntry.findMany({
        where: {
          compCode,
          doctorId: { not: null },
          planDate: dateRange,
          weeklyPlan: {
            approveStatus: 'APPROVED',
            ...(filters.empId ? { empId: filters.empId } : {}),
            ...(filters.headQuarterId ? { employee: { headQuarterId: filters.headQuarterId } } : {}),
          },
        },
        include: {
          weeklyPlan: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true,
                  headQuarter: { select: { hqName: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.dcrDoctorVisit.findMany({
        where: {
          compCode,
          dcr: {
            approveStatus: 'APPROVED',
            workDate: dateRange,
            ...(filters.empId ? { empId: filters.empId } : {}),
            ...(filters.headQuarterId ? { employee: { headQuarterId: filters.headQuarterId } } : {}),
          },
        },
        select: {
          doctorId: true,
          dcr: { select: { empId: true, workDate: true } },
        },
      }),
    ]);

    const visitedKeys = new Set(
      doctorVisits.map(
        (visit) =>
          `${visit.dcr.empId}|${visit.doctorId}|${this.dateKey(visit.dcr.workDate)}`,
      ),
    );

    const doctorIds = [
      ...new Set(
        plannedEntries
          .map((entry) => entry.doctorId)
          .filter((id): id is string => id !== null),
      ),
    ];

    const doctors =
      doctorIds.length > 0
        ? await this.prisma.doctor.findMany({
            where: { compCode, id: { in: doctorIds } },
            select: { id: true, doctorName: true },
          })
        : [];

    const doctorNameById = new Map(doctors.map((d) => [d.id, d.doctorName]));

    const items = plannedEntries
      .filter((entry) => entry.doctorId)
      .filter((entry) => {
        const key = `${entry.weeklyPlan.empId}|${entry.doctorId}|${this.dateKey(entry.planDate)}`;
        return !visitedKeys.has(key);
      })
      .map((entry) => {
        const employee = entry.weeklyPlan.employee;
        return {
          empId: entry.weeklyPlan.empId,
          employeeName: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
          employeeCode: employee.employeeCode,
          headQuarterName: employee.headQuarter?.hqName ?? null,
          doctorId: entry.doctorId!,
          doctorName: doctorNameById.get(entry.doctorId!) ?? '—',
          plannedDate: this.dateKey(entry.planDate),
        };
      })
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate) || a.doctorName.localeCompare(b.doctorName));

    const summary = {
      missedCallCount: items.length,
      uniqueDoctors: new Set(items.map((row) => row.doctorId)).size,
      uniqueEmployees: new Set(items.map((row) => row.empId)).size,
    };

    return { summary, items };
  }

  async missedCalls(compCode: string, query: unknown) {
    const parsed = MissedCallsFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: { missedCallCount: 0, uniqueDoctors: 0, uniqueEmployees: 0 },
        items: [],
      });
    }

    const { summary, items } = await this.buildMissedCallsData(compCode, month, year, {
      empId,
      headQuarterId,
    });

    return apiSuccess({ summary, items });
  }

  async managerSalesKpis(compCode: string, query: unknown) {
    const now = new Date();
    const parsed = ReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success && parsed.data.month ? parsed.data.month : now.getMonth() + 1;
    const year = parsed.success && parsed.data.year ? parsed.data.year : now.getFullYear();
    const dateRange = this.monthDateRange(month, year);

    const [pobAgg, targetAgg, approvedDcrs, plannedByEmp, missed] = await Promise.all([
      this.prisma.personalOrderBooking.aggregate({
        where: { compCode, approveStatus: 'APPROVED', orderDate: dateRange },
        _sum: { totalAmount: true },
      }),
      this.prisma.employeeMonthlyTarget.aggregate({
        where: { compCode, targetMonth: month, targetYear: year },
        _sum: { amountTarget: true },
      }),
      this.prisma.dailyCallReport.findMany({
        where: { compCode, approveStatus: 'APPROVED', workDate: dateRange },
        select: { _count: { select: { doctorVisits: true } } },
      }),
      this.plannedDoctorCallsByEmp(compCode, dateRange, {}),
      this.buildMissedCallsData(compCode, month, year, {}),
    ]);

    const pobApprovedAmount = Number(pobAgg._sum.totalAmount ?? 0);
    const amountTarget = Number(targetAgg._sum.amountTarget ?? 0);
    const doctorVisits = approvedDcrs.reduce((sum, row) => sum + row._count.doctorVisits, 0);
    const plannedDoctorCalls = [...plannedByEmp.values()].reduce((sum, count) => sum + count, 0);

    const payload = {
      month,
      year,
      pobApprovedAmount,
      amountTarget,
      pobAchievementPct: this.pct(pobApprovedAmount, amountTarget),
      doctorVisits,
      plannedDoctorCalls,
      coveragePct: this.pct(doctorVisits, plannedDoctorCalls),
      missedCallCount: missed.summary.missedCallCount,
    };

    return apiSuccess(payload);
  }

  async rtpSummary(compCode: string, query: unknown) {
    const parsed = RtpSummaryFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          totalSubmitted: 0,
          approvedCount: 0,
          pendingCount: 0,
          draftCount: 0,
          notSubmittedCount: 0,
        },
        items: [],
      });
    }

    const employeeWhere = {
      compCode,
      active: true,
      ...(empId ? { id: empId } : {}),
      ...(headQuarterId ? { headQuarterId } : {}),
    };

    const [programmes, activeEmployeeCount] = await Promise.all([
      this.prisma.tourProgramme.findMany({
        where: {
          compCode,
          planMonth: month,
          planYear: year,
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        include: {
          days: { select: { workType: true } },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              headQuarter: { select: { hqName: true } },
            },
          },
        },
      }),
      this.prisma.employee.count({ where: employeeWhere }),
    ]);

    const items = programmes
      .map((rtp) => {
        const employee = rtp.employee;
        const fieldDays = rtp.days.filter((day) => day.workType === 'FIELD').length;
        return {
          empId: rtp.empId,
          employeeName: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
          employeeCode: employee.employeeCode,
          headQuarterName: employee.headQuarter?.hqName ?? null,
          approveStatus: rtp.approveStatus,
          fieldDays,
          totalPlanDays: rtp.days.length,
          submittedAt: rtp.submittedAt ? this.dateKey(rtp.submittedAt) : null,
        };
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    const summary = {
      totalSubmitted: programmes.length,
      approvedCount: programmes.filter((row) => row.approveStatus === 'APPROVED').length,
      pendingCount: programmes.filter(
        (row) => row.approveStatus === 'SUBMITTED' || row.approveStatus === 'PENDING',
      ).length,
      draftCount: programmes.filter((row) => row.approveStatus === 'DRAFT').length,
      notSubmittedCount: Math.max(0, activeEmployeeCount - programmes.length),
    };

    return apiSuccess({ summary, items });
  }

  async doctorReport(compCode: string, query: unknown) {
    const parsed = DoctorReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;
    const routeId = parsed.success ? parsed.data.routeId : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const dateRange = month && year ? this.monthDateRange(month, year) : undefined;

    const doctors = await this.prisma.doctor.findMany({
      where: {
        compCode,
        deletedAt: null,
        active: true,
        ...(routeId ? { routeId } : {}),
        ...(headQuarterId ? { route: { headQuarterId } } : {}),
      },
      select: {
        id: true,
        doctorName: true,
        mobileNo: true,
        approveStatus: true,
        route: {
          select: {
            routeName: true,
            headQuarter: { select: { hqName: true } },
          },
        },
        specialist: { select: { specialistName: true } },
      },
      orderBy: { doctorName: 'asc' },
      take: 5000,
    });

    const doctorIds = doctors.map((doctor) => doctor.id);
    const dcrFilter = {
      approveStatus: 'APPROVED' as const,
      ...(empId ? { empId } : {}),
    };

    const [periodVisits, lastVisits] =
      doctorIds.length === 0
        ? [[], []]
        : await Promise.all([
            this.prisma.dcrDoctorVisit.findMany({
              where: {
                compCode,
                doctorId: { in: doctorIds },
                dcr: {
                  ...dcrFilter,
                  ...(dateRange ? { workDate: dateRange } : {}),
                },
              },
              select: {
                doctorId: true,
                dcr: { select: { workDate: true } },
              },
            }),
            dateRange
              ? this.prisma.dcrDoctorVisit.findMany({
                  where: {
                    compCode,
                    doctorId: { in: doctorIds },
                    dcr: dcrFilter,
                  },
                  select: {
                    doctorId: true,
                    dcr: { select: { workDate: true } },
                  },
                })
              : Promise.resolve([]),
          ]);

    const visitsForLast = dateRange ? lastVisits : periodVisits;

    const countByDoctor = new Map<string, number>();
    for (const visit of periodVisits) {
      countByDoctor.set(visit.doctorId, (countByDoctor.get(visit.doctorId) ?? 0) + 1);
    }

    const lastByDoctor = new Map<string, string>();
    for (const visit of visitsForLast) {
      const visitDate = this.dateKey(visit.dcr.workDate);
      const current = lastByDoctor.get(visit.doctorId);
      if (!current || visitDate > current) {
        lastByDoctor.set(visit.doctorId, visitDate);
      }
    }

    const items = doctors.map((doctor) => ({
      doctorId: doctor.id,
      doctorName: doctor.doctorName,
      routeName: doctor.route?.routeName ?? null,
      headQuarterName: doctor.route?.headQuarter?.hqName ?? null,
      specialistName: doctor.specialist?.specialistName ?? null,
      mobileNo: doctor.mobileNo,
      approveStatus: doctor.approveStatus,
      visitCount: countByDoctor.get(doctor.id) ?? 0,
      lastVisitDate: lastByDoctor.get(doctor.id) ?? null,
    }));

    const summary = {
      totalDoctors: items.length,
      visitedInPeriod: items.filter((row) => row.visitCount > 0).length,
      totalVisits: periodVisits.length,
      neverVisited: items.filter((row) => !row.lastVisitDate).length,
    };

    return apiSuccess({ summary, items });
  }

  async employeeAttendance(compCode: string, query: unknown) {
    const parsed = EmployeeAttendanceFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          totalEmployees: 0,
          totalFieldDays: 0,
          totalLeaveDays: 0,
          holidaysInMonth: 0,
        },
        items: [],
      });
    }

    const dateRange = this.monthDateRange(month, year);
    const employeeWhere = {
      compCode,
      active: true,
      ...(empId ? { id: empId } : {}),
      ...(headQuarterId ? { headQuarterId } : {}),
    };

    const [employees, dcrs, leaveApplications, holidays, tourProgrammes] = await Promise.all([
      this.prisma.employee.findMany({
        where: employeeWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          headQuarter: { select: { hqName: true } },
        },
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.dailyCallReport.findMany({
        where: {
          compCode,
          approveStatus: 'APPROVED',
          workDate: dateRange,
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        select: { empId: true, workDate: true },
      }),
      this.prisma.leaveApplication.findMany({
        where: {
          compCode,
          approveStatus: 'APPROVED',
          fromDate: { lt: dateRange.lt },
          toDate: { gte: dateRange.gte },
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        select: { empId: true, fromDate: true, toDate: true },
      }),
      this.prisma.holiday.findMany({
        where: {
          compCode,
          active: true,
          holidayDate: dateRange,
        },
        select: { id: true },
      }),
      this.prisma.tourProgramme.findMany({
        where: {
          compCode,
          planMonth: month,
          planYear: year,
          approveStatus: 'APPROVED',
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        include: { days: { select: { workType: true } } },
      }),
    ]);

    const holidaysInMonth = holidays.length;
    const fieldDaysByEmp = new Map<string, number>();
    const fieldDayKeysByEmp = new Map<string, Set<string>>();

    for (const dcr of dcrs) {
      const keys = fieldDayKeysByEmp.get(dcr.empId) ?? new Set<string>();
      keys.add(this.dateKey(dcr.workDate));
      fieldDayKeysByEmp.set(dcr.empId, keys);
    }
    for (const [id, keys] of fieldDayKeysByEmp) {
      fieldDaysByEmp.set(id, keys.size);
    }

    const leaveDaysByEmp = new Map<string, number>();
    for (const leave of leaveApplications) {
      const days = this.leaveDaysInMonth(leave.fromDate, leave.toDate, month, year);
      leaveDaysByEmp.set(leave.empId, (leaveDaysByEmp.get(leave.empId) ?? 0) + days);
    }

    const plannedFieldDaysByEmp = new Map<string, number>();
    const meetingDaysByEmp = new Map<string, number>();
    for (const programme of tourProgrammes) {
      const fieldDays = programme.days.filter((day) => day.workType === 'FIELD').length;
      const meetingDays = programme.days.filter((day) => day.workType === 'MEETING').length;
      plannedFieldDaysByEmp.set(programme.empId, fieldDays);
      meetingDaysByEmp.set(programme.empId, meetingDays);
    }

    const items = employees.map((employee) => ({
      empId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
      employeeCode: employee.employeeCode,
      headQuarterName: employee.headQuarter?.hqName ?? null,
      fieldDays: fieldDaysByEmp.get(employee.id) ?? 0,
      leaveDays: leaveDaysByEmp.get(employee.id) ?? 0,
      holidayDays: holidaysInMonth,
      plannedFieldDays: plannedFieldDaysByEmp.get(employee.id) ?? 0,
      meetingDays: meetingDaysByEmp.get(employee.id) ?? 0,
    }));

    const summary = {
      totalEmployees: items.length,
      totalFieldDays: items.reduce((sum, row) => sum + row.fieldDays, 0),
      totalLeaveDays: items.reduce((sum, row) => sum + row.leaveDays, 0),
      holidaysInMonth,
    };

    return apiSuccess({ summary, items });
  }

  async employeeAnalysis(compCode: string, query: unknown) {
    const parsed = EmployeeAnalysisFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          totalEmployees: 0,
          avgCallAchievementPct: 0,
          avgPobAchievementPct: 0,
          avgCoveragePct: 0,
        },
        items: [],
      });
    }

    const dateRange = this.monthDateRange(month, year);
    const filters = { empId, headQuarterId };

    const [targets, approvedPobs, dcrs, plannedByEmp] = await Promise.all([
      this.prisma.employeeMonthlyTarget.findMany({
        where: {
          compCode,
          targetMonth: month,
          targetYear: year,
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              headQuarter: { select: { hqName: true } },
            },
          },
        },
      }),
      this.prisma.personalOrderBooking.findMany({
        where: {
          compCode,
          approveStatus: 'APPROVED',
          orderDate: dateRange,
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        select: { empId: true, totalAmount: true },
      }),
      this.prisma.dailyCallReport.findMany({
        where: {
          compCode,
          approveStatus: 'APPROVED',
          workDate: dateRange,
          ...(empId ? { empId } : {}),
          ...(headQuarterId ? { employee: { headQuarterId } } : {}),
        },
        select: { empId: true, workDate: true, _count: { select: { doctorVisits: true } } },
      }),
      this.plannedDoctorCallsByEmp(compCode, dateRange, filters),
    ]);

    const actualAmountByEmp = new Map<string, { amount: number; pobCount: number }>();
    for (const pob of approvedPobs) {
      const current = actualAmountByEmp.get(pob.empId) ?? { amount: 0, pobCount: 0 };
      current.amount += Number(pob.totalAmount);
      current.pobCount += 1;
      actualAmountByEmp.set(pob.empId, current);
    }

    const actualCallsByEmp = new Map<string, number>();
    const fieldDaysByEmp = new Map<string, Set<string>>();
    for (const dcr of dcrs) {
      actualCallsByEmp.set(dcr.empId, (actualCallsByEmp.get(dcr.empId) ?? 0) + dcr._count.doctorVisits);
      const keys = fieldDaysByEmp.get(dcr.empId) ?? new Set<string>();
      keys.add(this.dateKey(dcr.workDate));
      fieldDaysByEmp.set(dcr.empId, keys);
    }

    const targetByEmp = new Map(targets.map((row) => [row.empId, row]));
    const empIds = new Set<string>([
      ...targets.map((row) => row.empId),
      ...approvedPobs.map((row) => row.empId),
      ...dcrs.map((row) => row.empId),
      ...plannedByEmp.keys(),
    ]);

    const missingEmpIds = [...empIds].filter((id) => !targetByEmp.has(id));
    const extraEmployees =
      missingEmpIds.length > 0
        ? await this.prisma.employee.findMany({
            where: { compCode, id: { in: missingEmpIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              headQuarter: { select: { hqName: true } },
            },
          })
        : [];

    const employeeById = new Map(extraEmployees.map((row) => [row.id, row]));
    for (const target of targets) {
      employeeById.set(target.empId, target.employee);
    }

    const items = [...empIds]
      .map((id) => {
        const target = targetByEmp.get(id);
        const employee = employeeById.get(id);
        const actual = actualAmountByEmp.get(id) ?? { amount: 0, pobCount: 0 };
        const doctorVisits = actualCallsByEmp.get(id) ?? 0;
        const plannedDoctorCalls = plannedByEmp.get(id) ?? 0;
        const amountTarget = target ? Number(target.amountTarget) : 0;
        const callTarget = target?.callTarget ?? null;
        const pobTarget = target?.pobTarget ?? null;

        if (!employee) {
          return null;
        }

        const employeeName = `${employee.firstName} ${employee.lastName ?? ''}`.trim();

        return {
          empId: id,
          employeeName,
          employeeCode: employee.employeeCode,
          headQuarterName: employee.headQuarter?.hqName ?? null,
          fieldDays: fieldDaysByEmp.get(id)?.size ?? 0,
          doctorVisits,
          plannedDoctorCalls,
          coveragePct: this.pct(doctorVisits, plannedDoctorCalls),
          callTarget,
          callAchievementPct: callTarget ? this.pct(doctorVisits, callTarget) : null,
          amountTarget,
          actualAmount: actual.amount,
          pobAchievementPct: this.pct(actual.amount, amountTarget),
          pobCount: actual.pobCount,
          pobTarget,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter(
        (row) =>
          row.amountTarget > 0 ||
          row.actualAmount > 0 ||
          row.doctorVisits > 0 ||
          row.plannedDoctorCalls > 0,
      )
      .sort((a, b) => (b.callAchievementPct ?? 0) - (a.callAchievementPct ?? 0));

    const callPcts = items.map((row) => row.callAchievementPct).filter((v): v is number => v !== null);
    const pobPcts = items.filter((row) => row.amountTarget > 0).map((row) => row.pobAchievementPct);
    const coveragePcts = items.filter((row) => row.plannedDoctorCalls > 0).map((row) => row.coveragePct);

    const average = (values: number[]) =>
      values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

    const summary = {
      totalEmployees: items.length,
      avgCallAchievementPct: average(callPcts),
      avgPobAchievementPct: average(pobPcts),
      avgCoveragePct: average(coveragePcts),
    };

    return apiSuccess({ summary, items });
  }

  async monthlyCoveredDoctors(compCode: string, query: unknown) {
    const parsed = MonthlyCoveredDoctorFilterSchema.safeParse(query ?? {});
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;
    const empId = parsed.success ? parsed.data.empId : undefined;
    const headQuarterId = parsed.success ? parsed.data.headQuarterId : undefined;

    if (!month || !year) {
      return apiSuccess({
        summary: {
          coveredDoctors: 0,
          plannedDoctors: 0,
          coveragePct: 0,
          totalVisits: 0,
        },
        items: [],
      });
    }

    const dateRange = this.monthDateRange(month, year);

    const [plannedEntries, visits] = await Promise.all([
      this.prisma.weeklyPlanEntry.findMany({
        where: {
          compCode,
          doctorId: { not: null },
          planDate: dateRange,
          weeklyPlan: {
            approveStatus: 'APPROVED',
            ...(empId ? { empId } : {}),
            ...(headQuarterId ? { employee: { headQuarterId } } : {}),
          },
        },
        select: {
          doctorId: true,
          weeklyPlan: { select: { empId: true } },
        },
      }),
      this.prisma.dcrDoctorVisit.findMany({
        where: {
          compCode,
          dcr: {
            approveStatus: 'APPROVED',
            workDate: dateRange,
            ...(empId ? { empId } : {}),
            ...(headQuarterId ? { employee: { headQuarterId } } : {}),
          },
        },
        select: {
          doctorId: true,
          dcr: {
            select: {
              empId: true,
              workDate: true,
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true,
                  headQuarter: { select: { hqName: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    const plannedDoctorIds = new Set<string>();
    const plannedByEmpDoctor = new Set<string>();
    for (const entry of plannedEntries) {
      if (!entry.doctorId) continue;
      plannedDoctorIds.add(entry.doctorId);
      plannedByEmpDoctor.add(`${entry.weeklyPlan.empId}|${entry.doctorId}`);
    }

    type VisitAgg = {
      empId: string;
      doctorId: string;
      employeeName: string;
      employeeCode: string | null;
      headQuarterName: string | null;
      visitCount: number;
      firstVisitDate: string;
      lastVisitDate: string;
    };

    const byKey = new Map<string, VisitAgg>();
    for (const visit of visits) {
      const key = `${visit.dcr.empId}|${visit.doctorId}`;
      const visitDate = this.dateKey(visit.dcr.workDate);
      const employee = visit.dcr.employee;
      const employeeName = `${employee.firstName} ${employee.lastName ?? ''}`.trim();
      const current = byKey.get(key);
      if (!current) {
        byKey.set(key, {
          empId: visit.dcr.empId,
          doctorId: visit.doctorId,
          employeeName,
          employeeCode: employee.employeeCode,
          headQuarterName: employee.headQuarter?.hqName ?? null,
          visitCount: 1,
          firstVisitDate: visitDate,
          lastVisitDate: visitDate,
        });
        continue;
      }
      current.visitCount += 1;
      if (visitDate < current.firstVisitDate) current.firstVisitDate = visitDate;
      if (visitDate > current.lastVisitDate) current.lastVisitDate = visitDate;
    }

    const coveredDoctorIds = new Set([...byKey.values()].map((row) => row.doctorId));
    const doctorIds = [...coveredDoctorIds];
    const doctors =
      doctorIds.length > 0
        ? await this.prisma.doctor.findMany({
            where: { compCode, id: { in: doctorIds } },
            select: {
              id: true,
              doctorName: true,
              route: { select: { routeName: true } },
            },
          })
        : [];
    const doctorById = new Map(
      doctors.map((doctor) => [
        doctor.id,
        { doctorName: doctor.doctorName, routeName: doctor.route?.routeName ?? null },
      ]),
    );

    const items = [...byKey.values()]
      .map((row) => {
        const doctor = doctorById.get(row.doctorId);
        return {
          empId: row.empId,
          employeeName: row.employeeName,
          employeeCode: row.employeeCode,
          headQuarterName: row.headQuarterName,
          doctorId: row.doctorId,
          doctorName: doctor?.doctorName ?? row.doctorId,
          routeName: doctor?.routeName ?? null,
          visitCount: row.visitCount,
          firstVisitDate: row.firstVisitDate,
          lastVisitDate: row.lastVisitDate,
          wasPlanned: plannedByEmpDoctor.has(`${row.empId}|${row.doctorId}`),
        };
      })
      .sort((a, b) => {
        const byEmp = a.employeeName.localeCompare(b.employeeName);
        if (byEmp !== 0) return byEmp;
        return a.doctorName.localeCompare(b.doctorName);
      });

    const summary = {
      coveredDoctors: coveredDoctorIds.size,
      plannedDoctors: plannedDoctorIds.size,
      coveragePct: this.pct(coveredDoctorIds.size, plannedDoctorIds.size),
      totalVisits: visits.length,
    };

    return apiSuccess({ summary, items });
  }

  async fieldStaffKpis(compCode: string, empId: string, query: unknown) {
    const now = new Date();
    const parsed = ReportFilterSchema.safeParse(query ?? {});
    const month = parsed.success && parsed.data.month ? parsed.data.month : now.getMonth() + 1;
    const year = parsed.success && parsed.data.year ? parsed.data.year : now.getFullYear();
    const dateRange = this.monthDateRange(month, year);
    const todayDay = now.getDate();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      employee,
      pobAgg,
      targetRow,
      approvedDcrs,
      plannedByEmp,
      missed,
      rtp,
      weeklyDoctorsToday,
      pendingSubmitCount,
    ] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: empId, compCode },
        select: { headQuarter: { select: { hqName: true } } },
      }),
      this.prisma.personalOrderBooking.aggregate({
        where: { compCode, empId, approveStatus: 'APPROVED', orderDate: dateRange },
        _sum: { totalAmount: true },
      }),
      this.prisma.employeeMonthlyTarget.findFirst({
        where: { compCode, empId, targetMonth: month, targetYear: year },
      }),
      this.prisma.dailyCallReport.findMany({
        where: { compCode, empId, approveStatus: 'APPROVED', workDate: dateRange },
        select: { _count: { select: { doctorVisits: true } } },
      }),
      this.plannedDoctorCallsByEmp(compCode, dateRange, { empId }),
      this.buildMissedCallsData(compCode, month, year, { empId }),
      this.prisma.tourProgramme.findFirst({
        where: { compCode, empId, planMonth: month, planYear: year },
        include: { days: { where: { dayOfMonth: todayDay }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.weeklyPlanEntry.count({
        where: {
          compCode,
          doctorId: { not: null },
          planDate: { gte: todayStart, lt: todayEnd },
          weeklyPlan: { empId, approveStatus: 'APPROVED' },
        },
      }),
      Promise.all([
        this.prisma.dailyCallReport.count({
          where: { compCode, empId, approveStatus: { in: ['DRAFT', 'REJECTED'] } },
        }),
        this.prisma.personalOrderBooking.count({
          where: { compCode, empId, approveStatus: { in: ['DRAFT', 'REJECTED'] } },
        }),
        this.prisma.tourProgramme.count({
          where: { compCode, empId, approveStatus: { in: ['DRAFT', 'REJECTED'] } },
        }),
        this.prisma.weeklyPlan.count({
          where: { compCode, empId, approveStatus: { in: ['DRAFT', 'REJECTED'] } },
        }),
      ]).then((counts) => counts.reduce((sum, n) => sum + n, 0)),
    ]);

    const pobApprovedAmount = Number(pobAgg._sum.totalAmount ?? 0);
    const amountTarget = Number(targetRow?.amountTarget ?? 0);
    const doctorVisits = approvedDcrs.reduce((sum, row) => sum + row._count.doctorVisits, 0);
    const plannedDoctorCalls = plannedByEmp.get(empId) ?? 0;
    const rtpDay = rtp?.days[0];

    const payload = {
      month,
      year,
      headQuarterName: employee?.headQuarter?.hqName ?? null,
      pobApprovedAmount,
      amountTarget,
      pobAchievementPct: this.pct(pobApprovedAmount, amountTarget),
      doctorVisits,
      plannedDoctorCalls,
      coveragePct: this.pct(doctorVisits, plannedDoctorCalls),
      missedCallCount: missed.summary.missedCallCount,
      rtpWorkTypeToday: rtpDay?.workType ?? null,
      rtpHasPlanToday: Boolean(rtpDay),
      weeklyDoctorsToday,
      pendingSubmitCount,
    };

    return apiSuccess(payload);
  }

  private formatDdMmYyyy(date: Date) {
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d}-${m}-${y}`;
  }

  private todayUtcRange() {
    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    return { start, end };
  }

  async fieldStaffDcrDrafts(compCode: string, empId: string, todayOnly: boolean) {
    const { start, end } = this.todayUtcRange();
    const rows = await this.prisma.dailyCallReport.findMany({
      where: {
        compCode,
        empId,
        approveStatus: { in: ['DRAFT', 'REJECTED'] },
        ...(todayOnly ? { workDate: { gte: start, lt: end } } : {}),
      },
      orderBy: { workDate: 'desc' },
      take: 5,
      include: { _count: { select: { doctorVisits: true } } },
    });

    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        workDate: this.formatDdMmYyyy(row.workDate),
        approveStatus: row.approveStatus,
        doctorCount: row._count.doctorVisits,
      })),
    });
  }

  async fieldStaffPobDrafts(compCode: string, empId: string, todayOnly: boolean) {
    const { start, end } = this.todayUtcRange();
    const rows = await this.prisma.personalOrderBooking.findMany({
      where: {
        compCode,
        empId,
        approveStatus: { in: ['DRAFT', 'REJECTED'] },
        ...(todayOnly ? { orderDate: { gte: start, lt: end } } : {}),
      },
      orderBy: { orderDate: 'desc' },
      take: 5,
    });

    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        orderDate: this.formatDdMmYyyy(row.orderDate),
        approveStatus: row.approveStatus,
        amount: Math.round(Number(row.totalAmount)),
      })),
    });
  }
}
