import { Module } from '@nestjs/common';
import { ApprovalsModule } from '../approvals/approvals.module';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

@Module({
  imports: [ApprovalsModule],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
