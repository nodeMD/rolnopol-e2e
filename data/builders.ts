export type UserPayload = {
  email: string;
  password: string;
  displayedName?: string;
};

export type FieldPayload = {
  name: string;
  area: number;
};

export type MarketplaceOfferPayload = {
  itemType: 'field' | 'animal';
  itemId: number;
  price: number;
  description?: string;
};

export function makeUniqueUser(overrides?: Partial<UserPayload>): UserPayload {
  return {
    email: `e2e-${Date.now()}-${Math.floor(Math.random() * 9999)}@test.com`,
    password: 'test1234',
    ...overrides,
  };
}

export function makeField(overrides?: Partial<FieldPayload>): FieldPayload {
  return {
    name: `E2E Field ${Date.now()}`,
    area: 10,
    ...overrides,
  };
}
