import { Module } from '@nestjs/common';
import { InsightsConfigController } from './insights-config.controller';
import { InsightsConfigService } from './insights-config.service';

@Module({
  controllers: [InsightsConfigController],
  providers: [InsightsConfigService],
  exports: [InsightsConfigService],
})
export class InsightsConfigModule {}
