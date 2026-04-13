export const mockMarketplaceOffers = [
  {
    id: 901,
    sellerId: 2,
    itemType: 'field',
    itemId: 22,
    price: 500,
    description: 'Fertile land near river.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 902,
    sellerId: 3,
    itemType: 'animal',
    itemId: 63,
    price: 120,
    description: 'Healthy goats.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 903,
    sellerId: 4,
    itemType: 'field',
    itemId: 25,
    price: 800,
    description: 'Large pasture with good soil.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockBuySuccess = {
  success: true,
  timestamp: new Date().toISOString(),
  message: 'Purchase successful',
  data: { offerId: 901, status: 'sold' },
};
