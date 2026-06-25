import type { PrismaClient } from '@prisma/client';
import type { DemoMonthContext } from './demo-month';

function dateUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function demoHierId(code: string) {
  const n = code.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return `00000000-0000-4000-8b01-${n.toString(16).padStart(12, '0')}`;
}

function demoRetailerId(index: number) {
  return `00000000-0000-4000-8b02-${String(index + 1).padStart(12, '0')}`;
}

function demoStockistId(index: number) {
  return `00000000-0000-4000-8b03-${String(index + 1).padStart(12, '0')}`;
}

function demoLeaveId(mrIndex: number, seq: number) {
  const n = (mrIndex + 1) * 10 + seq;
  return `00000000-0000-4000-8b04-${n.toString(16).padStart(12, '0')}`;
}

function demoExpenseId(mrIndex: number, month: number) {
  const n = (mrIndex + 1) * 100 + month;
  return `00000000-0000-4000-8b05-${n.toString(16).padStart(12, '0')}`;
}

function demoDoctorReqId(index: number) {
  return `00000000-0000-4000-8b06-${String(index + 1).padStart(12, '0')}`;
}

function demoLoginId(index: number) {
  return `00000000-0000-4000-8b07-${String(index + 1).padStart(12, '0')}`;
}

export interface DemoFullContext extends DemoMonthContext {
  stateId: string;
  rmEmployeeId: string;
}

export async function ensureDemoGeo(prisma: PrismaClient, ctx: DemoFullContext) {
  const hq2 = await prisma.headQuarter.upsert({
    where: { compCode_hqName: { compCode: ctx.compCode, hqName: 'Indore-2' } },
    update: { stateId: ctx.stateId },
    create: { compCode: ctx.compCode, hqName: 'Indore-2', stateId: ctx.stateId },
  });

  const route2 = await prisma.route.upsert({
    where: {
      compCode_headQuarterId_routeName: {
        compCode: ctx.compCode,
        headQuarterId: hq2.id,
        routeName: 'Route-B',
      },
    },
    update: {},
    create: { compCode: ctx.compCode, headQuarterId: hq2.id, routeName: 'Route-B' },
  });

  return { hq2Id: hq2.id, route2Id: route2.id };
}

export async function ensureDemoHierarchyTree(prisma: PrismaClient, compCode: string) {
  const admin = await prisma.hierarchy.upsert({
    where: { compCode_hierarchyCode: { compCode, hierarchyCode: 'ADMIN' } },
    update: {},
    create: {
      id: demoHierId('ADMIN'),
      compCode,
      hierarchyCode: 'ADMIN',
      hierarchyType: 'MGT',
      hierarchyLevel: 1,
    },
  });

  const levels = [
    { code: 'MSD', type: 'MAN', level: 2, parent: admin.id },
    { code: 'ZSM', type: 'MAN', level: 3, parent: demoHierId('MSD') },
    { code: 'RSM', type: 'MAN', level: 3, parent: demoHierId('ZSM') },
    { code: 'ASM', type: 'ASM', level: 4, parent: demoHierId('RSM') },
    { code: 'MR-HQ', type: 'FS', level: 5, parent: demoHierId('ASM') },
  ];

  let parentId = admin.id;
  for (const row of levels) {
    const id = demoHierId(row.code);
    const record = await prisma.hierarchy.upsert({
      where: { compCode_hierarchyCode: { compCode, hierarchyCode: row.code } },
      update: { reportingHierarchyId: parentId, hierarchyType: row.type, hierarchyLevel: row.level },
      create: {
        id,
        compCode,
        hierarchyCode: row.code,
        hierarchyType: row.type,
        hierarchyLevel: row.level,
        reportingHierarchyId: parentId,
      },
    });
    parentId = record.id;
  }
}

export async function assignMrHeadQuarters(
  prisma: PrismaClient,
  mrEmpIds: string[],
  hq1Id: string,
  hq2Id: string,
) {
  for (let i = 0; i < mrEmpIds.length; i += 1) {
    await prisma.employee.update({
      where: { id: mrEmpIds[i]! },
      data: { headQuarterId: i < 5 ? hq1Id : hq2Id },
    });
  }
}

async function ensureRetailersAndStockists(
  prisma: PrismaClient,
  compCode: string,
  routeId: string,
  route2Id: string,
) {
  for (let i = 0; i < 12; i += 1) {
    await prisma.retailer.upsert({
      where: { id: demoRetailerId(i) },
      update: { routeId: i < 6 ? routeId : route2Id, active: true },
      create: {
        id: demoRetailerId(i),
        compCode,
        routeId: i < 6 ? routeId : route2Id,
        retailerName: `Demo Chemist ${String(i + 1).padStart(2, '0')}`,
        approveStatus: 'APPROVED',
        active: true,
      },
    });
  }

  for (let i = 0; i < 6; i += 1) {
    await prisma.stockist.upsert({
      where: { id: demoStockistId(i) },
      update: { routeId: i < 3 ? routeId : route2Id, active: true },
      create: {
        id: demoStockistId(i),
        compCode,
        routeId: i < 3 ? routeId : route2Id,
        stockistName: `Demo Stockist ${String(i + 1).padStart(2, '0')}`,
        active: true,
      },
    });
  }

  return Array.from({ length: 12 }, (_, i) => demoRetailerId(i));
}

async function ensureHolidays(prisma: PrismaClient, compCode: string, month: number, year: number) {
  const holidayDays = [15, 26];
  for (const day of holidayDays) {
    const holidayDate = dateUtc(year, month, day);
    const holidayName = `Demo Holiday ${day}`;
    await prisma.holiday.upsert({
      where: {
        compCode_holidayDate_holidayName: { compCode, holidayDate, holidayName },
      },
      update: { active: true },
      create: {
        compCode,
        holidayDate,
        holidayName,
        active: true,
      },
    });
  }
}

export async function clearDemoExtras(prisma: PrismaClient, compCode: string, empIds: string[]) {
  const doctorReqIds = Array.from({ length: 3 }, (_, i) => demoDoctorReqId(i));
  await prisma.approvalQueueItem.deleteMany({
    where: { compCode, entityId: { in: doctorReqIds } },
  });
  await prisma.doctor.deleteMany({ where: { compCode, id: { in: doctorReqIds } } });

  const loginIds = Array.from({ length: 500 }, (_, i) => demoLoginId(i + 1));
  await prisma.loginEvent.deleteMany({ where: { compCode, id: { in: loginIds } } });
  await prisma.expenseStatementLine.deleteMany({
    where: { compCode, statement: { empId: { in: empIds } } },
  });
  await prisma.expenseStatement.deleteMany({ where: { compCode, empId: { in: empIds } } });
  await prisma.leaveApplication.deleteMany({ where: { compCode, empId: { in: empIds } } });
}

async function seedLeaveBalancesAndApps(
  prisma: PrismaClient,
  compCode: string,
  mrEmpIds: string[],
  month: number,
  year: number,
  rmId: string,
) {
  const policyYear = year;

  for (let i = 0; i < mrEmpIds.length; i += 1) {
    const empId = mrEmpIds[i]!;
    for (const row of [
      { leaveType: 'CL', balance: 10 - (i % 3) },
      { leaveType: 'SL', balance: 5 },
      { leaveType: 'PL', balance: 12 },
    ]) {
      await prisma.leaveBalance.upsert({
        where: {
          compCode_empId_leaveType_policyYear: {
            compCode,
            empId,
            leaveType: row.leaveType,
            policyYear,
          },
        },
        update: { balance: row.balance },
        create: {
          compCode,
          empId,
          leaveType: row.leaveType,
          policyYear,
          balance: row.balance,
        },
      });
    }

    if (i < 4) {
      const leaveId = demoLeaveId(i, 1);
      const fromDate = dateUtc(year, month, 5 + i);
      const toDate = dateUtc(year, month, 5 + i);
      await prisma.leaveApplication.create({
        data: {
          id: leaveId,
          compCode,
          empId,
          leaveType: 'CL',
          fromDate,
          toDate,
          totalDays: 1,
          reason: 'Demo personal leave',
          balanceBefore: 10,
          approveStatus: 'APPROVED',
          submittedAt: fromDate,
        },
      });
    }

    if (i === 4 || i === 5) {
      const leaveId = demoLeaveId(i, 2);
      const fromDate = dateUtc(year, month, 20 + i);
      const toDate = dateUtc(year, month, 21 + i);
      await prisma.leaveApplication.create({
        data: {
          id: leaveId,
          compCode,
          empId,
          leaveType: 'SL',
          fromDate,
          toDate,
          totalDays: 2,
          reason: 'Demo sick leave pending approval',
          balanceBefore: 5,
          approveStatus: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
      await prisma.approvalQueueItem.create({
        data: {
          compCode,
          entityType: 'LEAVE',
          entityId: leaveId,
          submittedBy: empId,
          approverId: rmId,
          status: 'PENDING',
        },
      });
    }
  }
}

async function seedExpenseStatements(
  prisma: PrismaClient,
  compCode: string,
  mrEmpIds: string[],
  month: number,
  year: number,
  rmId: string,
) {
  const heads = await prisma.expenseHead.findMany({ where: { compCode, active: true } });
  const travelHead = heads.find((h) => h.headName === 'Travel') ?? heads[0];
  const fixedHead = heads.find((h) => h.headName === 'Fixed Allowance') ?? heads[0];

  for (let i = 0; i < mrEmpIds.length; i += 1) {
    const empId = mrEmpIds[i]!;
    const stmtId = demoExpenseId(i, month);
    const total = 4500 + i * 350;
    const status = i === 8 || i === 9 ? 'SUBMITTED' : 'APPROVED';

    await prisma.expenseStatement.create({
      data: {
        id: stmtId,
        compCode,
        empId,
        claimMonth: month,
        claimYear: year,
        totalAmount: total,
        approveStatus: status,
        submittedAt: status === 'SUBMITTED' ? new Date() : dateUtc(year, month, 28),
        lines: {
          create: [
            {
              compCode,
              expenseHeadId: travelHead?.id,
              description: 'Field travel — demo',
              amount: Math.round(total * 0.6),
            },
            {
              compCode,
              expenseHeadId: fixedHead?.id,
              description: 'Daily allowance — demo',
              amount: Math.round(total * 0.4),
            },
          ],
        },
      },
    });

    if (status === 'SUBMITTED') {
      await prisma.approvalQueueItem.create({
        data: {
          compCode,
          entityType: 'EXPENSE',
          entityId: stmtId,
          submittedBy: empId,
          approverId: rmId,
          status: 'PENDING',
        },
      });
    }
  }
}

async function seedDoctorApprovalRequests(
  prisma: PrismaClient,
  compCode: string,
  mrEmpIds: string[],
  routeId: string,
  specialistId: string,
) {
  const names = ['Dr. Pending Verma', 'Dr. Pending Joshi', 'Dr. Pending Nair'];
  for (let i = 0; i < names.length; i += 1) {
    const id = demoDoctorReqId(i);
    const submitter = mrEmpIds[i]!;
    await prisma.doctor.create({
      data: {
        id,
        compCode,
        routeId,
        doctorName: names[i]!,
        specialistId,
        mobileNo: `98111${String(22000 + i)}`,
        approveStatus: 'SUBMITTED',
        active: false,
        submittedBy: submitter,
        submittedAt: new Date(),
      },
    });
    await prisma.approvalQueueItem.create({
      data: {
        compCode,
        entityType: 'DOCTOR',
        entityId: id,
        submittedBy: submitter,
        status: 'PENDING',
      },
    });
  }
}

async function seedLoginEvents(
  prisma: PrismaClient,
  compCode: string,
  mrEmpIds: string[],
  rmId: string,
  adminId: string,
) {
  const users = [
    ...mrEmpIds.map((empId, i) => ({ empId, userName: `mr${i + 1}` })),
    { empId: rmId, userName: 'rm1' },
    { empId: adminId, userName: 'admin' },
  ];

  let seq = 0;
  const now = Date.now();
  for (let day = 0; day < 30; day += 1) {
    for (const user of users) {
      seq += 1;
      const createdAt = new Date(now - day * 24 * 60 * 60 * 1000 - seq * 60_000);
      const success = seq % 17 !== 0;
      await prisma.loginEvent.create({
        data: {
          id: demoLoginId(seq),
          compCode,
          empId: user.empId,
          userName: user.userName,
          loginStatus: success ? 'SUCCESS' : 'FAILED',
          channel: seq % 5 === 0 ? 'mobile' : 'web',
          deviceType: seq % 5 === 0 ? 'phone' : 'desktop',
          osName: seq % 3 === 0 ? 'Android' : 'macOS',
          browserName: seq % 3 === 0 ? 'Chrome Mobile' : 'Chrome',
          deviceId: `demo-device-${user.userName}`,
          ipAddress: `10.0.${(seq % 200) + 1}.${(seq % 250) + 1}`,
          createdAt,
        },
      });
    }
  }
}

export async function seedDemoInfrastructure(
  prisma: PrismaClient,
  ctx: DemoFullContext,
  mrEmpIds: string[],
) {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  const { hq2Id, route2Id } = await ensureDemoGeo(prisma, ctx);
  await ensureDemoHierarchyTree(prisma, ctx.compCode);
  await assignMrHeadQuarters(prisma, mrEmpIds, ctx.hqId, hq2Id);
  const retailerIds = await ensureRetailersAndStockists(
    prisma,
    ctx.compCode,
    ctx.routeId,
    route2Id,
  );
  await ensureHolidays(prisma, ctx.compCode, month, year);

  return { retailerIds, route2Id };
}

export async function seedDemoOperationalExtras(
  prisma: PrismaClient,
  ctx: DemoFullContext,
  mrEmpIds: string[],
  doctorIds: string[],
  adminId: string,
  options: { clearOnly: boolean },
) {
  if (options.clearOnly) {
    await clearDemoExtras(prisma, ctx.compCode, mrEmpIds);
    return;
  }

  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  const specialist = await prisma.specialist.findFirstOrThrow({
    where: { compCode: ctx.compCode },
  });

  await seedLeaveBalancesAndApps(prisma, ctx.compCode, mrEmpIds, month, year, ctx.rmEmployeeId);
  await seedExpenseStatements(prisma, ctx.compCode, mrEmpIds, month, year, ctx.rmEmployeeId);
  await seedDoctorApprovalRequests(
    prisma,
    ctx.compCode,
    mrEmpIds,
    ctx.routeId,
    specialist.id,
  );
  await seedLoginEvents(prisma, ctx.compCode, mrEmpIds, ctx.rmEmployeeId, adminId);

  console.log(
    `Demo operational data: leave, expense (${mrEmpIds.length} MRs), doctor approvals, login analytics`,
  );
}
