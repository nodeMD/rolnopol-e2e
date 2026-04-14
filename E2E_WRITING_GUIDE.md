# E2E Writing Guide

## Rules

### 1. No `waitForLoadState('networkidle')` or arbitrary timeouts

Never wait for the network to be idle or sleep to let things load.
Playwright cannot reliably determine when "idle" means "ready" for SPAs.

**Instead:** assert that a specific element you care about is visible.
This is both faster and more meaningful — if the element appears, the page is ready. 

**Acceptable:** Usage of waitForLoadState('load') or waitForLoadState('documentloaded') is allowed.

```ts
// ✗ wrong
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// ✓ correct
await expect(page.locator('#openAddFieldModal')).toBeVisible();
```

---

### 2. No locators in test files

Test files must not use `page.locator()`, `page.getByRole()`, or any other locator
directly. All element selection belongs in Page Object Models.

```ts
// ✗ wrong — locator in a test file
await page.locator('#fieldName').fill('My Field');
await expect(page.locator('#fieldsList')).toContainText('My Field');

// ✓ correct — delegated to the POM
await farmPage.addField('My Field', 10);
await farmPage.expectFieldVisible('My Field');
```

The only exception is `page.route()` for API interception, which belongs in
the test because it is part of the test strategy, not the page API.

---

### 3. Use Page Object Models (POM)

Every page or significant UI section gets its own class in `src/pages/`.

- One file per page: `src/pages/register.page.ts`, `src/pages/marketplace.page.ts`, etc.
- Methods describe *actions* and *assertions*, not element interactions:
  `addField()`, `expectFieldVisible()`, not `clickFieldNameInput()`.
- Keep locators `private` so they cannot leak into tests.

```ts
// src/pages/staff-fields.page.ts
export class StaffFieldsPage {
  private offerCards() {
    return this.page.locator('.offer-card');
  }

  async addField(name: string, area: number): Promise<void> {
    await this.page.locator('#openAddFieldModal').click();
    await this.page.locator('#fieldName').fill(name);
    await this.page.locator('#fieldArea').fill(String(area));
    await this.page.locator('#addFieldModal').getByRole('button', { name: /Add Field/i }).click();
    await this.expectFieldVisible(name); // wait by asserting visibility
  }

  async expectFieldVisible(name: string): Promise<void> {
    await expect(this.page.locator('#fieldsList')).toContainText(name);
  }
}
```

---

### 4. Use builder factories for test data

Never hardcode test data inline. Use the factories in `data/builders.ts`.
Builders generate unique values (e.g. timestamped emails) to prevent collisions
between parallel test runs.

```ts
// ✗ wrong — hardcoded, will collide on re-run
const user = { email: 'test@example.com', password: 'pass123' };

// ✓ correct
import { makeUniqueUser, makeField } from '../../data/builders';
const user = makeUniqueUser({ displayedName: 'E2E Farmer' });
const field = makeField({ name: 'My Plot', area: 15 });
```

Add a new factory to `data/builders.ts` rather than constructing objects inline.

---

### 5. Use `test.step()` for readability

Wrap logical phases of a test in named `test.step()` blocks.
Steps appear in the HTML report and trace viewer, making failures immediately
readable without having to parse code.

```ts
await test.step('User registers via UI', async () => {
  await registerPage.goto();
  await registerPage.register(user.email, user.password);
  await registerPage.expectRedirectAfterRegister();
});
```

---

### 6. Always clean up in `finally`

Use `try/finally` (for tests that register resources) or fixture teardown to
ensure created users, fields, and offers are deleted even when assertions fail.
Clean up in dependency order: cancel offers before deleting fields.

```ts
try {
  // ... test body
} finally {
  if (offerId) await seller.cancelOffer(offerId).catch(() => {});
  if (fieldId) await seller.deleteField(fieldId).catch(() => {});
  await seller.deleteProfile().catch(() => {});
}
```

For tests that only need an authenticated page, use the `authenticatedPage`
fixture — it handles user creation and deletion automatically.

---

## Project structure

```
data/
  builders.ts      # factory functions — all test data comes from here
  mocks.ts         # static API mock responses for integration tests

src/
  api/
    client.ts      # ApiClient — thin wrapper over APIRequestContext
  config/
    env.ts         # baseURL / apiURL from env vars
  fixtures/
    base.ts        # extended test with authenticatedPage fixture
  pages/
    *.page.ts      # one POM per page

tests/
  api/             # HTTP-only specs (no browser)
  integration/     # browser + page.route() API mocks
  ui/              # full browser E2E specs
```

## Future 

- Agree within dev team on consistent approach to locators (if we want to use data-test-id) and stick with it.
- Implement playeright shards on the CI to easily handle more tests running on the CI