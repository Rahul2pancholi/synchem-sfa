import { Module } from '@nestjs/common';
import { ApprovalsModule } from '../approvals/approvals.module';
import { ExpenseService } from './expense.service';
import { LeaveService } from './leave.service';
import { MonthlyCycleController } from './monthly-cycle.controller';

@Module({
  imports: [ApprovalsModule],
  controllers: [MonthlyCycleController],
  providers: [LeaveService, ExpenseService],
})
export class MonthlyCycleModule {}
