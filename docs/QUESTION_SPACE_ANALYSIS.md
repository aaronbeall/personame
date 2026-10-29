# Question-space diagnostics

Research and implementation notes, 28 October 2026.

The Analyze workspace now has three independent cards: the archetype atlas, Targets & Importance, and Your question space. These diagnostics inspect authored scoring. They do not use participant data, call AI services, change scoring, or write analytics to the database.

## Visual design and research decisions

| Question | Visualization | Why / limits |
| --- | --- | --- |
| Which questions affect which dimensions and archetypes? | Selectable three-column influence graph | Trace a question through variable dimension contributions into archetype relevance. Curved connections convey relationships without implying participant movement. |
| What scores can the quiz actually produce? | Per-dimension range + histogram + target diamonds | Shows fixed dimensions, score concentration, saturation and misplaced target coordinates. Each marginal range is exact; joint attainability is a separate problem. |
| Are particular selves favored by the model? | Outcome bars with simulation intervals | Uses the actual matching calculation. A uniform answer prior does not imply uniform scores or uniform archetype outcomes. |
| How well are archetype targets covered? | Importance-weighted target-axis coverage beside each outcome | Distinguishes coordinate coverage from winning a region. A target outside reachable bounds can still be the nearest archetype. A target inside all bounds can still be jointly impossible. |

[D3's Sankey documentation](https://github.com/d3/d3-sankey) defines links with quantitative values and node flow values. We use a relationship diagram rather than a conventional Sankey: question contribution swing and archetype relevance are different units, and there is no conserved quantity flowing through dimensions. Left widths encode contribution range; right widths encode relevance. This distinction is stated in the card. Constant contributions remain visible in the selected question details but have no answer-varying link.

[NIST's exploratory-analysis guidance](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm) describes histograms as useful for assessing distribution shape. Ten score bins expose concentration and endpoint pileups without suggesting that the resulting scores follow a normal distribution. Bin intervals are [0,10), [10,20), …, [90,100], including fractional scores.

[NIST's Wilson interval guidance](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) supplies the binomial proportion interval used for simulated outcome shares. Unlike a simple symmetric normal interval, it behaves sensibly for zero wins and all wins. Intervals are marginal 95% intervals for each archetype, not a simultaneous 95% guarantee across the whole chart. They measure simulation error under the specified answer prior, not uncertainty about real users.

[SciPy's entropy documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.entropy.html) gives Shannon entropy H = −Σp log p. We display exp(H) as the effective number of equally common outcomes: 1 for one winner, K for K equally common winners. This is descriptive, not a quality score. Intentionally rare archetypes can be good design.

## Actual scoring and baseline

The analyzer imports `calculateDimensionScores` and `findBestArchetype`, the same functions used by production scoring. Tests compare complete mixed-type answer spaces against `scoreQuiz`.

- Include questions only on visible pages that are neither cover nor results pages.
- Answer every included question, including optional questions. Skipping is not included as an extra equally likely answer.
- Multiple choice: each option has probability 1 / option count. Missing dimension weights contribute zero.
- Scale: each selectable point has equal probability. The first two stored answers define endpoint weights; subsequent point weights are not used by production scoring.
- Slider: each integer position 0 through 100 has probability 1 / 101, matching the current player's step. This is a discrete model, not a continuous slider integral.
- Questions are independent under this baseline.
- Start each dimension at 50, sum contributions, clamp once to [0,100].
- Match by each archetype's relevance-weighted root mean square distance, as implemented in production. Exact ties select the first archetype in authored order.
- Archetypes with no active target weights get zero distance in the current matcher. This potentially dominant behavior is flagged, not silently corrected by the analysis.

For question q and dimension d:

```
min_qd = minimum contribution among selectable answers
max_qd = maximum contribution among selectable answers
swing_qd = max_qd - min_qd
range_d = [clamp(50 + Σ min_qd), clamp(50 + Σ max_qd)]
```

A varying-question count uses swing > 0. A constant nonzero contribution shifts the result but cannot distinguish participants. Per-axis extremes are exact because the baseline permits any combination of answers; extremes for different dimensions need not be jointly attainable. Even when range endpoints are attainable, scores inside the interval may have gaps.

For archetype a, active target-axis coverage is:

```
Σ relevance_ad × indicator(target_ad lies in range_d)
---------------------------------------------------
               Σ relevance_ad
```

Only positive relevance on known dimensions enters the denominator. With no active targets, coverage is unspecified. This measures covered target coordinates, not discriminative power, question wording, psychometric quality, match probability, or joint target reachability.

Clamping share is the fraction of paths with raw scores strictly below 0 or above 100 on each dimension. A raw score exactly at an endpoint is not counted as clamped.

## Enumeration, sampling and runtime

Let P be the product of per-question answer counts. Estimate work per path from question × dimension count plus the number of archetype targets. The enumeration budget is at most 8,192 paths, reduced for complex models against a 4,000,000-work-unit heuristic; the minimum budget is 128. If P fits, enumerate every path. Otherwise draw at most 4,096 independent paths using a fixed xorshift32 seed. The work heuristic bounds ordinary analysis but is not a hard wall-clock guarantee; preparing answer vectors also costs time and memory proportional to authored data.

Computation runs in a Web Worker and is terminated when the card unmounts or the quiz changes. Only the active Analyze tab instantiates it. No API calls, participant submissions or database writes are made. Large question lists page eight nodes at a time; the influence graph scrolls within its own region. Monte Carlo output is deterministic across reloads for a fixed quiz and algorithm, simplifying before/after inspection.

For sampled outcome i with k wins in n paths, p = k/n. Wilson center and half-width, z = 1.96:

```
center = (p + z²/(2n)) / (1 + z²/n)
half   = z × sqrt(p(1−p)/n + z²/(4n²)) / (1 + z²/n)
```

Zero sampled wins means “not seen,” not impossible. Zero wins in a fully enumerated answer space means no complete answer combination wins under this baseline. Optional skips could still alter that conclusion. No estimates are produced for empty or malformed question spaces.

## Useful next diagnostics

These are proposals, not features already implemented:

1. **Question sensitivity.** Resample one answer while holding the others fixed; estimate how often the winning archetype changes and the average score displacement. This is a model-reliance diagnostic, not question validity. [Scikit-learn's permutation-importance guide](https://scikit-learn.org/stable/modules/permutation_importance.html) emphasizes the distinction between model reliance and intrinsic predictive value, and warns about correlated features. Our product would measure winner changes rather than supervised prediction accuracy.
2. **Redundancy and coupled dimensions.** Heatmaps of contribution-vector similarity and baseline score correlation identify duplicated mappings and mechanically linked axes. Compare these with observed response correlations later. Simulated correlations follow the authored weights; they do not reveal latent human traits.
3. **Reachable score cloud.** Overlay sampled score vectors on the existing atlas, retaining the same answer-prior assumptions. An empty-looking region may still have small nonzero probability.
4. **Boundary sensitivity.** Track the gap between the best and second-best weighted match distances, plus how often small answer changes swap winners. Large unstable regions may indicate overlapping prototypes; ties should expose authored-order dependence.
5. **Observed versus baseline distributions.** With consented real response data, compare choice frequencies, missingness, completion/dropoff by question, scores and archetype shares. Version the scoring model and report sample sizes; do not pool changed quizzes without an explicit policy.
6. **Construct exploration.** [Factor analysis](https://scikit-learn.org/stable/modules/decomposition.html#factor-analysis) models shared variation in observed data. It needs an appropriate response representation, missing-data handling and measurement assumptions. Mixed categorical/ordinal items require suitable methods rather than treating option IDs as continuous values. Use holdout or replication checks, loading stability and uncertainty; do not infer constructs from synthetic uniform answers. Avoid universal “enough responses” thresholds.
7. **Wording review.** AI can suggest checks for double-barreled prompts, leading language, mismatched endpoints and reading complexity against the author's stated goal. Keep those suggestions editable and distinct from empirical item quality. A whimsical quiz need not claim to measure a validated trait.
