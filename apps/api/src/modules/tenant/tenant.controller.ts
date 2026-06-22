import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { TenantService } from './tenant.service';

@Controller('api/v1/employees')
@RequireActor('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.tenantService.getCurrentEmployee(user);
  }

  @Get()
  @RequirePermission('MAS07', 'view')
  list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.tenantService.listEmployees(user.compCode!, Number(page), Number(pageSize));
  }

  @Get(':id')
  @RequirePermission('MAS07', 'view')
  getById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantService.getEmployee(user.compCode!, id);
  }

  @Post()
  @RequirePermission('MAS07', 'add')
  create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.tenantService.createEmployee(user.compCode!, body);
  }

  @Patch(':id')
  @RequirePermission('MAS07', 'edit')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.tenantService.updateEmployee(user.compCode!, id, body);
  }

  @Delete(':id')
  @RequirePermission('MAS07', 'delete')
  deactivate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantService.deactivateEmployee(user.compCode!, id);
  }
}
