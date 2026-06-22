import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InsightsConfigModule } from './config/insights-config.module';
import { HealthModule } from './health/health.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InsightsConfigModule,
    HealthModule,
    ChatModule,
  ],
})
export class AppModule {}
