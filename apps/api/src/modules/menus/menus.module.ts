import { Module } from '@nestjs/common';
import { PrismaMenuRepository } from './adapters/prisma-menu.repository';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { MENU_REPOSITORY } from './ports/menu.repository.port';

@Module({
  controllers: [MenusController],
  providers: [
    MenusService,
    { provide: MENU_REPOSITORY, useClass: PrismaMenuRepository },
  ],
  exports: [MenusService],
})
export class MenusModule {}
