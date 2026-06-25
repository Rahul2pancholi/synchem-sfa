import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { z } from 'zod';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import type { Request } from 'express';
import { AppLanguageParam } from '../../common/decorators/app-language.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';

import { ChatSubmitService } from './chat-submit.service';
import { InsightsChatService } from './insights-chat.service';

const ChatBodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .max(20)
    .optional(),
  sessionId: z.string().uuid().optional(),
});

const ChatSubmitSchema = z.object({
  entityType: z.enum(['DCR', 'POB']),
  entityId: z.string().uuid(),
});

@Controller('api/v1/insights')
@RequireActor('tenant')
export class InsightsChatController {
  constructor(
    private readonly insightsChat: InsightsChatService,
    private readonly chatSubmit: ChatSubmitService,
  ) {}

  @Get('chat/session')
  getSession(@CurrentUser() user: JwtPayload, @Query('sessionId') sessionId?: string) {
    return this.insightsChat.getSession(user, sessionId);
  }

  @Post('chat/session/reset')
  resetSession(@CurrentUser() user: JwtPayload) {
    return this.insightsChat.resetSession(user);
  }

  @Post('chat')
  chat(
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
    @Headers('authorization') authorization: string | undefined,
    @AppLanguageParam() language: AppLanguage,
    @Req() req: Request,
  ) {
    const parsed = ChatBodySchema.parse(body);
    const authHeader = authorization ?? req.headers.authorization ?? '';
    return this.insightsChat.query(
      user,
      parsed.message,
      language,
      authHeader,
      parsed.history ?? [],
      parsed.sessionId,
    );
  }

  @Post('chat/submit')
  submit(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    const parsed = ChatSubmitSchema.parse(body);
    return this.chatSubmit.submit(user, parsed.entityType, parsed.entityId);
  }
}
