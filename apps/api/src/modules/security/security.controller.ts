import { Controller, Get, Query } from '@nestjs/common';
import { LoginAnalyticsQuerySchema, type JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { SecurityAnalyticsService } from './security-analytics.service';

@Controller('api/v1/security')
@RequireActor('tenant')
export class SecurityController {
  constructor(private readonly analytics: SecurityAnalyticsService) {}

  @Get('login-analytics')
  @RequirePermission('ADM06', 'view')
  loginAnalytics(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    const parsed = LoginAnalyticsQuerySchema.parse(query);
    return this.analytics.getLoginAnalytics(user.compCode!, parsed.days);
  }
}
