# Editable starter quizzes

Edit **`content/seed-quizzes.json`** in any text editor. It contains eight complete, original quizzes: weekend travel, creativity, dinner parties, fantasy taverns, city exploring, space crews, teamwork, and rainy days. Each has two dimensions, four archetypes, and six questions covering multiple choice, slider, and scale. These are playful reflections, not validated psychological assessments.

## Changing the grading

- A dimension's `key` is its reference in `targets` and `weights`. Rename every reference if you change it.
- Scores begin at **50**. Selected answer weights add or subtract points; the final total is clamped to **0–100**.
- Each archetype has a target of **0–100 for every dimension**. The closest profile wins. Equal distances use the order in this file. Catalog archetypes give each dimension equal relevance.
- Multiple-choice questions score the selected answer's `weights`.
- A slider has exactly two answers: low and high endpoints. The engine interpolates their weights.
- A scale has two weighted endpoints, **followed by** the visible scale choices. Choice positions interpolate the endpoint weights; visible choices have empty `weights`.
- Omitted dimension weights contribute zero. Questions default to required; add `"required": false` to make one optional.
- Array order determines presentation. Slugs must be unique.

The supplied weights are deliberately modest: two multiple-choice questions contribute up to 24 points in each direction, and one slider/scale adds up to 16. The resulting range is 10–90; archetype targets at 15/85 remain reachable without one answer deciding everything.

## Validate and import

```sh
npm run catalog:validate
npm run test:unit
SEED_CREATOR_EMAIL=you@example.com npm run catalog:seed
```

Sign in once first so your creator account exists. Importing requires the configured database and applies each new quiz in a transaction. Quizzes are **private drafts** owned by that account: review them in Your quizzes, then publish from the normal workflow. Existing slugs are skipped, never overwritten; rerunning does not duplicate quizzes or change results.

Edits to this file affect future imports, not existing database records. To revise an imported quiz, use its editor. To import a separate variation, use a new slug. The older `db:seed` remains a separate development fixture script; use `catalog:seed` for this catalog.

`tests/catalog.unit.test.ts` validates references and scoring rules and checks every low/high response combination to ensure all 32 supplied archetypes can be reached. Changing targets can intentionally make that reachability test fail; adjust questions and targets together.
