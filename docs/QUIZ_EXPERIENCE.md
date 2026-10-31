# Quiz studio and participant experience

## Layout research

Reviewed official product guidance on 29 October 2026:

- [Typeform: My first form](https://help.typeform.com/hc/en-us/articles/360053660271-My-first-form): content outline, central WYSIWYG canvas, separate welcome/end screens and appearance controls. Personame uses a persistent page outline, a responsive canvas, and a contextual inspector while retaining its dimension/archetype model.
- [Tally: Progress bar](https://tally.so/help/progress-bar) and [FAQ](https://tally.so/help/faq): progress, page breaks, and saved answers reduce uncertainty. Personame retains answers in session storage, shows answered states and progress, and points required-answer feedback at the question.
- [Typeform: Share your form](https://help.typeform.com/hc/en-us/articles/360029252892-Share-your-form): preview and sharing are prominent, persistent actions. The studio saves in place and offers a preview of the saved model, avoiding accidental tests of stale scoring.
- [Interact: Launch your first quiz](https://www.tryinteract.com/blog/launch-your-first-quiz/): publication has a focused sharing moment. Personame opens a dismissible congratulations dialog after successful first publication with a copyable URL, sharing links, and its existing illustrated confetti. Reopening a closed quiz does not repeat first-publication celebrations.

## Implemented behavior

The Questions step is a studio with outline, canvas, inspector and a save/preview toolbar. The studio retains Personame’s shared Inter typography, indigo headings and actions, lavender textured workspace and illustrated header; studio describes the layout and interaction model, not a separate visual brand. On smaller screens, Outline, Canvas and Settings switch the working panel. Desktop and mobile canvas widths help check presentation. Cover and Results remain first-class pages in the outline. The top creation steps continue to connect naming, dimensions, archetypes, studio and review/publishing.

`QuizPage.presentation` stores validated layout, artwork and content options. Defaults preserve older pages. Cover options include the start label, description, question count and estimated duration (a rough 15 seconds per question). Result options include description, dimension scores, nearby archetypes, comparisons and retake/share actions. Page colors use existing authored themes. The studio cover and result preview reuse the same visual components as the player.

Public `/quiz/*` routes use a small Personame header and footer instead of application navigation. The player uses configured cover artwork and page palettes, question feedback, a persistent navigation footer, required-answer focus, saved responses, and reduced-motion-aware transitions. Slider midpoint still requires an explicit choice. Submissions retain server validation, revision checking and idempotency.

The result centers on a large archetype medallion. Presentation is captured in the result snapshot, preserving an earned result when its author edits the quiz. Existing results remain compatible through default settings.

## Comparison meaning and limits

Comparisons describe **completions**, not unique people or a representative population. A repeat participant may contribute multiple completions. No demographic or psychological validity claims are made.

A deterministic SHA-256 model key includes dimension identities, names and endpoint labels, visible question text/types/answers/positions/influence, and archetype targets/importance. Visual and publishing edits do not change the key. Meaningful model edits do, preventing incompatible scores from being pooled. Historical results without a model key do not receive comparisons.

A result is compared only with other results in its quiz/model cohort, excluding itself. At least 10 other completions are required. Each dimension mean needs 10 measured scores. Archetype shares below 3 matches are not given as exact percentages. The API returns aggregate counts/means only; it never returns other participants’ identities or answers. These are small-cohort safeguards, not a claim of differential privacy or formal anonymity.

No synthetic comparison data, demographic collection, image generation service, or new scoring algorithm is introduced. Publication timing and discoverability settings retain their existing preview-only status.

## Deployment

Apply the new Prisma migration before deploying the application:

```sh
npx prisma migrate deploy
npx prisma generate
```

The migration adds page presentation JSON, result model keys and historical dimension IDs. Old results are not backfilled with guessed model identities.
