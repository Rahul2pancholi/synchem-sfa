import { Controller, Get } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { apiSuccess } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { TenantFeaturesService } from './tenant-features.service';

@Controller('api/v1/tenant')
@RequireActor('tenant')
export class TenantFeaturesController {
  constructor(private readonly tenantFeatures: TenantFeaturesService) {}

  @Get('features')
  getFeatures(@CurrentUser() user: JwtPayload) {
    return this.tenantFeatures.getFeatureState(user.compCode!).then((features) =>
      apiSuccess({ compCode: user.compCode, features }),
    );
  }
}
