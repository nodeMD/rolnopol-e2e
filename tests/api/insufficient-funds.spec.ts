import { makeField, makeUniqueUser } from '../../data/builders';
import { registerUser } from '../../src/api/client';
import { expect, test } from '../../src/fixtures/base';

test.describe('Marketplace – insufficient funds', () => {
  test('buying an offer with zero balance is rejected and balance stays unchanged', async ({
    request,
  }) => {
    const { client: seller } = await registerUser(request, makeUniqueUser());
    const { client: buyer } = await registerUser(request, makeUniqueUser());

    let fieldId: number | undefined;
    let offerId: number | undefined;
    let balanceBefore = 0;

    try {
      await test.step('Seller creates a field', async () => {
        const fieldResp = await seller.createField(
          makeField({ name: 'Unaffordable Field', area: 5 }),
        );
        expect(fieldResp.status()).toBe(201);
        fieldId = (await fieldResp.json()).data.id as number;
      });

      await test.step('Seller lists field at a price the buyer cannot afford', async () => {
        const offerResp = await seller.createOffer({
          itemType: 'field',
          itemId: fieldId as number,
          price: 999_999,
        });
        expect(offerResp.status()).toBe(200);
        offerId = (await offerResp.json()).data.offer.id as number;
      });

      await test.step('Buyer records starting balance', async () => {
        const body = await (await buyer.getFinancialAccount()).json();
        balanceBefore = body.data.account.balance as number;
      });

      await test.step('Buyer attempts purchase and is rejected', async () => {
        const buyResp = await buyer.buyOffer(offerId as number);
        expect(buyResp.ok()).toBe(false);
        expect(buyResp.status()).toBeGreaterThanOrEqual(400);
        const buyBody = await buyResp.json();
        expect(buyBody.success).toBe(false);
        const errorText = (buyBody.error ?? buyBody.message ?? '').toLowerCase();
        expect(errorText).toMatch('insufficient funds to complete purchase (no overdraft allowed)');
      });

      await test.step('Buyer balance is unchanged after failed purchase', async () => {
        const body = await (await buyer.getFinancialAccount()).json();
        expect(body.data.account.balance as number).toBe(balanceBefore);
      });
    } finally {
      if (offerId !== undefined) await seller.cancelOffer(offerId).catch(() => {});
      if (fieldId !== undefined) await seller.deleteField(fieldId).catch(() => {});
      await seller.deleteProfile().catch(() => {});
      await buyer.deleteProfile().catch(() => {});
    }
  });
});
