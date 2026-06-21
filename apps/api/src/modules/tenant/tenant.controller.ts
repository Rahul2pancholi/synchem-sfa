import { Controller, Get } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { TenantService } from './tenant.service';

@Controller('api/v1/employees')
@RequireActor('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.tenantService.getCurrentEmployee(user);
  }
}
