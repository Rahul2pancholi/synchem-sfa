import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  Layout,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

interface Company {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
  active: boolean;
}

interface CreateTenantFormValues {
  compCode: string;
  compName: string;
}

export function PlatformTenantsPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<CreateTenantFormValues>();

  const token = localStorage.getItem('platform_token');

  useEffect(() => {
    if (!token) {
      navigate('/platform/login');
      return;
    }
    void loadCompanies();
  }, [token, navigate]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/platform/companies', {
        headers: { Authorization: `Bearer ${token}`, ...languageHeader },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('platform_token');
        navigate('/platform/login');
        return;
      }
      const data = await res.json();
      setCompanies(data.data.items ?? []);
    } catch {
      message.error(t('platform.tenants.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function createTenant(values: CreateTenantFormValues) {
    setCreating(true);
    try {
      const res = await fetch('/api/v1/platform/companies', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...languageHeader,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        message.error(t('platform.tenants.createFailed'));
        return;
      }

      form.resetFields();
      message.success(t('common.create'));
      await loadCompanies();
    } finally {
      setCreating(false);
    }
  }

  function logout() {
    localStorage.removeItem('platform_token');
    navigate('/platform/login');
  }

  const columns: ColumnsType<Company> = [
    { title: t('platform.tenants.code'), dataIndex: 'compCode', key: 'compCode' },
    { title: t('platform.tenants.name'), dataIndex: 'compName', key: 'compName' },
    { title: t('platform.tenants.timezone'), dataIndex: 'timezone', key: 'timezone' },
    {
      title: t('platform.tenants.status'),
      key: 'active',
      render: (_, row) => (
        <Tag color={row.active ? 'success' : 'default'}>
          {row.active ? t('platform.tenants.active') : t('platform.tenants.inactive')}
        </Tag>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Layout.Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('platform.tenants.title')}
        </Typography.Title>
        <Space>
          <LanguageSwitcher />
          <Link to="/login">{t('platform.tenants.tenantLogin')}</Link>
          <Button onClick={logout}>{t('common.logout')}</Button>
        </Space>
      </Layout.Header>
      <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title={t('platform.tenants.createTitle')}>
            <Form form={form} layout="inline" onFinish={createTenant}>
              <Form.Item
                name="compCode"
                rules={[{ required: true }]}
                normalize={(v: string) => v?.toUpperCase()}
              >
                <Input placeholder={t('platform.tenants.compCodePlaceholder')} />
              </Form.Item>
              <Form.Item name="compName" rules={[{ required: true }]}>
                <Input placeholder={t('platform.tenants.compNamePlaceholder')} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={creating}>
                  {t('common.create')}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title={t('platform.tenants.existingTitle')}>
            {loading ? (
              <Spin />
            ) : (
              <Table rowKey="compCode" columns={columns} dataSource={companies} pagination={false} />
            )}
          </Card>
        </Space>
      </Layout.Content>
    </Layout>
  );
}
