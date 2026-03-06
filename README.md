# Swag Labs - Playwright E2E & API Test Automation

End-to-end UI and API test automation built with Playwright and TypeScript. UI tests cover [Swag Labs](https://www.saucedemo.com) using the Page Object Model pattern. API tests cover the [JSONPlaceholder](https://jsonplaceholder.typicode.com) `/posts` endpoint with full CRUD validation.

---

## Project Structure

```
├── api/                         # API client classes
│   └── PostsApi.ts
├── constants/
│   ├── ui/                      # UI constants (URLs, page titles, messages)
│   │   ├── urls.ts
│   │   ├── pageTitles.ts
│   │   └── messages.ts
│   └── api/                     # API constants (endpoint paths)
│       └── apiUrls.ts
├── fixtures/                    # Playwright test fixtures
│   ├── fixtures.ts              # UI fixtures (POM wiring)
│   └── apiFixtures.ts           # API fixtures (request context)
├── locators/                    # UI selector strings per page
│   ├── LoginLocators.ts
│   ├── ProductsLocators.ts
│   ├── CartLocators.ts
│   ├── CheckoutLocators.ts
│   └── ConfirmationLocators.ts
├── pages/                       # Page Object Model classes (actions + getters)
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── ConfirmationPage.ts
├── test-data/
│   ├── ui/                      # UI test data
│   │   ├── credentials.json
│   │   ├── customer.json
│   │   └── products.json
│   └── api/                     # API test data
│       └── post.json
├── tests/
│   ├── ui/                      # UI / E2E test specs
│   │   └── purchase.spec.ts
│   └── api/                     # API test specs
│       └── posts.spec.ts
├── types/
│   ├── ui/                      # UI types
│   │   ├── CartItem.ts
│   │   └── PriceSummary.ts
│   └── api/                     # API types
│       └── Post.ts
├── utils/
│   ├── ui/                      # UI-specific helpers
│   │   └── priceUtils.ts
│   ├── api/                     # API-specific helpers
│   │   └── apiAssertions.ts
│   └── shared/                  # Shared helpers (used by both UI and API)
│       └── annotate.ts
├── playwright.config.ts
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- npm v9 or higher

---

## Installation

```bash
npm install
npx playwright install chromium
```

---

## Running Tests

```bash
# Run all tests (headless)
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run UI tests only
npx playwright test tests/ui

# Run API tests only
npx playwright test tests/api

# Run by tag
npx playwright test --grep @e2e
npx playwright test --grep @api

# Open the HTML report after a run
npx playwright show-report
```

---

## Test Data

All test data is maintained in `test-data/` and can be modified without touching test code.

### UI (`test-data/ui/`)

| File | Purpose |
|---|---|
| `credentials.json` | Login username and password |
| `customer.json` | Checkout shipping details |
| `products.json` | List of products to add to cart |

**Available products on Swag Labs:**
- Sauce Labs Backpack
- Sauce Labs Bike Light
- Sauce Labs Bolt T-Shirt
- Sauce Labs Fleece Jacket
- Sauce Labs Onesie
- Test.allTheThings() T-Shirt (Red)

### API (`test-data/api/`)

| File | Purpose |
|---|---|
| `post.json` | Payloads for create and update operations on `/posts` |

---

## Data Captured During Test Execution

The test captures and cross-validates the following fields at each stage of the purchase flow:

| Field | PDP (Inventory) | Cart | Checkout Overview |
|---|:---:|:---:|:---:|
| Product name | captured | validated | validated |
| Description | captured | validated | validated |
| Price | captured | validated | validated |
| Quantity | set to `1` | validated | validated |

### Capture points

**PDP (Inventory page)** -  captured via `captureAndAddToCart()` before the add-to-cart button is clicked, stored as `Record<productName, CartItem>`.

**Cart page** -  `getCartItems()` reads the same fields from each cart row and the result is deep-equal compared against the PDP capture.

**Checkout overview (step 2)** -  `getOrderItems()` reads the same fields again and is deep-equal compared against the PDP capture. Additionally, `getPriceSummary()` captures:

| Summary field | Validated against |
|---|---|
| Item total | Sum of individual captured prices |
| Tax | Read from page |
| Total | `itemTotal + tax` |

All annotations (captured PDP data, cart items, order overview, price summary) are attached to the HTML report for every test run.

---

## API Test Coverage

### CRUD (`tests/api/posts.spec.ts` -  serial)

| TC | Description |
|---|---|
| TC001-Create | POST `/posts` → 201, validates schema and payload fields |
| TC002-Read | GET on the created id → 404 (JSONPlaceholder does not persist POSTed data) |
| TC003-Read Seeded | GET `/posts/1` → 200, validates schema and id |
| TC004-Update | PATCH on created id → 200, validates updated fields |
| TC005-Verify Update | Repeat PATCH → 200, confirms fields are stable |
| TC006-Delete | DELETE on created id → 200 |
| TC007-Verify Deletion | GET after delete → 404 with empty body |

### Negative

| TC | Description |
|---|---|
| TC008-Read Non-Existent | GET id that never existed → 404 with empty body |
| TC009-Create Empty Payload | POST with no fields → 201, documents that `title`, `body`, `userId` are absent |

---

## Design Decisions

### Page Object Model
Each page is a class with action methods and locator getters. Locator selectors are maintained separately in `locators/` as plain string constants, one file per page.

### Assertions in tests
All `expect()` assertions live in the test file, not in page classes. Page classes only expose actions and locator getters.

### Price consistency
Prices are captured from the inventory page (PDP) at the time of add-to-cart and compared against the cart and checkout overview using strict `toBe` equality. `parsePrice` in `utils/ui/priceUtils.ts` handles stripping currency symbols and rounding to 2 decimal places.

### API assertion helpers
Common assertion groups (response shape, field values) are extracted into `utils/api/apiAssertions.ts` to avoid repeating multiple `expect` calls across tests. Single-line assertions (status codes, headers) remain inline in the test.

### Test annotations
Captured data is attached to the Playwright HTML report via `test.info().annotations`.

**UI tests** use the shared `annotate()` helper (`utils/shared/annotate.ts`) called inline within each `test.step`. This preserves per-step labelling (e.g. `Captured from PDP`, `Cart items`, `Price summary`) so failures are easy to trace back to the exact stage.

**API tests** use a `test.afterEach` hook that logs a standardised `{ status, body }` object as an `API Response` annotation after every test. Because each API test is a single request/response, centralising the log in `afterEach` keeps test bodies focused on assertions and ensures consistent logging across all tests without repeating the same call.

---

## Reports

An HTML report is generated after every run in `playwright-report/`. Open it locally with:

```bash
npx playwright show-report
```

Screenshots, videos, and traces are captured automatically on failure.

### Live Report (GitHub Pages)

The latest test report is published automatically to GitHub Pages after every CI run:

**https://mnazrinasari.github.io/playwright-automation-assessment/**

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on:

| Trigger | Description |
|---|---|
| Push / PR to `main` or `master` | Runs on every code change |
| Daily cron at 23:00 UTC | Scheduled nightly run to catch regressions against live environments |
| Manual dispatch | Trigger a run anytime from the Actions tab → select workflow → **Run workflow** |

<img width="1915" height="867" alt="image" src="https://github.com/user-attachments/assets/9149a7ef-7330-40ec-9e41-d16149858099" />


After each run, the HTML report is uploaded as a build artifact and deployed to GitHub Pages.
