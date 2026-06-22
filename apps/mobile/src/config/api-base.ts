import Config from 'react-native-config';

/** API base URL — set `API_URL` in apps/mobile/.env (see .env.example). */
export const API_BASE = Config.API_URL ?? 'http://localhost:3001';
