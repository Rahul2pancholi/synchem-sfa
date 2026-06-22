import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { TransactionsService } from './transactions.service';

@Controller('api/v1')
@RequireActor('tenant')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get('daily-call-reports')
  @RequirePermission('TRN03', 'view')
  listDcrs(@CurrentUser() user: JwtPayload) {
    return this.transactions.listDcrs(user.compCode!, user.empId!);
  }

  @Post('daily-call-reports')
  @RequirePermission('TRN03', 'add')
  createDcr(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.transactions.createDcr(user.compCode!, user.empId!, body);
  }

  @Post('daily-call-reports/:id/submit')
  @RequirePermission('TRN03', 'edit')
  submitDcr(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.submitDcr(user.compCode!, user.empId!, id);
  }

  @Get('tour-programmes')
  @RequirePermission('TRN01', 'view')
  listTourProgrammes(
    @CurrentUser() user: JwtPayload,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.transactions.listTourProgrammes(
      user.compCode!,
      user.empId!,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get('tour-programmes/:id')
  @RequirePermission('TRN01', 'view')
  getTourProgramme(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.getTourProgramme(user.compCode!, user.empId!, id);
  }

  @Post('tour-programmes')
  @RequirePermission('TRN01', 'add')
  createTourProgramme(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.transactions.createTourProgramme(user.compCode!, user.empId!, body);
  }

  @Post('tour-programmes/:id/submit')
  @RequirePermission('TRN01', 'edit')
  submitTourProgramme(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.submitTourProgramme(user.compCode!, user.empId!, id);
  }

  @Get('weekly-plans')
  @RequirePermission('TRN24', 'view')
  listWeeklyPlans(@CurrentUser() user: JwtPayload) {
    return this.transactions.listWeeklyPlans(user.compCode!, user.empId!);
  }

  @Post('weekly-plans')
  @RequirePermission('TRN24', 'add')
  createWeeklyPlan(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.transactions.createWeeklyPlan(user.compCode!, user.empId!, body);
  }

  @Post('weekly-plans/:id/submit')
  @RequirePermission('TRN24', 'edit')
  submitWeeklyPlan(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.submitWeeklyPlan(user.compCode!, user.empId!, id);
  }

  @Get('personal-orders/party-options')
  @RequirePermission('TRN04', 'view')
  listPobPartyOptions(
    @CurrentUser() user: JwtPayload,
    @Query('partyType') partyType: string,
    @Query('search') search?: string,
  ) {
    return this.transactions.listPobPartyOptions(user.compCode!, partyType ?? 'DOCTOR', search);
  }

  @Get('personal-orders/product-options')
  @RequirePermission('TRN04', 'view')
  listPobProductOptions(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('divisionId') divisionId?: string,
  ) {
    return this.transactions.listPobProductOptions(user.compCode!, search, divisionId);
  }

  @Get('personal-orders')
  @RequirePermission('TRN04', 'view')
  listPobs(@CurrentUser() user: JwtPayload) {
    return this.transactions.listPobs(user.compCode!, user.empId!);
  }

  @Post('personal-orders')
  @RequirePermission('TRN04', 'add')
  createPob(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.transactions.createPob(user.compCode!, user.empId!, body);
  }

  @Post('personal-orders/:id/submit')
  @RequirePermission('TRN04', 'edit')
  submitPob(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.submitPob(user.compCode!, user.empId!, id);
  }

  @Post('employees/me/push-token')
  savePushToken(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.transactions.savePushToken(user, body);
  }
}
