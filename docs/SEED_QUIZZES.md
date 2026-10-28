# Editable starter quizzes

Edit **`content/seed-quizzes.yaml`** in any text editor. It contains eight complete, original quizzes: weekend travel, creativity, dinner parties, fantasy taverns, city exploring, space crews, teamwork, and rainy days. They range from 2–5 dimensions, 3–7 archetypes, and 6–15 questions, covering multiple choice, slider, and scale. These are playful reflections, not validated psychological assessments.

| Quiz | Dimensions | Archetypes | Questions |
| --- | ---: | ---: | ---: |
| Weekend wanderer | 2 | 4 | 6 |
| Creative sidekick | 3 | 5 | 9 |
| Dinner party | 3 | 3 | 9 |
| Fantasy tavern | 4 | 6 | 12 |
| City after dark | 2 | 3 | 6 |
| Space crew | 5 | 7 | 15 |
| Team project | 4 | 5 | 12 |
| Rainy day | 3 | 4 | 9 |

The longer quizzes add distinct dimensions such as persistence, presentation, allegiance, wonder, stewardship, time horizon, collaboration, and nostalgia. Archetypes have individually authored profiles; they do not require every possible combination of high/low scores to become a separate result.

## Appearance and editing

YAML supports comments and multiline text. Quote hex colors: `#` starts a YAML comment otherwise. Themes are stored as ordered pairs, for example `color: "#2563eb,#7c3aed"` (Aurora); choose a known pair from `lib/colors.ts`.

- Every quiz has an emoji and theme for its cover.
- Dimensions include a description, emoji, endpoint emoji, and a solid color used by their tags and bars. Endpoint labels use adjectives so the value label reads naturally, for example “Very adventurous.”
- Archetypes each have a distinct themed badge, descriptive text, emoji, targets, and varied importance weights.
- Questions and answer options can include `emoji` and `color` too.
- `displayScale` accepts `PERCENT_ASCENDING`, `PERCENT_DESCENDING`, or `BIPOLAR`. It is persisted for future display formatting; current scoring and rendering still use 0–100. Several quizzes include bipolar metadata without changing their grading.

## Where to see them

The YAML file is source material, not an automatically visible gallery. After importing, sign into the same creator account and visit **Your quizzes** at `/dashboard`. Open a draft to inspect its Name, Dimensions, Archetypes, and Questions, then use **Preview & publish** to try the participant flow. The eight titles cover weekend wandering, creative sidekicks, dinner parties, fantasy taverns, city nights, space crews, team projects, and rainy days.

Imports are local to the database configured in `.env`. They do not deploy or publish anything. Drafts do not appear in the public Explore section. Publish a quiz through its normal workflow to make it public and get its `/quiz/<slug>` link. A deployed environment needs its own import with that environment’s database and creator account.

## Changing the grading

- A dimension's `key` is its reference in `targets` and `weights`. Rename every reference if you change it.
- Scores begin at **50**. Selected answer weights add or subtract points; the final total is clamped to **0–100**.
- Each archetype has a target of **0–100 for every dimension**. The closest profile wins. Equal distances use the order in this file. The optional `relevance` map assigns each dimension an importance from 0 to 1 (omitted entries default to 1). At least one dimension must matter.
- Multiple-choice questions score the selected answer's `weights`.
- A slider has exactly two answers: low and high endpoints. The engine interpolates their weights.
- A scale has two weighted endpoints, **followed by** the visible scale choices. Choice positions interpolate the endpoint weights; visible choices have empty `weights`.
- Omitted dimension weights contribute zero. Questions default to required; add `required: false` to make one optional.
- Array order determines presentation. Slugs must be unique.

Each dimension receives three scored prompts. Their maximum contributions are 12, 12, and 16 points in either direction, giving a total range of 10–90. Archetype targets at 15/85 remain reachable without one answer deciding everything. Longer quizzes introduce additional dimensions rather than simply repeating more questions on the same two scales.

## Validate and import

```sh
npm run catalog:validate
npm run test:unit
SEED_CREATOR_EMAIL=you@example.com npm run catalog:seed
```

Sign in once first so your creator account exists. Importing requires the configured database and applies each new quiz in a transaction. Quizzes are **private drafts** owned by that account: review them in Your quizzes, then publish from the normal workflow. Existing slugs are skipped, never overwritten; rerunning does not duplicate quizzes or change results.

Edits to this file affect future imports, not existing database records. To revise an imported quiz, use its editor. To import a separate variation, use a new slug. The older `db:seed` remains a separate development fixture script; use `catalog:seed` for this catalog.

`tests/catalog.unit.test.ts` validates references and scoring rules and checks every low/high response combination to ensure all 37 supplied archetypes can be reached. Changing targets can intentionally make that reachability test fail; adjust questions and targets together.
