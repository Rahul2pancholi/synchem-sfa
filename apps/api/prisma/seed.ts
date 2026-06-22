import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_MENUS } from './seed-data/menus';
import { templatePermission } from './seed-data/role-permission-templates';

const prisma = new PrismaClient();

async function seedMenus() {
  const menuIds = new Map<string, string>();

  for (const menu of SEED_MENUS.filter((m) => !m.parentCode)) {
    const record = await prisma.menu.upsert({
      where: { menuCode: menu.menuCode },
      update: {
        menuName: menu.menuName,
        menuUrl: menu.menuUrl,
        menuType: menu.menuType,
        sortOrder: menu.sortOrder,
      },
      create: {
        menuCode: menu.menuCode,
        menuName: menu.menuName,
        menuUrl: menu.menuUrl,
        menuType: menu.menuType,
        sortOrder: menu.sortOrder,
      },
    });
    menuIds.set(menu.menuCode, record.id);
  }

  for (const menu of SEED_MENUS.filter((m) => m.parentCode)) {
    const parentMenuId = menuIds.get(menu.parentCode!);
    const record = await prisma.menu.upsert({
      where: { menuCode: menu.menuCode },
      update: {
        menuName: menu.menuName,
        menuUrl: menu.menuUrl,
        menuType: menu.menuType,
        parentMenuId,
        sortOrder: menu.sortOrder,
      },
      create: {
        menuCode: menu.menuCode,
        menuName: menu.menuName,
        menuUrl: menu.menuUrl,
        menuType: menu.menuType,
        parentMenuId,
        sortOrder: menu.sortOrder,
      },
    });
    menuIds.set(menu.menuCode, record.id);
  }

  return menuIds;
}

async function seedRolePermissions(
  compCode: string,
  roleId: string,
  roleType: 'AD' | 'MAN' | 'FS',
) {
  const menus = await prisma.menu.findMany({ where: { active: true } });

  for (const menu of menus) {
    const flags = templatePermission(roleType, menu.menuCode);
    const hasAny =
      flags.canView ||
      flags.canAdd ||
      flags.canEdit ||
      flags.canDelete ||
      flags.canPreview ||
      flags.canPrint;
    if (!hasAny) continue;

    await prisma.roleMenuPermission.upsert({
      where: {
        compCode_roleId_menuId: {
          compCode,
          roleId,
          menuId: menu.id,
        },
      },
      update: flags,
      create: {
        compCode,
        roleId,
        menuId: menu.id,
        ...flags,
      },
    });
  }
}

async function seedAdminPermissions(compCode: string, roleId: string) {
  await seedRolePermissions(compCode, roleId, 'AD');
}

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';
  const platformPassword = process.env.SEED_PLATFORM_PASSWORD ?? 'Platform@123';

  await seedMenus();

  await prisma.company.upsert({
    where: { compCode: 'SYN' },
    update: {},
    create: {
      compCode: 'SYN',
      compName: 'Synchem Pharmaceuticals Pvt. Ltd.',
      compAddress: '38, S.R. Compound, Dewas Naka, Indore',
      industryType: 'SYN',
      timezone: 'Asia/Kolkata',
      locale: 'en-IN',
    },
  });

  const role = await prisma.role.upsert({
    where: { compCode_roleName: { compCode: 'SYN', roleName: 'ADMIN' } },
    update: {},
    create: {
      compCode: 'SYN',
      roleName: 'ADMIN',
      roleType: 'AD',
    },
  });

  await seedAdminPermissions('SYN', role.id);

  const mrRole = await prisma.role.upsert({
    where: { compCode_roleName: { compCode: 'SYN', roleName: 'MR' } },
    update: {},
    create: {
      compCode: 'SYN',
      roleName: 'MR',
      roleType: 'FS',
    },
  });

  await seedRolePermissions('SYN', mrRole.id, 'FS');

  const manRole = await prisma.role.upsert({
    where: { compCode_roleName: { compCode: 'SYN', roleName: 'RM' } },
    update: {},
    create: {
      compCode: 'SYN',
      roleName: 'RM',
      roleType: 'MAN',
    },
  });

  await seedRolePermissions('SYN', manRole.id, 'MAN');

  const adHierarchy = await prisma.hierarchy.upsert({
    where: { compCode_hierarchyCode: { compCode: 'SYN', hierarchyCode: 'AD-INDORE' } },
    update: {},
    create: {
      compCode: 'SYN',
      hierarchyCode: 'AD-INDORE',
      hierarchyType: 'AD',
      hierarchyLevel: 1,
    },
  });

  const rmHierarchy = await prisma.hierarchy.upsert({
    where: { compCode_hierarchyCode: { compCode: 'SYN', hierarchyCode: 'RM-INDORE' } },
    update: { reportingHierarchyId: adHierarchy.id },
    create: {
      compCode: 'SYN',
      hierarchyCode: 'RM-INDORE',
      hierarchyType: 'RM',
      hierarchyLevel: 2,
      reportingHierarchyId: adHierarchy.id,
    },
  });

  await prisma.hierarchy.upsert({
    where: { compCode_hierarchyCode: { compCode: 'SYN', hierarchyCode: 'MR-INDORE' } },
    update: { reportingHierarchyId: rmHierarchy.id },
    create: {
      compCode: 'SYN',
      hierarchyCode: 'MR-INDORE',
      hierarchyType: 'MR',
      hierarchyLevel: 4,
      reportingHierarchyId: rmHierarchy.id,
    },
  });

  const mpState = await prisma.state.upsert({
    where: { compCode_stateName: { compCode: 'SYN', stateName: 'Madhya Pradesh' } },
    update: {},
    create: { compCode: 'SYN', stateName: 'Madhya Pradesh' },
  });

  await prisma.city.upsert({
    where: {
      compCode_stateId_cityName: { compCode: 'SYN', stateId: mpState.id, cityName: 'Indore' },
    },
    update: {},
    create: { compCode: 'SYN', stateId: mpState.id, cityName: 'Indore' },
  });

  const hq = await prisma.headQuarter.upsert({
    where: { compCode_hqName: { compCode: 'SYN', hqName: 'Indore-1' } },
    update: { stateId: mpState.id },
    create: { compCode: 'SYN', hqName: 'Indore-1', stateId: mpState.id },
  });

  await prisma.route.upsert({
    where: {
      compCode_headQuarterId_routeName: {
        compCode: 'SYN',
        headQuarterId: hq.id,
        routeName: 'Route-A',
      },
    },
    update: {},
    create: { compCode: 'SYN', headQuarterId: hq.id, routeName: 'Route-A' },
  });

  const route = await prisma.route.findFirstOrThrow({
    where: { compCode: 'SYN', routeName: 'Route-A' },
  });

  const specialist = await prisma.specialist.findFirstOrThrow({
    where: { compCode: 'SYN', specialistName: 'General Physician' },
  });

  await prisma.doctor.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: { routeId: route.id, active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      compCode: 'SYN',
      routeId: route.id,
      doctorName: 'Dr. Sample Sharma',
      specialistId: specialist.id,
      mobileNo: '9876543210',
      approveStatus: 'APPROVED',
      active: true,
    },
  });

  await prisma.retailer.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: { routeId: route.id, active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      compCode: 'SYN',
      routeId: route.id,
      retailerName: 'Sample Medical Store',
      approveStatus: 'APPROVED',
      active: true,
    },
  });

  const brand = await prisma.brand.upsert({
    where: { compCode_brandName: { compCode: 'SYN', brandName: 'Synchem' } },
    update: {},
    create: { compCode: 'SYN', brandName: 'Synchem' },
  });

  const division = await prisma.productDivision.upsert({
    where: { compCode_divisionName: { compCode: 'SYN', divisionName: 'General' } },
    update: {},
    create: { compCode: 'SYN', divisionName: 'General' },
  });

  await prisma.product.upsert({
    where: { compCode_productCode: { compCode: 'SYN', productCode: 'PRD001' } },
    update: { brandId: brand.id, divisionId: division.id },
    create: {
      compCode: 'SYN',
      productName: 'Sample Product',
      productCode: 'PRD001',
      brandId: brand.id,
      divisionId: division.id,
    },
  });

  await prisma.specialist.upsert({
    where: { compCode_specialistName: { compCode: 'SYN', specialistName: 'General Physician' } },
    update: {},
    create: { compCode: 'SYN', specialistName: 'General Physician' },
  });

  await prisma.designation.upsert({
    where: { compCode_designationName: { compCode: 'SYN', designationName: 'Medical Representative' } },
    update: {},
    create: { compCode: 'SYN', designationName: 'Medical Representative' },
  });

  for (const [key, value] of [
    ['SET001', '1'],
    ['SET002', '1'],
    ['SET010', 'Asia/Kolkata'],
  ] as const) {
    await prisma.companySetting.upsert({
      where: { compCode_settingKey: { compCode: 'SYN', settingKey: key } },
      update: { settingValue: value },
      create: {
        compCode: 'SYN',
        settingKey: key,
        settingValue: value,
        dataType: 'string',
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.employee.upsert({
    where: { compCode_userName: { compCode: 'SYN', userName: 'admin' } },
    update: { passwordHash, roleId: role.id },
    create: {
      compCode: 'SYN',
      userName: 'admin',
      passwordHash,
      employeeCode: '0002',
      firstName: 'Admin',
      lastName: 'User',
      email: 'info@synchem.co',
      roleId: role.id,
      active: true,
      isFirstLogin: false,
    },
  });

  const mrPasswordHash = await bcrypt.hash('Mr@123', 10);
  const mrHierarchy = await prisma.hierarchy.findFirstOrThrow({
    where: { compCode: 'SYN', hierarchyCode: 'MR-INDORE' },
  });

  const rmPasswordHash = await bcrypt.hash('Rm@123', 10);
  const rmEmployee = await prisma.employee.upsert({
    where: { compCode_userName: { compCode: 'SYN', userName: 'rm1' } },
    update: {
      passwordHash: rmPasswordHash,
      roleId: manRole.id,
      hierarchyId: rmHierarchy.id,
    },
    create: {
      compCode: 'SYN',
      userName: 'rm1',
      passwordHash: rmPasswordHash,
      employeeCode: 'RM001',
      firstName: 'Manager',
      lastName: 'RM',
      email: 'rm1@synchem.co',
      roleId: manRole.id,
      hierarchyId: rmHierarchy.id,
      active: true,
      isFirstLogin: false,
    },
  });

  await prisma.employee.upsert({
    where: { compCode_userName: { compCode: 'SYN', userName: 'mr1' } },
    update: {
      passwordHash: mrPasswordHash,
      roleId: mrRole.id,
      headQuarterId: hq.id,
      hierarchyId: mrHierarchy.id,
      reportingManagerId: rmEmployee.id,
    },
    create: {
      compCode: 'SYN',
      userName: 'mr1',
      passwordHash: mrPasswordHash,
      employeeCode: 'MR001',
      firstName: 'Rahul',
      lastName: 'MR',
      email: 'mr1@synchem.co',
      roleId: mrRole.id,
      headQuarterId: hq.id,
      hierarchyId: mrHierarchy.id,
      reportingManagerId: rmEmployee.id,
      active: true,
      isFirstLogin: false,
    },
  });

  const mrEmployee = await prisma.employee.findFirstOrThrow({
    where: { compCode: 'SYN', userName: 'mr1' },
  });

  for (const policy of [
    { leaveType: 'CL', annualQuota: 12, carryForwardLimit: 3 },
    { leaveType: 'SL', annualQuota: 6, carryForwardLimit: 0 },
    { leaveType: 'PL', annualQuota: 15, carryForwardLimit: 0 },
  ]) {
    await prisma.leavePolicy.upsert({
      where: { compCode_leaveType: { compCode: 'SYN', leaveType: policy.leaveType } },
      update: {
        annualQuota: policy.annualQuota,
        carryForwardLimit: policy.carryForwardLimit,
        active: true,
      },
      create: {
        compCode: 'SYN',
        leaveType: policy.leaveType,
        annualQuota: policy.annualQuota,
        carryForwardLimit: policy.carryForwardLimit,
        active: true,
      },
    });
  }

  const policyYear = new Date().getFullYear();
  for (const balance of [
    { leaveType: 'CL', balance: 12 },
    { leaveType: 'SL', balance: 6 },
    { leaveType: 'PL', balance: 15 },
  ]) {
    await prisma.leaveBalance.upsert({
      where: {
        compCode_empId_leaveType_policyYear: {
          compCode: 'SYN',
          empId: mrEmployee.id,
          leaveType: balance.leaveType,
          policyYear,
        },
      },
      update: { balance: balance.balance },
      create: {
        compCode: 'SYN',
        empId: mrEmployee.id,
        leaveType: balance.leaveType,
        policyYear,
        balance: balance.balance,
      },
    });
  }

  for (const headName of ['Travel', 'Fixed Allowance', 'Daily Allowance']) {
    await prisma.expenseHead.upsert({
      where: { compCode_headName: { compCode: 'SYN', headName } },
      update: { active: true },
      create: { compCode: 'SYN', headName, active: true },
    });
  }

  const platformHash = await bcrypt.hash(platformPassword, 10);
  await prisma.platformUser.upsert({
    where: { email: 'superadmin@synchem.co' },
    update: { passwordHash: platformHash },
    create: {
      email: 'superadmin@synchem.co',
      passwordHash: platformHash,
      fullName: 'Platform Super Admin',
    },
  });

  await seedAdminPermissions('SYN', role.id);
  await seedRolePermissions('SYN', manRole.id, 'MAN');
  await seedRolePermissions('SYN', mrRole.id, 'FS');

  console.log('Seed complete: SYN tenant + admin (admin / Admin@123) + MR (mr1 / Mr@123) + RM (rm1 / Rm@123)');
  console.log('Platform super admin: superadmin@synchem.co / Platform@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
