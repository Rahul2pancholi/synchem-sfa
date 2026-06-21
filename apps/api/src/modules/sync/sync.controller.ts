import { Body, Controller, Post } from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { SyncService } from './sync.service';

@Controller('api/v1/sync')
@RequireActor('tenant')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  push(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.syncService.push(user, body);
  }

  @Post('pull')
  pull(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.syncService.pull(user, body);
  }

  @Post('masters/bootstrap')
  bootstrap(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.syncService.bootstrap(user, body);
  }
}
