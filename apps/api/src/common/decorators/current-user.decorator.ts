import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
