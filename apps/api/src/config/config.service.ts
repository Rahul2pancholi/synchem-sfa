import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema, type AppEnv } from '@synchem-sfa/shared-types';

@Injectable()
export class AppConfigService {
  private readonly env: AppEnv;

  constructor(private readonly configService: ConfigService) {
    const parsed = EnvSchema.safeParse({
      APP_ENV: this.configService.get('APP_ENV'),
      NODE_ENV: this.configService.get('NODE_ENV'),
      PORT: this.configService.get('PORT'),
      DATABASE_URL: this.configService.get('DATABASE_URL'),
      REDIS_URL: this.configService.get('REDIS_URL'),
      JWT_SECRET: this.configService.get('JWT_SECRET'),
      JWT_EXPIRES_IN: this.configService.get('JWT_EXPIRES_IN'),
      LOG_LEVEL: this.configService.get('LOG_LEVEL'),
    });

    if (!parsed.success) {
      throw new Error(`Invalid environment: ${parsed.error.message}`);
    }

    this.env = parsed.data;
  }

  get appEnv(): AppEnv['APP_ENV'] {
    return this.env.APP_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get jwtExpiresIn(): string {
    return this.env.JWT_EXPIRES_IN;
  }

  get logLevel(): AppEnv['LOG_LEVEL'] {
    return this.env.LOG_LEVEL;
  }

  get redisUrl(): string | undefined {
    return this.env.REDIS_URL;
  }
}
