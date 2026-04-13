import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/register.html');
  }

  async register(email: string, password: string, displayName?: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    if (displayName) {
      await this.page.getByLabel('Display Name (optional)').fill(displayName);
    }
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async expectRedirectAfterRegister(): Promise<void> {
    // after register the app shows success notification and then redirects to /login.html after 2 s
    await this.page.waitForURL(/login\.html/, { timeout: 10_000 });
  }

  async expectTokenCookieSet(): Promise<void> {
    const cookies = await this.page.context().cookies();
    const token = cookies.find((c) => c.name === 'rolnopolToken');
    expect(token?.value).toBeTruthy();
  }
}
