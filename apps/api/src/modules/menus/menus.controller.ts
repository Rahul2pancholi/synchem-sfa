import { Controller, Get } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MenusService } from './menus.service';

@Controller('api/v1/menus')
@RequireActor('tenant')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  getMenus(@CurrentUser() user: JwtPayload) {
    return this.menusService.getMenuTree(user.compCode!, user.roleId!);
  }
}
