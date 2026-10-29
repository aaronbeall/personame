# Scoring model (version 2)

Personame separates answer positions, question influence, and archetype importance.

## Authoring

Map a question to the dimensions it actually measures. For each mapped dimension,
set each answer's suggested position from 0 (low endpoint) to 100 (high endpoint).
50 explicitly means a neutral answer; an unmapped dimension means unrelated.
Each question × dimension influence defaults to 1; 2 counts twice as much as 1
for that dimension. The same question can strongly measure one dimension and weakly measure another. Its influence is shared automatically with the other answered questions
measuring that dimension. Creators do not budget point contributions by quiz length.

Multiple choice uses the selected position. Slider and scale positions interpolate
between the two endpoint answers; scale-point weights are ignored. Missing answer
positions within an otherwise mapped question default to 50. New editor mappings
initialize every scored option at 50, ready for the creator to adjust.

## Combining answers

For each dimension:

    score = sum(answer position × question × dimension influence) / sum(question × dimension influence)

Only answered questions mapped to that dimension enter the numerator and denominator.
Skipped optional questions contribute neither. Required questions must be answered.
Doubling an entire set of questions with the same influences leaves the score unchanged.
Adding a new, different question can change the score, as it introduces new evidence.
There is no additive saturation or need to shrink weights as the quiz grows.

Scores carry an evidence count and summed influence. A dimension without evidence
has a compatibility fallback value of 50, but is labeled **Not measured** and excluded
from matching. It does not become a fake neutral observation. New normalized
DimensionScore database rows are only saved for measured dimensions; the result
snapshot includes unmeasured dimensions explicitly. Historical snapshots without
evidence metadata retain their original presentation.

## Matching archetypes

Matching uses importance-weighted RMS distance on observed dimensions:

    distance = sqrt(sum(importance × (score − target)^2) / sum(observed importance))
    match points = 100 − distance

Archetypes without any observed, positive-importance targets are excluded. If none
can be matched, the participant must answer more mapped questions before a result
can be produced. Missing dimensions do not penalize or support an archetype.

The headline is the nearest eligible archetype. Stable archetype IDs break exact ties
reproducibly, rather than letting rearranging cards change results. Saved snapshots
include the next two matches, exact-tie flags, and the first-to-second distance gap.
A gap below 5 points is presented as a close call. This is a product heuristic,
not a probability, statistical confidence interval, or validated quality threshold.
Question counts show available evidence; they do not establish reliability.

## Analyze

The equal-answer simulation uses the same weighted-average calculation and ranking
as participant scoring. Marginal reachable bounds average per-question minima and
maxima using influence; they do not imply all dimensions' extremes are attainable together.
Question-to-dimension flow thickness reflects each question's possible movement of
the final score, including its relative influence. Outcome shares assume independent,
equally likely answers and answer all optional questions.

- **Close results:** share of paths with a first-to-second gap below 5 points.
- **One-answer sensitivity:** remove one question on each tested path (cycling through
  questions), then compare the winner. Exclude comparisons without enough remaining
  evidence. This is a bounded stress test, not full leave-one-out enumeration or
  empirical test–retest reliability. Higher values signal greater dependence on a
  single response; they are not automatically bad.

See `/reference/space-metrics` for formulas and heuristic interpretation bands.

## Existing quizzes and rollout

Apply Prisma migrations before deploying the new application. Migration
`20261029000000_normalized_question_scoring` converts existing answer contributions
into bounded positions and relative influence, removes unrelated all-zero mappings,
fills missing options with neutral positions, and updates quiz revisions so attempts
started before conversion cannot submit against a changed model. For each question,
M = max(1, largest absolute scored contribution), position = 50 + 50 × old value / M,
and influence = M. This preserves relative signed signals within the new average;
it deliberately does not preserve additive saturation or guarantee identical outcomes.
Ignored scale-point contributions are removed. Existing result snapshots and stored
scores are never recalculated. Catalog YAML version 2 stores normalized positions
and `dimensionInfluences` (a mapping of dimension keys to positive influences) directly; re-running catalog seeding does not overwrite quizzes.

## Quiet analytical depth

These design tools measure the behavior of the authored model, not whether it measures
real-world traits accurately. Future empirical work should use versioned item responses
to study test–retest stability, item discrimination, redundant questions and factor
structure; use held-out responses when proposing new archetypes. Factor analysis
would describe dimensional structure, while clustering or prototype fitting would
suggest archetype locations. AI question reviews may assist writing and alignment
with a creator's goals, but do not validate the instrument. No such empirical claims
are made by the current simulation or evidence counts.

Migration `20261029010000_question_dimension_influence` copies every legacy question influence onto each mapped dimension, removes the old shared field, and preserves normalized scoring behavior until authors change individual influences. The editor places each influence control beside its selected dimension tag. Removing a dimension removes its question influence metadata too.
