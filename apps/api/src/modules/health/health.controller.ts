import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { RedisService } from '../../infrastructure/cache/redis.module';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { apiSuccess } from '@synchem-sfa/shared-types';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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
    const redisOk = this.redis.isConfigured() ? await this.redis.ping() : true;
    const status = dbOk && redisOk ? 'ok' : 'fail';

    if (status !== 'ok') {
      return {
        status: 'not_ready',
        version: '0.1.0',
        env: this.config.appEnv,
        checks: {
          db: dbOk ? 'ok' : 'fail',
          redis: this.redis.isConfigured() ? (redisOk ? 'ok' : 'fail') : 'skipped',
        },
      };
    }

    return apiSuccess({
      status: 'ok',
      version: '0.1.0',
      env: this.config.appEnv,
      checks: {
        db: 'ok',
        redis: this.redis.isConfigured() ? 'ok' : 'skipped',
      },
    });
  }
}
