export type UserPayload = {
  email: string;
  password: string;
  displayedName?: string;
};

export function makeUniqueUser(overrides?: Partial<UserPayload>): UserPayload {
  return {
    email: `e2e-${Date.now()}-${Math.floor(Math.random() * 9999)}@test.com`,
    password: 'test1234',
    ...overrides,
  };
}
