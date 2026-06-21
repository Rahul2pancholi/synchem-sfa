import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AppLanguage } from '@synchem-sfa/shared-i18n';
import { resolveRequestLanguage } from '../i18n/language.util';

export const AppLanguageParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppLanguage => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    return resolveRequestLanguage(request.headers);
  },
);
