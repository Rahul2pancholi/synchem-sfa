import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenRequestSchema } from '@synchem-sfa/shared-types';
import { Public } from '../../common/decorators/public.decorator';
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
  forgotPassword(@Body() body: Record<string, unknown>) {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() body: Record<string, unknown>) {
    return this.authService.verifyOtp(body);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: Record<string, unknown>) {
    return this.authService.resetPassword(body);
  }
}
