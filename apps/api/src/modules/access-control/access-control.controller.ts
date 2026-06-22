import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AccessControlService } from './access-control.service';

@Controller('api/v1/roles')
@RequireActor('tenant')
export class AccessControlController {
  constructor(private readonly accessControl: AccessControlService) {}

  @Get()
  @RequirePermission('ADM01', 'view')
  list(@CurrentUser() user: JwtPayload) {
    return this.accessControl.listRoles(user.compCode!);
  }

  @Get('options')
  @RequirePermission('MAS07', 'view')
  listForEmployeeForm(@CurrentUser() user: JwtPayload) {
    return this.accessControl.listRoles(user.compCode!);
  }

  @Post()
  @RequirePermission('ADM01', 'add')
  create(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.accessControl.createRole(user.compCode!, body);
  }

  @Patch(':id')
  @RequirePermission('ADM01', 'edit')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: unknown) {
    return this.accessControl.updateRole(user.compCode!, id, body);
  }

  @Delete(':id')
  @RequirePermission('ADM01', 'delete')
  deactivate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accessControl.deactivateRole(user.compCode!, id);
  }

  @Get(':id/permissions')
  @RequirePermission('ADM04', 'view')
  getPermissions(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accessControl.getRolePermissions(user.compCode!, id);
  }

  @Put(':id/permissions')
  @RequirePermission('ADM04', 'edit')
  savePermissions(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.accessControl.saveRolePermissions(user.compCode!, id, body, user);
  }
}
