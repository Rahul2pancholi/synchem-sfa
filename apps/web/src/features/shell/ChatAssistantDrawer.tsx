import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Drawer, Input, Modal, Space, Tag, Typography, message } from 'antd';
import { DeleteOutlined, MessageOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type {
  ChatAction,
  ChatAssistantReply,
  ChatHistoryTurn,
  ChatListItem,
  ChatSessionSnapshot,
  ChatSubmitEntityType,
  ChatSubmitPayload,
  TenantFeatureState,
} from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: ChatAction[];
  items?: ChatListItem[];
}

interface ChatApiResponse {
  data?: ChatAssistantReply;
}

interface SessionApiResponse {
  data?: ChatSessionSnapshot;
}

interface TenantFeaturesResponse {
  data: { features: TenantFeatureState };
}

const SESSION_STORAGE_KEY = 'chatSessionId';

function interpolate(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function displayReply(reply: ChatAssistantReply, t: (key: MessageKey) => string): string {
  if (reply.replyText?.trim()) {
    return reply.replyText;
  }
  return interpolate(t(reply.messageKey as MessageKey), reply.params);
}

function suggestedPromptKeys(roleType: string | null): MessageKey[] {
  if (roleType === 'FS') {
    return [
      'chat.suggest.mr.dcr',
      'chat.suggest.mr.drafts',
      'chat.suggest.mr.submitDcr',
      'chat.suggest.mr.pob',
    ];
  }
  if (roleType === 'MAN') {
    return ['chat.suggest.mgr.pending', 'chat.suggest.mgr.coverage', 'chat.suggest.mgr.missed'];
  }
  return ['chat.suggest.ad.help', 'chat.suggest.mgr.pending', 'chat.suggest.mr.pob'];
}

function isSubmitAction(action: ChatAction) {
  return action.kind === 'submit' && action.entityType && action.entityId;
}

export function ChatAssistantDrawer() {
  const { t, languageHeader } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem(SESSION_STORAGE_KEY),
  );
  const roleType = localStorage.getItem('roleType');

  const suggestions = useMemo(() => suggestedPromptKeys(roleType), [roleType]);

  const featuresQuery = useQuery({
    queryKey: ['tenant-features'],
    queryFn: async () => {
      const res = await fetchApi<TenantFeaturesResponse>('/api/v1/tenant/features', languageHeader);
      return res.data.features;
    },
    retry: false,
  });

  const aiEnabled = featuresQuery.data?.ai_assistant ?? true;

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetchApi<SessionApiResponse>(
        `/api/v1/insights/chat/session?sessionId=${encodeURIComponent(sessionId)}`,
        languageHeader,
      );
      const snapshot = res.data;
      if (!snapshot?.messages?.length) return;
      setMessages(
        snapshot.messages.map((msg) => ({
          role: msg.role,
          text: msg.content,
          actions: msg.actions,
          items: msg.items,
        })),
      );
      setSessionId(snapshot.sessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, snapshot.sessionId);
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSessionId(null);
    }
  }, [languageHeader, sessionId]);

  useEffect(() => {
    if (open) {
      void loadSession();
    }
  }, [open, loadSession]);

  const confirmSubmit = useCallback(
    (payload: {
      entityType: ChatSubmitEntityType;
      entityId: string;
      confirmParams: Record<string, string | number>;
    }) => {
      const titleKey =
        payload.entityType === 'DCR' ? 'chat.confirm.submitDcr.title' : 'chat.confirm.submitPob.title';
      const bodyKey =
        payload.entityType === 'DCR' ? 'chat.confirm.submitDcr.body' : 'chat.confirm.submitPob.body';
      const successKey =
        payload.entityType === 'DCR' ? 'chat.submit.successDcr' : 'chat.submit.successPob';

      Modal.confirm({
        title: t(titleKey),
        content: interpolate(t(bodyKey), payload.confirmParams),
        okText: t('chat.confirm.submitOk'),
        cancelText: t('chat.confirm.submitCancel'),
        onOk: async () => {
          try {
            await fetchApi('/api/v1/insights/chat/submit', languageHeader, {
              method: 'POST',
              body: JSON.stringify({
                entityType: payload.entityType,
                entityId: payload.entityId,
              }),
            });
            message.success(t(successKey));
          } catch {
            message.error(t('chat.submit.error'));
          }
        },
      });
    },
    [languageHeader, t],
  );

  const handleSubmitPayload = useCallback(
    (submit: ChatSubmitPayload) => {
      confirmSubmit({
        entityType: submit.entityType,
        entityId: submit.entityId,
        confirmParams: submit.confirmParams,
      });
    },
    [confirmSubmit],
  );

  const handleSubmitAction = useCallback(
    (action: ChatAction) => {
      if (!isSubmitAction(action)) return;
      confirmSubmit({
        entityType: action.entityType!,
        entityId: action.entityId!,
        confirmParams: action.confirmParams ?? {},
      });
    },
    [confirmSubmit],
  );

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const history: ChatHistoryTurn[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

    if (!textOverride) {
      setInput('');
    }
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetchApi<ChatApiResponse>('/api/v1/insights/chat', languageHeader, {
        method: 'POST',
        body: JSON.stringify({ message: text, history, sessionId }),
      });
      const reply = res.data;
      if (reply?.replyText || reply?.messageKey) {
        if (reply.sessionId) {
          setSessionId(reply.sessionId);
          localStorage.setItem(SESSION_STORAGE_KEY, reply.sessionId);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: displayReply(reply, t),
            actions: reply.actions?.length ? reply.actions : undefined,
            items: reply.items?.length ? reply.items : undefined,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: t('chat.offlineHint') }]);
      }
    } catch {
      message.error(t('chat.error'));
      setMessages((prev) => [...prev, { role: 'assistant', text: t('chat.offlineHint') }]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([]);
    setInput('');
    try {
      const res = await fetchApi<SessionApiResponse>(
        '/api/v1/insights/chat/session/reset',
        languageHeader,
        { method: 'POST' },
      );
      const snapshot = res.data;
      if (snapshot?.sessionId) {
        setSessionId(snapshot.sessionId);
        localStorage.setItem(SESSION_STORAGE_KEY, snapshot.sessionId);
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSessionId(null);
    }
  }

  if (!aiEnabled) return null;

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="chat-fab"
        icon={<MessageOutlined />}
        aria-label={t('chat.open')}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title={
          <Space>
            <Avatar size="small" className="chat-drawer__avatar" icon={<UserOutlined />}>
              {t('chat.assistantName').charAt(0)}
            </Avatar>
            <span>{t('chat.title')}</span>
          </Space>
        }
        placement="right"
        size={420}
        open={open}
        onClose={() => setOpen(false)}
        className="chat-drawer"
        extra={
          messages.length > 0 ? (
            <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => void clearChat()}>
              {t('chat.clear')}
            </Button>
          ) : null
        }
      >
        <div className="chat-drawer__messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <Avatar size={48} className="chat-welcome__avatar" icon={<UserOutlined />}>
                {t('chat.assistantName').charAt(0)}
              </Avatar>
              <Typography.Title level={5} className="chat-welcome__title">
                {t('chat.welcome')}
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="chat-welcome__subtitle">
                {t('chat.welcomeSubtitle')}
              </Typography.Paragraph>
              <div className="chat-suggest">
                {suggestions.map((key) => (
                  <Tag
                    key={key}
                    className="chat-suggest__chip"
                    onClick={() => void sendMessage(t(key))}
                  >
                    {t(key)}
                  </Tag>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className="chat-turn">
                {msg.role === 'assistant' ? (
                  <Avatar size="small" className="chat-turn__avatar" icon={<UserOutlined />}>
                    {t('chat.assistantName').charAt(0)}
                  </Avatar>
                ) : null}
                <div className="chat-turn__body">
                  <div
                    className={
                      msg.role === 'user' ? 'chat-bubble chat-bubble--user' : 'chat-bubble chat-bubble--bot'
                    }
                  >
                    {msg.text}
                  </div>
                  {msg.items?.length ? (
                    <ul className="chat-drawer__items">
                      {msg.items.map((item) => (
                        <li key={`${item.labelKey}-${JSON.stringify(item.params)}-${item.submit?.entityId ?? item.path}`}>
                          <Space wrap size="small">
                            {item.path ? (
                              <Link to={item.path} onClick={() => setOpen(false)}>
                                {interpolate(t(item.labelKey as MessageKey), item.params)}
                              </Link>
                            ) : (
                              <span>{interpolate(t(item.labelKey as MessageKey), item.params)}</span>
                            )}
                            {item.submit ? (
                              <Button
                                size="small"
                                type="primary"
                                ghost
                                className="chat-action-btn"
                                onClick={() => handleSubmitPayload(item.submit!)}
                              >
                                {t(item.submit.labelKey as MessageKey)}
                              </Button>
                            ) : null}
                          </Space>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {msg.actions?.length ? (
                    <Space wrap size="small" className="chat-drawer__actions">
                      {msg.actions.map((action) =>
                        isSubmitAction(action) ? (
                          <Button
                            key={`submit-${action.entityType}-${action.entityId}`}
                            size="small"
                            type="primary"
                            className="chat-action-btn"
                            onClick={() => handleSubmitAction(action)}
                          >
                            {t(action.labelKey as MessageKey)}
                          </Button>
                        ) : action.path ? (
                          <Link key={`${action.path}-${action.labelKey}`} to={action.path} onClick={() => setOpen(false)}>
                            <Button size="small" type="default" className="chat-action-btn">
                              {t(action.labelKey as MessageKey)}
                            </Button>
                          </Link>
                        ) : null,
                      )}
                    </Space>
                  ) : null}
                </div>
              </div>
            ))
          )}
          {loading ? (
            <div className="chat-turn chat-turn--typing">
              <Avatar size="small" className="chat-turn__avatar" icon={<UserOutlined />}>
                {t('chat.assistantName').charAt(0)}
              </Avatar>
              <Typography.Text type="secondary" className="chat-typing">
                {t('chat.thinking')}
              </Typography.Text>
            </div>
          ) : null}
        </div>
        <div className="chat-drawer__input">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              onPressEnter={() => void sendMessage()}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              aria-label={t('chat.send')}
              loading={loading}
              onClick={() => void sendMessage()}
            />
          </Space.Compact>
        </div>
      </Drawer>
    </>
  );
}
