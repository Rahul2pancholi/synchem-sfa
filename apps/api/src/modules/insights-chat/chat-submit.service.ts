import { Injectable, Logger } from '@nestjs/common';
import type { ChatSubmitEntityType, JwtPayload } from '@synchem-sfa/shared-types';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ChatSubmitService {
  private readonly logger = new Logger(ChatSubmitService.name);

  constructor(private readonly transactions: TransactionsService) {}

  submit(user: JwtPayload, entityType: ChatSubmitEntityType, entityId: string) {
    const compCode = user.compCode!;
    const empId = user.empId!;

    this.logger.log({
      module: 'insights-chat',
      action: entityType === 'DCR' ? 'submitDcr' : 'submitPob',
      compCode,
      empId,
      entityId,
    });

    if (entityType === 'DCR') {
      return this.transactions.submitDcr(compCode, empId, entityId);
    }

    return this.transactions.submitPob(compCode, empId, entityId);
  }
}
