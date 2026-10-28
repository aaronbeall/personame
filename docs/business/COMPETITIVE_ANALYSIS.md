# Personame competitive analysis

Research date: October 28, 2026. Scope: social self-discovery, quiz creation, and commercial audience understanding. Read alongside the [monetization strategy](MONETIZATION_STRATEGY.md) and [implementation plan](IMPLEMENTATION_PLAN.md).

## Executive assessment

Personame's central thesis is **a creative system for building, discovering, and collecting your many selves**: authors define dimensions and archetype targets; participants discover illustrated identities they may want to keep and display. Model diagnostics can help authors understand the worlds they create. Business reporting is a conditional expansion, not the reason this experience exists. See the [product thesis](PRODUCT_THESIS.md) for the revised priority and validation plan.

The competitive bar is higher than “a pretty personality quiz builder.” Free builders, inexpensive marketing upgrades, paid assessments, sophisticated reporting, and AI generation already exist. But a crowded category does not establish that Personame has little chance of success: the evidence here does not estimate that probability. The useful question is whether this specific combination makes people create, return, collect, and share.

If business demand emerges, a plausible initial buyer is a newsletter publisher or community-led brand with an existing audience and recurring editorial campaigns. Branding and reporting are feasible extensions, not core differentiators or mandatory next releases. Do not assume Personame already has a distribution network to sell.

## 1. What Personame actually offers today

Repository review: `prisma/schema.prisma`, `lib/quiz-calculations.ts`, `lib/quiz-scoring.ts`, `components/result-view.tsx`, and the creator/public routes.

| Present in the product | Commercial implication |
| --- | --- |
| Authenticated quiz creation; custom dimensions and archetypes; three question formats; preview/publish workflow | An operational foundation for creator tooling |
| Scores start at 50, add answer weights, clamp to 0–100, and select the nearest relevance-weighted archetype | Flexible author-defined storytelling; not evidence of scientific validity |
| Illustrated visual system, authored themes, persistent archetype results | A recognizable experience worth testing for recall and sharing |
| Public discovery shelves, result-link copying, and an account's archetype collection | Beginnings of distribution and retention, not a demonstrated viral loop |
| Anonymous participation and idempotent result submissions | Low-friction participation and a useful basis for accurate completion accounting |
| Historical result snapshots | Preserve the displayed result; insufficient on their own for a fully reproducible versioned research dataset |
| Creator ownership checks and public/private quiz visibility | Single-creator authorization; not commercial workspaces or team permissions |

Not implemented: billing, entitlements, workspaces, demographic questions, purpose-specific consent, a business insights dashboard, reliable view/start/referral instrumentation, export governance, or an account-synced unfinished-attempt model. The `views` column is not evidence of a complete measured funnel. “Still exploring” currently uses browser-tab storage.

Current result URLs reveal the snapshot to anyone with the link when the quiz is public. They are not owner-private results with a separate explicit sharing permission. That distinction matters before adding research information or richer profiles.

## 2. Competitor map

These are observed public offers, not hands-on feature certifications. Prices exclude tax; annual equivalents require an annual commitment. A feature omitted from a vendor's marketing page is **unknown**, not proven absent. Do not interpret this table as a market-share ranking.

| Competitor | Relevant offer and observed price | Competitive strength | Implication for Personame |
| --- | --- | --- | --- |
| **uQuiz** | Free creation; Pro advertised at **$10/month**, with customization, lead collection, and share customization. [Plans](https://uquiz.com/Plans/Choose) | Direct alternative for playful, creator-authored personality quizzes at a low price | Free creation and a cheap branding upgrade are not distinctive. The collection, result quality, and repeat experience must matter. |
| **BuzzFeed** | Consumer quiz entertainment; commercial offering includes branded quizzes and media/content partnerships. No standard self-serve campaign price verified. [Advertiser offering](https://advertise.buzzfeed.com/) | Cultural formats, editorial production, and distribution sold alongside commercial content | Learn the result-first entertainment format. Do not promise sponsors BuzzFeed-like reach or confuse advertising income with SaaS revenue. |
| **16Personalities** | Free personality test plus paid products; the Career Suite page displayed **€29** during research. No claim here about its checkout billing cadence. [Test](https://www.16personalities.com/free-personality-test), [Career Suite](https://www.16personalities.com/premium/career-suite) | A coherent identity vocabulary and deeper content around a recognizable result | Identity can support continued engagement and optional depth. Personame's many custom quiz worlds are a different proposition; do not imply equivalent assessment validation. |
| **Interact** | Free tier; advertised annual equivalents **Lite $27/month, Growth $53/month, Pro $125/month**. Branding, integrations, and analytics expand by tier. [Pricing](https://www.tryinteract.com/plans/) | Direct personality-quiz marketing competitor with an established business workflow | Buyers can already purchase segmentation and marketing integrations. Compete on experience and a focused audience job, not merely the presence of analytics. |
| **Typeform** | Current headline Basic offer: **$39 monthly / $28 per month annually**, with 100 responses/month; higher tiers add branding and analysis. Its comparison section also contained inconsistent price fragments. [Pricing](https://www.typeform.com/pricing) | Broad form/survey workflows, polished interaction, logic, and integrations | Generic “collect answers in a nice form” is crowded. Verify checkout prices before using exact comparisons in marketing. |
| **Outgrow** | Displayed Freelancer Limited **$22 monthly / $14 annually**; wider plans include quizzes, calculators, assessments, and recommendation tools. [Pricing](https://outgrow.co/pricing/) | Breadth of interactive marketing formats and integrations | Avoid building calculators, product catalogs, and a general funnel builder before proving the archetype niche. |
| **involve.me** | Start **$49 monthly / $29 annually**; Grow **$99 / $69**, Scale **$199 / $139**. Advertises CRM, email automation, integrations, and higher-tier experiments. [Pricing](https://www.involve.me/pricing) | Business workflow beyond a quiz, including follow-up | Useful audience actions must eventually follow reporting. Start with one result CTA and one requested integration rather than a competing CRM. |
| **Riddle** | Pro displayed **€129 monthly / €119 annually**; higher tiers add tracking/API capabilities. Offers unlimited content/leads and unlimited views subject to stated conditions. [Pricing](https://www.riddle.com/pricing) | Publisher-oriented interactive content and commercially useful operational features | There is room for higher business pricing, but “unlimited” competitors make punitive response fees a weak differentiator. |
| **ScoreApp** | Starter headline **$39/month**; page promotes scorecard marketing, tailored results, and response reporting. Annual/currency presentation was ambiguous, so no annual price is relied on here. [Pricing/features](https://www.scoreapp.com/pricing/) | Assessment-led lead qualification and actionable output | “Learn something about your audience” is already sold. Personame needs to show a specific recurring decision improved by its results. |

Pricing confidence: uQuiz and involve.me explicitly label the quoted monthly offers; Interact quotes above are explicitly annual. Typeform and ScoreApp contain presentation inconsistencies, and 16Personalities displayed a regional currency. No private quotes, paid checkouts, negotiated contracts, traffic estimates, or revenue estimates were inspected. Interact's public pricing page was favored over conflicting vendor secondary/AI-summary pages.

## 3. Where competition is strongest

| Job | Strong alternatives | Personame's current position |
| --- | --- | --- |
| Take a fun quiz and share a recognizable identity | uQuiz, BuzzFeed, 16Personalities | Relevant aesthetic and collection concept; no proven content or distribution advantage |
| Publish a quick custom personality quiz | uQuiz, Interact, Typeform | Flexible engine; authoring complexity and time-to-publish still need measurement |
| Generate leads and follow up | Interact, involve.me, Outgrow, ScoreApp | Not implemented; integrations and lead capture would be catch-up work |
| Understand a campaign's audience | Typeform, ScoreApp, Interact, involve.me | Data foundation exists, but consent, attribution, reporting, and trustworthy comparisons are missing |
| Buy a branded entertainment campaign with reach | BuzzFeed, Riddle/publisher ecosystems | Could sell creation services early; cannot yet sell a guaranteed audience |
| Get a standardized psychological assessment | A different assessment/professional market | Not an appropriate promise for arbitrary creator-authored dimensions |

The last two columns are product judgments based on the repository and cited offers, not empirical conversion or usability comparisons.

## 4. The opportunity to validate

### The scoring model deserves its own comparison

Personame's actual flow is **answers → dimension scores → nearest archetype target profile**, using relevance-weighted distance. Dimensions are an intermediate model, not merely secondary statistics attached to a winning result. For example, the same answers can yield Curiosity 80 and Sociability 25; changing an archetype's target changes the match without rewiring each answer to that archetype.

| Product/model | Documented mechanism | Difference from Personame |
| --- | --- | --- |
| Interact Personality Style | Answer choices give equal +1 correlations to one or more results; highest accumulated total wins. [Official logic guide](https://help.tryinteract.com/en/articles/9971974-how-to-set-up-personality-quiz-logic-and-result-correlations) | Direct outcome votes rather than an explicit nearest-target dimension space in this documented mode |
| Riddle personality quiz | Weighted answer points for personalities; highest total wins. Optional attributes are scored alongside the personality. [Official scoring guide](https://www.riddle.com/help/content-creation/personality-quiz/scoring) | Attributes are documented, but that page does not describe choosing the winner by distance from an authored attribute target vector |
| 16Personalities | Trait spectrums combine into types in a fixed framework. [Official framework](https://www.16personalities.com/articles/our-theory) | Dimensions producing types is established; Personame lets creators author many different dimension/archetype worlds instead of adopting one fixed taxonomy |
| Pointerpro | Custom scoring, formulas, and business rules select personalized outcomes. [Official assessment guide](https://help.pointerpro.com/how-to-organize-a-personality-assessment-with-pointerpro) | Flexible software may reproduce related logic; we have not demonstrated that competitors cannot implement distance-based matching |

**Assessment:** the explicit target-profile workflow is a meaningful authoring distinction from the documented direct-vote examples. Neither the mathematics nor dimensions-to-types should be claimed as unique. No exhaustive feature audit or hands-on equivalent implementation was performed. The stronger opportunity is making model design, diagnostics, and collectible illustrated results work together unusually well.

Model analysis should distinguish authored space, reachable answer profiles, simulated matches, and observed responses. Useful diagnostics include overlapping archetypes, uncovered regions, unreachable outcomes, ambiguous matches, clipping, and skewed observed choice distributions. Equal outcome frequency is not automatically the goal. No reviewed documentation establishes that competitors lack all such tools; Interact already documents manual balance checks and testing result paths.

### Collection and creative identity

A persistent collection becomes a different product experience when participants can curate a public/private profile, select a showcase, and display recognizable illustrated characters. Attractive result images alone are already common; the proposed distinction is the continuing relationship to those identities across quizzes, plus a recognizable creative world. This remains unvalidated, not a claimed moat.

AI could help authors produce coherent archetype casts and polished display cards. Prefer approved, reusable archetype art before generating a new image for every completion. Test whether participants want to display results and explore other people's collections, rather than assuming more image generation creates retention. The user cites Flame Warriors as inspiration; the site returned HTTP 403 during this research, so no detailed visual audit is claimed.

**Consumer promise:** “Discover another side of yourself, keep the ones you love, and compare stories with your people.”

**Creator promise:** “Make a quiz people want to finish and share.”

**Business promise:** “Learn what participating audience members say they prefer, and use that to make a better campaign.”

Potential advantages to build and test:

1. **Collection over isolated funnel.** An archetype is a keepsake in Your many selves, with a memorable portrait and a reason to return.
2. **Participant-controlled social context.** Shared cards and opt-in comparisons can make an unfamiliar quiz worth trying. There is no current evidence this produces organic growth.
3. **Authored worlds, not generic form templates.** Examples, artwork, and better result writing can shorten creation time while keeping the engine expressive.
4. **Visible data boundaries.** Showing who created a quiz, why information is requested, and what a business can see can support trust. This is a proposed standard, not an assertion that competitors lack it.
5. **Decision-oriented reports.** An adult community's self-reported content preferences are more useful to a newsletter editor than a decorative personality chart with no recommended experiment.

Artwork, AI-generated questions, free participation, and analytics are individually easy to copy. A plausible longer-term advantage is a combination of a returning community, strong content, recognized identity design, and consistently honored permissions. Cross-customer personal profiles should not be treated as the moat.

## 5. Commercial value: demographics versus psychographics

A “rainy-day dreamer” is an authored outcome. A preference for quiet social events is a self-reported attitude. An age band or broad region is demographic information only if separately collected or otherwise appropriately sourced. One cannot reliably substitute for another.

Personame currently stores no structured demographic model. Arbitrary dimensions also cannot be compared across quizzes simply because both are normalized to 0–100. Question wording, weights, ranges, populations, and quiz versions differ. The displayed match score measures closeness to the creator's target; it is not a probability, confidence interval, or population percentile.

The first business product should therefore be **within-campaign descriptive insight**, with explicit sample sizes and collection purpose. Example: “Of 146 opted-in responses to this campaign, 58 selected small-group gatherings.” Do not claim that 40% of all customers, or of a demographic population, hold that preference. Self-selection, sharing networks, repeat attempts, and missing responses can distort the sample.

## 6. Initial market and avoidable distractions

Prioritize the core creative/collecting loop and author model diagnostics. If business demand appears, test newsletter publishers and community-led lifestyle/interest brands that already publish recurring content and can bring their own audience. A buyer should identify one decision: next event format, content series, product interest, or community program. Favor non-sensitive preferences over health, financial, or employment suitability.

Do not initially pursue clinical assessment, hiring/employee ranking, political targeting, third-party audience-data sales, enterprise procurement, a full CRM, or a marketplace of psychological reports. They change the trust, validation, legal, and operational requirements before the core business is proven.

## 7. Validation research still required

| Question | Practical validation | Evidence that changes the plan |
| --- | --- | --- |
| Why use Personame instead of a free maker? | Observe 8–10 creators build the same short quiz in Personame and one chosen alternative | Creation time, abandonment, quality of results, and which product they choose afterward |
| Will consumers return? | A small consented beta with at least three quiz topics; measure second-quiz completion within 14 days | Repeat use after novelty, rather than total first-week visits |
| Does sharing cause new participation? | Tokenized referral arrivals and completions, excluding bots and previews | New completions attributed to sharing, not copy-button presses |
| Who pays and for what? | 12–15 buyer interviews across publishers, community brands, and small agencies; ask about their last paid campaign | At least three paid, scoped pilots; verbal enthusiasm is insufficient |
| Does insight change a decision? | Each pilot records its question, decision, and follow-up action before/after the report | Buyers reuse the process or renew; a flattering report alone does not validate recurring software |
| Does transparent research damage the experience? | Usability and comprehension tests of the disclosure and optional fields | Participants understand the purpose; declining does not block results |

Do not send outreach, purchase competitors, or recruit participants automatically as part of this document. This is a research and execution plan.

## Research boundary

Additional direct personality products surfaced during the subsequent [naming research](NAMING_RESEARCH.md): [Personica](https://personica.net/) offers a free personality test, dimensions, archetypes, and growth tools; [PX7 Digital's catalog](https://px7.digital/apps/) lists **Personome** as an early-access personality profile with archetypes and AI-readable output. These are relevant naming and positioning overlaps. Their pricing, adoption, and full workflows were not evaluated in the nine-product comparison above.

No defensible TAM, market share, acquisition cost, churn benchmark, scientific-validity comparison, or conversion uplift can be inferred from the reviewed pages. Vendor pages describe offers; they do not prove customer outcomes. The [strategy](MONETIZATION_STRATEGY.md) labels Personame prices and targets as experiments, and the [implementation plan](IMPLEMENTATION_PLAN.md) separates existing capabilities from proposed work.
