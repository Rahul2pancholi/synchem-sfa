import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { PrismaMenuRepository } from './adapters/prisma-menu.repository';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { MENU_REPOSITORY } from './ports/menu.repository.port';

@Module({
  imports: [TenantModule],
  controllers: [MenusController],
  providers: [
    MenusService,
    { provide: MENU_REPOSITORY, useClass: PrismaMenuRepository },
  ],
  exports: [MenusService],
})
export class MenusModule {}
