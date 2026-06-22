import { Controller, Get, Query } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { SalesInsightsService } from './sales-insights.service';

@Controller('api/v1/sales-insights')
@RequireActor('tenant')
export class SalesInsightsController {
  constructor(private readonly salesInsights: SalesInsightsService) {}

  @Get('manager')
  @RequirePermission('REP20', 'view')
  managerSuggestions(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.salesInsights.managerSuggestions(user.compCode!, query);
  }
}
