import type {
  ChatAssistantReply,
  ChatHistoryTurn,
  ChatSessionSnapshot,
  TenantFeatureState,
} from '@synchem-sfa/shared-types';
import { API_BASE } from '../config/api-base';

interface ApiEnvelope<T> {
  responseCode?: number;
  data: T;
}

function authHeaders(accessToken: string, language: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-App-Language': language,
  };
}

export async function fetchTenantFeatures(accessToken: string, language: string) {
  const res = await fetch(`${API_BASE}/api/v1/tenant/features`, {
    headers: authHeaders(accessToken, language),
  });
  if (!res.ok) throw new Error('FEATURES_FAILED');
  const body = (await res.json()) as ApiEnvelope<{ features: TenantFeatureState }>;
  return body.data.features;
}

export async function fetchChatSession(
  accessToken: string,
  language: string,
  sessionId?: string | null,
) {
  const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  const res = await fetch(`${API_BASE}/api/v1/insights/chat/session${query}`, {
    headers: authHeaders(accessToken, language),
  });
  if (!res.ok) throw new Error('SESSION_FAILED');
  const body = (await res.json()) as ApiEnvelope<ChatSessionSnapshot>;
  return body.data;
}

export async function resetChatSession(accessToken: string, language: string) {
  const res = await fetch(`${API_BASE}/api/v1/insights/chat/session/reset`, {
    method: 'POST',
    headers: authHeaders(accessToken, language),
  });
  if (!res.ok) throw new Error('SESSION_RESET_FAILED');
  const body = (await res.json()) as ApiEnvelope<ChatSessionSnapshot>;
  return body.data;
}

export async function sendChatMessage(params: {
  accessToken: string;
  language: string;
  message: string;
  history: ChatHistoryTurn[];
  sessionId?: string | null;
}) {
  const res = await fetch(`${API_BASE}/api/v1/insights/chat`, {
    method: 'POST',
    headers: authHeaders(params.accessToken, params.language),
    body: JSON.stringify({
      message: params.message,
      history: params.history,
      sessionId: params.sessionId ?? undefined,
    }),
  });
  if (!res.ok) throw new Error('CHAT_FAILED');
  const body = (await res.json()) as ApiEnvelope<ChatAssistantReply>;
  return body.data;
}

export async function submitChatEntity(params: {
  accessToken: string;
  language: string;
  entityType: 'DCR' | 'POB';
  entityId: string;
}) {
  const res = await fetch(`${API_BASE}/api/v1/insights/chat/submit`, {
    method: 'POST',
    headers: authHeaders(params.accessToken, params.language),
    body: JSON.stringify({
      entityType: params.entityType,
      entityId: params.entityId,
    }),
  });
  if (!res.ok) throw new Error('SUBMIT_FAILED');
  return res.json();
}
