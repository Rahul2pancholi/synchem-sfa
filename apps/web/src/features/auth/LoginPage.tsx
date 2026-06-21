import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { ROLE_DASHBOARD_ROUTES } from '@synchem-sfa/shared-types';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

interface LoginFormValues {
  userName: string;
  password: string;
  compCode: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm<LoginFormValues>();

  async function handleSubmit(values: LoginFormValues) {
    try {
      const body = new URLSearchParams({
        grant_type: 'password',
        username: `${values.userName},${values.compCode}`,
        password: values.password,
      });

      const res = await fetch('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...languageHeader,
        },
        body,
      });

      if (!res.ok) {
        message.error(t('auth.login.invalidCredentials'));
        return;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('roleType', data.roleType);
      localStorage.setItem('compCode', data.compCode);
      localStorage.setItem('compName', data.compName);
      localStorage.setItem('employeeObj', data.employeeObj);
      localStorage.setItem('menuList', data.menuList ?? '[]');
      localStorage.setItem('configurationSetting', data.configurationSetting ?? '{}');

      const home = ROLE_DASHBOARD_ROUTES[data.roleType] ?? '/app';
      navigate(home);
    } catch {
      message.error(t('auth.login.apiError'));
    }
  }

  return (
    <div className="login-page">
      <Card style={{ width: 400 }} title={t('auth.login.title')}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSwitcher />
          </div>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            {t('auth.login.subtitle')}
          </Typography.Paragraph>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ userName: 'admin', password: 'Admin@123', compCode: 'SYN' }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="userName"
              label={t('auth.login.userName')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label={t('auth.login.password')}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="compCode"
              label={t('auth.login.compCode')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {t('common.signIn')}
              </Button>
            </Form.Item>
          </Form>
          <Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link>
        </Space>
      </Card>
    </div>
  );
}
