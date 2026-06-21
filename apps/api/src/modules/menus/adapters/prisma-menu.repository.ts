import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  MenuPermissionRecord,
  MenuRepositoryPort,
} from '../ports/menu.repository.port';

@Injectable()
export class PrismaMenuRepository implements MenuRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findMenusForRole(compCode: string, roleId: string): Promise<MenuPermissionRecord[]> {
    const permissions = await this.prisma.roleMenuPermission.findMany({
      where: {
        compCode,
        roleId,
        canView: true,
        menu: { active: true },
      },
      include: { menu: true },
      orderBy: { menu: { sortOrder: 'asc' } },
    });

    return permissions.map((perm) => ({
      menuId: perm.menu.id,
      menuCode: perm.menu.menuCode,
      menuName: perm.menu.menuName,
      menuUrl: perm.menu.menuUrl,
      menuType: perm.menu.menuType,
      parentMenuId: perm.menu.parentMenuId,
      sortOrder: perm.menu.sortOrder,
      canView: perm.canView,
      canAdd: perm.canAdd,
      canEdit: perm.canEdit,
      canDelete: perm.canDelete,
      canPreview: perm.canPreview,
      canPrint: perm.canPrint,
    }));
  }
}
