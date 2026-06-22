import { Platform } from 'react-native';
import { API_BASE } from '../config/api-base';

/**
 * Push token registration — FCM wiring pending (replaces Expo push tokens).
 * Login and sync work without this; wire @react-native-firebase/messaging when Firebase is configured.
 */
export async function registerPushToken(accessToken: string, language: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // TODO: replace with FCM token via @react-native-firebase/messaging
  void accessToken;
  void language;
  void API_BASE;
  return false;
}
