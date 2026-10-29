# Directional space metrics

The Analyze UI uses plain-language labels and short practical help. The in-app technical reference at `/reference/space-metrics` preserves the definitions below, with direct links from each metric. These presentation changes do not alter the calculations.

Each Analyze card includes three deterministic diagnostics, a numeric value, an explicit range, and an expandable explanation. Ranges are product heuristics chosen for an initial design pass. They are not externally validated psychological or statistical quality standards. The one scoring integrity requirement is that every archetype needs an active target: the current matcher otherwise gives it zero distance.

All metrics use underlying 0–100 values, regardless of display-scale preference. Missing inputs produce unavailable values rather than defaults or favorable zeroes. Counts and exact distances are separated from probe-based estimates. These numbers are not participant analytics.

## Archetype atlas

Geometry is computed over **all** dimensions, independently of the current chart projection, selected archetype, size encoding or authored relevance. RMS Euclidean distance gives equal weight to every dimension and keeps distances on a 0–100 scale:

```
d(x,y) = sqrt(Σ (x_d − y_d)² / D)
```

All archetypes must have valid targets on every dimension. Otherwise geometric metrics remain unavailable and the card reports the count of complete prototypes. A zero-importance target is still a geometric coordinate; it does not mean the axis matters to matching.

| Metric | Number | Direction and initial ranges |
| --- | --- | --- |
| Minimum separation | Exact minimum pairwise RMS distance | Higher → fewer near-duplicates. <10 points crowded; 10–<20 close; ≥20 distinct. Needs two archetypes. |
| Space within reach | Percentage of fixed cube probes within 20 RMS points of any prototype | Higher → broader geometric coverage. <50% sparse; 50–<80% patchy; ≥80% broad. |
| Territory balance | `100 × exp(−Σ p log p) / K`, using nearest-prototype probe shares | Higher → more even geometric territories. <50% concentrated; 50–<80% uneven; ≥80% even. |

With one to three dimensions, use fixed midpoint grids: 256 cells in 1D, 32 cells per axis in 2D (1,024 probes), and 12 cells per axis in 3D (1,728 probes). For four or more dimensions, use 1,024 centered Latin-hypercube probes: deterministic xorshift32 seed, Fisher–Yates marginal permutations, one sample per equal-width stratum on every axis. [SciPy's Latin-hypercube reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.qmc.LatinHypercube.html) describes this marginal stratification and the need to fix the generator for reproducibility. No SciPy runtime is needed in the application.

Nearest-distance ties share probe weight equally, avoiding authored-order bias in the geometric metric. Exact duplicate positions form a single territory; the denominator still includes all archetypes, so duplication cannot manufacture high balance. Geometric territories deliberately differ from production matching, which uses archetype-specific relevance and authored-order ties.

These probes estimate broad space coverage and territory sizes; they do not enumerate the cube or bound the worst uncovered gap. Especially in higher dimensions, a fixed set can miss small regions. Thresholds are not calibrated to dimension count or number of prototypes: compare models with similar D and K. Fewer prototypes in more dimensions naturally leave more of the full cube uncovered. Broad coverage may be unnecessary if questions reach only a narrow part of that cube.

Example: two far-apart corner prototypes can score well on separation and poorly on coverage. Four near-identical prototypes score poorly on separation even if their collective region is useful. Read the metrics together, not as a single grade.

## Targets & Importance

| Metric | Number | Direction and initial ranges |
| --- | --- | --- |
| Target coverage | Valid target count / (dimensions × archetypes) × 100 | Higher → more fully specified profiles. <80% many gaps; 80–<100% some gaps; 100% complete. |
| Active archetypes | Archetypes with at least one valid positive-relevance target / archetypes × 100 | 100% all active; anything below 100% needs attention. |
| Dimension participation | Dimensions used at positive relevance by at least one archetype / dimensions × 100 | Higher → fewer ignored matching axes. <80% many unused; 80–<100% some unused; 100% all used. |

All three are exact counts. Targets must be finite, in [0,100], and refer to known dimensions. Completeness counts zero-importance targets; activity and participation do not. Intentional omissions and informational dimensions can be reasonable. The card calls these heuristics rather than treating every missing pair as an error.

## Question space

| Metric | Number | Direction and initial ranges |
| --- | --- | --- |
| Reachable axis span | Mean reachable interval width / full axis width × 100 | Higher → broader marginal reach. <40% narrow; 40–<70% limited; ≥70% broad. |
| Outcome balance | Effective outcome diversity / archetype count × 100 | Higher → more even outcomes. <50% concentrated; 50–<80% uneven; ≥80% even. |
| Clamped scores | Mean fraction of answer paths with raw scores below 0 or above 100 × 100 | Lower → more raw score distinctions preserved. ≤10% low; >10–30% elevated; >30% high. |

Reachable axis span is exact from answer extrema. It measures interval width, not filled volume: an interval can have holes, and marginal extremes may be mutually incompatible. A fixed dimension contributes zero span.

Outcome balance and clamping use the existing exact enumeration or reproducible fixed-seed answer-path sample. They remain deterministic for a fixed model but can still have simulation error. The outcome bars retain Wilson intervals; the diagnostic bands do not override those uncertainties. A value near a heuristic cutoff should not be treated as a decisive difference.

Rare outcomes, focused questions, and endpoint emphasis can all be intentional. These directions assume the author's goal is a broad, discriminating quiz with a varied result collection, not that every quiz must have equal outcomes. See [question-space assumptions and calculations](QUESTION_SPACE_ANALYSIS.md) for the equal-answer prior, optional-answer policy, actual scoring functions, and further research.

## Importance comparisons (replaces the three completeness tiles)

The Targets & Importance card now shows:

| Metric | Calculation | Interpretation |
| --- | --- | --- |
| Dimension influence | Average the within-archetype normalized importance profiles, then `100 × H(mean profile) / ln(D)` | 0 = one dimension gets all attention; 100 = all dimensions get equal shares. ≥80 balanced, 50–<80 uneven, <50 concentrated. D=1 is 100 by convention. |
| Archetype focus | Median `exp(H(profile))` across active archetypes | Effective number of defining dimensions, displayed as “2.3 of 5.” Includes the range and per-archetype values. A neutral descriptor splits the interval from 1 to D effective dimensions into thirds: focused, mixed and broad. With D=1 it says single dimension. Neither end is inherently preferable. |
| Importance variety | Mean over active archetype pairs of `100 × ½ × Σ |p_ad − p_bd|` | 0 = identical priority profiles; 100 = pairwise disjoint priorities. ≥30 varied, 10–<30 some variety, <10 similar. An average of 100 is not attainable for every combination of D and K. |

Here `p_ad = positive importance_ad / sum of positive importance_a` and `H(p) = −Σ p ln p`. Only valid targets on known dimensions contribute. Every active archetype gets equal weight; inactive ones are excluded and reported as setup warnings. Multiplying all weights within an archetype by the same positive constant leaves all three metrics unchanged, matching the production distance normalization. Target coordinate changes alone do not change these importance summaries.

The colored overview bar shows each dimension’s mean share. The heatmap shows normalized shares with a common purple shading scale, while dimension-colored target bars retain coordinate values and the original importance setting remains visible. Each active row totals 100% before rounding. Missing targets use hatching; zero importance stays white. Per-archetype focus appears beside the archetype identity. These are authored priorities, not estimates of actual influence on winners.

The earlier profile-completeness, ready-archetype and dimension-use calculations are now conditional setup warnings, not headline quality metrics. Their definitions above remain useful as integrity checks. All thresholds remain directional product heuristics; shared priorities and narrow focus can be deliberate.
