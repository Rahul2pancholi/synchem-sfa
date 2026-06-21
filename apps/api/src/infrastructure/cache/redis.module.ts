import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis | null;

  constructor(private readonly config: AppConfigService) {
    this.client = config.redisUrl ? new Redis(config.redisUrl, { maxRetriesPerRequest: 1 }) : null;
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis is not configured');
    }

    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.del(key);
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
