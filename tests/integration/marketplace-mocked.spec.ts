import { mockBuySuccess, mockMarketplaceOffers } from '../../data/mocks';
import { expect, test } from '../../src/fixtures/base';
import { MarketplacePage } from '../../src/pages/marketplace.page';

test.describe('Front-end integration – Marketplace with mocks', () => {
  test('renders mocked offers and handles a mocked buy action', async ({
    authenticatedPage: page,
  }) => {
    const marketplacePage = new MarketplacePage(page);

    await test.step('Navigate to marketplace with mocked offers', async () => {
      let offersRouteHit = false;
      await page.route('**/api/v1/marketplace/offers**', async (route) => {
        offersRouteHit = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            data: { offers: mockMarketplaceOffers, total: mockMarketplaceOffers.length },
          }),
        });
      });
      await marketplacePage.goto();
      await marketplacePage.expectLoaded();
      expect(offersRouteHit, 'offers route should have been intercepted').toBe(true);
    });

    await test.step('Assert mocked offers are rendered', async () => {
      await marketplacePage.expectOffersVisible();
      await marketplacePage.expectOfferCount(mockMarketplaceOffers.length);
      await marketplacePage.expectFirstOfferContainsPrice(500);
    });

    await test.step('Buy first offer via mocked endpoint', async () => {
      let buyRouteHit = false;
      await page.route('**/api/v1/marketplace/buy**', async (route) => {
        buyRouteHit = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBuySuccess),
        });
      });

      await marketplacePage.buyFirstOffer();
      expect(buyRouteHit, 'buy route should have been intercepted').toBe(true);
      await marketplacePage.expectPurchaseSuccessToast();
      await marketplacePage.expectOfferCountAtMost(mockMarketplaceOffers.length);
    });
  });
});
