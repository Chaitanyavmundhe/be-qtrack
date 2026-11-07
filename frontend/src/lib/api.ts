const BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('beqtrack_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('beqtrack_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('beqtrack_token');
  localStorage.removeItem('beqtrack_user');
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'API Request Failed';
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
