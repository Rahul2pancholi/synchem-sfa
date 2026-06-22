import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { InternalApiKeyGuard } from '../../common/guards/internal-api-key.guard';
import { InsightsConfigService } from './insights-config.service';

@Controller('api/v1')
export class InsightsConfigController {
  constructor(private readonly insightsConfig: InsightsConfigService) {}

  @Get('admin/insights-chat-config')
  @RequireActor('tenant')
  @RequirePermission('ADM05', 'view')
  getAdmin(@CurrentUser() user: JwtPayload) {
    return this.insightsConfig.getAdminConfig(user.compCode!);
  }

  @Put('admin/insights-chat-config')
  @RequireActor('tenant')
  @RequirePermission('ADM05', 'edit')
  updateAdmin(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.insightsConfig.upsertAdminConfig(user.compCode!, user.empId, body);
  }

  @Post('admin/insights-chat-config/test-connection')
  @RequireActor('tenant')
  @RequirePermission('ADM05', 'edit')
  testConnection(@CurrentUser() user: JwtPayload) {
    return this.insightsConfig.testConnection(user.compCode!);
  }

  @Get('internal/insights-chat-config')
  @Public()
  @UseGuards(InternalApiKeyGuard)
  getInternal(@Query('compCode') compCode?: string) {
    if (!compCode?.trim()) {
      return { responseCode: 400, errorObj: { message: 'compCode required' }, data: null };
    }
    return this.insightsConfig.getRuntimeConfig(compCode.trim()).then((data) => ({
      responseCode: 200,
      errorObj: null,
      data,
    }));
  }
}
