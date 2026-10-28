# Personame: creative models and a collection of selves

Direction clarified October 28, 2026. This is a proposed product direction and research plan, not implemented functionality or validated demand. It refines the [competitive analysis](COMPETITIVE_ANALYSIS.md), [monetization strategy](MONETIZATION_STRATEGY.md), and [commercial implementation plan](IMPLEMENTATION_PLAN.md).

## The central promise

**Build a world of personalities. Discover who you are in it. Keep the selves you love.**

The founder's primary interest is the creative and social experience: explicit dimension models, authored archetypes, understandable diagnostics, beautiful character results, and a personal collection worth showing off. Demographics, business branding, and author reporting are possible commercial extensions if demand emerges. Their absence today is a scope choice, not evidence against the core concept.

The initial analysis overemphasized business quiz software and treated the collection mostly as a source of engagement for commercial campaigns. That weighting is corrected here. Competitive crowding establishes alternatives, not a probability of failure.

## 1. A model-building studio

The engine already separates question contributions, dimension scores, and archetype targets. Scores begin at 50, accumulate answer contributions, and clamp at 0–100. Matching uses the root mean squared distance from the participant's score vector to each archetype, weighted by that archetype's dimension relevance. Lowest distance wins; ties currently favor the first archetype in input order. This describes `lib/quiz-calculations.ts`, not a new scoring proposal.

This structure makes archetypes understandable as places in a world. A “Moonlit Cartographer” might target high curiosity, low social energy, and high deliberation. The author can change the cast without reconnecting every answer directly to an outcome. Different archetypes can care about different dimensions.

Dimension-based types and nearest-profile matching are established concepts. The distinction to test is **an accessible creative workflow for authoring and inspecting these systems**, integrated with expressive collectible results. See the linked competitive analysis for primary-source comparisons with Interact, Riddle, Pointerpro, and 16Personalities. Those sources do not prove competitors cannot implement equivalent logic.

### Model diagnostics: before and after real responses

| Layer | Useful questions | Honest presentation |
| --- | --- | --- |
| Authored geometry | Are targets nearly identical? Which regions are far from all targets? Does relevance make an archetype unusually broad? | “Model map,” “overlap,” and distance diagnostics; not psychological validity |
| Answer reachability | Can permitted answer combinations actually reach the target regions? Are some dimensions barely measured? Does clamping collapse different paths to the same endpoint? | Exact enumeration for small finite quizzes; clearly labeled estimates for larger/continuous spaces |
| Simulation | Which archetypes win under a stated answer-generation assumption? How often are matches tied or close? | Show sample size, seed, assumptions, and sampling method; random answers are not a population model |
| Observed responses | Which choices vary? Which are rarely selected? Where do scores cluster? Are outcomes concentrated or matches ambiguous? | Show quiz version, cohort/date range, denominators, repeat-attempt policy, and descriptive limits |

Separate **space coverage** from **participant fit**. A geometric corner may be unreachable through the actual questions. An outcome rare among current participants may reflect the audience, a poorly worded question, or the scoring model; frequency alone cannot identify the cause. A uniform sample of dimension coordinates and a random sample of answer paths answer different questions.

Useful first release: target overlap/duplicate warnings; dimension contribution ranges; evidence that each outcome can win under at least one discovered answer path; simulated outcome shares; distribution of best-versus-second-best distance gaps. A small gap means an ambiguous assignment under this model, not low psychological confidence. If search is approximate, “no winning path found” must not be labeled “impossible.”

Then add observed per-question choice distributions, dimension histograms, saturation rates at 0/100, outcome shares, and distance-gap distributions. Question variation can help authors revise content, but low variation is not inherently a bad question. Do not automatically rebalance the quiz to force equal outcomes or silently change historical results. Version scoring and keep diagnostics tied to the version.

High-dimensional coverage needs projections or summaries; a two-dimensional scatter plot cannot certify the whole model. Archetype-specific relevance also means a simple unweighted nearest-center diagram may misrepresent actual decision boundaries. Use the real scorer for simulations and match maps.

### Optional depth: learn from responses, then refine the world

Beyond checking an authored model, Personame could help creators discover structure they did not anticipate. A creator can invent an entertaining world entirely by intuition, explore a domain with deliberate questions, or combine both approaches. These tools should be available on demand, without making scientific terminology or a research setup part of the default creation flow.

Distinguish three proposed capabilities:

| Capability | Question it addresses | Possible author action |
| --- | --- | --- |
| Underlying dimension exploration | Which item responses vary together, and does their structure support or challenge the intended dimensions? | Review redundant items, split a mixed dimension, or propose an additional dimension |
| Profile/group exploration | Are there stable response-profile groupings, or dense regions poorly represented by the current archetypes? | Draft a new archetype, reposition targets, merge overlapping concepts, or retain an intentionally fictional cast |
| Question review | Does this question serve the creator's stated goal, and what happens when people answer it? | Revise wording/options, reconsider weights, or remove an unhelpful item |

**Factor analysis and clustering are not interchangeable.** Factor analysis models shared variation across measured variables and can inform candidate dimensions; clustering groups response profiles and can inform candidate archetypes. A continuous distribution may not contain useful discrete groups. A clustering algorithm producing groups does not establish that those groups represent real, stable kinds of people. See the [factor-analysis documentation](https://scikit-learn.org/stable/modules/decomposition.html#factor-analysis) and [clustering/evaluation documentation](https://scikit-learn.org/stable/modules/clustering.html#clustering-performance-evaluation).

Use versioned item-level responses where permitted, not only awarded archetypes. Analyzing final dimension scores can describe the authored scoring system; it cannot independently establish that its dimensions are supported by the underlying responses. Preserve question type, options, response coding, missingness, and branching exposure. Unordered choices must not be treated as ordered numeric measurements simply because the database assigns them IDs. Mixed categorical, ordinal, and continuous items need appropriate methods; ordinary continuous factor analysis is not a universal fit.

“Enough data” should depend on item count, response variation, missingness, sample composition, model assumptions, and stability—not a universal completion threshold. Sparse data should yield a clear limitation or no recommendation. Test stability across resamples and, where feasible, a held-out or later cohort. Keep development and evaluation separate. Report observed sample scope, not population-wide discovery. A six-question entertainment quiz may never support a credible latent-factor analysis; that does not make it a worse entertainment experience.

### Question coaching: goal-aware, advisory, and testable

A creator may optionally state a goal such as “distinguish appetite for novelty from comfort with uncertainty,” along with the intended audience and tone. AI could flag ambiguity, leading language, questions asking two things at once, inaccessible wording, overlapping/missing answer options, and questionable alignment between wording, goal, and assigned weights. Show the relevant passage, explain the concern, and offer a revision that preserves the creator's voice. When no measurement goal is supplied, review clarity and playfulness without pretending to know what the question should measure.

Established [survey-writing guidance](https://www.pewresearch.org/writing-survey-questions/) supports examining wording and response options. AI-assisted question review is not itself novel: [Momentive researchers published a machine-learning approach to detecting double-barreled questions](https://arxiv.org/abs/2203.03545). Personame's opportunity would be the integration with the creator's domain model and actual response patterns, not claiming to invent automated question critique.

Separate **AI editorial advice** from **empirical item evidence**. An AI statement that an item appears relevant is not proof that it measures the intended construct. Observed choice spread, missingness, redundancy, and item relationships can inform review; low variation or a correlation alone does not prove an item is bad or valid. Any item-to-dimension association must account for the item contributing to that dimension's score; otherwise the check can be circular. Consider corrected associations excluding the item, and evaluate revisions prospectively.

Keep recommendations as drafts with supporting evidence and limitations. Authors choose whether to adopt them into a new quiz version; do not automatically rewrite questions, replace dimensions, or change old earned results. Offer small suggestions such as “these profiles might inspire a fifth archetype” rather than a universal scientific-quality score. This is quiet intellectual depth beneath a whimsical experience, not an obligation to turn every quiz into an assessment instrument.

## 2. A collection people choose to display

An earned archetype can be a small creative object: a name, a character, a short piece of writing, its quiz provenance, and an attractive frame. The existing account collection and snapshots are a foundation; curated profiles and showcases are proposed additions.

Start with a profile where people choose featured selves, their order, and which collection entries are public. Offer a small showcase with strong art direction rather than a dense grid of score reports. Each piece links to its originating quiz so discovery can lead to another experience. Keep the result understandable and available before requiring an account; saving and curating can supply the reason to join.

Treat these as identity keepsakes, not status for having a supposedly superior personality. An achievement such as exploring three quiz worlds is different from implying that one archetype is better than another. Do not add arbitrary rarity or random reward mechanics merely to induce repeated attempts.

The intended loop is **discover → feel recognized or entertained → keep → curate/show → invite someone else → discover again**. Every arrow is a hypothesis to measure. The useful signals are voluntary saving, showcase selection, return visits, shared-profile visits, and referred completions—not just generation count or initial quiz volume.

## 3. Art as the object, not decoration

The founder cites [Flame Warriors](https://flamewarriorsguide.com/) as a reference for memorable illustrated personalities. The site was inaccessible to the research tool (HTTP 403); the proposal here interprets the founder's direction rather than claiming a visual review. Create original character concepts and an original art system; the reference is not an instruction to reproduce its characters or artwork.

Prototype one authored world with a coherent cast: distinct silhouettes, expressive poses, meaningful props, recognizable palettes, and short memorable descriptions. A result should still read at avatar/card size and feel worth displaying at larger size. Preserve Personame's quiz-book, dimension-facet, and circular archetype languages.

AI is most useful first as **an authoring assistant**: suggest a coherent cast, draft art briefs from archetype definitions, generate variations, and let the author choose the approved canonical image. Avoid treating raw participant answers or inferred sensitive traits as necessary image prompts. Keep scoring deterministic and separate from image generation.

Generate once per approved archetype/version, store the asset, and reuse it across completions. Later, test optional personal variants that preserve the recognizable base character. This makes consistency, latency, and cost more tractable than unconditional per-completion generation. Provider terms, rights to inputs/outputs, content handling, costs, and failure behavior still need a concrete implementation decision.

Persist the chosen art and attribution/provenance with the result snapshot; later regeneration must not silently replace someone's keepsake. Provide existing artwork as a fallback and separate artifact rendering from provider availability. Account ownership, explicit public sharing, deletion controls, and safe image/metadata handling matter before expanding public profiles.

## 4. Product sequence and commercial options

1. **Prove the object:** one compelling quiz world with a coherent illustrated cast and polished result artifacts. Observe whether people want to keep and show them.
2. **Prove the collection:** a minimal curated showcase with explicit visibility and links back to quizzes. Measure return use and actual referrals.
3. **Prove the studio:** model diagnostics and small simulations help creators explain and improve their quizzes. Measure comprehension and time to a satisfactory publish, not dashboard clicks.
4. **Test paid creative value:** advanced model inspection, art-authoring capacity, showcase cosmetics, or premium creator presentation. These are experiments; free core results and existing earned selves remain available.
5. **Follow business pull:** add branding, optional demographic fields, and governed reporting when a concrete customer requests a useful workflow and shows willingness to pay. Avoid building a generic marketing suite speculatively.

The technical UI for a custom logo or demographic question can be small. Reliable reporting also needs defined cohorts, reproducible versions, clear data use, permissions, and operating support. That distinction affects implementation quality, not whether these are sensible expansion opportunities. Existing commercial estimates cover that conditional workstream, not the new core art/profile/diagnostic roadmap.

Revenue need not come from a single audience. Creator tooling can serve hobbyists and businesses; optional artistic personalization can serve collectors. Evaluate generation cost, willingness to pay, and repeat demand separately. Do not assume the earlier proposed $29/$99 plans or service pilots are already the right packages for this revised emphasis.

## 5. The uncertainty worth resolving

The key question is not whether another builder has quizzes or AI. It is whether **people care more about a Personame result, keep a growing collection, and inspire others to create or discover**—and whether creators value a clearer model enough to use the studio repeatedly.

Observe a small prototype cohort and several creators before expanding scope. Compare a plain-text result with the illustrated result/showcase experience, and a basic builder with the diagnostic workflow. Record what people actually save, display, revisit, understand, and share. Include the opportunity to do nothing; prompted praise is weak evidence. Business buyer interviews can proceed opportunistically, without making business demand the gate for this core creative project.
