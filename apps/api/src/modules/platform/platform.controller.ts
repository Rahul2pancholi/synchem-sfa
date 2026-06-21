import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException } from '@nestjs/common';
import { PlatformTokenRequestSchema } from '@synchem-sfa/shared-types';
import { Public } from '../../common/decorators/public.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { PlatformService } from './platform.service';

@Controller('api/v1/platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Public()
  @Post('token')
  async token(@Body() body: Record<string, string>) {
    const parsed = PlatformTokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException('Invalid platform token request');
    }

    return this.platformService.login(parsed.data.email, parsed.data.password);
  }

  @Get('companies')
  @RequireActor('platform')
  listCompanies(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.platformService.listCompanies(Number(page), Number(pageSize));
  }

  @Post('companies')
  @RequireActor('platform')
  createCompany(@Body() body: Record<string, unknown>) {
    return this.platformService.createCompany(body);
  }

  @Get('companies/:compCode')
  @RequireActor('platform')
  getCompany(@Param('compCode') compCode: string) {
    return this.platformService.getCompany(compCode);
  }

  @Patch('companies/:compCode')
  @RequireActor('platform')
  updateCompany(@Param('compCode') compCode: string, @Body() body: Record<string, unknown>) {
    return this.platformService.updateCompany(compCode, body);
  }
}
