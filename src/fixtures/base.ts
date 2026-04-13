import { type Page, test as base } from '@playwright/test';
import { makeUniqueUser } from '../../data/builders';
import { ApiClient, registerUser } from '../api/client';
import { env } from '../config/env';

type CustomFixtures = {
  // unauthenticated API client
  apiClient: ApiClient;

  /**
   * Browser Page with rolnopolToken + rolnopolIsLogged cookies injected
   * for a freshly registered user. The user account is deleted in teardown.
   *
   * isAuthenticated() in auth-service.js requires BOTH cookies to return true.
   */
  authenticatedPage: Page;
};

export const test = base.extend<CustomFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authenticatedPage: async ({ page, request }, use) => {
    const payload = makeUniqueUser();
    const { token, client } = await registerUser(request, payload);

    const hostname = new URL(env.baseURL).hostname;
    await page.context().addCookies([
      { name: 'rolnopolToken', value: token, domain: hostname, path: '/' },
      { name: 'rolnopolIsLogged', value: 'true', domain: hostname, path: '/' },
    ]);

    await use(page);

    // teardown
    await client.deleteProfile().catch(() => {});
  },
});

export { expect } from '@playwright/test';
