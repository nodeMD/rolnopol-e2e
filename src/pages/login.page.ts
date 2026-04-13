import { type Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login.html');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await expect(this.page.getByTestId('nav-profile')).toBeVisible();
  }
}
