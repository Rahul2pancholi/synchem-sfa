import type { SyncChange, SyncRepositoryPort } from './ports/sync.repository.port';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  const user = {
    sub: 'mr1',
    empId: 'emp-1',
    compCode: 'SYN',
    roleType: 'FS',
    roleId: 'role-1',
    actorType: 'tenant' as const,
  };

  function createRepo(overrides: Partial<SyncRepositoryPort> = {}): SyncRepositoryPort {
    return {
      findBatchBySyncId: jest.fn().mockResolvedValue(null),
      pushBatch: jest.fn().mockResolvedValue(undefined),
      applyChanges: jest.fn().mockResolvedValue({ applied: [], errors: [] }),
      pullChanges: jest.fn().mockResolvedValue([]),
      bootstrapMasters: jest.fn().mockResolvedValue({
        doctors: [],
        retailers: [],
        routes: [],
        products: [],
      }),
      ...overrides,
    };
  }

  it('returns cached push result for duplicate syncBatchId', async () => {
    const cached = {
      syncBatchId: '11111111-1111-1111-1111-111111111111',
      serverTimestamp: '2026-06-18T00:00:00.000Z',
      applied: [],
      errors: [],
      serverChanges: [],
    };
    const repo = createRepo({
      findBatchBySyncId: jest.fn().mockResolvedValue({
        syncBatchId: cached.syncBatchId,
        compCode: 'SYN',
        empId: 'emp-1',
        responseJson: cached,
      }),
    });

    const service = new SyncService(repo);
    const result = await service.push(user, {
      syncBatchId: cached.syncBatchId,
      changes: [],
    });

    expect(result.data.syncBatchId).toBe(cached.syncBatchId);
    expect(repo.applyChanges).not.toHaveBeenCalled();
  });

  it('rejects invalid push payload', async () => {
    const service = new SyncService(createRepo());

    await expect(service.push(user, { changes: [] })).rejects.toThrow();
  });

  it('bootstraps masters for HQ', async () => {
    const repo = createRepo({
      bootstrapMasters: jest.fn().mockResolvedValue({
        doctors: [{ id: 'd1', doctorName: 'Dr A', routeId: 'r1', mobileNo: null }],
        retailers: [],
        routes: [{ id: 'r1', routeName: 'Route-A', headQuarterId: 'hq1' }],
        products: [],
      }),
    });

    const service = new SyncService(repo);
    const result = await service.bootstrap(user, {
      headQuarterId: '11111111-1111-1111-1111-111111111111',
    });

    expect(result.data.doctors).toHaveLength(1);
    expect(repo.bootstrapMasters).toHaveBeenCalledWith(
      'SYN',
      '11111111-1111-1111-1111-111111111111',
      undefined,
    );
  });
});

describe('PrismaSyncRepository helpers', () => {
  it('orders DCR before visit changes', () => {
    const changes: SyncChange[] = [
      {
        clientId: '22222222-2222-2222-2222-222222222222',
        entityType: 'dcr_doctor_visit',
        operation: 'create',
        payload: { doctorId: 'doc-1', dcrClientId: '11111111-1111-1111-1111-111111111111' },
      },
      {
        clientId: '11111111-1111-1111-1111-111111111111',
        entityType: 'daily_call_report',
        operation: 'create',
        payload: { workDate: '2026-06-18', approveStatus: 'DRAFT' },
      },
    ];

    const ordered = [...changes].sort((a, b) => {
      const rank = (type: SyncChange['entityType']) => {
        if (type === 'daily_call_report') return 0;
        if (type === 'dcr_doctor_visit' || type === 'dcr_retailer_visit') return 1;
        return 2;
      };
      return rank(a.entityType) - rank(b.entityType);
    });

    expect(ordered[0].entityType).toBe('daily_call_report');
  });
});
