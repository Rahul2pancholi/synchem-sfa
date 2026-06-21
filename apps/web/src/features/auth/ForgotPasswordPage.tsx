import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Space, Steps, Typography, message } from 'antd';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

type Step = 'request' | 'verify' | 'reset' | 'done';

const STEP_INDEX: Record<Step, number> = {
  request: 0,
  verify: 1,
  reset: 2,
  done: 3,
};

export function ForgotPasswordPage() {
  const { t, languageHeader } = useI18n();
  const [step, setStep] = useState<Step>('request');
  const [userName, setUserName] = useState('');
  const [compCode, setCompCode] = useState('SYN');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.message ?? t('auth.forgot.otpRequestFailed'));
        return;
      }
      message.success(t('auth.forgot.otpSent'));
      setStep('verify');
    } catch {
      message.error(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode, otp }),
      });
      if (!res.ok) {
        message.error(t('auth.forgot.otpInvalid'));
        return;
      }
      setStep('reset');
    } catch {
      message.error(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(values: { newPassword: string }) {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode, otp, newPassword: values.newPassword }),
      });
      if (!res.ok) {
        message.error(t('auth.forgot.resetFailed'));
        return;
      }
      message.success(t('auth.forgot.passwordUpdated'));
      setStep('done');
    } catch {
      message.error(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Card style={{ width: 440 }} title={t('auth.forgot.title')}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSwitcher />
          </div>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            {t('auth.forgot.policy')}
          </Typography.Paragraph>
          <Steps
            size="small"
            current={STEP_INDEX[step]}
            items={[
              { title: t('auth.forgot.sendOtp') },
              { title: t('auth.forgot.verifyOtp') },
              { title: t('auth.forgot.resetPassword') },
              { title: t('auth.forgot.passwordUpdated') },
            ]}
          />

          {step === 'request' && (
            <Form layout="vertical" onFinish={requestOtp}>
              <Form.Item label={t('auth.forgot.userName')} required>
                <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
              </Form.Item>
              <Form.Item label={t('auth.forgot.compCode')} required>
                <Input value={compCode} onChange={(e) => setCompCode(e.target.value)} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {t('auth.forgot.sendOtp')}
              </Button>
            </Form>
          )}

          {step === 'verify' && (
            <Form layout="vertical" onFinish={verifyOtp}>
              <Form.Item label={t('auth.forgot.otp')} required>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {t('auth.forgot.verifyOtp')}
              </Button>
            </Form>
          )}

          {step === 'reset' && (
            <Form layout="vertical" onFinish={resetPassword}>
              <Form.Item
                name="newPassword"
                label={t('auth.forgot.newPassword')}
                rules={[{ required: true, min: 8 }]}
              >
                <Input.Password />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {t('auth.forgot.resetPassword')}
              </Button>
            </Form>
          )}

          {step === 'done' && (
            <Alert type="success" message={t('auth.forgot.passwordUpdated')} showIcon />
          )}

          <Link to="/login">{t('common.backToLogin')}</Link>
        </Space>
      </Card>
    </div>
  );
}
