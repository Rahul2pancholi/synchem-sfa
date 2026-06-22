import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import type { ApprovalEntityType, JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { ApprovalService } from './approval.service';

@Controller('api/v1/approvals')
@RequireActor('tenant')
export class ApprovalController {
  constructor(private readonly approvals: ApprovalService) {}

  @Get('pending')
  listPending(
    @CurrentUser() user: JwtPayload,
    @Query('entityType') entityType?: ApprovalEntityType,
  ) {
    return this.approvals.listPending(user.compCode!, user, entityType);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.approvals.getSummary(user.compCode!, user);
  }

  @Get('entities/:entityType/:entityId')
  getEntityDetail(
    @CurrentUser() user: JwtPayload,
    @Param('entityType') entityType: ApprovalEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.approvals.getEntityDetail(user.compCode!, user, entityType, entityId);
  }

  @Post(':id/approve')
  approve(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: unknown) {
    return this.approvals.approve(user.compCode!, id, user, body);
  }

  @Post(':id/reject')
  reject(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: unknown) {
    return this.approvals.reject(user.compCode!, id, user, body);
  }
}
