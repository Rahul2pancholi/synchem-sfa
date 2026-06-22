import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  UpsertInsightsChatConfigSchema,
  type InsightsChatConfigPublic,
  type InsightsChatConfigRuntime,
} from '@synchem-sfa/shared-types';
import { decryptSecret, encryptSecret, maskApiKey } from '../../common/crypto/secret-cipher';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import {
  DEFAULT_INSIGHTS_INTENT_PROMPT,
  DEFAULT_INSIGHTS_NARRATION_PROMPT,
  DEFAULT_INSIGHTS_SYSTEM_PROMPT,
} from './insights-config.defaults';

@Injectable()
export class InsightsConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
  ) {}

  private encryptionSecret(): string {
    return this.appConfig.jwtSecret;
  }

  private toPublic(row: {
    compCode: string;
    enabled: boolean;
    provider: string;
    model: string;
    apiKeyCiphertext: string | null;
    apiKeyIv: string | null;
    systemPrompt: string;
    intentPrompt: string;
    narrationPrompt: string;
    updatedAt: Date;
  }): InsightsChatConfigPublic {
    let apiKeyHint: string | null = null;
    if (row.apiKeyCiphertext && row.apiKeyIv) {
      try {
        const plain = decryptSecret(
          row.apiKeyCiphertext,
          row.apiKeyIv,
          this.encryptionSecret(),
        );
        apiKeyHint = maskApiKey(plain);
      } catch {
        apiKeyHint = '********';
      }
    }

    return {
      compCode: row.compCode,
      enabled: row.enabled,
      provider: row.provider as InsightsChatConfigPublic['provider'],
      model: row.model,
      apiKeyConfigured: Boolean(row.apiKeyCiphertext && row.apiKeyIv),
      apiKeyHint,
      systemPrompt: row.systemPrompt,
      intentPrompt: row.intentPrompt,
      narrationPrompt: row.narrationPrompt,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getOrCreateDefaults(compCode: string) {
    const existing = await this.prisma.insightsChatConfig.findUnique({
      where: { compCode },
    });
    if (existing) return existing;

    return this.prisma.insightsChatConfig.create({
      data: {
        compCode,
        enabled: false,
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: DEFAULT_INSIGHTS_SYSTEM_PROMPT,
        intentPrompt: DEFAULT_INSIGHTS_INTENT_PROMPT,
        narrationPrompt: DEFAULT_INSIGHTS_NARRATION_PROMPT,
      },
    });
  }

  async getAdminConfig(compCode: string) {
    const row = await this.getOrCreateDefaults(compCode);
    return apiSuccess(this.toPublic(row));
  }

  async getRuntimeConfig(compCode: string): Promise<InsightsChatConfigRuntime> {
    const row = await this.getOrCreateDefaults(compCode);
    let apiKey: string | null = null;
    if (row.apiKeyCiphertext && row.apiKeyIv) {
      apiKey = decryptSecret(row.apiKeyCiphertext, row.apiKeyIv, this.encryptionSecret());
    }

    return {
      compCode: row.compCode,
      enabled: row.enabled,
      provider: row.provider as InsightsChatConfigRuntime['provider'],
      model: row.model,
      apiKey,
      systemPrompt: row.systemPrompt,
      intentPrompt: row.intentPrompt,
      narrationPrompt: row.narrationPrompt,
    };
  }

  async upsertAdminConfig(compCode: string, empId: string | undefined, body: unknown) {
    const parsed = UpsertInsightsChatConfigSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input = parsed.data;
    await this.getOrCreateDefaults(compCode);

    const data: {
      enabled: boolean;
      provider: string;
      model: string;
      systemPrompt: string;
      intentPrompt: string;
      narrationPrompt: string;
      updatedByEmployeeId?: string;
      apiKeyCiphertext?: string;
      apiKeyIv?: string;
    } = {
      enabled: input.enabled,
      provider: input.provider,
      model: input.model.trim(),
      systemPrompt: input.systemPrompt.trim(),
      intentPrompt: input.intentPrompt.trim(),
      narrationPrompt: input.narrationPrompt.trim(),
      updatedByEmployeeId: empId,
    };

    if (input.apiKey?.trim()) {
      const encrypted = encryptSecret(input.apiKey.trim(), this.encryptionSecret());
      data.apiKeyCiphertext = encrypted.ciphertext;
      data.apiKeyIv = encrypted.iv;
    }

    const row = await this.prisma.insightsChatConfig.update({
      where: { compCode },
      data,
    });

    return apiSuccess(this.toPublic(row));
  }

  async testConnection(compCode: string) {
    const runtime = await this.getRuntimeConfig(compCode);
    if (!runtime.enabled) {
      throw new BadRequestException('Enable chatbot before testing connection');
    }
    if (!runtime.apiKey) {
      throw new BadRequestException('API key is not configured');
    }
    if (runtime.provider === 'stub') {
      return apiSuccess({ ok: true, message: 'Stub provider — no external call' });
    }

    if (runtime.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${runtime.apiKey}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new BadRequestException(`OpenAI connection failed: ${res.status} ${text.slice(0, 200)}`);
      }
      return apiSuccess({ ok: true, message: 'OpenAI API key is valid', model: runtime.model });
    }

    if (runtime.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(runtime.apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new BadRequestException(`Gemini connection failed: ${res.status} ${text.slice(0, 200)}`);
      }
      return apiSuccess({ ok: true, message: 'Gemini API key is valid', model: runtime.model });
    }

    throw new NotFoundException('Unknown provider');
  }
}
