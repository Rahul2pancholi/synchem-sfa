import * as Keychain from 'react-native-keychain';

export async function setSecureItem(key: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(key, value, { service: key });
}

export async function getSecureItem(key: string): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: key });
  if (!credentials) return null;
  return credentials.password;
}

export async function deleteSecureItem(key: string): Promise<void> {
  await Keychain.resetGenericPassword({ service: key });
}
