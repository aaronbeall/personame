# API performance

Implemented October 28, 2026. These changes address query amplification and bounded work; they are not a production capacity guarantee.

## Reads and builder progress

- `ownedQuizSelect` combines the ownership predicate with the endpoint's projection. Dimensions, archetypes, and questions no longer each fetch every relation in the quiz.
- `/api/personames/:id/details` returns only naming/style fields. `/progress` returns `QuizComposition` from the minimal readiness projection. The stepper uses a separate `['progress', id]` cache key, invalidated by successful saves and publication.
- The full authoring document remains available for review/scoring. Readiness still examines actual question labels, weights, and archetype relevance; counts alone never imply completion.
- `currentUser` uses the user ID supplied by the database-backed authenticated session rather than querying the same user again by email.

## Bounded personal collections

`GET /api/me/quizzes` and `GET /api/me/discoveries` now return:

```json
{ "items": [], "total": 0, "page": 1, "hasMore": false }
```

Both accept `page` (default 1), `limit` (default 24, maximum 50), and a literal `search` string (maximum 200 characters). Quizzes additionally accepts `status=DRAFT` or `status=PUBLISHED`; Published includes CLOSED. Invalid pagination returns 400. Queries use a deterministic timestamp/ID order. The UI searches on the server after a short debounce, resets the page when filters change, cancels obsolete requests, and offers compact numbered pagination below the results, with Previous/Next controls and ellipses. Existing content remains visible while fetching to avoid layout collapse.

Quiz responses include unfiltered `counts.DRAFT` and `counts.PUBLISHED`. Discovery responses include unfiltered `collectionTotal` alongside the filtered `total`. Count bubbles therefore remain stable while searching. The legacy `/api/dashboard` and `/api/dashboard/completed` aliases share these new response contracts.

Quiz cards use a minimal readiness projection for the current page, not every quiz's full authoring graph. Discoveries use PostgreSQL `DISTINCT ON` to identify the latest result per quiz before search and pagination, with a timestamp/ID tie-breaker. Only the chosen results' archetype JSON is returned, rather than full historical snapshots. The header's discovery count is a database-side distinct count, not a list of IDs transferred into application memory.

Offset pagination is bounded and simple. For very large collections, measure deep-page plans and consider keyset pagination. Pages and totals use separate statements, so concurrent edits may briefly change totals between requests; this is a collection view, not a point-in-time export.

## Save work and concurrency

Editor saves precompute ownership/ID maps, assign IDs to new records, batch inserts in groups of 1,000, and skip scalar updates for unchanged records. Answer weights and archetype targets are compared without database metadata or order dependence. Only changed relationships are replaced, using one scoped delete and batched inserts. IDs and historical-result behavior are preserved.

A quiz's question save is limited to 250 total questions, 2,500 answers, and 30,000 weights, in addition to existing per-list bounds. These limits constrain a single transaction; raising timeouts alone is not the scaling strategy. Changed existing records still require individual updates, so an intentionally huge rewrite can remain more expensive than a normal edit.

Submissions and publication retry the entire transaction on Prisma P2034, with at most five attempts and jittered backoff. Other validation/revision errors do not retry. Duplicate submission-key races recover the existing public quiz result instead of inserting another one. A result and its completion increment remain atomic; revision and public-availability checks are retained. The shared completion counter is still a hot row at sufficiently high per-quiz concurrency. Measure contention before introducing a separate durable aggregation pipeline; bounded retries are not unlimited throughput.

## Public cache boundaries

Public listings and published counts use Next's shared data cache with a 30-second revalidation interval. Participant quiz responses are cached by ID and content revision; the database projection excludes scoring weights, archetypes, and hidden pages. Cache the formatted response so Date serialization never affects a cache hit.

Every public quiz GET first checks current publication/visibility in the database. Editing, publishing, or closing through the API immediately expires catalog and quiz tags after commit. An edit returning a quiz to draft therefore revokes access even when its old participant response is warm. Personal collections, editor documents, and submissions do not use this shared cache.

Completion statistics on public shelves can lag by the cache interval; submitting a result does not invalidate the whole catalog. Direct database writes or CLI seeding do not invoke Next cache invalidation; catalog/count caches refresh on their normal interval, while the live public-availability check still applies. Existing browser query caches may retain data until their normal refresh or a first-party mutation invalidates them.

## Indexes and verification

Migration `20261028000000_api_query_indexes` adds indexes for creator/time ordering, published discovery ordering/filtering, and latest per-user/per-quiz results. Apply it with the standard migration deployment process; do not reset existing databases. On large production tables, plan index rollout and lock impact separately.

Regression coverage includes bounded pagination and invalid parameters, stable relationship IDs after no-op saves, concurrent completion/idempotency, database-side discovery deduplication, public cache warm hits, and immediate revocation after close/edit. Unit tests cover retry limits/error classification, change detection, batch boundaries, and total editor limits. Existing creator/participant browser workflows exercise the changed contracts.

To assess real capacity, collect request latency percentiles, query counts/durations, response bytes, transaction retries, and database pool wait under representative quiz sizes and concurrency. Use `EXPLAIN (ANALYZE, BUFFERS)` on representative read queries. Local functional tests and a successful build do not establish production latency or a throughput SLA.
