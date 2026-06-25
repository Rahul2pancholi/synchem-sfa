import { Injectable } from '@nestjs/common';
import {
  apiSuccess,
  type ManagerSalesKpis,
  SalesInsightsFilterSchema,
  SALES_INSIGHT_THRESHOLDS,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { ReportsService } from '../reports/reports.service';
import { evaluateFieldStaffInsights, evaluateSalesInsights } from './sales-insights.rules';

@Injectable()
export class SalesInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
  ) {}

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

  private async teamCoverageAndAchievement(compCode: string, month: number, year: number) {
    const dateRange = this.monthDateRange(month, year);
    const threshold = SALES_INSIGHT_THRESHOLDS;

    const employees = await this.prisma.employee.findMany({
      where: { compCode, active: true },
      select: { id: true },
    });

    const empIds = employees.map((e) => e.id);
    if (empIds.length === 0) {
      return { lowCoverageCount: 0, lowAchievementCount: 0 };
    }

    const [weeklyPlans, dcrs, targets, pobs] = await Promise.all([
      this.prisma.weeklyPlan.findMany({
        where: {
          compCode,
          empId: { in: empIds },
          approveStatus: 'APPROVED',
          entries: { some: { planDate: dateRange, doctorId: { not: null } } },
        },
        include: {
          entries: {
            where: { planDate: dateRange, doctorId: { not: null } },
            select: { id: true },
          },
        },
      }),
      this.prisma.dailyCallReport.findMany({
        where: {
          compCode,
          empId: { in: empIds },
          approveStatus: 'APPROVED',
          workDate: dateRange,
        },
        select: { empId: true, _count: { select: { doctorVisits: true } } },
      }),
      this.prisma.employeeMonthlyTarget.findMany({
        where: { compCode, empId: { in: empIds }, targetMonth: month, targetYear: year },
        select: { empId: true, amountTarget: true },
      }),
      this.prisma.personalOrderBooking.groupBy({
        by: ['empId'],
        where: { compCode, empId: { in: empIds }, approveStatus: 'APPROVED', orderDate: dateRange },
        _sum: { totalAmount: true },
      }),
    ]);

    const plannedByEmp = new Map<string, number>();
    for (const plan of weeklyPlans) {
      plannedByEmp.set(plan.empId, (plannedByEmp.get(plan.empId) ?? 0) + plan.entries.length);
    }

    const visitsByEmp = new Map<string, number>();
    for (const dcr of dcrs) {
      visitsByEmp.set(dcr.empId, (visitsByEmp.get(dcr.empId) ?? 0) + dcr._count.doctorVisits);
    }

    const targetByEmp = new Map(targets.map((t) => [t.empId, Number(t.amountTarget ?? 0)]));
    const pobByEmp = new Map(
      pobs.map((p) => [p.empId, Number(p._sum.totalAmount ?? 0)]),
    );

    let lowCoverageCount = 0;
    let lowAchievementCount = 0;

    for (const empId of empIds) {
      const planned = plannedByEmp.get(empId) ?? 0;
      const visits = visitsByEmp.get(empId) ?? 0;
      if (planned > 0) {
        const coverage = this.pct(visits, planned);
        if (coverage < threshold.lowCoveragePct) lowCoverageCount += 1;
      }

      const target = targetByEmp.get(empId) ?? 0;
      const pob = pobByEmp.get(empId) ?? 0;
      if (target > 0) {
        const achievement = this.pct(pob, target);
        if (achievement < threshold.lowPobAchievementPct) lowAchievementCount += 1;
      }
    }

    return { lowCoverageCount, lowAchievementCount };
  }

  async managerSuggestions(compCode: string, query: unknown) {
    const parsed = SalesInsightsFilterSchema.safeParse(query ?? {});
    const filterQuery = parsed.success ? parsed.data : {};

    const kpiResponse = await this.reports.managerSalesKpis(compCode, filterQuery);
    const kpis = kpiResponse.data as ManagerSalesKpis;

    const team = await this.teamCoverageAndAchievement(compCode, kpis.month, kpis.year);
    const insights = evaluateSalesInsights(kpis, team);

    return apiSuccess({
      month: kpis.month,
      year: kpis.year,
      insights,
    });
  }

  async fieldStaffSuggestions(compCode: string, empId: string, query: unknown) {
    const parsed = SalesInsightsFilterSchema.safeParse(query ?? {});
    const filterQuery = parsed.success ? parsed.data : {};

    const kpiResponse = await this.reports.fieldStaffKpis(compCode, empId, filterQuery);
    const kpis = kpiResponse.data;

    const [dcrDraftCount, pobDraftCount] = await Promise.all([
      this.prisma.dailyCallReport.count({
        where: {
          compCode,
          empId,
          approveStatus: { in: ['DRAFT', 'REJECTED'] },
        },
      }),
      this.prisma.personalOrderBooking.count({
        where: {
          compCode,
          empId,
          approveStatus: { in: ['DRAFT', 'REJECTED'] },
        },
      }),
    ]);

    const insights = evaluateFieldStaffInsights(kpis, { dcrDraftCount, pobDraftCount });

    return apiSuccess({
      month: kpis.month,
      year: kpis.year,
      insights,
    });
  }
}
