import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

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

export async function saveSession(session: StoredSession) {
  await Promise.all([
    setSecureItem(KEYS.accessToken, session.accessToken),
    setSecureItem(KEYS.refreshToken, session.refreshToken),
    setSecureItem(KEYS.compCode, session.compCode),
    setSecureItem(KEYS.compName, session.compName),
    setSecureItem(KEYS.empId, session.empId),
    setSecureItem(KEYS.employeeJson, JSON.stringify(session.employee)),
    session.headQuarterId ? setSecureItem(KEYS.headQuarterId, session.headQuarterId) : Promise.resolve(),
  ]);
}

export async function loadSession(): Promise<StoredSession | null> {
  const [accessToken, refreshToken, compCode, compName, empId, employeeJson, headQuarterId] =
    await Promise.all([
      getSecureItem(KEYS.accessToken),
      getSecureItem(KEYS.refreshToken),
      getSecureItem(KEYS.compCode),
      getSecureItem(KEYS.compName),
      getSecureItem(KEYS.empId),
      getSecureItem(KEYS.employeeJson),
      getSecureItem(KEYS.headQuarterId),
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
  await Promise.all(Object.values(KEYS).map((key) => deleteSecureItem(key)));
}

export async function saveMpinHash(hash: string) {
  await setSecureItem(KEYS.mpinHash, hash);
}

export async function getMpinHash() {
  return getSecureItem(KEYS.mpinHash);
}

export async function saveLanguage(language: string) {
  await setSecureItem(KEYS.language, language);
}

export async function loadLanguage() {
  return getSecureItem(KEYS.language);
}

export function hashMpin(mpin: string) {
  let hash = 0;
  for (let i = 0; i < mpin.length; i += 1) {
    hash = (hash << 5) - hash + mpin.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}
