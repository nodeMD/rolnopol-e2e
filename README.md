# rolnopol-e2e

Playwright + TypeScript E2E test suite for the [Rolnopol](https://github.com/jaktestowac/rolnopol) agricultural management application.

Tests are runing on *Safari, Chrome and Firefox to cover with specs all browser engines (Safari - WebKit, Firefox - Gecko, Chrome - Blink)*.

---

## Technology and architectural decisions

| Concern | Choice | Why |
|---------|--------|-----|
| Test runner | **Playwright** | Native browser automation, built-in `APIRequestContext`, `page.route()` for mocking, parallel execution, and first-class TypeScript support |
| Language | **TypeScript** (strict) | Catches payload mismatches at author-time; shared types between API client and test builders |
| Linting / formatting | **Biome** | Single tool replacing ESLint + Prettier; fast, zero-config for most rules |
| Abstraction | **Page Object Model** + **Fixtures** | POMs encapsulate locators so tests read like business steps; fixtures handle authenticated state setup/teardown in one place |
| Test data | **Builder functions** (`data/builders.ts`) | Unique-per-run emails prevent cross-test pollution; shared types keep API client and UI tests aligned |

---

## Project structure and patterns used

Check [E2E_WRITING_GUIDE.md](E2E_WRITING_GUIDE.md)

---

## The five tests and why they were chosen

All three scenarios documented at `/docs.html#e2e-scenarios` are covered:

| # | File | Category | Documented scenario |
|---|------|----------|---------------------|
| 1 | `tests/ui/e2e-farm-setup.spec.ts` | UI E2E | Register and Set Up Farm |
| 2 | `tests/api/marketplace-buy-api.spec.ts` | API | Sell a Field on the Marketplace |
| 3 | `tests/api/insufficient-funds.spec.ts` | API | Attempt to Buy with Insufficient Funds |
| 4 | `tests/api/healthcheck.spec.ts` | API | Operational gate (deploy readiness) |
| 5 | `tests/integration/marketplace-mocked.spec.ts` | Integration + mocks | Sell a Field on the Marketplace (UI layer) |
| Bonus | `tests/ui/form-validation.spec.ts` | UI | Validations on registration and animal, staff, field forms |

There is a bug in the app which prevents the user from authenticating properly while using Safari browser. 🐛 Cause of that the specs are failing. Check [issues.md](issues.md) to get more info.

---

## Prerequisites

1. **Node.js** ≥ 20 LTS
2. **Rolnopol server** running locally:
   ```bash
   cd ../rolnopol
   npm install
   npm start          # starts on http://localhost:3000
   ```
3. Install test suite dependencies and browsers:
   ```bash
   npm install
   npx playwright install chromium
   ```

---

## Run instructions

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env if your app runs on a different port or host
```

### 2. Run all tests

```bash
npm test
```

### 3. Run by category

```bash
npm run test:api          # API tests only (no browser — fast, CI-friendly)
npm run test:ui           # UI E2E tests (requires running server + browser)
npm run test:integration  # Integration tests with mocks (requires browser)
npm run test:headed       # Run all tests with visible browser window
```

### 4. Open HTML report

```bash
npm run report
```

### 5. Lint and format

```bash
npm run lint      # Biome linter
npm run format    # Biome formatter (write)
npm run check     # Biome lint + format combined
```

---

## CI strategy

Github actions worfklow.
The CI will run firstly lint. 
If lint will pass than the healthcheck spec will run to make sure that the tests can access the app. To not waste time and money on trying to run the full tests suite when the specs are not able to access the app.
If the healthcheck will pass successfully than full test suite will start as a last step.
The tests are failing cause of the bug in the rolnopol app on Safari browser which prevents user from authenticating. Check [issues.md](issues.md).

You can test the CI flow locally using [act](https://github.com/nektos/act).
Setup act locally accroding to their docs. Add `.secrets` file with data copied from `.env.local.docker` and than run: 

`act push --secret-file .secrets`

If you want to see the tests runing on the CI you have to firstly deploy the rolnopol app. Easiest way will be to deploy it on Render following rolnopol guide: [https://github.com/jaktestowac/rolnopol?tab=readme-ov-file#deploy-to-render](https://github.com/jaktestowac/rolnopol?tab=readme-ov-file#deploy-to-render).
After the app is deployed you need to set up the secrets for the CI.
Open your repository Settings then click on Secrets -> Actions next click button New repository secret and add secrets for all environmental variables from .env.example file pointing to the app you deployed on Render.

Parallel execution is enabled via `fullyParallel: true` and `workers: 2` in CI. Only two workers cause when used more the app was returning 429 "Too Many Requests.

---

## Docker

to run the specs on docker
firstly start the Rolnopol app locally
than in this codebase fill `.env` with data copied from `.env.local.docker`
than run:

`docker build -t e2etests .`
