# Testing Personame

## Run and watch

Use Node 22+, install dependencies, configure `.env` for a **local PostgreSQL database**, and apply migrations:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npx playwright install chromium
npm run test:unit
npm run test:coverage
npm run test:e2e:ui
```

In Playwright UI, select a test and press its play button. Expand its named steps to see the behavior being checked. Click an action to inspect the page before and after it. The main walkthrough is **Create, grade, preview, publish, and complete a quiz through the UI**. It creates the quiz, dimension, archetypes, and all three question types by clicking and typing through the actual app.

For a visible, slower browser run:

```sh
PW_SLOW_MO=350 npm run test:e2e:headed
```

For pause/step debugging with Playwright Inspector:

```sh
npm run test:e2e:debug
```

Each command prepares a fresh production test build in `.next-e2e` and launches a dedicated server at **127.0.0.1:3100**. Your regular localhost:3000 preview stays running. Stop a UI/debug session before launching another suite on port 3100. After source changes, restart the command to rebuild the test app.

## Replay completed runs

```sh
npm run test:e2e:report
npm run test:e2e:trace -- test-results/<test-folder>/trace.zip
```

Reports include traces for **successful and failed** runs. The trace is an inspectable action history, not a video player; the video attachment provides real-time playback. Traces/videos are also under `test-results/`. Reports and fixtures are local and ignored by Git; test artifacts are replaced by subsequent runs. The main walkthrough signs its test account out before opening a participant tab; both creator and anonymous actions appear in the same trace.

Official references: [UI mode](https://playwright.dev/docs/test-ui-mode), [Trace viewer](https://playwright.dev/docs/trace-viewer).

## Coverage and intent

| Layer | Important behaviors |
| --- | --- |
| Unit | Neutral scores, zero handling, final clamping, order independence, interpolation, invalid responses, optional/hidden pages, relevance-weighted matching and tie order, result snapshots, publish readiness, catalog references and archetype reachability |
| API integration | Real persistence, owner isolation, stable IDs and weights, preview not counting as a completion, public payload safety, publication checks, required responses, retry/idempotency, result preservation after definition edits |
| Playwright | Real creator UI from blank quiz to publish; all question controls; preview isolation; anonymous submission/results; required answers/midpoint; reload/back restoration; editing/unpublishing; historical result links; anonymous editor access |

`npm run test:coverage` measures the calculation, scoring, publish-validation, and catalog modules. It requires at least **95% lines, 90% branches, and 90% functions** across those modules; it does not claim browser coverage of every UI component. Keep assertions about business outcomes rather than CSS structure or exact screenshots. New bugs should get focused regression tests.

Run the real API integration test against your local preview:

```sh
PERSONAME_TEST_URL=http://localhost:3000 npm test
```

Without that environment variable, the integration test is explicitly skipped; unit tests still run. Browser tests never silently skip. The GitHub Actions workflow runs lint, types, coverage, browser tests, and API integration against a disposable PostgreSQL service, then uploads reports and traces.

## Fixture isolation and limits

Browser tests create a uniquely named `@example.test` user and a real NextAuth database session per test. Only that user's quizzes/results/session are removed in teardown, including on test failure. The fixture refuses remote databases. A forced process kill can bypass teardown; inspect any leftover `e2e-…@example.test` account before removing it. Use a dedicated local database if you want complete separation from development data.

Authentication is installed as a fixture, so the tests cover authenticated app behavior, **not the external Google/GitHub OAuth consent flow**. Supporting participant scenarios seed definitions via real APIs; the primary walkthrough does not bypass creator UI. Chromium desktop is the current browser target; this suite does not yet certify Safari, Firefox, or every mobile layout.

## Builder save and appearance checks

The editing browser scenarios cover Name appearance persistence, five-stage navigation, display/edit modes, closing an editor without discarding drafts, saving in place, and Reset after a successful save. Name screenshots cover desktop and mobile layouts. The main creation walkthrough edits emoji/color and saves archetype targets without per-record save buttons.

Navigation regression tests cover removal of the former naming draft, fresh Create forms, cancelling and accepting internal links, cancelling browser Back/Forward without losing inputs, the native reload warning, and no warning after successful Save.

The loading scenario holds real API responses until released, checks list/editor skeletons, verifies that editors are unavailable before data arrives, and checks pending Save feedback and reduced-motion behavior.


## Dimension rename migration

The API workflow uses `/api/personames/:id/dimensions`, `dimensions`, `dimensionId`, and `dimensionName`. Builder navigation uses `/create/:id/dimensions`. The seed catalog uses `dimensions` too. There are no legacy route or payload aliases.

With `PERSONAME_TEST_URL` set, `npm test` also replays the migration history in a disposable local PostgreSQL schema. It populates the old tables, runs the in-place rename, and verifies IDs, endpoint emoji, display-scale enums, target/relevance values, weights, scores, relationships, index/constraint names, and ordered historical snapshots. Empty/null snapshots and unrelated snapshot fields are preserved. The schema is created and removed inside one transaction; any failure rolls it back. Historical migration files retain their original names and SQL.

Deploy the current source and run `npx prisma migrate deploy` against the deployment database together, then restart the app. The new Prisma client and API require the renamed schema. Scoring formulas and stored numerical values are unchanged.


## Hex colors and contrast

Color tests cover canonical `#rrggbb` storage, null/short/mixed-case hex, rejection of named or transparent colors, palette display names, custom hex retention, and library-based contrast decisions. The color migration test uses disposable tables to verify all authored color fields and saved archetype artwork. The custom-color browser test picks a native custom color, saves, and reloads it. Palette names are UI metadata only; existing historical palettes are converted by migration.


Theme coverage checks canonical color lists, known-theme validation, fallback naming, all-color bar gradients, distinct badge accents, result snapshots, and preservation of existing solids by migration. The theme migration also verifies that storage can hold three-color lists for future use. The browser scenario selects themes on quizzes, dimensions, and archetypes, checks both picker tabs and keyboard navigation, reloads saved values, verifies rendered gradients, and captures themed archetype artwork.


Dimension value tests verify symmetric descriptor bands, midpoint neutrality, bounds and decimals. The browser scenario checks persistent value callouts, raw scores, dominant endpoint emoji, absence of the separate Target label, callout alignment within the rail, and unbroken endpoint text at desktop and mobile widths.
