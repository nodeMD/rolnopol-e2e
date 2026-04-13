import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class MarketplacePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/marketplace.html');
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForURL(/marketplace\.html/, { timeout: 10_000 });
    await expect(this.page).not.toHaveURL(/login\.html/);
  }

  offerCards() {
    return this.page.locator('#browseOffers .offer-card');
  }

  async expectOfferCount(count: number): Promise<void> {
    await expect(this.offerCards()).toHaveCount(count, { timeout: 8_000 });
  }

  async expectOffersVisible(): Promise<void> {
    await expect(this.offerCards().first()).toBeVisible({ timeout: 8_000 });
  }

  async buyFirstOffer(): Promise<void> {
    await this.offerCards().first().getByRole('button', { name: /buy/i }).click();
  }
}
