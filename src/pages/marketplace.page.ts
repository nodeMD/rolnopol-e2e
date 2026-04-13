import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class MarketplacePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/marketplace.html');
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  private offerCards() {
    return this.page.locator('#browseOffers .offer-card');
  }

  async expectOffersVisible(): Promise<void> {
    await expect(this.offerCards().first()).toBeVisible({ timeout: 8_000 });
  }

  async expectOfferCount(count: number): Promise<void> {
    await expect(this.offerCards()).toHaveCount(count, { timeout: 8_000 });
  }

  async expectFirstOfferContainsPrice(price: string | number): Promise<void> {
    await expect(this.offerCards().first()).toContainText(String(price));
  }

  async buyFirstOffer(): Promise<void> {
    await this.offerCards().first().locator('.btn-buy').click();
    const confirmButton = this.page.locator('#confirmationModalConfirm');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await this.page.waitForLoadState('load');
  }

  async expectPurchaseSuccessToast(): Promise<void> {
    await expect(this.page.getByText('Purchase completed successfully!')).toBeVisible({
      timeout: 8_000,
    });
  }

  async expectOfferCountAtMost(count: number): Promise<void> {
    const current = await this.offerCards().count();
    expect(current).toBeLessThanOrEqual(count);
  }
}
