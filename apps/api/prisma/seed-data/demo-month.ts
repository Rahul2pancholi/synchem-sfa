import type { PrismaClient } from '@prisma/client';
import {
  seedDemoInfrastructure,
  seedDemoOperationalExtras,
  type DemoFullContext,
} from './demo-full';

const COMP_CODE = 'SYN';
const MR_USER_NAMES = ['mr1', 'mr2', 'mr3', 'mr4', 'mr5', 'mr6', 'mr7', 'mr8', 'mr9', 'mr10'] as const;

/** POB achievement spread — weak → strong MRs for dashboard traffic lights. */
const ACHIEVEMENT_FACTORS = [0.38, 0.48, 0.55, 0.63, 0.71, 0.76, 0.82, 0.87, 0.92, 0.96];

const MR_PROFILES = [
  { userName: 'mr1', firstName: 'Rahul', lastName: 'Sharma', employeeCode: 'MR001' },
  { userName: 'mr2', firstName: 'Amit', lastName: 'Patel', employeeCode: 'MR002' },
  { userName: 'mr3', firstName: 'Vikram', lastName: 'Singh', employeeCode: 'MR003' },
  { userName: 'mr4', firstName: 'Suresh', lastName: 'Mehta', employeeCode: 'MR004' },
  { userName: 'mr5', firstName: 'Anil', lastName: 'Gupta', employeeCode: 'MR005' },
  { userName: 'mr6', firstName: 'Ravi', lastName: 'Joshi', employeeCode: 'MR006' },
  { userName: 'mr7', firstName: 'Kiran', lastName: 'Rao', employeeCode: 'MR007' },
  { userName: 'mr8', firstName: 'Deepak', lastName: 'Verma', employeeCode: 'MR008' },
  { userName: 'mr9', firstName: 'Manoj', lastName: 'Yadav', employeeCode: 'MR009' },
  { userName: 'mr10', firstName: 'Sanjay', lastName: 'Kulkarni', employeeCode: 'MR010' },
] as const;

export interface DemoMonthContext {
  compCode: string;
  mrRoleId: string;
  rmEmployeeId: string;
  hqId: string;
  routeId: string;
  mrHierarchyId: string;
  mrPasswordHash: string;
  brandId: string;
  divisionId: string;
}

function demoEmpId(index: number) {
  return `00000000-0000-4000-8e01-${String(index + 1).padStart(12, '0')}`;
}

function demoDoctorId(index: number) {
  return `00000000-0000-4000-8d01-${String(index + 1).padStart(12, '0')}`;
}

function demoProductId(index: number) {
  return `00000000-0000-4000-8a01-${String(index + 1).padStart(12, '0')}`;
}

function demoTourId(mrIndex: number, month: number) {
  const n = (mrIndex + 1) * 100 + month;
  return `00000000-0000-4000-8a02-${n.toString(16).padStart(12, '0')}`;
}

function demoWeekId(mrIndex: number, month: number, weekDay: number) {
  const n = (mrIndex + 1) * 10000 + month * 100 + weekDay;
  return `00000000-0000-4000-8a03-${n.toString(16).padStart(12, '0')}`;
}

function demoDcrId(mrIndex: number, month: number, day: number) {
  const n = (mrIndex + 1) * 10000 + month * 100 + day;
  return `00000000-0000-4000-8dc0-${n.toString(16).padStart(12, '0')}`;
}

function demoPobId(mrIndex: number, month: number, day: number) {
  const n = (mrIndex + 1) * 10000 + month * 100 + day;
  return `00000000-0000-4000-8a04-${n.toString(16).padStart(12, '0')}`;
}

function dateUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function daysInMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function mondaysInMonth(month: number, year: number) {
  const total = daysInMonth(month, year);
  const mondays: Date[] = [];
  for (let day = 1; day <= total; day += 1) {
    const dt = dateUtc(year, month, day);
    if (dt.getUTCDay() === 1) mondays.push(dt);
  }
  return mondays;
}

function isSunday(year: number, month: number, day: number) {
  return dateUtc(year, month, day).getUTCDay() === 0;
}

async function clearMrTransactions(prisma: PrismaClient, compCode: string, empIds: string[]) {
  if (empIds.length === 0) return;

  const [dcrs, pobs, tours, weeks] = await Promise.all([
    prisma.dailyCallReport.findMany({ where: { compCode, empId: { in: empIds } }, select: { id: true } }),
    prisma.personalOrderBooking.findMany({ where: { compCode, empId: { in: empIds } }, select: { id: true } }),
    prisma.tourProgramme.findMany({ where: { compCode, empId: { in: empIds } }, select: { id: true } }),
    prisma.weeklyPlan.findMany({ where: { compCode, empId: { in: empIds } }, select: { id: true } }),
  ]);

  const dcrIds = dcrs.map((row) => row.id);
  const pobIds = pobs.map((row) => row.id);
  const tourIds = tours.map((row) => row.id);
  const weekIds = weeks.map((row) => row.id);
  const entityIds = [...dcrIds, ...pobIds, ...tourIds, ...weekIds];

  if (entityIds.length > 0) {
    await prisma.approvalQueueItem.deleteMany({ where: { compCode, entityId: { in: entityIds } } });
  }
  if (pobIds.length > 0) {
    await prisma.personalOrderLine.deleteMany({ where: { compCode, pobId: { in: pobIds } } });
  }
  await prisma.personalOrderBooking.deleteMany({ where: { compCode, empId: { in: empIds } } });
  if (dcrIds.length > 0) {
    await prisma.dcrDoctorVisit.deleteMany({ where: { compCode, dcrId: { in: dcrIds } } });
    await prisma.dcrRetailerVisit.deleteMany({ where: { compCode, dcrId: { in: dcrIds } } });
  }
  await prisma.dailyCallReport.deleteMany({ where: { compCode, empId: { in: empIds } } });
  if (weekIds.length > 0) {
    await prisma.weeklyPlanEntry.deleteMany({ where: { compCode, weeklyPlanId: { in: weekIds } } });
  }
  await prisma.weeklyPlan.deleteMany({ where: { compCode, empId: { in: empIds } } });
  if (tourIds.length > 0) {
    await prisma.tourProgrammeDay.deleteMany({ where: { compCode, tourProgrammeId: { in: tourIds } } });
  }
  await prisma.tourProgramme.deleteMany({ where: { compCode, empId: { in: empIds } } });
  await prisma.employeeMonthlyTarget.deleteMany({ where: { compCode, empId: { in: empIds } } });
}

async function ensureDoctors(
  prisma: PrismaClient,
  compCode: string,
  routeId: string,
  specialistId: string,
) {
  const ids: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    const id = demoDoctorId(i);
    ids.push(id);
    await prisma.doctor.upsert({
      where: { id },
      update: { routeId, active: true, approveStatus: 'APPROVED' },
      create: {
        id,
        compCode,
        routeId,
        doctorName: `Dr. Demo ${String(i + 1).padStart(2, '0')}`,
        specialistId,
        mobileNo: `98765${String(43210 + i).slice(-5)}`,
        approveStatus: 'APPROVED',
        active: true,
      },
    });
  }
  return ids;
}

async function ensureProducts(
  prisma: PrismaClient,
  compCode: string,
  brandId: string,
  divisionId: string,
) {
  const names = ['Sample Product', 'Synchem Tab 10mg', 'Synchem Cap 250mg', 'Synchem Syrup', 'Synchem Injection'];
  const codes = ['PRD001', 'PRD002', 'PRD003', 'PRD004', 'PRD005'];
  const ids: string[] = [];

  for (let i = 0; i < names.length; i += 1) {
    const record = await prisma.product.upsert({
      where: { compCode_productCode: { compCode, productCode: codes[i]! } },
      update: { productName: names[i], brandId, divisionId },
      create: {
        id: demoProductId(i),
        compCode,
        productCode: codes[i]!,
        productName: names[i]!,
        brandId,
        divisionId,
      },
    });
    ids.push(record.id);
  }
  return ids;
}

async function ensureMrEmployees(prisma: PrismaClient, ctx: DemoMonthContext) {
  const ids: string[] = [];

  for (let i = 0; i < MR_PROFILES.length; i += 1) {
    const profile = MR_PROFILES[i]!;
    const id = demoEmpId(i);
    const employee = await prisma.employee.upsert({
      where: { compCode_userName: { compCode: ctx.compCode, userName: profile.userName } },
      update: {
        passwordHash: ctx.mrPasswordHash,
        roleId: ctx.mrRoleId,
        headQuarterId: ctx.hqId,
        hierarchyId: ctx.mrHierarchyId,
        reportingManagerId: ctx.rmEmployeeId,
        employeeCode: profile.employeeCode,
        firstName: profile.firstName,
        lastName: profile.lastName,
        active: true,
        isFirstLogin: false,
      },
      create: {
        id,
        compCode: ctx.compCode,
        userName: profile.userName,
        passwordHash: ctx.mrPasswordHash,
        employeeCode: profile.employeeCode,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: `${profile.userName}@synchem.co`,
        roleId: ctx.mrRoleId,
        headQuarterId: ctx.hqId,
        hierarchyId: ctx.mrHierarchyId,
        reportingManagerId: ctx.rmEmployeeId,
        active: true,
        isFirstLogin: false,
      },
    });
    ids.push(employee.id);
  }

  return ids;
}

async function seedMrMonth(
  prisma: PrismaClient,
  ctx: DemoMonthContext,
  empId: string,
  mrIndex: number,
  month: number,
  year: number,
  throughDay: number,
  doctorIds: string[],
  productIds: string[],
  retailerIds: string[],
  options: { withPending: boolean },
) {
  const amountTarget = 200_000;
  const callTarget = 180;
  const pobTarget = 55;
  const achievement = ACHIEVEMENT_FACTORS[mrIndex] ?? 0.7;
  const targetPobAmount = Math.round(amountTarget * achievement);
  const visitRate = 0.72 + (mrIndex % 4) * 0.05;

  await prisma.employeeMonthlyTarget.create({
    data: {
      compCode: ctx.compCode,
      empId,
      targetMonth: month,
      targetYear: year,
      amountTarget,
      callTarget,
      pobTarget,
    },
  });

  const tourId = demoTourId(mrIndex, month);
  const tourStatus = options.withPending && mrIndex === 9 ? 'SUBMITTED' : 'APPROVED';
  await prisma.tourProgramme.create({
    data: {
      id: tourId,
      compCode: ctx.compCode,
      empId,
      planMonth: month,
      planYear: year,
      approveStatus: tourStatus,
      submittedAt: tourStatus === 'SUBMITTED' ? new Date() : null,
      days: {
        create: Array.from({ length: daysInMonth(month, year) }, (_, idx) => {
          const day = idx + 1;
          const sunday = isSunday(year, month, day);
          return {
            compCode: ctx.compCode,
            dayOfMonth: day,
            routeId: ctx.routeId,
            workType: sunday ? 'HOLIDAY' : 'FIELD',
          };
        }),
      },
    },
  });

  if (tourStatus === 'SUBMITTED') {
    await prisma.approvalQueueItem.create({
      data: {
        compCode: ctx.compCode,
        entityType: 'RTP',
        entityId: tourId,
        submittedBy: empId,
        status: 'PENDING',
      },
    });
  }

  const plannedByDay = new Map<number, string[]>();

  for (const weekStart of mondaysInMonth(month, year)) {
    const weekId = demoWeekId(mrIndex, month, weekStart.getUTCDate());
    const weekStatus =
      options.withPending && (mrIndex === 7 || mrIndex === 8) ? 'SUBMITTED' : 'APPROVED';

    await prisma.weeklyPlan.create({
      data: {
        id: weekId,
        compCode: ctx.compCode,
        empId,
        weekStartDate: weekStart,
        approveStatus: weekStatus,
        submittedAt: weekStatus === 'SUBMITTED' ? new Date() : null,
      },
    });

    if (weekStatus === 'SUBMITTED') {
      await prisma.approvalQueueItem.create({
        data: {
          compCode: ctx.compCode,
          entityType: 'WEEKLY_PLAN',
          entityId: weekId,
          submittedBy: empId,
          status: 'PENDING',
        },
      });
    }

    for (let offset = 0; offset < 6; offset += 1) {
      const planDate = new Date(weekStart);
      planDate.setUTCDate(weekStart.getUTCDate() + offset);
      if (planDate.getUTCMonth() + 1 !== month) continue;

      const day = planDate.getUTCDate();
      if (isSunday(year, month, day)) continue;

      const doctorsForDay: string[] = [];
      for (let v = 0; v < 4; v += 1) {
        const doctorId = doctorIds[(mrIndex * 3 + day + v) % doctorIds.length]!;
        doctorsForDay.push(doctorId);
        await prisma.weeklyPlanEntry.create({
          data: {
            compCode: ctx.compCode,
            weeklyPlanId: weekId,
            planDate,
            doctorId,
          },
        });
      }
      plannedByDay.set(day, doctorsForDay);
    }
  }

  let pobBooked = 0;
  const pobOrders = 10;

  for (let day = 1; day <= Math.min(throughDay, daysInMonth(month, year)); day += 1) {
    if (isSunday(year, month, day)) continue;

    const workDate = dateUtc(year, month, day);
    const plannedDoctors = plannedByDay.get(day) ?? [];
    const visitCount = Math.max(1, Math.floor(plannedDoctors.length * visitRate));
    const visitedDoctors = plannedDoctors.slice(0, visitCount);

    const isPendingDcr =
      options.withPending && (mrIndex === 3 || mrIndex === 4 || mrIndex === 5 || mrIndex === 6);
    const dcrStatus =
      options.withPending && day === throughDay && mrIndex === 0
        ? 'DRAFT'
        : options.withPending && day === throughDay - 1 && mrIndex === 2
          ? 'REJECTED'
          : isPendingDcr && day >= throughDay - 2
            ? 'SUBMITTED'
            : 'APPROVED';

    const dcrId = demoDcrId(mrIndex, month, day);

    await prisma.dailyCallReport.create({
      data: {
        id: dcrId,
        compCode: ctx.compCode,
        empId,
        workDate,
        headQuarterId: ctx.hqId,
        routeId: ctx.routeId,
        approveStatus: dcrStatus,
        submittedAt: dcrStatus === 'SUBMITTED' || dcrStatus === 'APPROVED' ? workDate : null,
        doctorVisits: {
          create: visitedDoctors.map((doctorId, visitOrder) => ({
            compCode: ctx.compCode,
            doctorId,
            visitOrder: visitOrder + 1,
          })),
        },
        ...(retailerIds.length && day % 3 === 0
          ? {
              retailerVisits: {
                create: {
                  compCode: ctx.compCode,
                  retailerId: retailerIds[day % retailerIds.length]!,
                  visitOrder: 1,
                },
              },
            }
          : {}),
      },
    });

    if (dcrStatus === 'SUBMITTED') {
      await prisma.approvalQueueItem.create({
        data: {
          compCode: ctx.compCode,
          entityType: 'DCR',
          entityId: dcrId,
          submittedBy: empId,
          status: 'PENDING',
        },
      });
    }

    if (dcrStatus === 'APPROVED' && pobBooked < targetPobAmount && day % 2 === 0) {
      const remaining = targetPobAmount - pobBooked;
      const orderAmount = Math.min(remaining, Math.round(targetPobAmount / pobOrders));
      if (orderAmount > 0) {
        const pobId = demoPobId(mrIndex, month, day);
        const productId = productIds[day % productIds.length]!;
        const qty = Math.max(1, Math.round(orderAmount / 1200));
        const rate = Math.round(orderAmount / qty);

        await prisma.personalOrderBooking.create({
          data: {
            id: pobId,
            compCode: ctx.compCode,
            empId,
            partyType: 'DOCTOR',
            partyId: visitedDoctors[0] ?? doctorIds[0]!,
            orderDate: workDate,
            dcrId,
            totalAmount: orderAmount,
            approveStatus: 'APPROVED',
            submittedAt: workDate,
            lines: {
              create: {
                compCode: ctx.compCode,
                productId,
                qty,
                rate,
                amount: orderAmount,
              },
            },
          },
        });
        pobBooked += orderAmount;
      }
    }
  }

  if (options.withPending && mrIndex === 1) {
    const draftPobId = demoPobId(mrIndex, month, 99);
    const productId = productIds[0]!;
    await prisma.personalOrderBooking.create({
      data: {
        id: draftPobId,
        compCode: ctx.compCode,
        empId,
        partyType: 'DOCTOR',
        partyId: doctorIds[1]!,
        orderDate: dateUtc(year, month, throughDay),
        totalAmount: 8500,
        approveStatus: 'DRAFT',
        lines: {
          create: {
            compCode: ctx.compCode,
            productId,
            qty: 5,
            rate: 1700,
            amount: 8500,
          },
        },
      },
    });
  }
}

export async function seedDemoMonth(prisma: PrismaClient, ctx: DemoMonthContext, adminId: string) {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  const todayDay = now.getUTCDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const specialist = await prisma.specialist.findFirstOrThrow({
    where: { compCode: ctx.compCode },
  });

  const doctorIds = await ensureDoctors(prisma, ctx.compCode, ctx.routeId, specialist.id);
  const productIds = await ensureProducts(prisma, ctx.compCode, ctx.brandId, ctx.divisionId);
  const mrEmpIds = await ensureMrEmployees(prisma, ctx);

  await clearMrTransactions(prisma, ctx.compCode, mrEmpIds);

  const mpState = await prisma.state.findFirstOrThrow({
    where: { compCode: ctx.compCode, stateName: 'Madhya Pradesh' },
  });

  const fullCtx: DemoFullContext = {
    ...ctx,
    stateId: mpState.id,
  };

  await seedDemoOperationalExtras(prisma, fullCtx, mrEmpIds, [], adminId, { clearOnly: true });

  const { retailerIds } = await seedDemoInfrastructure(prisma, fullCtx, mrEmpIds);

  for (let i = 0; i < mrEmpIds.length; i += 1) {
    await seedMrMonth(
      prisma,
      ctx,
      mrEmpIds[i]!,
      i,
      prevMonth,
      prevYear,
      daysInMonth(prevMonth, prevYear),
      doctorIds,
      productIds,
      [],
      { withPending: false },
    );
  }

  for (let i = 0; i < mrEmpIds.length; i += 1) {
    await seedMrMonth(
      prisma,
      ctx,
      mrEmpIds[i]!,
      i,
      month,
      year,
      todayDay,
      doctorIds,
      productIds,
      retailerIds,
      { withPending: true },
    );
  }

  await seedDemoOperationalExtras(prisma, fullCtx, mrEmpIds, doctorIds, adminId, { clearOnly: false });

  console.log(
    `Demo month seed: ${MR_USER_NAMES.length} MRs · ${prevMonth}/${prevYear} + ${month}/${year} · full dashboards`,
  );
  console.log('MR logins: mr1..mr10 / Mr@123 · Manager: rm1 / Rm@123');
}
