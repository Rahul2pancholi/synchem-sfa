import { Module } from '@nestjs/common';
import { ReportsModule } from '../reports/reports.module';
import { SalesInsightsController } from './sales-insights.controller';
import { SalesInsightsService } from './sales-insights.service';

@Module({
  imports: [ReportsModule],
  controllers: [SalesInsightsController],
  providers: [SalesInsightsService],
  exports: [SalesInsightsService],
})
export class SalesInsightsModule {}
