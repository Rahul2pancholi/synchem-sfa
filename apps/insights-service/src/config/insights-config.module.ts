import { Global, Module } from '@nestjs/common';
import { InsightsConfigService } from './insights-config.service';

@Global()
@Module({
  providers: [InsightsConfigService],
  exports: [InsightsConfigService],
})
export class InsightsConfigModule {}
