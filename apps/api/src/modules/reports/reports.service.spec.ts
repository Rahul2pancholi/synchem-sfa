import { ReportsService } from './reports.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

describe('ReportsService', () => {
  const prod1 = '11111111-1111-4111-8111-111111111101';
  const prod2 = '11111111-1111-4111-8111-111111111102';
  const div1 = '22222222-2222-4222-8222-222222222201';
  const emp1 = '33333333-3333-4333-8333-333333333301';

  const prisma = {
    employee: { findMany: jest.fn().mockResolvedValue([]) },
    dailyCallReport: { findMany: jest.fn().mockResolvedValue([]) },
    expenseStatement: { findMany: jest.fn().mockResolvedValue([]) },
    personalOrderBooking: {
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 0 } }),
    },
    product: { findMany: jest.fn().mockResolvedValue([]) },
    employeeMonthlyTarget: {
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amountTarget: 0 } }),
    },
    weeklyPlan: { findMany: jest.fn().mockResolvedValue([]) },
    weeklyPlanEntry: { findMany: jest.fn().mockResolvedValue([]) },
    dcrDoctorVisit: { findMany: jest.fn().mockResolvedValue([]) },
    doctor: { findMany: jest.fn().mockResolvedValue([]) },
  } as unknown as PrismaService;

  const service = new ReportsService(prisma);

  it('aggregates sales summary from POB lines', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([
      { id: prod1, divisionId: div1 },
    ]);
    (prisma.personalOrderBooking.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'pob-1',
        empId: 'emp-1',
        approveStatus: 'APPROVED',
        totalAmount: 500,
        employee: {
          id: 'emp-1',
          firstName: 'Amit',
          lastName: 'Kumar',
          employeeCode: 'MR01',
          headQuarterId: 'hq-1',
          headQuarter: { hqName: 'Delhi' },
        },
        lines: [
          {
            productId: prod1,
            qty: 10,
            amount: 500,
          },
        ],
      },
    ]);

    const result = await service.salesSummary('SYN', { month: 6, year: 2026 });
    expect(result.data.summary.orderCount).toBe(1);
    expect(result.data.summary.totalQty).toBe(10);
    expect(result.data.summary.totalAmount).toBe(500);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].employeeName).toBe('Amit Kumar');
    expect(result.data.items[0].headQuarterName).toBe('Delhi');
  });

  it('filters sales summary by product', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([
      { id: prod1, divisionId: div1 },
      { id: prod2, divisionId: div1 },
    ]);
    (prisma.personalOrderBooking.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'pob-1',
        empId: 'emp-1',
        approveStatus: 'DRAFT',
        totalAmount: 800,
        employee: {
          id: 'emp-1',
          firstName: 'Ravi',
          lastName: null,
          employeeCode: 'MR02',
          headQuarterId: null,
          headQuarter: null,
        },
        lines: [
          {
            productId: prod1,
            qty: 5,
            amount: 300,
          },
          {
            productId: prod2,
            qty: 10,
            amount: 500,
          },
        ],
      },
    ]);

    const result = await service.salesSummary('SYN', {
      month: 6,
      year: 2026,
      productId: prod2,
    });

    expect(result.data.summary.totalQty).toBe(10);
    expect(result.data.summary.totalAmount).toBe(500);
    expect(result.data.items[0].orderCount).toBe(1);
  });

  it('computes target achievement from approved POB and DCR calls', async () => {
    (prisma.employeeMonthlyTarget.findMany as jest.Mock).mockResolvedValueOnce([
      {
        empId: emp1,
        amountTarget: 200000,
        callTarget: 160,
        pobTarget: 50,
        employee: {
          id: emp1,
          firstName: 'Rahul',
          lastName: 'MR',
          employeeCode: 'MR001',
          headQuarter: { hqName: 'Indore' },
        },
      },
    ]);
    (prisma.personalOrderBooking.findMany as jest.Mock).mockResolvedValueOnce([
      { empId: emp1, totalAmount: 170000 },
    ]);
    (prisma.dailyCallReport.findMany as jest.Mock).mockResolvedValueOnce([
      { empId: emp1, _count: { doctorVisits: 120 } },
    ]);
    (prisma.employee.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await service.targetAchievement('SYN', { month: 6, year: 2026 });

    expect(result.data.summary.amountTarget).toBe(200000);
    expect(result.data.summary.actualAmount).toBe(170000);
    expect(result.data.summary.achievementPct).toBe(85);
    expect(result.data.summary.actualCalls).toBe(120);
    expect(result.data.summary.callAchievementPct).toBe(75);
    expect(result.data.items[0].gapAmount).toBe(30000);
  });

  it('aggregates visit summary with coverage from weekly plan', async () => {
    (prisma.weeklyPlan.findMany as jest.Mock).mockResolvedValueOnce([
      {
        empId: emp1,
        entries: [{ doctorId: 'doc-1' }, { doctorId: 'doc-2' }],
      },
    ]);
    (prisma.dailyCallReport.findMany as jest.Mock).mockResolvedValueOnce([
      {
        empId: emp1,
        _count: { doctorVisits: 8, retailerVisits: 3 },
        employee: {
          id: emp1,
          firstName: 'Rahul',
          lastName: 'MR',
          employeeCode: 'MR001',
          headQuarter: { hqName: 'Indore' },
        },
      },
    ]);
    (prisma.employee.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await service.visitSummary('SYN', { month: 6, year: 2026 });

    expect(result.data.summary.doctorVisits).toBe(8);
    expect(result.data.summary.retailerVisits).toBe(3);
    expect(result.data.summary.plannedDoctorCalls).toBe(2);
    expect(result.data.summary.coveragePct).toBe(400);
    expect(result.data.items[0].totalVisits).toBe(11);
  });

  it('adds retailer visits and coverage to dcr summary', async () => {
    (prisma.employee.findMany as jest.Mock).mockReset();
    (prisma.dailyCallReport.findMany as jest.Mock).mockReset();
    (prisma.weeklyPlan.findMany as jest.Mock).mockReset();
    (prisma.employee.findMany as jest.Mock).mockResolvedValue([
      { id: emp1, firstName: 'Rahul', lastName: 'MR', employeeCode: 'MR001' },
    ]);
    (prisma.dailyCallReport.findMany as jest.Mock).mockResolvedValue([
      {
        empId: emp1,
        approveStatus: 'APPROVED',
        _count: { doctorVisits: 4, retailerVisits: 2 },
      },
    ]);
    (prisma.weeklyPlan.findMany as jest.Mock).mockResolvedValue([
      { empId: emp1, entries: [{ doctorId: 'doc-1' }] },
    ]);

    const result = await service.dcrSummary('SYN', { month: 6, year: 2026 });

    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.totalRetailerVisits).toBe(2);
    expect(result.data.items[0]?.plannedDoctorCalls).toBe(1);
    expect(result.data.items[0]?.coveragePct).toBe(400);
  });

  it('lists planned doctors not visited on planned date as missed calls', async () => {
    const docId = '44444444-4444-4444-8444-444444444401';
    const planDate = new Date('2026-06-10T00:00:00.000Z');

    (prisma.weeklyPlanEntry.findMany as jest.Mock).mockResolvedValueOnce([
      {
        doctorId: docId,
        planDate,
        weeklyPlan: {
          empId: emp1,
          employee: {
            id: emp1,
            firstName: 'Rahul',
            lastName: 'MR',
            employeeCode: 'MR001',
            headQuarter: { hqName: 'Mumbai' },
          },
        },
      },
    ]);
    (prisma.dcrDoctorVisit.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.doctor.findMany as jest.Mock).mockResolvedValueOnce([
      { id: docId, doctorName: 'Dr. Patel' },
    ]);

    const result = await service.missedCalls('SYN', { month: 6, year: 2026 });

    expect(result.data.summary.missedCallCount).toBe(1);
    expect(result.data.items[0]?.doctorName).toBe('Dr. Patel');
    expect(result.data.items[0]?.plannedDate).toBe('2026-06-10');
  });

  it('aggregates manager sales KPIs for current month', async () => {
    (prisma.personalOrderBooking.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { totalAmount: 150000 },
    });
    (prisma.employeeMonthlyTarget.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { amountTarget: 200000 },
    });
    (prisma.dailyCallReport.findMany as jest.Mock).mockResolvedValueOnce([
      { _count: { doctorVisits: 6 } },
      { _count: { doctorVisits: 4 } },
    ]);
    (prisma.weeklyPlan.findMany as jest.Mock).mockResolvedValueOnce([
      { empId: emp1, entries: [{ doctorId: 'd1' }, { doctorId: 'd2' }] },
    ]);
    (prisma.weeklyPlanEntry.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.dcrDoctorVisit.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await service.managerSalesKpis('SYN', { month: 6, year: 2026 });

    expect(result.data.pobApprovedAmount).toBe(150000);
    expect(result.data.pobAchievementPct).toBe(75);
    expect(result.data.doctorVisits).toBe(10);
    expect(result.data.plannedDoctorCalls).toBe(2);
    expect(result.data.coveragePct).toBe(500);
    expect(result.data.missedCallCount).toBe(0);
  });
});
