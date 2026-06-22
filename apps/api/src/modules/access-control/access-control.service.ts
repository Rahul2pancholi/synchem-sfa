import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  CreateRoleRequestSchema,
  SaveRolePermissionsRequestSchema,
  UpdateRoleRequestSchema,
  type JwtPayload,
  type RoleDetailSummary,
  type RolePermissionRow,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

const ADMIN_ACCESS_MENU_CODES = ['ADM01', 'ADM04'] as const;

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listRoles(compCode: string) {
    const rows = await this.prisma.role.findMany({
      where: { compCode },
      orderBy: { roleName: 'asc' },
      include: { _count: { select: { employees: true } } },
    });

    return apiSuccess({
      items: rows.map(
        (row): RoleDetailSummary => ({
          id: row.id,
          roleName: row.roleName,
          roleType: row.roleType,
          active: row.active,
          employeeCount: row._count.employees,
        }),
      ),
    });
  }

  async createRole(compCode: string, body: unknown) {
    const parsed = CreateRoleRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    try {
      const created = await this.prisma.role.create({
        data: {
          compCode,
          roleName: parsed.data.roleName,
          roleType: parsed.data.roleType,
          active: parsed.data.active,
        },
      });

      this.logger.log({ module: 'roles', action: 'create', compCode, id: created.id });
      return apiSuccess(
        {
          id: created.id,
          roleName: created.roleName,
          roleType: created.roleType,
          active: created.active,
        },
        201,
      );
    } catch {
      throw new ConflictException('Role name already exists');
    }
  }

  async updateRole(compCode: string, roleId: string, body: unknown) {
    const parsed = UpdateRoleRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    await this.assertRole(compCode, roleId);

    try {
      const updated = await this.prisma.role.update({
        where: { id: roleId },
        data: parsed.data,
      });

      this.logger.log({ module: 'roles', action: 'update', compCode, id: roleId });
      return apiSuccess({
        id: updated.id,
        roleName: updated.roleName,
        roleType: updated.roleType,
        active: updated.active,
      });
    } catch {
      throw new ConflictException('Role name already exists');
    }
  }

  async deactivateRole(compCode: string, roleId: string) {
    const role = await this.assertRole(compCode, roleId);

    const activeEmployees = await this.prisma.employee.count({
      where: { compCode, roleId, active: true },
    });
    if (activeEmployees > 0) {
      throw new BadRequestException('Cannot deactivate role with active employees');
    }

    if (role.roleName === 'ADMIN') {
      throw new BadRequestException('Cannot deactivate ADMIN role');
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: { active: false },
    });

    this.logger.log({ module: 'roles', action: 'deactivate', compCode, id: roleId });
    return apiSuccess({
      id: updated.id,
      roleName: updated.roleName,
      roleType: updated.roleType,
      active: updated.active,
    });
  }

  async getRolePermissions(compCode: string, roleId: string) {
    await this.assertRole(compCode, roleId);

    const menus = await this.prisma.menu.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { menuCode: 'asc' }],
    });

    const existing = await this.prisma.roleMenuPermission.findMany({
      where: { compCode, roleId },
    });
    const permByMenuId = new Map(existing.map((row) => [row.menuId, row]));

    const items: RolePermissionRow[] = menus.map((menu) => {
      const perm = permByMenuId.get(menu.id);
      return {
        menuId: menu.id,
        menuCode: menu.menuCode,
        menuName: menu.menuName,
        menuUrl: menu.menuUrl,
        parentMenuId: menu.parentMenuId,
        sortOrder: menu.sortOrder,
        canView: perm?.canView ?? false,
        canAdd: perm?.canAdd ?? false,
        canEdit: perm?.canEdit ?? false,
        canDelete: perm?.canDelete ?? false,
        canPreview: perm?.canPreview ?? false,
        canPrint: perm?.canPrint ?? false,
      };
    });

    return apiSuccess({ items });
  }

  async saveRolePermissions(compCode: string, roleId: string, body: unknown, user: JwtPayload) {
    const parsed = SaveRolePermissionsRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const role = await this.assertRole(compCode, roleId);
    await this.assertAdminAccessGuardrails(compCode, roleId, role.roleName, parsed.data.permissions, user);

    const menuIds = parsed.data.permissions.map((p) => p.menuId);
    const menus = await this.prisma.menu.findMany({ where: { id: { in: menuIds } } });
    if (menus.length !== menuIds.length) {
      throw new BadRequestException('Invalid menu id in permissions payload');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.roleMenuPermission.deleteMany({ where: { compCode, roleId } });

      for (const entry of parsed.data.permissions) {
        const hasAny =
          entry.canView ||
          entry.canAdd ||
          entry.canEdit ||
          entry.canDelete ||
          entry.canPreview ||
          entry.canPrint;
        if (!hasAny) continue;

        await tx.roleMenuPermission.create({
          data: {
            compCode,
            roleId,
            menuId: entry.menuId,
            canView: entry.canView,
            canAdd: entry.canAdd,
            canEdit: entry.canEdit,
            canDelete: entry.canDelete,
            canPreview: entry.canPreview,
            canPrint: entry.canPrint,
          },
        });
      }
    });

    this.logger.log({ module: 'roles', action: 'savePermissions', compCode, id: roleId });
    return apiSuccess({ saved: true });
  }

  private async assertRole(compCode: string, roleId: string) {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, compCode } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  private async assertAdminAccessGuardrails(
    compCode: string,
    roleId: string,
    roleName: string,
    permissions: Array<{
      menuId: string;
      canView: boolean;
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canPreview: boolean;
      canPrint: boolean;
    }>,
    user: JwtPayload,
  ) {
    const menus = await this.prisma.menu.findMany({
      where: { menuCode: { in: [...ADMIN_ACCESS_MENU_CODES] } },
    });
    const menuCodeById = new Map(menus.map((m) => [m.id, m.menuCode]));

    const byCode = new Map<string, (typeof permissions)[number]>();
    for (const entry of permissions) {
      const code = menuCodeById.get(entry.menuId);
      if (code) byCode.set(code, entry);
    }

    if (roleName === 'ADMIN' && user.roleId === roleId) {
      for (const code of ADMIN_ACCESS_MENU_CODES) {
        const entry = byCode.get(code);
        if (!entry?.canView || !entry?.canEdit) {
          throw new BadRequestException('Cannot remove your own role access administration rights');
        }
      }
    }

    const adminRole = await this.prisma.role.findFirst({
      where: { compCode, roleName: 'ADMIN', active: true },
    });
    if (!adminRole) return;

    if (adminRole.id === roleId) {
      for (const code of ADMIN_ACCESS_MENU_CODES) {
        const entry = byCode.get(code);
        if (!entry?.canView || !entry?.canEdit) {
          throw new BadRequestException('ADMIN role must retain access configuration permissions');
        }
      }
    }
  }
}
