import { makeField, makeUniqueUser } from '../../data/builders';
import { registerUser } from '../../src/api/client';
import { expect, test } from '../../src/fixtures/base';

test.describe('Marketplace – authenticated buy cycle', () => {
  test('User A lists a field; User B funds account and buys it', async ({ request }) => {
    const { client: userA } = await registerUser(request, makeUniqueUser());
    const { client: userB } = await registerUser(request, makeUniqueUser());

    const offerPrice = 50;
    let fieldId: number | undefined;
    let offerId: number | undefined;
    let createdOfferId: number | undefined;

    try {
      await test.step('User A creates a field', async () => {
        const fieldResp = await userA.createField(
          makeField({ name: 'Market Test Field', area: 8 }),
        );
        expect(fieldResp.status()).toBe(201);
        fieldId = (await fieldResp.json()).data.id as number;
      });

      await test.step('User A lists field on marketplace', async () => {
        const offerResp = await userA.createOffer({
          itemType: 'field',
          itemId: fieldId as number,
          price: offerPrice,
        });
        expect(offerResp.status()).toBe(200);
        offerId = createdOfferId = (await offerResp.json()).data.offer.id as number;
      });

      await test.step('User B sees the offer as active', async () => {
        const offersResp = await userB.getOffers();
        expect(offersResp.ok()).toBe(true);
        const offers = (await offersResp.json()).data.offers as Array<{
          id: number;
          status: string;
        }>;
        const listedOffer = offers.find((o) => o.id === offerId);
        expect(listedOffer).toBeDefined();
        expect(listedOffer?.status).toBe('active');
      });

      await test.step('User B funds account', async () => {
        const fundResp = await userB.addIncome(offerPrice + 10);
        expect(fundResp.ok()).toBe(true);
      });

      await test.step('User B buys the offer', async () => {
        const buyResp = await userB.buyOffer(offerId as number);
        expect(buyResp.ok()).toBe(true);
      });

      await test.step('User A verifies offer is marked sold', async () => {
        const myOffersResp = await userA.getMyOffers();
        expect(myOffersResp.ok()).toBe(true);
        const offers = (await myOffersResp.json()).data.offers as Array<{
          id: number;
          status: string;
        }>;
        const soldOffer = offers.find((o) => o.id === createdOfferId);
        expect(soldOffer?.status).toBe('sold');
      });

      await test.step('User B verifies field ownership transferred', async () => {
        const bFieldsResp = await userB.getFields();
        expect(bFieldsResp.ok()).toBe(true);
        const bFields = (await bFieldsResp.json()).data as Array<{ id: number }>;
        expect(bFields.some((f) => f.id === fieldId)).toBe(true);
      });
    } finally {
      if (offerId !== undefined) await userA.cancelOffer(offerId).catch(() => {});
      await userA.deleteProfile().catch(() => {});
      await userB.deleteProfile().catch(() => {});
    }
  });
});
