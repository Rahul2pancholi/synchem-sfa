import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Checkbox, Select, Space, Spin, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RoleDetailSummary, RolePermissionRow } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { saveMenuListToStorage } from '../../lib/menu-permissions';
import { notifyMenuListUpdated } from '../../hooks/usePermission';

interface RoleListResponse {
  data: { items: RoleDetailSummary[] };
}

interface PermissionListResponse {
  data: { items: RolePermissionRow[] };
}

type PermKey = 'canView' | 'canAdd' | 'canEdit' | 'canDelete' | 'canPreview' | 'canPrint';

interface EditableRow extends RolePermissionRow {
  depth: number;
}

export function RoleSettingPage() {
  const { t, languageHeader } = useI18n();
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState<string>();
  const [rows, setRows] = useState<EditableRow[]>([]);

  const rolesQuery = useQuery({
    queryKey: ['roles-admin'],
    queryFn: async () => {
      const res = await fetchApi<RoleListResponse>('/api/v1/roles', languageHeader);
      return res.data.items.filter((r) => r.active);
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ['role-permissions', roleId],
    enabled: Boolean(roleId),
    queryFn: async () => {
      const res = await fetchApi<PermissionListResponse>(
        `/api/v1/roles/${roleId}/permissions`,
        languageHeader,
      );
      return res.data.items;
    },
  });

  useEffect(() => {
    if (!permissionsQuery.data) return;
    const depthById = new Map<string, number>();
    const computeDepth = (menuId: string): number => {
      if (depthById.has(menuId)) return depthById.get(menuId)!;
      const row = permissionsQuery.data!.find((r) => r.menuId === menuId);
      if (!row?.parentMenuId) {
        depthById.set(menuId, 0);
        return 0;
      }
      const depth = computeDepth(row.parentMenuId) + 1;
      depthById.set(menuId, depth);
      return depth;
    };

    setRows(
      permissionsQuery.data.map((row) => ({
        ...row,
        depth: computeDepth(row.menuId),
      })),
    );
  }, [permissionsQuery.data]);

  useEffect(() => {
    if (!roleId && rolesQuery.data?.length) {
      setRoleId(rolesQuery.data[0].id);
    }
  }, [roleId, rolesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      fetch(`/api/v1/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: authHeaders(languageHeader),
        body: JSON.stringify({ permissions: rows }),
      }).then((res) => {
        if (!res.ok) throw new Error('save failed');
      }),
    onSuccess: async () => {
      message.success(t('access.permission.saveSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });

      const menuRes = await fetchApi<{ data: { menuList: string } }>(
        '/api/v1/menus/me',
        languageHeader,
      );
      saveMenuListToStorage(menuRes.data.menuList);
      notifyMenuListUpdated();
    },
    onError: () => message.error(t('access.permission.saveFailed')),
  });

  function toggleRow(menuId: string, key: PermKey, value: boolean) {
    setRows((prev) =>
      prev.map((row) => (row.menuId === menuId ? { ...row, [key]: value } : row)),
    );
  }

  const permColumns: Array<{ key: PermKey; title: string }> = useMemo(
    () => [
      { key: 'canView', title: t('access.permission.canView') },
      { key: 'canAdd', title: t('access.permission.canAdd') },
      { key: 'canEdit', title: t('access.permission.canEdit') },
      { key: 'canDelete', title: t('access.permission.canDelete') },
      { key: 'canPreview', title: t('access.permission.canPreview') },
      { key: 'canPrint', title: t('access.permission.canPrint') },
    ],
    [t],
  );

  const columns: ColumnsType<EditableRow> = [
    {
      title: t('access.permission.menuName'),
      key: 'menuName',
      render: (_, row) => (
        <span style={{ paddingLeft: row.depth * 16 }}>
          {row.menuName}{' '}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            ({row.menuCode})
          </Typography.Text>
        </span>
      ),
    },
    ...permColumns.map(({ key, title }) => ({
      title,
      key,
      width: 80,
      align: 'center' as const,
      render: (_: unknown, row: EditableRow) => (
        <Checkbox checked={row[key]} onChange={(e) => toggleRow(row.menuId, key, e.target.checked)} />
      ),
    })),
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('access.permission.title')}
      </Typography.Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Typography.Text>{t('access.permission.selectRole')}:</Typography.Text>
          <Select
            style={{ minWidth: 220 }}
            value={roleId}
            loading={rolesQuery.isLoading}
            onChange={setRoleId}
            options={(rolesQuery.data ?? []).map((role) => ({
              value: role.id,
              label: `${role.roleName} (${role.roleType})`,
            }))}
          />
          <Button type="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {t('access.permission.save')}
          </Button>
        </Space>

        {permissionsQuery.isLoading ? (
          <Spin />
        ) : (
          <Table
            rowKey="menuId"
            size="small"
            pagination={{ pageSize: 20 }}
            columns={columns}
            dataSource={rows}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </Space>
  );
}
