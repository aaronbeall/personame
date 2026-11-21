# Personame feature checklist

Reviewed November 21, 2026 against the founder's feature specification, existing project documentation, and current code.

Checked items have an implemented path. Unchecked items require implementation, refinement, or a product decision. Partial features are split into completed foundations and remaining work. Implementation status does not establish production deployment or replace release verification.

This review includes tags through commit 7385341 and PR #3. Both CI runs passed at the last verification. Confirm merge/deployment status before releasing.

## Core persona model

### Dimensions → archetype targets → weighted answers → nearest archetype

- [x] Model quizzes with dimensions, archetypes, pages, questions, and answers.
- [x] Define dimension names, descriptions, low/high labels, and endpoint emblems.
- [x] Store scores and target positions on a normalized 0–100 scale.
- [x] Give archetypes per-dimension target positions and relevance.
- [x] Map answer options to suggested positions on relevant dimensions.
- [x] Set question influence separately per dimension.
- [x] Calculate scores as influence-weighted averages of answered evidence.
- [x] Distinguish an unrelated dimension from an explicit neutral answer.
- [x] Default missing option positions within a mapped question to 50.
- [x] Interpolate slider and scale responses between endpoint positions.
- [x] Exclude skipped optional questions from the evidence denominator.
- [x] Mark dimensions without evidence as unmeasured and exclude them from matching.
- [x] Find the nearest archetype using relevance-weighted RMS distance.
- [x] Break exact ties deterministically using stable archetype IDs.
- [x] Show close alternatives and narrow best-versus-second-best gaps.
- [x] Keep match points distinct from psychological confidence and population percentiles.
- [x] Save immutable result snapshots, including scores, archetype identity, and presentation.
- [x] Group compatible comparisons with a scoring-model key.
- [x] Preserve historical snapshots when source definitions change.
- [x] Support older results through presentation/evidence defaults.
- [ ] Explain answer position, question influence, and archetype relevance more clearly.
- [ ] Decide sufficient-evidence guidance and communication of weak evidence.
- [ ] Review model-key treatment of wording/endpoint edits against the version policy.
- [ ] Explain why a particular answer set produced its winning archetype.

[Current scoring specification](SCORING.md). Evidence is in lib/quiz-calculations.ts, lib/quiz-scoring.ts, and lib/scoring-model-key.ts.

## Quiz creation

### Name, description, tags, and styling

- [x] Create/edit title and description.
- [x] Start fresh naming forms with a suggested emblem and color.
- [x] Save a draft in place or save and continue.
- [x] Edit manual quiz tags on Name and beneath Publish settings.
- [x] Render removable tag chips inside the input.
- [x] Add tags using Enter/comma and normalize case/spacing.
- [x] Deduplicate tags and limit to 12 entries of 32 characters.
- [x] Save pending tags atomically with publication.
- [x] Preserve published status for tag-only Publish saves.
- [x] Search published quiz titles, descriptions, and tags.
- [x] Select emoji, library icon, or curated persona artwork as an emblem.
- [x] Select solid colors or curated multicolor themes.
- [x] Tint library icons with the relevant style color.
- [x] Choose curated full-scene artwork or Unsplash photos.
- [x] Display the selected image in the Name header and discovery tile background.
- [x] Render quiz cover imagery according to the participant page layout.
- [x] Put the booklet in the participant cover content area.
- [x] Edit booklet Label/Sub-label inside the style popover.
- [x] Scale text within limits, wrap to two lines, and clamp overflow.
- [x] Choose/clear one of 16 quiz-color-tinted book patterns.
- [x] Show selected image previews and empty placeholders on picker controls.
- [x] Provide a Current selection tab in image pickers.
- [x] Keep portraits in emblem choices and scenes in image choices.
- [x] Mirror base quiz appearance on the welcome page.
- [ ] Review long/localized labels across compact booklet sizes.
- [ ] Expand curated artwork/pattern collections as needed.
- [ ] Revisit crop/focal-position controls if a usable interaction is designed.
- [ ] Decide custom image support and tier placement.

- [ ] Suggest meaningful semantic tags from quiz themes, topics, and concepts across the content. Let authors review and select suggestions, exclude existing tags, and evaluate relevance and usefulness on representative quizzes.

Manual tagging is implemented. The earlier word-frequency suggestions were removed because their quality was inadequate. Semantic tag suggestions remain planned.

### Defining personality dimensions with styling

- [x] Add, edit, and delete dimensions.
- [x] Configure descriptions, endpoint labels, and endpoint emblems.
- [x] Configure dimension emblem, color, and artwork.
- [x] Preserve IDs and scoring references during ordinary edits.
- [x] Clean obsolete question mappings after dimension removal.
- [x] Store ascending, descending, and bipolar display-scale preferences.
- [x] Show dimension values and reusable endpoint descriptors.
- [ ] Apply display-scale preferences consistently in participant/result rendering.
- [ ] Improve coaching for distinct, understandable, adequately measured dimensions.
- [ ] Provide explicit dimension ordering controls.

### Defining archetypes with styling

- [x] Add, edit, and delete archetypes.
- [x] Configure names, descriptions, emblems, and themes.
- [x] Set dimension targets and relevance.
- [x] Render selected artwork behind archetype headings.
- [x] Use the shared circular badge and ribbon presentation.
- [x] Preserve target mappings and IDs through edits.
- [x] Inspect targets visually.
- [ ] Turn overlap, incomplete targets, and unreachable outcomes into actionable guidance.
- [ ] Provide explicit archetype ordering controls.
- [ ] Offer optional coherent-cast creation and artwork briefs.

### Creating a quiz that maps answers to archetypes

- [x] Multiple-choice, slider, and scale questions.
- [x] Answer labels, slider endpoints, and scale points.
- [x] Answer-to-dimension positions and question/dimension influence.
- [x] Multiple question pages between Cover and Results.
- [x] Required and optional questions.
- [x] Hidden pages excluded from scoring.
- [x] Page titles and descriptions.
- [x] Styling for pages, questions, answers, slider endpoints, and scale points.
- [x] Hero, split, card, and minimal layouts where supported.
- [x] Optional custom colors with a remove action.
- [x] Independent cover-page background and base quiz image.
- [x] Cover start text and description/count/duration visibility controls.
- [x] Results title and result-content visibility controls.
- [x] Results appearance driven by the resulting archetype.
- [x] Outline, canvas, contextual settings, and inspector breadcrumbs.
- [x] Desktop/mobile canvas previews.
- [x] Bottom save action for unsaved builder changes.
- [x] Reset, Save, Save and continue, and record edit/cancel behavior.
- [x] Unsaved-navigation warning.
- [x] Stable IDs, targets, and weights through edits.
- [x] No-op save detection and targeted relationship updates.
- [x] Restoration of missing Cover/Results bookends for legacy quizzes.
- [x] Full preview using participant rendering and production scoring.
- [x] Preview isolation from saved participant results/counts.
- [x] Results preview confetti and replay.
- [ ] Accessible move controls or drag-and-drop page/question ordering.
- [ ] Additional question types after choosing scoring/response semantics.
- [ ] Conditional branching and its scoring/progress/analysis rules if pursued.
- [ ] Faster, clearer bulk question-mapping workflows.
- [ ] User-facing starter/template picker and create-from-template flow.

### Tools to analyze the personality framework

- [x] Archetype projections across one, two, three, and higher dimensions.
- [x] 3D orbit, zoom, reset, and keyboard controls.
- [x] Projection selection and fourth-dimension size encoding.
- [x] Geometric separation, coverage, and territory diagnostics.
- [x] Dimension influence, archetype focus, and importance variety.
- [x] Target/relevance heatmaps and missing/inactive configuration warnings.
- [x] Question-to-dimension influence and marginal reachable ranges.
- [x] Exact enumeration for small finite answer spaces.
- [x] Reproducible bounded sampling for larger spaces.
- [x] Outcome shares calculated with actual scoring behavior.
- [x] Sampling intervals, assumptions, and counts.
- [x] Close-result and one-answer omission-sensitivity diagnostics.
- [x] Bounded analysis in a Web Worker.
- [x] Practical metric help and a technical reference.
- [x] Distinguish authored geometry, answer reachability, and observed responses.
- [ ] Show representative winning answer paths for each archetype.
- [ ] Overlay reachable score clouds on the atlas.
- [ ] Add answer-resampling sensitivity beyond omission checks.
- [ ] Add contribution redundancy and coupled-dimension diagnostics.
- [ ] Show small answer changes that cross outcome boundaries.
- [ ] Link findings directly to questions/targets an author can edit.
- [ ] Reconcile older diagnostic prose with current scoring and tie behavior.

[Space metrics](SPACE_METRICS.md) and [question-space analysis](QUESTION_SPACE_ANALYSIS.md)

### Publish with options

- [x] Publication readiness checks for meaningful dimensions, archetypes, questions, and mappings.
- [x] Public publication with a stable participant URL.
- [x] PUBLIC/PRIVATE storage as an access-control foundation.
- [ ] Implement Unlisted publication for anyone holding its private URL.
- [ ] Exclude Unlisted quizzes from listings while permitting participation.
- [ ] Define visibility changes' effect on existing result shares.
- [ ] Replace placeholder discoverability settings with working controls.
- [ ] Implement publication scheduling and closing dates.
- [ ] Decide/implement optional response limits and at-limit behavior.
- [ ] Replace generic Coming later grouping with accurate per-setting messaging.

#### Private URL access

An Unlisted quiz is accessible to anyone holding its URL and excluded from search. This is pending implementation.

#### Public access

Public publishing and searchable listings are implemented.

Invite-only access is covered under Pro.

### Manage quiz lifecycle

- [x] Author-owned drafts and author-only testing.
- [x] Save real results only for accepted published submissions.
- [x] Publication celebration, copy link, and share actions.
- [x] Close to stop new submissions and reopen through publication.
- [x] Preserve public result links after close or return to Draft.
- [x] Return most edited live quizzes to Draft under the current workflow.
- [x] Allow tag-only Publish saves while preserving publication status.
- [ ] Agree safe live edits versus changes needing a new version.
- [ ] Separate editable drafts from immutable published versions.
- [ ] Keep a published version available during replacement-draft editing.
- [ ] Bind submissions, results, and analytics to explicit published versions.
- [ ] Define in-progress participant behavior when a version changes.
- [ ] Duplicate a whole quiz into a new private draft with fresh IDs.
- [ ] Track version/fork lineage and related editions.
- [ ] Decide permissions and attribution for forking another author's quiz.
- [ ] Define archive/delete behavior that preserves earned-result expectations.

PRIVATE currently provides author-only draft access. The requested private-URL behavior needs an Unlisted mode. Invite-only is a separate future permission model.

A proposed live-edit policy allows presentation, typo corrections, descriptions, and tags on the live quiz, with structural/scoring changes creating a new draft version. This remains a decision.

### Creator sign-in and ownership

- [x] Google and GitHub OAuth when provider credentials are configured.
- [x] Database-backed sessions and provider identity/avatar data.
- [x] Author-only editor reads, saves, previews, and publication.
- [x] Separate quiz ownership from participant result ownership.
- [x] Separate Explore, Your quizzes, and Your many selves.
- [ ] Account settings, deletion, and data export.
- [ ] Shared quiz ownership through organizations and roles.
- [ ] Ownership transfer and organization offboarding.

### Launch, platform, and quality

- [x] Next.js, TypeScript, PostgreSQL, Prisma, and NextAuth foundation.
- [x] Checked-in schema migrations and client-generation workflow.
- [x] Bounded/paginated personal collections and targeted editor reads.
- [x] Batched saves, unchanged-record detection, and stable relationships.
- [x] Public caching and lifecycle access invalidation.
- [x] Bounded transaction retries, idempotency, and atomic completion writes.
- [x] Editor payload limits.
- [x] Shared tokens, entity identity, and live design reference.
- [x] Reduced-motion behavior in major flows.
- [x] Eleven editable seed quizzes, with eight public samples and three private drafts.
- [x] Three-page Space Crew sample and varied style demonstrations.
- [x] Full-scene curated image choices, 16 patterns, and attributed Unsplash selection.
- [x] Catalog validation and artwork refresh for matching existing seeds.
- [x] CI lint, type checking, coverage, Playwright, and API integration.
- [x] Regression coverage for scoring, ownership, lifecycle, historical results, and tags.
- [ ] Confirm production hosting using the founder's free-hosting preference.
- [ ] Refresh dated hosting recommendations/constraints before choosing providers.
- [ ] Production runtime/database configuration and controlled migration releases.
- [ ] Production secrets, OAuth callbacks, canonical host, DNS, and HTTPS.
- [ ] Deployed end-to-end creator/participant verification.
- [ ] Isolate production from preview/CI databases.
- [ ] Monitoring, backup/restore rehearsal, alerts, rate limits, and cost controls.
- [ ] Representative concurrency/latency measurement before capacity claims.
- [ ] Abuse reports, acceptable-use guidance, and takedown handling.
- [ ] Launch-appropriate terms, privacy, deletion/export, and support routes.
- [ ] Retention/cleanup for attempts, events, shares, and exports.
- [ ] Systematic accessibility audit across all workflows.
- [ ] Reconcile old overview/development/quickstart claims with current behavior.
- [ ] Maintain this checklist as features are verified, merged, and deployed.

### Decisions to settle for creation and publishing

- [ ] Public, Unlisted, and invite-only terminology/access semantics.
- [ ] Safe live edits versus changes requiring new versions.
- [ ] Version numbers, participant URLs, and in-progress attempts.
- [ ] Duplication/fork permissions and attribution.
- [ ] Repeat-attempt history and featured/favorite result behavior.
- [ ] Default profile/result privacy and anonymous-result claiming.
- [ ] Which metrics represent completions versus people.
- [ ] First Pro value proposition and separation from optional business research.
- [ ] Launch hosting and operating limits.
- [ ] Sequence publishing/versioning, account continuity, profiles/trophy case, and analytics.

## Quiz taking

### Find a quiz or open a direct link

- [x] Public home strips and Explore browsing.
- [x] Case-insensitive title, description, and tag search.
- [x] Direct links to public quizzes.
- [ ] Server-side public search and pagination beyond the current 30-item list.
- [ ] Tag browsing/filtering beyond free-text search if wanted.
- [ ] Defined categories/recommendations replacing provisional shelf keyword grouping.
- [ ] Shareable discovery filters/search URLs.

### Take a quiz without login

- [x] Participation without login.
- [x] Cover, question pages, sticky progress, and navigation.
- [x] Explicit slider choice or Use midpoint.
- [x] Required-answer validation and focus feedback.
- [x] Back navigation and answer changes before submission.
- [x] Session-storage responses tied to quiz revision.
- [x] Stale-revision rejection with restart guidance.
- [x] Server validation of answer IDs and scoring.
- [x] Idempotent submission and atomic result/count writes.
- [x] Scoring weights/hidden questions excluded from participant payloads.
- [x] Loading, empty, unavailable, and submission-error states.
- [x] Reduced-motion support.
- [ ] Resume incomplete attempts across sessions and devices.
- [ ] Anonymous resumption capability with ownership proof.
- [ ] Systematic keyboard, screen-reader, and mobile review.

### Get saved and shareable results

- [x] Anonymous saved completions and unguessable result URLs.
- [x] Medallion, description, dimension landscape, and close alternatives.
- [x] Earned presentation and scores preserved in snapshots.
- [x] Copy/share result URL and retake.
- [x] Result access without exposing account data or individual answers.
- [ ] Owner-private results and explicit public-sharing choices.
- [ ] Separately revocable shares with selectable detail.
- [ ] Owner result deletion and share revocation.
- [ ] Generated share images and Open Graph previews.
- [ ] Clear referral from share artifacts to the originating quiz.
- [ ] Sharing rules for Unlisted/invite-only quizzes.
- [ ] Preserve earned access when source quizzes or creator accounts are deleted.
- [ ] Appropriate private/unlisted indexing and cache behavior.

Current result URLs are bearer links. Claiming, explicit ownership controls, and share revocation remain unfinished.

### Optional login and account association

- [x] Account association when signed in at submission.
- [ ] Claim an anonymous completion after login with attempt ownership proof.
- [ ] Clear save-to-account invitation after showing the result.

### Logged-in user profile

#### Self profile

- [x] Authenticated Your many selves collection.
- [x] Latest result per completed quiz.
- [x] Collection search and pagination.
- [x] In-session unfinished attempts in Still exploring.
- [x] Resume/dismiss local attempts.
- [x] Your quizzes with drafts, live/closed quizzes, counts, and next editing steps.
- [ ] Unified editable self profile with identity, activity, collection, and created quizzes.
- [ ] Private activity/all-attempt history beyond latest-per-quiz.

#### Public profile

- [ ] Public profile URL and public identity fields.
- [ ] Per-item control of public personas, completed quizzes, activity, and authored quizzes.
- [ ] Public authored-quiz listing on profiles.
- [ ] User-controlled avatar with account-associated image default.
- [ ] Profile visibility defaults and visitor-view preview.
- [ ] Whole-profile and featured-persona sharing.
- [ ] Social connections/feed only if demand justifies them.

#### Trophy case and favorite personas

- [x] Shared illustrated badge treatment for earned personas.
- [ ] Favorite result pins and display ordering.
- [ ] Fun, responsive trophy-case presentation.
- [ ] Repeat-attempt collection policy.
- [ ] Collection provenance/version labels and deleted-source behavior.
- [ ] Optional exploration achievements/cosmetics after defining their role.

## Quiz metrics

### Aggregate quiz statistics

- [x] Atomic completion counts.
- [x] Stored selections, measured scores, completion timestamps, and model keys.
- [x] Counts on creator/public quiz surfaces.
- [ ] Define attempts, retakes, completions, and unique-person metrics.
- [ ] Track qualified views, starts, question/page exposure, and abandonment.
- [ ] Define preview/test/bot exclusions.
- [ ] Referral arrival/completion and copy/native-share handoff metrics.
- [ ] Retry-safe event collection and retention.

### Tools to analyze aggregate results for creators

- [ ] Creator observed-archetype distribution dashboard.
- [ ] Dimension histograms, answer frequencies, and missingness.
- [ ] Date/version/cohort filters and explicit sample sizes/denominators.
- [ ] Observed-versus-modeled outcome comparison.
- [ ] Observed close-match and sensitivity summaries.
- [ ] Aggregate exports and tier placement.
- [ ] Model stability evaluation with clear descriptive limits.

Framework simulations are implemented. A creator dashboard analyzing actual participant responses remains to be built. Repeat completions currently count separately.

### Comparative results for quiz takers

- [x] Participant dimension means against other compatible completions.
- [x] Archetype shares for the same quiz/model cohort.
- [x] Minimum 10 other completions for comparisons and dimension means.
- [x] Suppression of exact shares below 3 matching completions.
- [x] Comparison API excludes other participants' identities/answers.
- [ ] Participant percentiles only after defining cohorts and interpretation.

## Pro tier

The founder's Pro scope and earlier commercial proposals are recorded below. Prices, quotas, plan names, and research thresholds remain decisions.

### Preparation and messaging now

- [ ] Agree Free/Pro boundaries while retaining access to earned results.
- [ ] Add accurate future-capability messaging before enabling purchases.
- [ ] Centralize server-side premium entitlement checks.
- [ ] Define quotas, grandfathering, downgrade/grace periods, and usage communication.
- [ ] Choose whether advanced analysis, images, templates, and AI tools are premium.
- [ ] Define purchase, renewal, cancellation, and support terms.

### Invite-only quizzes with explicit permissions and request access

- [ ] Invite-only access distinct from Public/Unlisted.
- [ ] Invitations, explicit grants, and revocation.
- [ ] Request-access, approval, and denial workflows.
- [ ] Access enforcement on reads, submissions, results, and exports.

### Organization management and multiple quiz managers

- [ ] Organizations/workspaces owning multiple quizzes.
- [ ] Owner/editor/analyst roles and scoped membership.
- [ ] Backward-compatible migration from individual creator ownership.
- [ ] Role changes, member removal, ownership transfer, and offboarding.
- [ ] Separate organization permissions from personal result ownership.

### Custom quiz branding and routing

- [ ] Custom logos, attribution, and brand/layout configuration.
- [ ] Custom quiz routes and a decision on custom domains.

### Embed tools for other sites

- [ ] Responsive embed tools and configuration.
- [ ] Embed origin/access rules and supported host behavior.

### Pro creator tools, custom images, and AI assistance

- [ ] Custom asset storage/uploads, rights, limits, and moderation responsibilities.
- [ ] AI-assisted question/cast/artwork-brief drafts with author approval.
- [ ] Store/reuse approved archetype art across completions.
- [ ] Preserve generated asset provenance and provide provider-failure fallbacks.
- [ ] Evaluate optional personal art variants/cosmetic packs with cost limits.
- [ ] Result CTAs and demand-led integrations.

### Billing foundations

- [ ] Hosted checkout and customer portal.
- [ ] Signed webhooks with replay/out-of-order handling.
- [ ] Subscription reconciliation, failed payments, renewals, and cancellations.
- [ ] Idempotent usage ledger and concurrency-safe quotas.
- [ ] Server-controlled plan activation.
- [ ] Results/data preservation through cancellation and downgrade.

### Optional business insight and deeper research

These conditional proposals come from existing business/product docs. They are outside the core launch scope and are not prerequisites for continued creative-product development.

- [ ] Validate buyer demand and scoped pilot usefulness.
- [ ] Define sponsor, research purpose, audience, and intended markets.
- [ ] Separate research contribution, marketing permission, and public sharing.
- [ ] Capture recipient/notice/version and consent grant, decline, and withdrawal.
- [ ] Preserve results when optional research is declined.
- [ ] Approved optional demographic/preference questions after scope review.
- [ ] Defined eligible cohorts, missingness, quality exclusions, and repeat policy.
- [ ] Cohort/cell suppression and overlapping-query release protections.
- [ ] Fixed-cohort campaign reports with reviewed interpretations.
- [ ] Consistent release rules for UI, jobs, exports, and APIs.
- [ ] Export auditing and withdrawal/deletion workflows.
- [ ] Pilot renewal, report usefulness, and cost evidence before Business self-service.
- [ ] Observed item relationships and candidate dimension exploration.
- [ ] Stable response-profile groups as possible archetype inspiration.
- [ ] Goal-aware question wording critique with editable suggestions.
- [ ] Empirical item evidence evaluated separately from AI editorial advice.
- [ ] Author-approved revisions introduced through new quiz versions.

[Product thesis](business/PRODUCT_THESIS.md), [monetization proposals](business/MONETIZATION_STRATEGY.md), and [commercial implementation plan](business/IMPLEMENTATION_PLAN.md)

### Checklist sources and maintenance

The founder's November 21 feature specification supplies the high-level scope. Current implementation determines checked status. Historical plans contribute future items without making them approved launch requirements.

- [Scoring](SCORING.md) and current scorer code supersede additive-scoring descriptions in older documents. Current ties use stable archetype IDs.
- [Core workflow](CORE_WORKFLOW.md) and [quiz experience](QUIZ_EXPERIENCE.md) describe the implemented flow. Their broad live-edit descriptions predate tag-only publication-preserving saves.
- [Space metrics](SPACE_METRICS.md) and [question-space analysis](QUESTION_SPACE_ANALYSIS.md) supply diagnostics and further proposals. Current code governs where those docs retain older formulas or metric descriptions.
- [API performance](API_PERFORMANCE.md) supplies bounded collection, cache, save, and transaction behavior.
- [Seed quizzes](SEED_QUIZZES.md), [brand guide](BRAND_GUIDE.md), [design system](DESIGN_SYSTEM.md), and [testing](TESTING.md) supply content, visual direction, and verification detail.
- [Deployment](DEPLOYMENT.md) is a dated plan. This review does not reconfirm vendor pricing or establish a live deployment. The founder's later preference is a free hosting starting point.
- [Product thesis](business/PRODUCT_THESIS.md), [monetization strategy](business/MONETIZATION_STRATEGY.md), and [implementation plan](business/IMPLEMENTATION_PLAN.md) contain conditional commercial/research proposals. Their prices, quotas, estimates, and release thresholds remain hypotheses.
- [Earlier next steps](../NEXT_STEPS.md), [technical overview](../PROJECT_SUMMARY.md), [development guide](../DEVELOPMENT.md), and [quickstart](../QUICKSTART.md) are historical supporting references where they conflict with current code.
- [Competitive analysis](business/COMPETITIVE_ANALYSIS.md) and [naming research](business/NAMING_RESEARCH.md) supply research context and do not establish implemented features.

Check an item only when its stated behavior is implemented and appropriately verified. Keep implementation, product approval, PR merge, and deployment status distinct.
