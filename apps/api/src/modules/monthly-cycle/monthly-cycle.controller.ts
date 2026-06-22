import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';

@Controller('api/v1')
@RequireActor('tenant')
export class MonthlyCycleController {
  constructor(
    private readonly leave: LeaveService,
    private readonly expense: ExpenseService,
  ) {}

  @Get('leave-applications')
  @RequirePermission('TRN09', 'view')
  listLeaveApplications(@CurrentUser() user: JwtPayload) {
    return this.leave.listApplications(user.compCode!, user.empId!);
  }

  @Get('leave-balances')
  @RequirePermission('TRN09', 'view')
  listLeaveBalances(@CurrentUser() user: JwtPayload) {
    return this.leave.listBalances(user.compCode!, user.empId!);
  }

  @Post('leave-applications')
  @RequirePermission('TRN09', 'add')
  createLeaveApplication(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.leave.createApplication(user.compCode!, user.empId!, body);
  }

  @Post('leave-applications/:id/submit')
  @RequirePermission('TRN09', 'edit')
  submitLeaveApplication(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leave.submitApplication(user.compCode!, user.empId!, id);
  }

  @Get('leave-policies')
  @RequirePermission('SET03', 'view')
  listLeavePolicies(@CurrentUser() user: JwtPayload) {
    return this.leave.listPolicies(user.compCode!);
  }

  @Post('leave-policies')
  @RequirePermission('SET03', 'edit')
  upsertLeavePolicy(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.leave.upsertPolicy(user.compCode!, body);
  }

  @Get('expense-statements')
  @RequirePermission('TRN20', 'view')
  listExpenseStatements(@CurrentUser() user: JwtPayload) {
    return this.expense.listStatements(user.compCode!, user.empId!);
  }

  @Get('expense-statements/:id')
  @RequirePermission('TRN20', 'view')
  getExpenseStatement(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.expense.getStatement(user.compCode!, user.empId!, id);
  }

  @Post('expense-statements')
  @RequirePermission('TRN20', 'add')
  createExpenseStatement(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.expense.createStatement(user.compCode!, user.empId!, body);
  }

  @Post('expense-statements/:id/submit')
  @RequirePermission('TRN20', 'edit')
  submitExpenseStatement(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.expense.submitStatement(user.compCode!, user.empId!, id);
  }
}
