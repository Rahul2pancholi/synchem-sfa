import { Controller, Get, Query } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ReportsService } from './reports.service';

@Controller('api/v1/reports')
@RequireActor('tenant')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dcr-summary')
  @RequirePermission('REP01', 'view')
  dcrSummary(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.dcrSummary(user.compCode!, query);
  }

  @Get('expense-summary')
  @RequirePermission('REP05', 'view')
  expenseSummary(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.expenseSummary(user.compCode!, query);
  }

  @Get('employee-pob')
  @RequirePermission('REP12', 'view')
  employeePob(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.employeePob(user.compCode!, query);
  }
}
