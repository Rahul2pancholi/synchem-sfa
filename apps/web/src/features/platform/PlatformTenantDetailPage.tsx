import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Layout,
  Radio,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  TENANT_FEATURE_DEFINITIONS,
  TENANT_FEATURE_PRESETS,
  type TenantFeatureKey,
  type TenantFeaturePresetId,
  type TenantFeatureState,
} from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

interface Company {
  compCode: string;
  compName: string;
  active: boolean;
}

interface FeaturesResponse {
  data: { compCode: string; features: TenantFeatureState };
}

function detectPreset(features: TenantFeatureState): TenantFeaturePresetId | 'custom' {
  for (const preset of TENANT_FEATURE_PRESETS) {
    const match = (Object.keys(features) as TenantFeatureKey[]).every(
      (key) => features[key] === preset.features[key],
    );
    if (match) return preset.id;
  }
  return 'custom';
}

export function PlatformTenantDetailPage() {
  const { compCode = '' } = useParams();
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [company, setCompany] = useState<Company | null>(null);
  const [features, setFeatures] = useState<TenantFeatureState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('platform_token');

  useEffect(() => {
    if (!token) {
      navigate('/platform/login');
      return;
    }
    void load();
  }, [token, compCode, navigate]);

  async function load() {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, ...languageHeader };
      const [companyRes, featuresRes] = await Promise.all([
        fetch(`/api/v1/platform/companies/${compCode}`, { headers }),
        fetch(`/api/v1/platform/companies/${compCode}/features`, { headers }),
      ]);

      if (companyRes.status === 401 || featuresRes.status === 401) {
        localStorage.removeItem('platform_token');
        navigate('/platform/login');
        return;
      }

      const companyJson = await companyRes.json();
      const featuresJson = (await featuresRes.json()) as FeaturesResponse;
      setCompany(companyJson.data);
      setFeatures(featuresJson.data.features);
    } catch {
      message.error(t('platform.tenants.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function persistFeatures(next: TenantFeatureState) {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/platform/companies/${compCode}/features`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...languageHeader,
        },
        body: JSON.stringify({ features: next }),
      });
      if (!res.ok) {
        message.error(t('platform.tenants.createFailed'));
        return;
      }
      message.success(t('platform.tenants.featuresSaved'));
    } finally {
      setSaving(false);
    }
  }

  async function applyPreset(presetId: TenantFeaturePresetId) {
    const preset = TENANT_FEATURE_PRESETS.find((p) => p.id === presetId);
    if (!preset || !features) return;
    const next = { ...preset.features };
    setFeatures(next);
    await persistFeatures(next);
  }

  async function toggleFeature(key: TenantFeatureKey, enabled: boolean) {
    if (!features) return;
    const next = { ...features, [key]: enabled };
    setFeatures(next);
    await persistFeatures(next);
  }

  async function toggleActive() {
    if (!company) return;
    const res = await fetch(`/api/v1/platform/companies/${compCode}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...languageHeader,
      },
      body: JSON.stringify({ active: !company.active }),
    });
    if (!res.ok) return;
    message.success(t('platform.tenants.companyUpdated'));
    await load();
  }

  function logout() {
    localStorage.removeItem('platform_token');
    navigate('/platform/login');
  }

  const activePreset = features ? detectPreset(features) : 'full';

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
          {company?.compName ?? compCode}
        </Typography.Title>
        <Space>
          <LanguageSwitcher />
          <Link to="/platform/tenants">{t('platform.tenants.back')}</Link>
          <Button onClick={logout}>{t('common.logout')}</Button>
        </Space>
      </Layout.Header>
      <Layout.Content style={{ padding: 24, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {loading ? (
          <Spin />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Space wrap>
                <Tag color={company?.active ? 'success' : 'default'}>
                  {company?.active ? t('platform.tenants.active') : t('platform.tenants.inactive')}
                </Tag>
                <Typography.Text type="secondary">{compCode}</Typography.Text>
                <Button onClick={() => void toggleActive()}>
                  {company?.active
                    ? t('platform.tenants.suspendCompany')
                    : t('platform.tenants.activateCompany')}
                </Button>
              </Space>
            </Card>

            <Card title={t('platform.tenants.presetTitle')}>
              <Typography.Paragraph type="secondary">
                {t('platform.tenants.presetSubtitle')}
              </Typography.Paragraph>
              <Radio.Group
                value={activePreset === 'custom' ? undefined : activePreset}
                optionType="button"
                buttonStyle="solid"
                disabled={saving}
                onChange={(e) => void applyPreset(e.target.value as TenantFeaturePresetId)}
              >
                {TENANT_FEATURE_PRESETS.map((preset) => (
                  <Radio.Button key={preset.id} value={preset.id}>
                    {t(preset.labelKey as MessageKey)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Card>

            <Card title={t('platform.tenants.featuresTitle')}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {TENANT_FEATURE_DEFINITIONS.map((def) => (
                  <div key={def.key} className="platform-feature-row platform-feature-row--compact">
                    <Typography.Text>{t(def.labelKey as MessageKey)}</Typography.Text>
                    <Switch
                      checked={features?.[def.key] ?? true}
                      disabled={saving}
                      onChange={(checked) => void toggleFeature(def.key, checked)}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Space>
        )}
      </Layout.Content>
    </Layout>
  );
}
