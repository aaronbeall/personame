# Commercialization implementation plan

Planning date: October 28, 2026. This is a proposed backlog, not authorization to implement features, deploy, charge users, contact customers, or change existing data. It implements the direction in the [strategy](MONETIZATION_STRATEGY.md), informed by the [competitive analysis](COMPETITIVE_ANALYSIS.md).

## 1. Delivery approach and boundaries

**Priority revision, October 28:** follow the [core product thesis](PRODUCT_THESIS.md) first: a compelling illustrated result, curated collection/profile, and author model diagnostics. The phases and estimates below describe the conditional commercialization workstream, not a requirement to build demographics, workspaces, or billing before advancing that creative core. Core art/profile/diagnostic work is not included in these estimates and needs separate scoping. Business features should follow evidence of demand; the paid-pilot gate below applies to business investment, not continued development of Personame's core experience.

Ship a trusted core experience, validate willingness to pay, launch one paid creator plan, then expand audience research only when pilots demonstrate value. Preserve the artwork, whimsical language, and the separate **Explore**, **Your quizzes**, and **Your many selves** spaces. Business features belong in a workspace area; `/dashboard` remains available for a future overview rather than becoming the name of the creator library again.

Planning assumption: one experienced full-stack engineer, part-time design, and a founder doing research/support. Allow approximately **9–14 engineering weeks**, with a **12–18-week elapsed planning window** for interviews, pilots, review, and rework. These are estimates, not a delivery commitment. Re-estimate after foundation design; jurisdiction, data scope, and integration requirements can materially change effort.

| Phase | Indicative effort | Depends on | Exit evidence |
| --- | --- | --- | --- |
| 0. Buyer and experience validation | 1–2 founder/research weeks; small prototype effort | None | Clear buyer/job; at least 3 scoped paid-pilot commitments or equivalent purchase evidence; no claim of validated SaaS retention |
| 1. Production, ownership, versions, permissions | 3–4 engineering weeks | Agreed purpose/market/data scope | Deployed and monitored core; immutable versions; working privacy, deletion, consent, and reporting boundaries |
| 2. Measured social and creator experience | 1–2 engineering weeks | Core access/versioning in phase 1 | Reliable share/referral funnel, safe share cards, starter-driven creation, measured costs |
| 3. Studio commercial launch | 2–3 engineering weeks | Demand gate + phase 1; phase 2 evidence informs scope | One paid plan, tested billing/entitlements, cancellation and support; no unsupported Business claims |
| 4. Audience insight pilots | 2–3 engineering weeks plus 30–60-day follow-up | Research-purpose controls + committed buyers | Governed report delivered; real decision logged; renewal evidence and acceptable cost |
| 5. Business self-serve expansion | Estimate after pilots | Renewal, trust, margin, and repeat-use gates | Business tier/integration scope justified by observed demand |

Do not treat phases as permission to build all speculative features. The **first engineering release** is phases 1–2 plus only the Studio capabilities needed for agreed pilots. Paid work does not require a fully automated Business dashboard: early permitted reports can be produced through a controlled internal job after the same privacy checks.

## 2. Phase 0: make the offer testable

Deliverables:

- A one-page offer for publishers/community brands: audience decision, one quiz, customer-owned distribution, permissions, response/report thresholds, fixed service scope, and price.
- 12–15 buyer interviews; 8–10 observed quiz builds; at least 10 participant disclosure-comprehension sessions. Record observations separately from hypotheses.
- Mockups of a social result card, the research invitation, a cohort report, and a simple $29 Studio purchase/cancellation flow.
- A pilot measurement sheet: decision to improve, participant source, expected reach, data fields, opted-in response threshold, cost/time budget, and follow-up date.
- A reviewed low-response outcome: extend, provide an explicitly limited report, or refund under agreed terms. Do not invent a strong insight to fulfill a sales promise.

Do not infer consent or contact permission from the existing OAuth user database. Pilot recruitment and outreach require separately authorized work.

## 3. Architecture and proposed model changes

Keep Next.js, PostgreSQL, and Prisma. Prefer a small number of first-party endpoints and a database-backed job/outbox mechanism before adding a separate analytics warehouse or message platform. All table/API names below are proposals.

| Proposed model | Key information / invariant |
| --- | --- |
| `Workspace`, `WorkspaceMember` | Owner and member roles; individual creators receive a personal workspace. Keep participant identity separate from the customer's workspace. |
| `QuizVersion` | `personaId`, version number, content/scoring JSON, content hash, scoring algorithm version, publication timestamp. A published version is immutable. |
| `ParticipantSession` | Quiz version, owner or scoped anonymous subject, answer state, resume token hash, timestamps/expiry. Partial answers are for resumption, not automatically for research. |
| Extended `QuizResult` | Published version, subject ownership, retained display snapshot, attempt idempotency key. Result ownership is not membership in the quiz creator's workspace. |
| `ResultShare` | Hashed revocable share token, result reference, allowed fields, expiry and generated asset reference. The public artifact contains no research or contact fields. |
| `ConsentEvent` | Subject, named recipient/workspace, quiz version, purpose, exact notice version, grant/decline/withdrawal, capture time and mechanism. Append-only proof with a minimal retention policy. |
| `ResearchContribution` | Only permitted answers/outcomes and optional enrichment; version, purpose, workspace, consent event, quality flags, deletion linkage. Never silently include account email or other quiz histories. |
| `QuizEvent` / daily operational aggregates | Minimal event type, version, campaign/source, attempt-scoped pseudonym, timestamp, unique event key. No answer text, demographic values, or email in generic telemetry. |
| `CampaignReport` | Fixed cohort definition, report version, suppression decisions, eligible denominator, release time, and export audit trail |
| `Subscription`, `Entitlement`, `BillingEvent`, `UsageLedger` | Stripe identifiers/state, server-side capabilities, unique processed webhook events, auditable research-processing units/adjustments |
| `AuditEvent`, deletion/export jobs | Actor, purpose, resource, action, status; never copy raw participant answers or secrets into logs |

Deferred models: newsletter-contact delivery, public social connections, creator payouts, standardized benchmarks, recommendation training, and external data licensing. Do not create these just because the schema could accommodate them.

### Migration sequence

1. Backfill a personal workspace and owner membership for each existing creator; retain `creatorId` during transition.
2. Create an immutable version from each current quiz definition. Mark preexisting results as legacy when the original full definition cannot be reconstructed; do not claim current questions reproduce old scores.
3. Add nullable version references, then require a version for new submissions. Preserve existing result snapshots and idempotency behavior. Historical research reports use only attributable, consented records.
4. Introduce explicit result ownership and a legacy-sharing flag. Existing public bearer links remain legacy shares with clear controls; new owner-private results use the new access path. Do not break published links without a documented migration decision.
5. Add separate purpose/consent and research tables with no legacy-consent backfill. Validate constraints and indexes before enabling collection.
6. Apply new plan entitlements after grandfathering existing publication allocations. A downgrade must not remove an earned archetype or delete historical results.

Avoid destructive reset/push operations. Use checked-in migrations, a staging rehearsal on representative copies with sensitive fields removed, and a rollback/feature-disable plan. See [deployment prerequisites](../DEPLOYMENT.md).

## 4. Phase 1 acceptance criteria

### Ownership and sharing

- Replace result-ID-only access for new private results with authenticated ownership or an appropriately scoped anonymous-session capability. Anonymous users still receive a result without signing in.
- The Share action creates a separate revocable token and a sanitized image/page; default fields are archetype, quiz title, and selected artwork. Dimension detail is an explicit choice. Never include demographics, contact data, or raw answers in Open Graph tags, images, URLs, or response caches.
- Add no-index behavior for private/unlisted results, private cache headers where applicable, token-safe logging, and authorization checks on every read/export path. No-index is not access control.
- An account can manage its own results; a business editor or analyst sees only authorized aggregate data. Support access is restricted and audited.

### Research invitation and information model

- Before a commercial quiz, show the author/sponsor and concise purpose. After the result, invite optional research contribution; decline and skip are usable and never remove the result.
- Bind a contribution to a server-validated attempt, quiz version, purpose, and current notice. Separate research consent, optional field responses, marketing permission, and public sharing.
- Initially allow only reviewed broad adult age/region fields and topic-relevant preferences. Sensitive or unrestricted custom fields are off. Adult eligibility is not an inferred age from an account or device.
- Withdrawal/deletion removes the linked contribution and prevents future exports/recomputation from using it. Previously released truly non-identifiable summaries may be impossible to unwind; communicate this clearly. Pseudonymous records remain subject to the retention/deletion policy.
- Proposed retention for review: resumption sessions and detailed operational events expire after 30 days; research contributions after 90 days by default; personal result snapshots remain until the participant deletes them or the published retention policy applies. Keep billing/legal evidence separately under reviewed obligations. Do not promise completed exports can be recalled from recipients.
- Add real terms, privacy, research-information, deletion, and reporting/abuse pages. The current sign-in sentence mentioning Terms/Privacy is not a complete policy or a consent mechanism.

### Deployment and operating readiness

- Production database connections/migrations, OAuth callbacks, HTTPS, separate preview data, backups/restore rehearsal, error monitoring, rate limits, and usage alerts are configured.
- No production secrets in the repository. Define the operating budget and a safe response to viral/bot traffic.
- Publish a content/acceptable-use policy, attribution rules, and report/takedown path. Reject diagnostic, hiring-ranking, sensitive profiling, or misleading commercial claims in initial commercial pilots.
- Confirm legal basis, participant age/market scope, controller/processor responsibilities, contracts, and required consent/rights workflows for the actual launch. Privacy defaults are product requirements, not legal certification.

## 5. Phase 2: measurement and social delivery

Use a reusable event vocabulary:

| Event | Definition |
| --- | --- |
| `quiz_view` | Qualified cover view after bot/preview filtering; define the counting window |
| `quiz_start` | First deliberate entry into questions; deduplicated within an attempt |
| `quiz_complete` | Successful server-committed result, never just a clicked submit button |
| `share_intent`, `share_handoff` | User action and successful copy/native handoff; neither proves a public post |
| `referral_arrival`, `referral_complete` | Valid referral landing and downstream committed completion |
| `quiz_publish`, `creator_upgrade` | Successful server-side publication / confirmed entitlement activation |
| `research_contribution` | Accepted, permissioned contribution; distinct from merely viewing an invitation |

Whitelisted campaign tags and short-lived referral tokens carry no email, demographic value, or account ID. Reject or strip personal data from user-supplied source strings. Keep identification scoped to its purpose; no device fingerprinting or cross-business participant graph. Decide whether non-essential analytics require opt-in in each launch market before activating them.

Server deduplication and version binding must survive refresh, double submit, and out-of-order events. Report attempts versus people honestly: anonymous tokens are not verified unique people. Exclude previews, sample/creator traffic, and known bots from commercial reports; expose the exclusion policy and uncertainty.

Deliver generated/cached share images, good result copy, starter templates, a short route to a second quiz, and safe attribution. Account-synced resume can replace the current browser-tab-only experience using `ParticipantSession`; it must not turn partial answers into marketing data. Defer a social feed or friend graph until the loop is measured.

## 6. Phase 3: Studio billing and entitlements

Use hosted Stripe Checkout and the customer portal rather than handling card data. Subscription activity is asynchronous: [Stripe's webhook documentation](https://docs.stripe.com/billing/subscriptions/webhooks) requires handling payment and status updates outside the redirect flow.

- A server-controlled price map chooses the supported plan. Clients cannot send arbitrary product IDs or grant themselves capabilities.
- Verify webhook signatures. Store unique event IDs, process idempotently, and reconcile against current subscription state to handle delayed/out-of-order messages. Retry failures through an outbox/job and alert on unreconciled states.
- Handle successful purchase, authentication-required/incomplete purchase, invoice payment failure, renewal, cancellation at period end, refund policy, and entitlement reconciliation. A checkout-success URL alone never grants a paid plan.
- Enforce publication allocations and premium actions server-side. Show clear limits, billing period, tax/currency, renewal, and cancellation terms in the UI.
- Cancellation preserves core results and existing user data under policy; downgrade behavior and grace periods are explicit. Privacy controls never require a paid plan.
- Launch only Free and Studio. Do not show a purchasable Business plan before its reporting and governance capabilities exist.

Add a simple operational funnel report and result CTA. Keep external CTAs disclosed and do not append personal result data to their URLs. Add one integration only after pilot customers repeatedly ask for the same destination. Marketing-contact collection requires its own consent and implementation, not automatic reuse of OAuth email.

## 7. Phase 4: audience insights and the first report

For each campaign, predefine the quiz/version, audience question, allowed fields, period, minimum data threshold, and owner. Example endpoints could live under `/api/workspaces/:id/campaigns/:campaignId/reports`; every request checks membership, role, purpose, entitlement, and cohort-release policy.

Release a small set of fixed reports first:

1. Operational funnel by coarse campaign source.
2. Consented response/outcome distribution for one published version.
3. One approved optional demographic/preference breakdown when the proposed 100-response/20-cell policy is satisfied.
4. A plain-language observation and an explicitly proposed next experiment, reviewed by a human in pilots.

Display all relevant denominators, missingness, dates, source mix, duplicate policy, and quality exclusions. Do not describe self-selected respondents as a representative population. Never treat a 0–100 scale or archetype match as psychometric confidence.

Use an allowlist of coarse filters, fixed release windows, and suppression of small and complementary cells. Prevent differencing across overlapping exports or successive tiny batches; do not provide arbitrary SQL-like slicing. A privacy review must test auxiliary-information/linkability attacks, not just whether cells exceed 20. The [ICO guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/how-do-we-ensure-anonymisation-is-effective) explains why singling out and linkability matter beyond removing names.

An aggregate export contains no participant IDs, result URLs, raw answer rows, email, or contact tokens. Apply the same release policy to UI, CSV, jobs, and APIs; defend CSV output against formula injection in creator-controlled labels. Audit exports, expiry, and job authorization. Do not let an asynchronous job retain access after permission is revoked.

Maintain an idempotent usage ledger for accepted insight completions. Reserve included research capacity atomically so concurrent final submissions cannot produce surprise overages. A failed/retried submission does not consume another unit; preview traffic consumes none. Declining research does not consume an insight unit or block the result.

## 8. Verification plan

Extend the current unit, API integration, and replayable Playwright suites; do not replace real persistence checks with mocks of the implementation.

| Area | Required evidence |
| --- | --- |
| Versions/scoring | Immutable published definitions; reproducible version-specific results; old snapshot compatibility; editing cannot mix report populations |
| Billing | Signed/invalid/replayed/out-of-order events; payment failure; delayed activation; cancel/renew; entitlement race; no client-forged upgrade |
| Quotas/usage | Concurrent publish and completion boundaries; retries, retakes, previews; reserved-capacity behavior; no result withheld at a cap |
| Permissions | Cross-workspace reads/exports denied; analyst cannot access private results; user/anonymous ownership; revoked share token denied |
| Consent | Decline and skip still produce results; independent marketing choice; correct recipient/notice/version; withdrawal removes future research access |
| Reporting | All/eligible/opted-in/missing denominators; dedupe limits; small/complementary-cell suppression; overlapping-query attacks; CSV injection |
| Lifecycle | Expired attempt, result deletion, workspace offboarding, export revocation, retention job, creator deletion, and participant collection behavior |
| Social/telemetry | Copy is not counted as a referred completion; bot/OG fetches excluded; version/source attribution; no personal data in logs/URLs |
| Accessibility | Keyboard and mobile discovery, consent, sharing, billing, error/loading states; reduced-motion behavior |
| Capacity/cost | Realistic concurrent starts/submissions, burst arrivals, image delivery, query plans, and a reconciled cost-per-visit/completion estimate |

Provide headed/UI commands and named Playwright steps for founder review: free participant → private result → optional research decline; grant with optional fields; explicit share/revoke; creator upgrade/cancel; analyst report suppression/export; anonymous resume and finish. Use isolated synthetic workspaces and test-mode billing; never replay tests against production participants.

## 9. Launch gates, ownership, and next concrete work

| Owner | Before charging for the relevant capability |
| --- | --- |
| Founder/product | Confirm buyer and scope; 3 paid pilot commitments; approved price experiment; operating/support budget; honest marketing copy |
| Design/content | Result quality and starter examples; disclosure comprehension; mobile/share flow; no forced optional questions |
| Engineering | Version/access/consent foundations; verified migrations; billing/entitlement tests; release-policy enforcement; operational visibility |
| Privacy/legal review | Intended jurisdictions/ages, lawful basis/roles, notices/contracts, retention and deletion, sponsor disclosure, research restrictions |
| Pilot/customer lead | Distribution plan; agreed report threshold; actual decision and action log; 30–60-day renewal follow-up |

Immediate next work should be **the pilot offer and report/disclosure mockups**, followed by versioning and result-access design. The first implementation tickets are:

- **COM-01:** immutable quiz-version design and backward-compatible migration tests.
- **COM-02:** private result ownership, anonymous resumption, share/revoke design and threat review.
- **COM-03:** purpose/recipient consent schema, contributor controls, and policy routes.
- **COM-04:** minimal event definitions, referral attribution, and cost instrumentation.
- **COM-05:** personal workspace backfill and centralized authorization.
- **COM-06:** Studio entitlement and billing state-machine specification; implementation gated on the price/pilot decision.
- **COM-07:** fixed-cohort pilot report and suppression/export tests; gated on approved research scope.

COM-01 through COM-05 can be designed together; do not assume the old `creatorId` check grants workspace or participant-data access. Billing and report implementation depend on those foundations. Reassess the Business subscription only after pilot renewal and economics gates pass.
