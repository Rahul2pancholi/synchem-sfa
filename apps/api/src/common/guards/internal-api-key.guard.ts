import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('INTERNAL_API_KEY');
    if (!expected?.trim()) {
      throw new UnauthorizedException('Internal API not configured');
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const provided = request.headers['x-internal-key'];
    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
