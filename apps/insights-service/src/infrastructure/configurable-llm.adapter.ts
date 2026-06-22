import { Injectable } from '@nestjs/common';
import type { InsightsChatConfigRuntime } from '@synchem-sfa/shared-types';
import type { LlmPort, ParsedIntent } from '../ports/llm.port';
import { MainApiConfigClient } from './main-api-config.client';

@Injectable()
export class ConfigurableLlmAdapter implements LlmPort {
  constructor(private readonly configClient: MainApiConfigClient) {}

  private async loadConfig(compCode: string): Promise<InsightsChatConfigRuntime | null> {
    return this.configClient.getRuntimeConfig(compCode);
  }

  async parseIntent(message: string, locale: string, compCode?: string): Promise<ParsedIntent> {
    if (!compCode) {
      return { metricId: 'unimplemented', dimensions: [], filters: {}, confidence: 'low' };
    }

    const config = await this.loadConfig(compCode);
    if (!config?.enabled || config.provider === 'stub' || !config.apiKey) {
      return { metricId: 'unimplemented', dimensions: [], filters: {}, confidence: 'low' };
    }

    const system = `${config.intentPrompt}\nLocale: ${locale}`;
    const content = await this.chatCompletion(config, system, message);
    try {
      const parsed = JSON.parse(content) as {
        metricId?: string;
        dimensions?: string[];
        filters?: Record<string, string | number | boolean>;
      };
      return {
        metricId: parsed.metricId ?? 'unimplemented',
        dimensions: parsed.dimensions ?? [],
        filters: parsed.filters ?? {},
        confidence: 'medium',
      };
    } catch {
      return { metricId: 'unimplemented', dimensions: [], filters: {}, confidence: 'low' };
    }
  }

  async narrateAnswer(params: {
    message: string;
    locale: string;
    metricId: string;
    rows: Record<string, unknown>[];
    compCode?: string;
  }): Promise<string> {
    if (!params.compCode) {
      return 'Insights chat is in scaffold mode.';
    }

    const config = await this.loadConfig(params.compCode);
    if (!config?.enabled || config.provider === 'stub' || !config.apiKey) {
      return 'Chatbot disabled or API key missing. Admin: Admin → AI Chatbot Settings.';
    }

    const userPayload = JSON.stringify({
      question: params.message,
      metricId: params.metricId,
      locale: params.locale,
      rows: params.rows,
    });
    return this.chatCompletion(config, config.narrationPrompt, userPayload);
  }

  private async chatCompletion(
    config: InsightsChatConfigRuntime,
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    const fullSystem = `${config.systemPrompt}\n\n${systemPrompt}`;

    if (config.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: fullSystem },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.2,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`);
      }
      const body = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return body.choices?.[0]?.message?.content?.trim() ?? '';
    }

    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey!)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: fullSystem }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
      }
      const body = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    }

    return '';
  }
}
