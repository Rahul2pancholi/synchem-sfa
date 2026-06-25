import { Injectable, Logger } from '@nestjs/common';
import type {
  ChatAction,
  ChatAssistantReply,
  ChatListItem,
  ChatSessionMessage,
  ChatSessionSnapshot,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

interface AssistantMetadata {
  actions?: ChatAction[];
  items?: ChatListItem[];
}

@Injectable()
export class ChatSessionService {
  private readonly logger = new Logger(ChatSessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getActiveSession(
    compCode: string,
    empId: string,
    sessionId?: string,
  ): Promise<ChatSessionSnapshot> {
    const session = await this.resolveSession(compCode, empId, sessionId);
    const rows = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id, compCode },
      orderBy: { createdAt: 'asc' },
      take: 40,
    });

    return {
      sessionId: session.id,
      messages: rows.map((row) => this.toSessionMessage(row)),
    };
  }

  async createSession(compCode: string, empId: string): Promise<ChatSessionSnapshot> {
    const session = await this.prisma.chatSession.create({
      data: { compCode, empId },
    });
    return { sessionId: session.id, messages: [] };
  }

  async resolveSession(compCode: string, empId: string, sessionId?: string) {
    if (sessionId) {
      const existing = await this.prisma.chatSession.findFirst({
        where: { id: sessionId, compCode, empId },
      });
      if (existing) return existing;
    }

    return this.prisma.chatSession.create({
      data: { compCode, empId },
    });
  }

  async appendTurn(
    sessionId: string,
    compCode: string,
    userMessage: string,
    assistantReply: ChatAssistantReply,
  ) {
    const metadata: AssistantMetadata = {
      actions: assistantReply.actions,
      items: assistantReply.items,
    };

    await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          sessionId,
          compCode,
          role: 'user',
          content: userMessage,
        },
      }),
      this.prisma.chatMessage.create({
        data: {
          sessionId,
          compCode,
          role: 'assistant',
          content: assistantReply.replyText,
          metadataJson: JSON.stringify(metadata),
        },
      }),
      this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }

  private toSessionMessage(row: {
    role: string;
    content: string;
    metadataJson: string | null;
  }): ChatSessionMessage {
    if (row.role !== 'assistant' || !row.metadataJson) {
      return { role: row.role as ChatSessionMessage['role'], content: row.content };
    }

    try {
      const metadata = JSON.parse(row.metadataJson) as AssistantMetadata;
      return {
        role: 'assistant',
        content: row.content,
        actions: metadata.actions,
        items: metadata.items,
      };
    } catch (err) {
      this.logger.warn({
        module: 'chat-session',
        action: 'metadataParseFailed',
        error: err instanceof Error ? err.message : String(err),
      });
      return { role: 'assistant', content: row.content };
    }
  }
}
