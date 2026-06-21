import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import {
  PERMISSION_KEY,
  type RequiredPermission,
} from '../decorators/require-permission.decorator';
import { MenusService } from '../../modules/menus/menus.service';

@Injectable()
export class MenuPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly menusService: MenusService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user?.compCode || !user.roleId) {
      throw new ForbiddenException('Tenant context required');
    }

    const allowed = await this.menusService.hasPermission(
      user.compCode,
      user.roleId,
      permission.menuCode,
      permission.action,
    );

    if (!allowed) {
      throw new ForbiddenException(`Missing permission: ${permission.menuCode}.${permission.action}`);
    }

    return true;
  }
}
