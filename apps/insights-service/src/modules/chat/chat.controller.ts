import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatQueryDto } from './dto/chat-query.dto';

/** Minimal JWT payload decode for scaffold — replace with shared auth guard in Phase D. */
function decodeActor(authorization?: string) {
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Bearer token required');
  }
  const token = authorization.slice(7);
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    ) as { sub?: string; compCode?: string; roleCode?: string };
    if (!payload.sub || !payload.compCode) {
      throw new Error('missing claims');
    }
    return {
      userId: payload.sub,
      compCode: payload.compCode,
      roleCode: payload.roleCode ?? 'FS',
    };
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
}

@Controller('insights/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async query(
    @Body() dto: ChatQueryDto,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = decodeActor(authorization);
    return this.chatService.query(dto, actor);
  }
}
