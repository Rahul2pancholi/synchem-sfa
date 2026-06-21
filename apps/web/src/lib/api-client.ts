export function authHeaders(languageHeader: Record<string, string>): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...languageHeader,
  };
}

export async function fetchApi<T>(url: string, languageHeader: Record<string, string>, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(languageHeader),
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.errorObj?.message ?? data?.message ?? `Request failed: ${res.status}`);
  }

  return data as T;
}
