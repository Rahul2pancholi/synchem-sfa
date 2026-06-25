import {
  apiSuccess,
  matchChatIntent,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { ChatIntentService } from './chat-intent.service';
import { buildFallbackReplyText } from './chat-reply-humanizer';

describe('ChatIntentService', () => {
  const managerUser: JwtPayload = {
    sub: 'rm1',
    empId: 'emp-rm',
    fullName: 'RM User',
    compCode: 'SYN',
    roleType: 'MAN',
    roleId: 'role-1',
    actorType: 'tenant',
  };

  it('returns pending approval counts for managers', async () => {
    const approvals = {
      getSummary: jest.fn().mockResolvedValue(
        apiSuccess({ dcr: 2, rtp: 1, weeklyPlan: 0, leave: 0, expense: 0, doctor: 0, total: 3 }),
      ),
    };
    const reports = {
      fieldStaffKpis: jest.fn(),
      managerSalesKpis: jest.fn(),
      fieldStaffDcrDrafts: jest.fn(),
      fieldStaffPobDrafts: jest.fn(),
    };
    const service = new ChatIntentService(approvals as never, reports as never);

    const intent = matchChatIntent('pending approvals', 'MAN');
    const reply = await service.resolve(managerUser, intent);

    expect(reply.messageKey).toBe('chat.answer.pendingApprovals');
    expect(reply.params.total).toBe(3);
    expect(reply.actions.some((a) => a.path.includes('approvals'))).toBe(true);
    expect(buildFallbackReplyText(reply, 'en')).toContain('3');
  });

  it('lists DCR drafts for field staff', async () => {
    const approvals = { getSummary: jest.fn() };
    const reports = {
      fieldStaffKpis: jest.fn(),
      managerSalesKpis: jest.fn(),
      fieldStaffDcrDrafts: jest.fn().mockResolvedValue(
        apiSuccess({
          items: [
            { id: 'd1', workDate: '22-06-2026', approveStatus: 'DRAFT', doctorCount: 3 },
          ],
        }),
      ),
      fieldStaffPobDrafts: jest.fn(),
    };
    const service = new ChatIntentService(approvals as never, reports as never);
    const fsUser: JwtPayload = {
      ...managerUser,
      roleType: 'FS',
      empId: 'emp-mr',
    };

    const reply = await service.resolve(fsUser, 'my_dcr_drafts', 'dcr draft dikhao');

    expect(reply.messageKey).toBe('chat.answer.dcrDraftList');
    expect(reply.items).toHaveLength(1);
    expect(reply.items?.[0].params.date).toBe('22-06-2026');
  });
});
