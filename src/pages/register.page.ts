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
    await this.page.waitForLoadState('load');
  }

  async submitEmpty(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async expectFieldError(fieldLabel: string, message: string): Promise<void> {
    const field = this.page.getByLabel(fieldLabel);
    const errorEl = field.locator('..').locator('.form__error');
    await expect(errorEl).toContainText(message, { timeout: 5_000 });
  }

  async expectRedirectAfterRegister(): Promise<void> {
    await expect(this.page.getByText('Registration successful!')).toBeVisible();
    await expect(this.page.getByText('Registration successful!')).toBeHidden({ timeout: 7_000 });
  }

  async expectTokenCookieSet(): Promise<void> {
    const cookies = await this.page.context().cookies();
    const token = cookies.find((c) => c.name === 'rolnopolToken');
    expect(token?.value).toBeTruthy();
  }
}
