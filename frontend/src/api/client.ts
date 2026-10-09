const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

const TOKEN_KEYS = {
  customer: 'glowcard_customer_token',
  admin: 'glowcard_admin_token',
} as const;

export type AuthRole = keyof typeof TOKEN_KEYS;

export const tokenStore = {
  get(role: AuthRole): string | null {
    try {
      return localStorage.getItem(TOKEN_KEYS[role]);
    } catch {
      return null;
    }
  },
  set(role: AuthRole, token: string): void {
    try {
      localStorage.setItem(TOKEN_KEYS[role], token);
    } catch {
      /* trình duyệt chặn storage: bỏ qua */
    }
  },
  clear(role: AuthRole): void {
    try {
      localStorage.removeItem(TOKEN_KEYS[role]);
    } catch {
      /* bỏ qua */
    }
  },
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(ApiError.toMessage(status, detail));
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  private static toMessage(status: number, detail: unknown): string {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      // lỗi 422 của FastAPI: [{ loc, msg }, ...]
      return detail
        .map((d) => (d && typeof d === 'object' && 'msg' in d ? String(d.msg) : ''))
        .filter(Boolean)
        .join('; ');
    }
    if (detail && typeof detail === 'object' && 'message' in detail) {
      return String((detail as { message: unknown }).message);
    }
    return status === 0 ? 'Không kết nối được máy chủ' : `Lỗi ${status}`;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  /** Gắn token của vai trò này vào header. Bỏ trống nếu là API công khai. */
  auth?: AuthRole;
}

export async function api<T>(
  path: string,
  { method = 'GET', body, query, auth }: RequestOptions = {},
): Promise<T> {
  const url = new URL(API_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = tokenStore.get(auth);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth) {
      // Token hết hạn hoặc sai: xóa và báo cho app biết để chuyển về trang đăng nhập
      tokenStore.clear(auth);
      window.dispatchEvent(new CustomEvent('glowcard:unauthorized', { detail: auth }));
    }
    throw new ApiError(res.status, data?.detail ?? null);
  }
  return data as T;
}