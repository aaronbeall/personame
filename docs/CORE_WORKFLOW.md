# Personame core workflow

## Creator flow

Sign in → Your quizzes → Create a quiz → Dimensions → Archetypes → Questions → Preview & publish.

- Each editor saves a draft. Existing dimension, archetype, question, page, and answer IDs remain stable when edited.
- Only the quiz creator can load editor data, save changes, preview a draft, or publish it.
- Leaving an edited page warns about unsaved changes; Name, Dimensions, and Archetypes support saving in place or saving and continuing. Create always starts fresh with a random emoji and palette color. Use Save to keep a named draft in Your quizzes; unfinished naming forms are not restored from local storage.
- Saving any part of a live quiz returns it to draft. Review and publish again when the changes are ready. The public quiz URL stays the same.
- Publishing requires at least one dimension, two meaningful archetypes, a visible question, valid answer options, and non-zero question coverage for every dimension.
- The full participant preview uses the same question controls and scoring routine as the published quiz. It never saves a completion.

## Participant flow

Open a published quiz link → cover → visible question pages → saved result.

Hidden pages, cover questions, and result-page questions are excluded from scoring. Required questions must be answered before continuing; optional questions can be skipped. A slider starts visually at 50 but requires interaction or an explicit “Use midpoint” action to count as an answer.

Responses are kept in session storage for the current tab and quiz revision. If the quiz changes before submission, the server asks the participant to reload rather than score against a different definition. Submissions use a stable UUID so retrying a request does not create a second result or increment completions twice. Public payloads exclude scoring weights.

Results have unguessable links and include a snapshot of the matched archetype and dimension scores. Anyone with a result link can view it; account details and individual answers are not returned by that endpoint. Existing public result links remain usable after a quiz returns to draft or closes. Deleting or editing an answer/archetype does not change the saved result snapshot.

## Scoring

All dimensions start at 50. Contributions are added and clamped to 0–100 once, at the end.

- **Multiple choice:** add the selected answer’s weights.
- **Slider:** interpolate linearly between the low and high endpoint weights using the 0–100 slider value.
- **Scale:** interpolate between the same endpoints using the selected point’s relative position. Labels/emojis decorate the points; endpoint weights define the scoring.
- **Skipped optional question:** contributes zero.

The closest archetype minimizes the relevance-weighted root-mean-square distance from the resulting dimension scores. Equal-distance ties use archetype order. Scores represent the creator’s dimensions, not population percentiles.

## Artwork and UI

The shared page intro, five-step builder navigation, surfaces, controls, empty/error states, and participant renderer are reused across the workflow. Optimized WebP accents in `public/images/decor` come from the existing generated illustrations in `art/`: creation, science, tree house, galaxy expansion, islands, and party. No new image generation is required.

## Local verification

With `.env` configured and PostgreSQL available:

```sh
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Checks:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Run the integration test against a **local** server and database:

```sh
PERSONAME_TEST_URL=http://localhost:3000 npm test
```

It creates isolated users/quizzes/sessions and removes only those fixtures afterward. Coverage includes ownership, ID preservation, weights surviving edits, publication checks, public payloads, preview isolation, required-answer validation, idempotent submissions, draft visibility, and historical results surviving deleted definitions.

The result-preservation migration adds a result snapshot and submission key, and changes deleted answer/archetype references to `SET NULL`. It does not delete existing results. Results created before snapshots existed are not exposed by the new result-link endpoint.

## Follow-up scope

Analytics, demographic comparisons, rankings, social integrations, quiz templates, and versioned simultaneous live/draft editing remain separate features. Your quizzes manages created quizzes at `/quizzes`; Your many selves at `/selves` lists discovered archetypes and unfinished attempts.

### Builder drafts

Name, Dimensions, and Archetypes share Reset / Save / Save & continue actions. Reset restores the last saved page; Save stays put; Save & continue advances. Done keeps a record’s edits in the page draft. Cancel restores its values from the start of editing, or removes a newly added record. Delete is available only while editing. Name stays available throughout the builder and owns the quiz title, description, emoji, and color. Appearance options live in a single Style popover beneath each emblem.
