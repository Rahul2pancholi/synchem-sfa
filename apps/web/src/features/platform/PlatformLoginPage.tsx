import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

interface PlatformLoginFormValues {
  email: string;
  password: string;
}

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm<PlatformLoginFormValues>();

  async function handleSubmit(values: PlatformLoginFormValues) {
    try {
      const res = await fetch('/api/v1/platform/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        message.error(t('platform.login.invalidCredentials'));
        return;
      }

      const data = await res.json();
      localStorage.setItem('platform_token', data.access_token);
      navigate('/platform/tenants');
    } catch {
      message.error(t('auth.login.apiError'));
    }
  }

  return (
    <div className="login-page">
      <Card style={{ width: 400 }} title={t('platform.login.title')}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSwitcher />
          </div>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            {t('platform.login.subtitle')}
          </Typography.Paragraph>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ email: 'superadmin@synchem.co', password: 'Platform@123' }}
            onFinish={handleSubmit}
          >
            <Form.Item name="email" label={t('platform.login.email')} rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label={t('auth.login.password')} rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {t('common.signIn')}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
