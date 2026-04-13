import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { UserPayload } from '../../data/builders';

// wrapper around Playwright's APIRequestContext
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private token?: string,
  ) {}

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  setToken(token: string): void {
    this.token = token;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  register(payload: UserPayload): Promise<APIResponse> {
    return this.request.post('/api/v1/register', { data: payload });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/api/v1/login', { data: { email, password } });
  }

  logout(): Promise<APIResponse> {
    return this.request.post('/api/v1/logout', { headers: this.authHeaders() });
  }

  deleteProfile(): Promise<APIResponse> {
    return this.request.delete('/api/v1/users/profile', { headers: this.authHeaders() });
  }
}

// registers a fresh user and returns their token + userId
export async function registerUser(
  request: APIRequestContext,
  payload: UserPayload,
): Promise<{ token: string; userId: number; client: ApiClient }> {
  const client = new ApiClient(request);
  const response = await client.register(payload);

  if (!response.ok()) {
    const body = await response.json();
    throw new Error(`Registration failed: ${body.error ?? response.status()}`);
  }

  const body = await response.json();
  const token: string = body.data.token;
  const userId: number = body.data.user.id;

  client.setToken(token);
  return { token, userId, client };
}
