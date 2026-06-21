import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  compCode: 'comp_code',
  compName: 'comp_name',
  empId: 'emp_id',
  headQuarterId: 'head_quarter_id',
  employeeJson: 'employee_json',
  mpinHash: 'mpin_hash',
  language: 'app_language',
} as const;

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  compCode: string;
  compName: string;
  empId: string;
  headQuarterId?: string;
  employee: {
    firstName: string;
    lastName?: string;
    roleName?: string;
    userName: string;
  };
}

async function setItem(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(session: StoredSession) {
  await Promise.all([
    setItem(KEYS.accessToken, session.accessToken),
    setItem(KEYS.refreshToken, session.refreshToken),
    setItem(KEYS.compCode, session.compCode),
    setItem(KEYS.compName, session.compName),
    setItem(KEYS.empId, session.empId),
    setItem(KEYS.employeeJson, JSON.stringify(session.employee)),
    session.headQuarterId ? setItem(KEYS.headQuarterId, session.headQuarterId) : Promise.resolve(),
  ]);
}

export async function loadSession(): Promise<StoredSession | null> {
  const [accessToken, refreshToken, compCode, compName, empId, employeeJson, headQuarterId] =
    await Promise.all([
      getItem(KEYS.accessToken),
      getItem(KEYS.refreshToken),
      getItem(KEYS.compCode),
      getItem(KEYS.compName),
      getItem(KEYS.empId),
      getItem(KEYS.employeeJson),
      getItem(KEYS.headQuarterId),
    ]);

  if (!accessToken || !refreshToken || !compCode || !compName || !empId || !employeeJson) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    compCode,
    compName,
    empId,
    headQuarterId: headQuarterId ?? undefined,
    employee: JSON.parse(employeeJson) as StoredSession['employee'],
  };
}

export async function clearSession() {
  await Promise.all(Object.values(KEYS).map((key) => deleteItem(key)));
}

export async function saveMpinHash(hash: string) {
  await setItem(KEYS.mpinHash, hash);
}

export async function getMpinHash() {
  return getItem(KEYS.mpinHash);
}

export async function saveLanguage(language: string) {
  await setItem(KEYS.language, language);
}

export async function loadLanguage() {
  return getItem(KEYS.language);
}

export function hashMpin(mpin: string) {
  let hash = 0;
  for (let i = 0; i < mpin.length; i += 1) {
    hash = (hash << 5) - hash + mpin.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}
