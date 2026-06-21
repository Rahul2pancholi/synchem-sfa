import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenRequestSchema } from '@synchem-sfa/shared-types';
import { AppLanguageParam } from '../../common/decorators/app-language.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthV1Controller {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('refresh')
  refresh(@Body() body: Record<string, string>) {
    const parsed = RefreshTokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid refresh request');
    }

    return this.authService.refresh(parsed.data.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: Record<string, unknown>, @AppLanguageParam() language: AppLanguage) {
    return this.authService.forgotPassword(body, language);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() body: Record<string, unknown>, @AppLanguageParam() language: AppLanguage) {
    return this.authService.verifyOtp(body, language);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: Record<string, unknown>, @AppLanguageParam() language: AppLanguage) {
    return this.authService.resetPassword(body, language);
  }
}
