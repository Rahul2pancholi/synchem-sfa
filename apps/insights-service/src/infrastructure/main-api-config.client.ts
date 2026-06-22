import { Injectable } from '@nestjs/common';
import type { InsightsChatConfigRuntime } from '@synchem-sfa/shared-types';
import { InsightsConfigService } from '../config/insights-config.service';

@Injectable()
export class MainApiConfigClient {
  constructor(private readonly config: InsightsConfigService) {}

  async getRuntimeConfig(compCode: string): Promise<InsightsChatConfigRuntime | null> {
    const baseUrl = this.config.mainApiUrl;
    const internalKey = this.config.internalApiKey;
    if (!baseUrl || !internalKey) {
      return null;
    }

    const url = new URL('/api/v1/internal/insights-chat-config', baseUrl);
    url.searchParams.set('compCode', compCode);

    const res = await fetch(url, {
      headers: { 'X-Internal-Key': internalKey },
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as {
      responseCode: number;
      data: InsightsChatConfigRuntime | null;
    };
    return body.data;
  }
}
