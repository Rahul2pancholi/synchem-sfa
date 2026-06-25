import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  ChatAction,
  ChatAssistantReply,
  ChatHistoryTurn,
  ChatListItem,
  ChatSubmitPayload,
} from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useI18n } from '../../i18n/I18nProvider';
import {
  fetchChatSession,
  fetchTenantFeatures,
  resetChatSession,
  sendChatMessage,
  submitChatEntity,
} from '../../lib/chat-api';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: ChatAction[];
  items?: ChatListItem[];
}

interface Props {
  visible: boolean;
  accessToken: string;
  roleType: string | null;
  onClose: () => void;
}

function interpolate(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function displayReply(reply: ChatAssistantReply, t: (key: MessageKey) => string) {
  if (reply.replyText?.trim()) return reply.replyText;
  return interpolate(t(reply.messageKey as MessageKey), reply.params);
}

function suggestedPromptKeys(roleType: string | null): MessageKey[] {
  if (roleType === 'FS') {
    return ['chat.suggest.mr.dcr', 'chat.suggest.mr.submitDcr', 'chat.suggest.mr.pob'];
  }
  if (roleType === 'MAN') {
    return ['chat.suggest.mgr.pending', 'chat.suggest.mgr.coverage'];
  }
  return ['chat.suggest.ad.help'];
}

function isSubmitAction(action: ChatAction) {
  return action.kind === 'submit' && action.entityType && action.entityId;
}

export function ChatAssistantModal({ visible, accessToken, roleType, onClose }: Props) {
  const { t, language } = useI18n();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  const suggestions = useMemo(() => suggestedPromptKeys(roleType), [roleType]);

  const loadSession = useCallback(async () => {
    try {
      const snapshot = await fetchChatSession(accessToken, language, sessionId);
      if (snapshot.messages.length) {
        setMessages(
          snapshot.messages.map((msg) => ({
            role: msg.role,
            text: msg.content,
            actions: msg.actions,
            items: msg.items,
          })),
        );
      }
      setSessionId(snapshot.sessionId);
    } catch {
      setSessionId(null);
    }
  }, [accessToken, language, sessionId]);

  useEffect(() => {
    if (!visible) return;
    void fetchTenantFeatures(accessToken, language)
      .then((features) => setEnabled(features.ai_assistant ?? true))
      .catch(() => setEnabled(false));
    void loadSession();
  }, [visible, accessToken, language, loadSession]);

  const confirmSubmit = useCallback(
    (payload: ChatSubmitPayload) => {
      const titleKey =
        payload.entityType === 'DCR' ? 'chat.confirm.submitDcr.title' : 'chat.confirm.submitPob.title';
      const bodyKey =
        payload.entityType === 'DCR' ? 'chat.confirm.submitDcr.body' : 'chat.confirm.submitPob.body';
      const successKey =
        payload.entityType === 'DCR' ? 'chat.submit.successDcr' : 'chat.submit.successPob';

      Alert.alert(t(titleKey), interpolate(t(bodyKey), payload.confirmParams), [
        { text: t('chat.confirm.submitCancel'), style: 'cancel' },
        {
          text: t('chat.confirm.submitOk'),
          onPress: () => {
            void submitChatEntity({
              accessToken,
              language,
              entityType: payload.entityType,
              entityId: payload.entityId,
            })
              .then(() => Alert.alert(t(successKey)))
              .catch(() => Alert.alert(t('chat.submit.error')));
          },
        },
      ]);
    },
    [accessToken, language, t],
  );

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const history: ChatHistoryTurn[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

    if (!textOverride) setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const reply = await sendChatMessage({
        accessToken,
        language,
        message: text,
        history,
        sessionId,
      });
      if (reply.sessionId) setSessionId(reply.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: displayReply(reply, t),
          actions: reply.actions,
          items: reply.items,
        },
      ]);
    } catch {
      Alert.alert(t('chat.error'));
      setMessages((prev) => [...prev, { role: 'assistant', text: t('chat.offlineHint') }]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([]);
    setInput('');
    try {
      const snapshot = await resetChatSession(accessToken, language);
      setSessionId(snapshot.sessionId);
    } catch {
      setSessionId(null);
    }
  }

  if (!enabled) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('chat.title')}</Text>
          <View style={styles.headerActions}>
            {messages.length > 0 ? (
              <Pressable onPress={() => void clearChat()}>
                <Text style={styles.headerLink}>{t('chat.clear')}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onClose}>
              <Text style={styles.headerLink}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <Text style={styles.welcomeTitle}>{t('chat.welcome')}</Text>
              <Text style={styles.welcomeSubtitle}>{t('chat.welcomeSubtitle')}</Text>
              <View style={styles.chips}>
                {suggestions.map((key) => (
                  <Pressable key={key} style={styles.chip} onPress={() => void sendMessage(t(key))}>
                    <Text style={styles.chipText}>{t(key)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View key={`${msg.role}-${index}`} style={styles.turn}>
                <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={msg.role === 'user' ? styles.bubbleUserText : styles.bubbleBotText}>
                    {msg.text}
                  </Text>
                </View>
                {msg.items?.map((item) => (
                  <View key={`${item.labelKey}-${JSON.stringify(item.params)}`} style={styles.itemRow}>
                    <Text style={styles.itemText}>
                      {interpolate(t(item.labelKey as MessageKey), item.params)}
                    </Text>
                    {item.submit ? (
                      <Pressable style={styles.actionBtn} onPress={() => confirmSubmit(item.submit!)}>
                        <Text style={styles.actionBtnText}>{t(item.submit.labelKey as MessageKey)}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                {msg.actions?.map((action) =>
                  isSubmitAction(action) ? (
                    <Pressable
                      key={`submit-${action.entityId}`}
                      style={styles.actionBtn}
                      onPress={() =>
                        confirmSubmit({
                          entityType: action.entityType!,
                          entityId: action.entityId!,
                          labelKey: action.labelKey,
                          confirmParams: action.confirmParams ?? {},
                        })
                      }
                    >
                      <Text style={styles.actionBtnText}>{t(action.labelKey as MessageKey)}</Text>
                    </Pressable>
                  ) : null,
                )}
              </View>
            ))
          )}
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#127fbf" />
              <Text style={styles.loadingText}>{t('chat.thinking')}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder')}
            editable={!loading}
          />
          <Pressable style={styles.sendBtn} onPress={() => void sendMessage()} disabled={loading}>
            <Text style={styles.sendBtnText}>{t('chat.send')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerActions: { flexDirection: 'row', gap: 16 },
  headerLink: { color: '#0891b2', fontWeight: '600' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  welcome: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipText: { color: '#0f172a', fontSize: 13 },
  turn: { gap: 8, marginBottom: 8 },
  bubble: { maxWidth: '88%', borderRadius: 14, padding: 12 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#0891b2' },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  bubbleUserText: { color: '#fff' },
  bubbleBotText: { color: '#0f172a' },
  itemRow: { gap: 8, marginLeft: 4 },
  itemText: { color: '#334155', fontSize: 13 },
  actionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0891b2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { color: '#64748b', fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#0891b2',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '700' },
});
