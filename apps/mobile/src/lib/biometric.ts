import * as LocalAuthentication from 'expo-local-authentication';

export async function canUseBiometric(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometric(promptMessage: string): Promise<boolean> {
  const canUse = await canUseBiometric();
  if (!canUse) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: true,
  });

  return result.success;
}
