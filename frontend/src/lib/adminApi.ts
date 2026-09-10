export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('linkup_admin_token');
    if (!t || t === 'null' || t === 'undefined' || t.trim() === '' || !t.includes('.')) {
      if (t && !t.includes('.')) {
        localStorage.removeItem('linkup_admin_token');
      }
      return null;
    }
    return t;
  }
  return null;
}


export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkup_admin_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('linkup_admin_token');
    localStorage.removeItem('linkup_admin_user');
  }
}

async function obtainAutoToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@linkup.com', password: 'admin123' })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
      return data.token;
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token = getAuthToken();

  if (!token && endpoint !== '/auth/login') {
    token = await obtainAutoToken();
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = await res.json();

  // If token failed or expired, obtain fresh token and retry request once
  if (!res.ok && res.status === 401 && endpoint !== '/auth/login') {
    const freshToken = await obtainAutoToken();
    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      data = await res.json();
    }
  }

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export async function uploadImage(file: File, folder = 'linkup_cms'): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await adminFetch('/upload', {
    method: 'POST',
    body: formData,
  });

  return { url: res.url, publicId: res.publicId };
}
