/**
 * Import normalized live-pull JSON into PostgreSQL (SYN tenant).
 *
 * Prerequisite:
 *   pnpm db:migrate && pnpm live-pull:normalize
 *   data/live-pull/raw/ populated (see data/live-pull/README.md)
 *
 * Usage:
 *   pnpm db:seed:live
 */
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_MENUS } from './seed-data/menus';
import { templatePermission } from './seed-data/role-permission-templates';
import {
  batchCreateMany,
  COMP_CODE,
  livePullDir,
  liveUuid,
  normName,
  parseLiveInt,
  parseSeedLimit,
  readLiveJson,
  unwrapList,
} from './live-pull-utils';

const prisma = new PrismaClient();

type LiveRole = {
  roleId: number;
  roleName: string;
  roleType: string;
  active?: boolean;
};

type LiveHierarchy = {
  hierachyId: number;
  hierachyCode: string;
  hierachyDescription: string;
  hierachyLevel: number;
  hierachyType: string;
  underHierarchy: string;
};

type LiveEmployee = {
  empId: number;
  userName: string;
  password?: string;
  firstName: string;
  lastName?: string;
  emailId?: string;
  mobileNo?: string;
  employeeCode?: string;
  roleId: number;
  roleType?: string;
  headQuaterId?: number | string;
  headQuaterName?: string;
  hierachyId?: number;
  hierachyCode?: string;
  reportingManager?: number;
  reportingHierachy?: number;
  division?: string;
  active?: boolean;
  isFirstLogin?: boolean;
  isCheckIn?: boolean;
  isGeoFencingApplicable?: boolean;
  pushToken?: string | null;
};

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
}

function mapRoleType(roleType: string): 'AD' | 'MAN' | 'FS' {
  if (roleType === 'AD' || roleType === 'MGT') return 'AD';
  if (roleType === 'FS') return 'FS';
  return 'MAN';
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
        compCode_roleId_menuId: { compCode, roleId, menuId: menu.id },
      },
      update: flags,
      create: { compCode, roleId, menuId: menu.id, ...flags },
    });
  }
}

async function seedRoles(): Promise<Map<number, string>> {
  const payload = await readLiveJson<Record<string, unknown>>('masters/role-list.json');
  const rows = unwrapList<LiveRole>(payload, ['roles', 'roleList', 'rolesList']);
  const roleMap = new Map<number, string>();

  for (const row of rows) {
    const id = liveUuid('role', row.roleId);
    await prisma.role.upsert({
      where: { compCode_roleName: { compCode: COMP_CODE, roleName: row.roleName } },
      update: { roleType: mapRoleType(row.roleType), active: row.active ?? true },
      create: {
        id,
        compCode: COMP_CODE,
        roleName: row.roleName,
        roleType: mapRoleType(row.roleType),
        active: row.active ?? true,
      },
    });
    const saved = await prisma.role.findFirstOrThrow({
      where: { compCode: COMP_CODE, roleName: row.roleName },
    });
    roleMap.set(row.roleId, saved.id);
    await seedRolePermissions(COMP_CODE, saved.id, mapRoleType(row.roleType));
  }

  console.log(`  roles: ${roleMap.size}`);
  return roleMap;
}

async function seedStatesAndCities(): Promise<Map<string, string>> {
  const stateMap = new Map<string, string>();
  const cityKeys = new Set<string>();

  const statePayload = await readLiveJson<Record<string, unknown>>('masters/city-state.json');
  const stateRows = unwrapList<{ stateId: number; stateName: string }>(statePayload, [
    'stateList',
  ]);

  const hqPayload = await readLiveJson<Record<string, unknown>>('masters/headquarter-active.json');
  const hqRows = unwrapList<{ stateName?: string; cityName?: string }>(hqPayload, [
    'headQuaterList',
    'headQuarterList',
  ]);

  const stateNames = new Set<string>();
  for (const row of stateRows) {
    const name = normName(row.stateName);
    if (name) stateNames.add(name);
  }
  for (const row of hqRows) {
    const name = normName(row.stateName);
    if (name) stateNames.add(name);
  }

  for (const stateName of stateNames) {
    const id = liveUuid('state', stateName.toUpperCase());
    const saved = await prisma.state.upsert({
      where: { compCode_stateName: { compCode: COMP_CODE, stateName } },
      update: { active: true },
      create: { id, compCode: COMP_CODE, stateName, active: true },
    });
    stateMap.set(stateName.toUpperCase(), saved.id);
  }

  for (const row of hqRows) {
    const stateName = normName(row.stateName);
    const cityName = normName(row.cityName);
    if (!stateName || !cityName) continue;
    const stateId = stateMap.get(stateName.toUpperCase());
    if (!stateId) continue;
    const key = `${stateId}:${cityName.toUpperCase()}`;
    if (cityKeys.has(key)) continue;
    cityKeys.add(key);
    await prisma.city.upsert({
      where: { compCode_stateId_cityName: { compCode: COMP_CODE, stateId, cityName } },
      update: { active: true },
      create: {
        id: liveUuid('city', `${stateName}:${cityName}`),
        compCode: COMP_CODE,
        stateId,
        cityName,
        active: true,
      },
    });
  }

  console.log(`  states: ${stateMap.size}, cities: ${cityKeys.size}`);
  return stateMap;
}

async function seedHeadQuarters(stateMap: Map<string, string>): Promise<Map<number, string>> {
  const payload = await readLiveJson<Record<string, unknown>>('masters/headquarter-active.json');
  const rows = unwrapList<{
    headQuaterId: number;
    headQuaterName: string;
    stateName?: string;
    active?: boolean;
  }>(payload, ['headQuaterList', 'headQuarterList']);
  const hqMap = new Map<number, string>();

  for (const row of rows) {
    const hqName = normName(row.headQuaterName);
    if (!hqName) continue;
    const stateId = row.stateName
      ? stateMap.get(normName(row.stateName).toUpperCase())
      : undefined;
    const id = liveUuid('hq', row.headQuaterId);
    await prisma.headQuarter.upsert({
      where: { compCode_hqName: { compCode: COMP_CODE, hqName } },
      update: { stateId: stateId ?? null, active: row.active ?? true },
      create: {
        id,
        compCode: COMP_CODE,
        hqName,
        stateId: stateId ?? null,
        active: row.active ?? true,
      },
    });
    const saved = await prisma.headQuarter.findFirstOrThrow({
      where: { compCode: COMP_CODE, hqName },
    });
    hqMap.set(row.headQuaterId, saved.id);
  }

  console.log(`  headquarters: ${hqMap.size}`);
  return hqMap;
}

async function seedRoutes(hqMap: Map<number, string>): Promise<Map<number, string>> {
  const payload = await readLiveJson<Record<string, unknown>>('masters/route-list-all.json');
  const rows = unwrapList<{
    routeId: number;
    routeName: string;
    headQuaterId: number;
    status?: string;
  }>(payload, ['routeListAll', 'routeList']);
  const routeMap = new Map<number, string>();
  let skipped = 0;

  for (const row of rows) {
    const routeName = normName(row.routeName);
    const hqId = hqMap.get(row.headQuaterId);
    if (!routeName || !hqId) {
      skipped += 1;
      continue;
    }
    const id = liveUuid('route', row.routeId);
    await prisma.route.upsert({
      where: {
        compCode_headQuarterId_routeName: {
          compCode: COMP_CODE,
          headQuarterId: hqId,
          routeName,
        },
      },
      update: { active: row.status !== 'N' },
      create: {
        id,
        compCode: COMP_CODE,
        headQuarterId: hqId,
        routeName,
        active: row.status !== 'N',
      },
    });
    const saved = await prisma.route.findFirstOrThrow({
      where: { compCode: COMP_CODE, headQuarterId: hqId, routeName },
    });
    routeMap.set(row.routeId, saved.id);
  }

  console.log(`  routes: ${routeMap.size} (skipped ${skipped})`);
  return routeMap;
}

async function seedLookups() {
  const divisionPayload = await readLiveJson<Record<string, unknown>>('masters/division-list.json');
  const divisions = unwrapList<{ divisionId: number; division: string }>(divisionPayload, [
    'divisionList',
  ]);
  const divisionMap = new Map<number, string>();
  for (const row of divisions) {
    const divisionName = normName(row.division);
    if (!divisionName) continue;
    const saved = await prisma.productDivision.upsert({
      where: { compCode_divisionName: { compCode: COMP_CODE, divisionName } },
      update: { active: true },
      create: {
        id: liveUuid('division', row.divisionId),
        compCode: COMP_CODE,
        divisionName,
        active: true,
      },
    });
    divisionMap.set(row.divisionId, saved.id);
  }

  const specialistPayload = await readLiveJson<Record<string, unknown>>(
    'masters/specialist-list.json',
  );
  const specialists = unwrapList<{ specialistId: number; specialistName: string }>(
    specialistPayload,
    ['specialistList'],
  );
  const specialistMap = new Map<number, string>();
  for (const row of specialists) {
    const specialistName = normName(row.specialistName);
    if (!specialistName) continue;
    const saved = await prisma.specialist.upsert({
      where: { compCode_specialistName: { compCode: COMP_CODE, specialistName } },
      update: { active: true },
      create: {
        id: liveUuid('specialist', row.specialistId),
        compCode: COMP_CODE,
        specialistName,
        active: true,
      },
    });
    specialistMap.set(row.specialistId, saved.id);
  }

  const qualPayload = await readLiveJson<Record<string, unknown>>(
    'masters/qualification-list.json',
  );
  const qualifications = unwrapList<{ qualificationId: number; qualificationName: string }>(
    qualPayload,
    ['qualificationList'],
  );
  const qualificationMap = new Map<number, string>();
  for (const row of qualifications) {
    const qualificationName = normName(row.qualificationName);
    if (!qualificationName) continue;
    const saved = await prisma.qualification.upsert({
      where: { compCode_qualificationName: { compCode: COMP_CODE, qualificationName } },
      update: { active: true },
      create: {
        id: liveUuid('qualification', row.qualificationId),
        compCode: COMP_CODE,
        qualificationName,
        active: true,
      },
    });
    qualificationMap.set(row.qualificationId, saved.id);
  }

  const desigPayload = await readLiveJson<Record<string, unknown>>('masters/designation-list.json');
  const designations = unwrapList<{ designationId?: number; designationName: string }>(
    desigPayload,
    ['designationList'],
  );
  for (const row of designations) {
    const designationName = normName(row.designationName);
    if (!designationName) continue;
    await prisma.designation.upsert({
      where: { compCode_designationName: { compCode: COMP_CODE, designationName } },
      update: { active: true },
      create: {
        id: liveUuid('designation', row.designationId ?? designationName),
        compCode: COMP_CODE,
        designationName,
        active: true,
      },
    });
  }

  const brandPayload = await readLiveJson<Record<string, unknown>>('masters/brand-list.json');
  const brands = unwrapList<{ brandId: number; brandName: string }>(brandPayload, ['brandList']);
  const brandMap = new Map<number, string>();
  for (const row of brands) {
    const brandName = normName(row.brandName);
    if (!brandName) continue;
    const saved = await prisma.brand.upsert({
      where: { compCode_brandName: { compCode: COMP_CODE, brandName } },
      update: { active: true },
      create: {
        id: liveUuid('brand', row.brandId),
        compCode: COMP_CODE,
        brandName,
        active: true,
      },
    });
    brandMap.set(row.brandId, saved.id);
  }

  const productPayload = await readLiveJson<Record<string, unknown>>('masters/product-list.json');
  const products = unwrapList<{
    productId: number;
    productName: string;
    prodCode?: string;
    brandId?: number;
    divisionId?: number;
    isDisabled?: boolean;
  }>(productPayload, ['productList']);

  const productRows: Prisma.ProductCreateManyInput[] = [];
  const seenCodes = new Set<string>();
  for (const row of products) {
    const productName = normName(row.productName);
    if (!productName) continue;
    const productCode = normName(row.prodCode) || `LIVE-${row.productId}`;
    if (seenCodes.has(productCode)) continue;
    seenCodes.add(productCode);
    productRows.push({
      id: liveUuid('product', row.productId),
      compCode: COMP_CODE,
      productName,
      productCode,
      brandId: row.brandId ? brandMap.get(row.brandId) : undefined,
      divisionId: row.divisionId ? divisionMap.get(row.divisionId) : undefined,
      active: !row.isDisabled,
    });
  }

  await batchCreateMany('products', productRows, (chunk) =>
    prisma.product.createMany({ data: chunk, skipDuplicates: true }),
  );

  console.log(
    `  lookups: divisions ${divisionMap.size}, specialists ${specialistMap.size}, qualifications ${qualificationMap.size}, brands ${brandMap.size}`,
  );

  return { specialistMap, qualificationMap, divisionMap };
}

async function seedHierarchies(): Promise<Map<number, string>> {
  const payload = await readLiveJson<Record<string, unknown>>('hierarchy/hierarchy-reporting.json');
  const rows = unwrapList<LiveHierarchy>(payload, ['hierachyList', 'hierarchyList']);
  const hierMap = new Map<number, string>();
  const byDescription = new Map<string, number>();

  for (const row of rows) {
    byDescription.set(normName(row.hierachyDescription).toLowerCase(), row.hierachyId);
    byDescription.set(normName(row.hierachyCode).toLowerCase(), row.hierachyId);
  }

  for (const row of rows) {
    const id = liveUuid('hierarchy', row.hierachyId);
    await prisma.hierarchy.upsert({
      where: { compCode_hierarchyCode: { compCode: COMP_CODE, hierarchyCode: row.hierachyCode } },
      update: {
        hierarchyType: row.hierachyType,
        hierarchyLevel: row.hierachyLevel,
        active: true,
      },
      create: {
        id,
        compCode: COMP_CODE,
        hierarchyCode: row.hierachyCode,
        hierarchyType: row.hierachyType,
        hierarchyLevel: row.hierachyLevel,
        active: true,
      },
    });
    const saved = await prisma.hierarchy.findFirstOrThrow({
      where: { compCode: COMP_CODE, hierarchyCode: row.hierachyCode },
    });
    hierMap.set(row.hierachyId, saved.id);
  }

  for (const row of rows) {
    const parentLiveId = byDescription.get(normName(row.underHierarchy).toLowerCase());
    if (!parentLiveId || parentLiveId === row.hierachyId) continue;
    const id = hierMap.get(row.hierachyId);
    const parentId = hierMap.get(parentLiveId);
    if (!id || !parentId) continue;
    await prisma.hierarchy.update({
      where: { id },
      data: { reportingHierarchyId: parentId },
    });
  }

  console.log(`  hierarchies: ${hierMap.size}`);
  return hierMap;
}

function defaultPassword(roleType?: string): string {
  if (roleType === 'AD' || roleType === 'MGT') return process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';
  if (roleType === 'FS') return 'Mr@123';
  return 'Rm@123';
}

/** UAT demo logins — keep stable even when importing live employee passwords. */
const DEMO_USER_PASSWORDS: Record<string, string> = {
  admin: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123',
  mr1: 'Mr@123',
  rm1: 'Rm@123',
};

function resolveEmployeePassword(userName: string, livePassword: unknown, roleType?: string): string {
  const demo = DEMO_USER_PASSWORDS[userName.toLowerCase()];
  if (demo) return demo;
  return normName(livePassword) || defaultPassword(roleType);
}

async function seedEmployees(
  roleMap: Map<number, string>,
  hqMap: Map<number, string>,
  hierMap: Map<number, string>,
): Promise<Map<number, string>> {
  const payload = await readLiveJson<Record<string, unknown>>('users/employee-list.json');
  const rows = unwrapList<LiveEmployee>(payload, ['employeeList']);
  const empMap = new Map<number, string>();
  const hqByName = new Map<string, string>();
  const hqs = await prisma.headQuarter.findMany({ where: { compCode: COMP_CODE } });
  for (const hq of hqs) {
    hqByName.set(hq.hqName.toLowerCase(), hq.id);
  }

  const hierByCode = new Map<string, string>();
  const hiers = await prisma.hierarchy.findMany({ where: { compCode: COMP_CODE } });
  for (const h of hiers) {
    hierByCode.set(h.hierarchyCode.toLowerCase(), h.id);
  }

  const divisionPayload = await readLiveJson<Record<string, unknown>>('masters/division-list.json');
  const divisions = unwrapList<{ divisionId: number; division: string }>(divisionPayload, [
    'divisionList',
  ]);
  const divisionByLiveId = new Map<number, string>();
  for (const d of divisions) {
    const rec = await prisma.productDivision.findFirst({
      where: { compCode: COMP_CODE, divisionName: normName(d.division) },
    });
    if (rec) divisionByLiveId.set(d.divisionId, rec.id);
  }

  type PendingEmployee = {
    liveId: number;
    reportingManager?: number;
    roleId: string;
    headQuarterId?: string;
    hierarchyId?: string;
    divisionId?: string;
    id: string;
    userName: string;
    passwordHash: string;
    firstName: string;
    lastName?: string;
    email?: string;
    mobileNo?: string;
    employeeCode?: string;
    active: boolean;
    isFirstLogin: boolean;
    isCheckInEnabled: boolean;
    isGeoFencingEnabled: boolean;
    pushToken?: string | null;
  };
  const pending: PendingEmployee[] = [];

  for (const row of rows) {
    const userName = normName(row.userName);
    if (!userName) continue;
    const roleId = roleMap.get(row.roleId);
    if (!roleId) continue;

    const plainPassword = resolveEmployeePassword(userName, row.password, row.roleType);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    let headQuarterId: string | undefined;
    const liveHqId = parseLiveInt(row.headQuaterId);
    if (liveHqId) headQuarterId = hqMap.get(liveHqId);
    if (!headQuarterId && row.headQuaterName) {
      headQuarterId = hqByName.get(normName(row.headQuaterName).toLowerCase());
    }

    let hierarchyId: string | undefined;
    if (row.hierachyId && row.hierachyId > 0) {
      hierarchyId = hierMap.get(row.hierachyId);
    } else if (row.hierachyCode) {
      hierarchyId = hierByCode.get(row.hierachyCode.toLowerCase());
    }

    const divisionLiveId = parseLiveInt(row.division);
    const divisionId = divisionLiveId ? divisionByLiveId.get(divisionLiveId) : undefined;

    pending.push({
      liveId: row.empId,
      reportingManager: parseLiveInt(row.reportingManager) ?? undefined,
      id: liveUuid('employee', row.empId),
      roleId,
      headQuarterId,
      hierarchyId,
      divisionId,
      userName,
      passwordHash,
      employeeCode: normName(row.employeeCode) || undefined,
      firstName: normName(row.firstName) || userName,
      lastName: normName(row.lastName) || undefined,
      email: normName(row.emailId) || undefined,
      mobileNo: normName(row.mobileNo) || undefined,
      active: row.active ?? true,
      isFirstLogin: row.isFirstLogin ?? false,
      isCheckInEnabled: row.isCheckIn ?? false,
      isGeoFencingEnabled: row.isGeoFencingApplicable ?? false,
      pushToken: row.pushToken ?? undefined,
    });
  }

  for (const item of pending) {
    await prisma.employee.upsert({
      where: { compCode_userName: { compCode: COMP_CODE, userName: item.userName } },
      update: {
        passwordHash: item.passwordHash,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        mobileNo: item.mobileNo,
        employeeCode: item.employeeCode,
        roleId: item.roleId,
        headQuarterId: item.headQuarterId ?? null,
        hierarchyId: item.hierarchyId ?? null,
        divisionId: item.divisionId ?? null,
        active: item.active,
        isFirstLogin: item.isFirstLogin,
        isCheckInEnabled: item.isCheckInEnabled,
        isGeoFencingEnabled: item.isGeoFencingEnabled,
        pushToken: item.pushToken ?? undefined,
      },
      create: {
        id: item.id,
        compCode: COMP_CODE,
        userName: item.userName,
        passwordHash: item.passwordHash,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        mobileNo: item.mobileNo,
        employeeCode: item.employeeCode,
        roleId: item.roleId,
        headQuarterId: item.headQuarterId,
        hierarchyId: item.hierarchyId,
        divisionId: item.divisionId,
        active: item.active,
        isFirstLogin: item.isFirstLogin,
        isCheckInEnabled: item.isCheckInEnabled,
        isGeoFencingEnabled: item.isGeoFencingEnabled,
        pushToken: item.pushToken ?? undefined,
      },
    });
    const saved = await prisma.employee.findFirstOrThrow({
      where: { compCode: COMP_CODE, userName: item.userName },
    });
    empMap.set(item.liveId, saved.id);
  }

  let managersLinked = 0;
  for (const item of pending) {
    if (!item.reportingManager) continue;
    const empId = empMap.get(item.liveId);
    const managerId = empMap.get(item.reportingManager);
    if (!empId || !managerId || empId === managerId) continue;
    await prisma.employee.update({
      where: { id: empId },
      data: { reportingManagerId: managerId },
    });
    managersLinked += 1;
  }

  console.log(`  employees: ${empMap.size} (reporting links: ${managersLinked})`);
  return empMap;
}

async function seedDoctors(
  routeMap: Map<number, string>,
  specialistMap: Map<number, string>,
  qualificationMap: Map<number, string>,
) {
  const payload = await readLiveJson<Record<string, unknown>>('masters/doctor-list.json');
  const rows = unwrapList<{
    doctorId: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    doctorName?: string;
    routeId?: number;
    speciality?: number;
    degree?: number;
    mobileNo?: string;
    active?: boolean;
    approveStatus?: string;
  }>(payload, ['doctorList']);

  const maxDoctors = parseSeedLimit('LIVE_SEED_MAX_DOCTORS');
  const doctorRows: Prisma.DoctorCreateManyInput[] = [];
  for (const row of rows) {
    if (maxDoctors && doctorRows.length >= maxDoctors) break;
    const doctorName =
      normName(row.fullName) ||
      normName(row.doctorName) ||
      normName([row.firstName, row.lastName].filter(Boolean).join(' '));
    if (!doctorName) continue;

    doctorRows.push({
      id: liveUuid('doctor', row.doctorId),
      compCode: COMP_CODE,
      doctorName,
      routeId: row.routeId ? routeMap.get(row.routeId) : undefined,
      specialistId: row.speciality ? specialistMap.get(row.speciality) : undefined,
      qualificationId: row.degree ? qualificationMap.get(row.degree) : undefined,
      mobileNo: normName(row.mobileNo) || undefined,
      approveStatus: normName(row.approveStatus) || 'APPROVED',
      active: row.active ?? true,
    });
  }

  await batchCreateMany('doctors', doctorRows, (chunk) =>
    prisma.doctor.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function seedRetailers(routeMap: Map<number, string>) {
  const payload = await readLiveJson<Record<string, unknown>>('masters/retailer-list.json');
  const rows = unwrapList<{
    retailerId: number;
    shopName: string;
    routeId?: number;
    approveStatus?: string;
    active?: boolean;
  }>(payload, ['retailerList']);

  const maxRetailers = parseSeedLimit('LIVE_SEED_MAX_RETAILERS');
  const retailerRows: Prisma.RetailerCreateManyInput[] = [];
  for (const row of rows) {
    if (maxRetailers && retailerRows.length >= maxRetailers) break;
    const retailerName = normName(row.shopName);
    if (!retailerName) continue;
    retailerRows.push({
      id: liveUuid('retailer', row.retailerId),
      compCode: COMP_CODE,
      retailerName,
      routeId: row.routeId ? routeMap.get(row.routeId) : undefined,
      approveStatus: normName(row.approveStatus) || 'APPROVED',
      active: row.active ?? true,
    });
  }

  await batchCreateMany('retailers', retailerRows, (chunk) =>
    prisma.retailer.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function main() {
  console.log(`Live-pull seed from ${livePullDir()}\n`);

  await prisma.company.upsert({
    where: { compCode: COMP_CODE },
    update: {},
    create: {
      compCode: COMP_CODE,
      compName: 'Synchem Pharmaceuticals Pvt. Ltd.',
      compAddress: '38, S.R. Compound, Dewas Naka, Indore',
      industryType: 'SYN',
      timezone: 'Asia/Kolkata',
      locale: 'en-IN',
    },
  });

  await seedMenus();
  const roleMap = await seedRoles();
  const stateMap = await seedStatesAndCities();
  const hqMap = await seedHeadQuarters(stateMap);
  const routeMap = await seedRoutes(hqMap);
  const { specialistMap, qualificationMap } = await seedLookups();
  const hierMap = await seedHierarchies();
  await seedEmployees(roleMap, hqMap, hierMap);
  await seedDoctors(routeMap, specialistMap, qualificationMap);
  await seedRetailers(routeMap);

  console.log('\nLive-pull seed complete.');
  console.log('Sample login: MRAligarh1 / MR@12345 (from live employee-list)');
  console.log('Admin password comes from live employee-list (not Admin@123).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
