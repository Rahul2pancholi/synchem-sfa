import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { apiSuccess } from '@synchem-sfa/shared-types';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      version: '0.1.0',
      env: this.config.appEnv,
    };
  }

  @Public()
  @Get('ready')
  async ready() {
    const dbOk = await this.prisma.isHealthy();
    const status = dbOk ? 'ok' : 'fail';

    if (!dbOk) {
      return {
        status: 'not_ready',
        version: '0.1.0',
        env: this.config.appEnv,
        checks: { db: status, redis: 'skipped' },
      };
    }

    return apiSuccess({
      status: 'ok',
      version: '0.1.0',
      env: this.config.appEnv,
      checks: { db: 'ok', redis: 'skipped' },
    });
  }
}
