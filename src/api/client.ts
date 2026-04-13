import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { FieldPayload, MarketplaceOfferPayload, UserPayload } from '../../data/builders';

export interface ApiBody<T = unknown> {
  success: boolean;
  timestamp?: string;
  data: T;
  error?: string;
  message?: string;
}

export interface AuthData {
  token: string;
  user: { id: number; email: string; displayedName: string };
}

export interface FieldData {
  id: number;
  name: string;
  area: number;
  ownerId: number;
}

export interface OfferData {
  id: number;
  sellerId: number;
  itemType: 'field' | 'animal';
  itemId: number;
  price: number;
  description?: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccountData {
  balance: number;
  currency: string;
}

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

  // ── Fields ────────────────────────────────────────────────────────────────

  createField(payload: FieldPayload): Promise<APIResponse> {
    return this.request.post('/api/v1/fields', {
      data: payload,
      headers: this.authHeaders(),
    });
  }

  getFields(): Promise<APIResponse> {
    return this.request.get('/api/v1/fields', { headers: this.authHeaders() });
  }

  deleteField(id: number): Promise<APIResponse> {
    return this.request.delete(`/api/v1/fields/${id}`, { headers: this.authHeaders() });
  }

  // ── Staff ─────────────────────────────────────────────────────────────────

  assignStaffToField(staffId: number, fieldId: number): Promise<APIResponse> {
    return this.request.post('/api/v1/fields/assign', {
      data: { staffId, fieldId },
      headers: this.authHeaders(),
    });
  }

  // ── Marketplace ───────────────────────────────────────────────────────────

  createOffer(payload: MarketplaceOfferPayload): Promise<APIResponse> {
    return this.request.post('/api/v1/marketplace/offers', {
      data: payload,
      headers: this.authHeaders(),
    });
  }

  getOffers(): Promise<APIResponse> {
    return this.request.get('/api/v1/marketplace/offers', { headers: this.authHeaders() });
  }

  getMyOffers(): Promise<APIResponse> {
    return this.request.get('/api/v1/marketplace/my-offers', { headers: this.authHeaders() });
  }

  cancelOffer(offerId: number): Promise<APIResponse> {
    return this.request.delete(`/api/v1/marketplace/offers/${offerId}`, {
      headers: this.authHeaders(),
    });
  }

  buyOffer(offerId: number): Promise<APIResponse> {
    return this.request.post('/api/v1/marketplace/buy', {
      data: { offerId },
      headers: this.authHeaders(),
    });
  }

  // ── Financial ─────────────────────────────────────────────────────────────

  getFinancialAccount(): Promise<APIResponse> {
    return this.request.get('/api/v1/financial/account', { headers: this.authHeaders() });
  }

  // fund a user's account via the financial transactions endpoint using valid test card number
  addIncome(amount: number, description = 'E2E test seed'): Promise<APIResponse> {
    return this.request.post('/api/v1/financial/transactions', {
      data: {
        type: 'income',
        amount,
        description,
        cardNumber: '4111111111111111',
        cvv: '123',
      },
      headers: this.authHeaders(),
    });
  }

  // ── Health ────────────────────────────────────────────────────────────────

  healthcheck(): Promise<APIResponse> {
    return this.request.get('/api/v1/healthcheck');
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

  const body = (await response.json()) as ApiBody<AuthData>;
  const token = body.data.token;
  const userId = body.data.user.id;

  client.setToken(token);
  return { token, userId, client };
}
