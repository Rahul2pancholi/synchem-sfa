import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_MENUS } from './seed-data/menus';

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

async function seedAdminPermissions(compCode: string, roleId: string) {
  const menus = await prisma.menu.findMany({ where: { active: true } });

  for (const menu of menus) {
    await prisma.roleMenuPermission.upsert({
      where: {
        compCode_roleId_menuId: {
          compCode,
          roleId,
          menuId: menu.id,
        },
      },
      update: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canPreview: true,
        canPrint: true,
      },
      create: {
        compCode,
        roleId,
        menuId: menu.id,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canPreview: true,
        canPrint: true,
      },
    });
  }
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

  console.log('Seed complete: SYN tenant + admin (admin / Admin@123)');
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
