import { Module } from '@nestjs/common';
import { PrismaHierarchyRepository } from './adapters/prisma-hierarchy.repository';
import { HierarchiesController } from './hierarchies.controller';
import { HierarchiesService } from './hierarchies.service';
import { HIERARCHY_REPOSITORY } from './ports/hierarchy.repository.port';

@Module({
  controllers: [HierarchiesController],
  providers: [
    HierarchiesService,
    { provide: HIERARCHY_REPOSITORY, useClass: PrismaHierarchyRepository },
  ],
  exports: [HierarchiesService],
})
export class HierarchiesModule {}
