import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
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

  @Get('sales-summary')
  @RequirePermission('REP41712', 'view')
  salesSummary(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.salesSummary(user.compCode!, query);
  }

  @Get('target-achievement')
  @RequirePermission('REP20', 'view')
  targetAchievement(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.targetAchievement(user.compCode!, query);
  }

  @Get('visit-summary')
  @RequirePermission('REP02', 'view')
  visitSummary(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.visitSummary(user.compCode!, query);
  }

  @Get('missed-calls')
  @RequirePermission('REP22', 'view')
  missedCalls(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.missedCalls(user.compCode!, query);
  }

  @Get('monthly-covered-doctors')
  @RequirePermission('REP23', 'view')
  monthlyCoveredDoctors(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.monthlyCoveredDoctors(user.compCode!, query);
  }

  @Get('rtp-summary')
  @RequirePermission('REP10', 'view')
  rtpSummary(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.rtpSummary(user.compCode!, query);
  }

  @Get('doctor-report')
  @RequirePermission('REP18', 'view')
  doctorReport(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.doctorReport(user.compCode!, query);
  }

  @Get('employee-attendance')
  @RequirePermission('REP13', 'view')
  employeeAttendance(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.employeeAttendance(user.compCode!, query);
  }

  @Get('employee-analysis')
  @RequirePermission('REP04', 'view')
  employeeAnalysis(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.employeeAnalysis(user.compCode!, query);
  }

  @Get('manager-kpis')
  @RequirePermission('REP20', 'view')
  managerSalesKpis(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.managerSalesKpis(user.compCode!, query);
  }

  @Get('field-staff-kpis')
  @RequirePermission('DSH01', 'view')
  fieldStaffKpis(@CurrentUser() user: JwtPayload, @Query() query: unknown) {
    return this.reports.fieldStaffKpis(user.compCode!, user.empId!, query);
  }
}
