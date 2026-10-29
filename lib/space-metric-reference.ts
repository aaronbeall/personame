export const SPACE_METRIC_REFERENCE = {
  "Minimum separation": {
    "id": "minimum-separation",
    "title": "Archetype differences",
    "detail": "Exact closest-pair RMS distance across all dimensions, on a 0–100 scale. Higher means fewer near-duplicates; it does not guarantee good coverage. Needs at least two fully specified archetypes.",
    "ranges": "≥20 distinct · 10–<20 close · <10 crowded"
  },
  "Space within reach": {
    "id": "space-within-reach",
    "title": "Map coverage",
    "detail": "Share of fixed probes in the full 0–100 dimension cube within 20 RMS points of any archetype. Higher means broader geometric coverage. This samples the cube, not the reachable answer distribution or worst-case gaps. All targets must be specified.",
    "ranges": "≥80% broad · 50–<80% patchy · <50% sparse"
  },
  "Territory balance": {
    "id": "territory-balance",
    "title": "Map balance",
    "detail": "Effective number of nearest-prototype territories divided by archetype count. Uses fixed probes, equal axis weights and shared boundary ties. Duplicate positions share one territory. Higher means more evenly sized regions, not better real-world outcome odds.",
    "ranges": "≥80% even · 50–<80% uneven · <50% concentrated"
  },
  "Target coverage": {
    "id": "target-coverage",
    "title": "Profile completeness",
    "detail": "Fraction of dimension × archetype pairs with a valid target, including zero-importance targets. Aim for 100% if every archetype should describe every axis; deliberate omissions are allowed.",
    "ranges": "100% complete · 80–<100% some gaps · <80% many gaps"
  },
  "Active archetypes": {
    "id": "active-archetypes",
    "title": "Ready archetypes",
    "detail": "Fraction of archetypes with at least one valid, positive-importance target on a known dimension. Every archetype should have one: the scorer excludes archetypes without observed, positive-importance targets. This is a scoring integrity check.",
    "ranges": "100% all active · <100% needs attention"
  },
  "Dimension participation": {
    "id": "dimension-participation",
    "title": "Dimensions used",
    "detail": "Fraction of dimensions used with positive importance by at least one archetype. Higher means fewer dimensions ignored by matching. Intentionally informational dimensions can be left out.",
    "ranges": "100% all used · 80–<100% some unused · <80% many unused"
  },
  "Reachable axis span": {
    "id": "reachable-axis-span",
    "title": "Score range",
    "detail": "Mean reachable interval width as a fraction of the 0–100 axis range. Exact under the all-questions-answered model. Higher means broader marginal reach, but intervals can have holes and axis extremes need not be jointly attainable.",
    "ranges": "≥70% broad · 40–<70% limited · <40% narrow"
  },
  "Outcome balance": {
    "id": "outcome-balance",
    "title": "Result balance",
    "detail": "Effective outcome diversity divided by archetype count. Higher means more even outcomes under independent, equally likely answers. Uses the same exact enumeration or fixed-seed estimate as the outcome bars. Rare outcomes can be intentional.",
    "ranges": "≥80% even · 50–<80% uneven · <50% concentrated"
  },
  "Close results": {
    "id": "close-results", "title": "Close results",
    "detail": "Share of enumerated or sampled answer paths whose two nearest eligible archetypes are less than 5 RMS-distance points apart. The 5-point margin and verdict bands are product heuristics, not calibrated confidence or evidence of validity. Exact ties use stable archetype IDs for a reproducible headline and are exposed in saved results.",
    "ranges": "≤20% distinct · >20–50% some overlap · >50% much overlap. Overlap can be intentional."
  },
  "One-answer sensitivity": {
    "id": "one-answer-sensitivity", "title": "One-answer sensitivity",
    "detail": "Omit one question per answer path, cycling through authored questions by path index, and compare the winner with the full path. Divide changed winners by comparisons with an eligible winner after omission. This bounded deterministic stress test is not a complete leave-one-out enumeration and is not empirical test–retest reliability. Unmeasured dimensions are excluded in both matches.",
    "ranges": "≤10% steady · >10–30% some changes · >30% sensitive. Product heuristics, not validated cutoffs."
  },
  "Dimension influence": {
    "id": "dimension-influence",
    "title": "Dimension influence",
    "detail": "Normalize positive importance weights within each active archetype to sum to one, then average those shares across active archetypes. Influence balance is 100 × Shannon entropy of the mean shares / ln(dimension count). Zero means one dimension gets all attention; 100 means equal shares. With one used dimension the balance is 100 by convention. This measures balance of authored priorities, not observed or simulated causal influence on winners. Inactive archetypes are excluded and reported as setup issues.",
    "ranges": "≥80% balanced · 50–<80% uneven · <50% concentrated"
  },
  "Archetype focus": {
    "id": "archetype-focus",
    "title": "Archetype focus",
    "detail": "For each active archetype, compute exp(−Σ p_d ln(p_d)) from its normalized importance shares. This is the effective number of equally weighted dimensions. Display the median across active archetypes, with per-archetype values in the table. One means a single dimension carries all importance; D means all D dimensions have equal importance. This is descriptive, not a quality grade.",
    "ranges": "Between 1 and D effective dimensions: first third focused · middle third mixed · last third broad. D=1 is labeled single dimension. All are valid design choices."
  },
  "Importance variety": {
    "id": "importance-variety",
    "title": "Importance variety",
    "detail": "Mean pairwise importance difference among active archetypes, computed as 100 × ½ × Σ |p_ad − p_bd| for each pair. Zero means identical normalized priority profiles; 100 means every pair puts weight on disjoint dimensions. The maximum attainable mean depends on the number of archetypes and dimensions. This ignores target coordinates and is not a measure of outcome separation.",
    "ranges": "≥30% varied · 10–<30% some variety · <10% similar. Shared priorities can be intentional."
  }
} as const
