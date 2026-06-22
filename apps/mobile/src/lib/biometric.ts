import ReactNativeBiometrics from 'react-native-biometrics';

const biometrics = new ReactNativeBiometrics();

export async function canUseBiometric(): Promise<boolean> {
  const { available } = await biometrics.isSensorAvailable();
  return available;
}

export async function authenticateWithBiometric(promptMessage: string): Promise<boolean> {
  const canUse = await canUseBiometric();
  if (!canUse) return false;

  const { success } = await biometrics.simplePrompt({
    promptMessage,
    cancelButtonText: 'Cancel',
  });

  return success;
}
