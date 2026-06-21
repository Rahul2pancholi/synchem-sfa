import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { HierarchiesService } from './hierarchies.service';

@Controller('api/v1/hierarchies')
@RequireActor('tenant')
export class HierarchiesController {
  constructor(private readonly hierarchiesService: HierarchiesService) {}

  @Get()
  @RequirePermission('MAS06', 'view')
  list(@CurrentUser() user: JwtPayload) {
    return this.hierarchiesService.list(user.compCode!);
  }

  @Get('reporting')
  @RequirePermission('MAS06', 'view')
  reportingTree(@CurrentUser() user: JwtPayload) {
    return this.hierarchiesService.getReportingTree(user.compCode!);
  }

  @Get(':id')
  @RequirePermission('MAS06', 'view')
  getById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.hierarchiesService.getById(user.compCode!, id);
  }

  @Post()
  @RequirePermission('MAS06', 'add')
  create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.hierarchiesService.create(user.compCode!, body);
  }

  @Patch(':id')
  @RequirePermission('MAS06', 'edit')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.hierarchiesService.update(user.compCode!, id, body);
  }

  @Delete(':id')
  @RequirePermission('MAS06', 'delete')
  deactivate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.hierarchiesService.deactivate(user.compCode!, id);
  }
}
