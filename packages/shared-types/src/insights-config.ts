import { z } from 'zod';

export const InsightsLlmProviderSchema = z.enum(['openai', 'gemini', 'stub']);
export type InsightsLlmProvider = z.infer<typeof InsightsLlmProviderSchema>;

export const InsightsChatConfigPublicSchema = z.object({
  compCode: z.string(),
  enabled: z.boolean(),
  provider: InsightsLlmProviderSchema,
  model: z.string().min(1).max(100),
  apiKeyConfigured: z.boolean(),
  apiKeyHint: z.string().nullable(),
  systemPrompt: z.string(),
  intentPrompt: z.string(),
  narrationPrompt: z.string(),
  updatedAt: z.string().optional(),
});

export type InsightsChatConfigPublic = z.infer<typeof InsightsChatConfigPublicSchema>;

export const UpsertInsightsChatConfigSchema = z.object({
  enabled: z.boolean(),
  provider: InsightsLlmProviderSchema,
  model: z.string().min(1).max(100),
  /** Omit or empty to keep existing key. Use non-empty string to replace. */
  apiKey: z.string().max(500).optional(),
  systemPrompt: z.string().min(10).max(8000),
  intentPrompt: z.string().min(10).max(8000),
  narrationPrompt: z.string().min(10).max(8000),
});

export type UpsertInsightsChatConfig = z.infer<typeof UpsertInsightsChatConfigSchema>;

/** Full config for insights-service (includes decrypted API key). */
export const InsightsChatConfigRuntimeSchema = z.object({
  compCode: z.string(),
  enabled: z.boolean(),
  provider: InsightsLlmProviderSchema,
  model: z.string(),
  apiKey: z.string().nullable(),
  systemPrompt: z.string(),
  intentPrompt: z.string(),
  narrationPrompt: z.string(),
});

export type InsightsChatConfigRuntime = z.infer<typeof InsightsChatConfigRuntimeSchema>;

export const InsightsModelPresets: Record<InsightsLlmProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  stub: ['stub'],
};
