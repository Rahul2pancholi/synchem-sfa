import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { TokenRequestSchema } from '@synchem-sfa/shared-types';
import { AppLanguageParam } from '../../common/decorators/app-language.decorator';
import { extractDeviceContext } from '../../common/http/device-context';
import { Public } from '../../common/decorators/public.decorator';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';
import { AuthService } from './auth.service';

const LOGIN_THROTTLE_LIMIT =
  process.env.LOAD_TEST === '1' || process.env.APP_ENV === 'dev' ? 10_000 : 10;

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: 60000 } })
  @Post('token')
  async token(
    @Body() body: Record<string, string>,
    @AppLanguageParam() language: AppLanguage,
    @Req() req: Request,
  ) {
    const parsed = TokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid token request');
    }

    const device = extractDeviceContext(req);
    return this.authService.login(parsed.data.username, parsed.data.password, language, device);
  }
}
