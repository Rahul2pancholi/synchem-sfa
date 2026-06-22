import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import type { ApprovalEntityType } from '@synchem-sfa/shared-types';
import {
  PUSH_NOTIFICATION_PORT,
  type PushNotificationPort,
} from './push-notification.port';

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUSH_NOTIFICATION_PORT) private readonly push: PushNotificationPort,
  ) {}

  async notifyApprovalSubmitted(
    compCode: string,
    entityType: ApprovalEntityType,
    submitterEmpId: string,
    summary: string,
  ) {
    const submitter = await this.prisma.employee.findFirst({
      where: { compCode, id: submitterEmpId },
      select: { reportingManagerId: true, firstName: true },
    });
    if (!submitter?.reportingManagerId) return;

    await this.push.sendToEmployee(compCode, submitter.reportingManagerId, {
      title: 'Pending approval',
      body: `${submitter.firstName}: ${summary}`,
      data: { entityType, action: 'approval_submitted' },
    });
  }

  async notifyApprovalDecision(
    compCode: string,
    entityType: ApprovalEntityType,
    submitterEmpId: string,
    summary: string,
    decision: 'APPROVED' | 'REJECTED',
  ) {
    await this.push.sendToEmployee(compCode, submitterEmpId, {
      title: decision === 'APPROVED' ? 'Approved' : 'Rejected',
      body: `${summary} — ${decision.toLowerCase()}`,
      data: { entityType, action: `approval_${decision.toLowerCase()}` },
    });
  }
}
