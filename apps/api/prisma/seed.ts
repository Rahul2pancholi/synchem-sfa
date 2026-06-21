import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';

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

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.employee.upsert({
    where: { compCode_userName: { compCode: 'SYN', userName: 'admin' } },
    update: { passwordHash },
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

  console.log('Seed complete: SYN tenant + admin user (admin / Admin@123 default)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
