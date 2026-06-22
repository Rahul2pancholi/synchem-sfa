import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InsightsConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return Number(this.config.get('INSIGHTS_PORT', 3010));
  }

  get corsOrigins(): string[] {
    const raw = this.config.get<string>('INSIGHTS_CORS_ORIGINS', 'http://localhost:5173');
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  }

  get mainApiUrl(): string | undefined {
    return this.config.get<string>('MAIN_API_URL')?.replace(/\/$/, '');
  }

  get internalApiKey(): string | undefined {
    return this.config.get<string>('INTERNAL_API_KEY');
  }
}
