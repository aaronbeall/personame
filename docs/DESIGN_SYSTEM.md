# Personame design system

This is the implementation companion to [BRAND_GUIDE.md](BRAND_GUIDE.md). Visit **`/design-system`** for a live reference using the shipped components. It is a public, unlisted reference page; it contains examples only, not account or quiz data.

## Source of truth

| Layer | File | Responsibility |
| --- | --- | --- |
| Brand palette | `app/globals.css` `@theme` | Existing primary, secondary, accent, and content color families |
| Semantic tokens | `app/design-tokens.css` | Product colors, surfaces, spacing, radii, elevation, motion |
| Product patterns | `app/globals.css` | Workspace, illustrated headers, builder panels/footers, participant and result layouts |
| Content accents | `lib/colors.ts` | Creator-selectable dimension/archetype color themes |
| Components | `components/` and `components/ui/` | Shared behavior and rendered controls |
| Reference | `app/design-system/` | Live specimens, usage guidance, interactive examples |

Use an existing semantic token before adding a new literal. Change the token and review the reference plus real workflow pages. Legacy Tailwind utilities still exist; this is an incremental system, not a claim that every historical style is tokenized. Keep shared rules scoped to `.workspace` or `.workspace-auth` when they should not change the landing page.

## Foundations

### Semantic color

| Role | Token | Default | Use |
| --- | --- | --- | --- |
| Main action | `--pn-action` | primary-600 / `#3d4ed9` | Continue, publish, submit |
| Action hover | `--pn-action-hover` | primary-700 / `#2d38ad` | Hover on the main action |
| Strong heading | `--pn-ink-strong` | primary-900 / `#1a1f6f` | Page titles |
| Main text | `--pn-ink` | `#39334c` | Fields, section headings |
| Secondary text | `--pn-text-secondary` | `#555269` | Descriptions |
| Supporting text | `--pn-text-muted` | `#776e84` | Essential helper copy on light surfaces |
| Canvas | `--pn-canvas` | `#f0ebfb` | Lavender atmosphere under the workspace gradient |
| Working surface | `--pn-surface` | `#ffffff` | Forms and panels |
| Footer surface | `--pn-surface-soft` | `#fcfbfe` | Action footers |
| Field surface | `--pn-field` | `#faf9fd` | Inputs and textarea backgrounds |
| Panel border | `--pn-border` | `#e3dfed` | Quiet surface boundary |
| Field border | `--pn-field-border` | `#e2ddeb` | Control boundary |
| Focus border | `--pn-focus` | `#8b75c5` | Focused fields |
| Focus halo | `--pn-focus-ring` | `#a790d822` | Supporting 3px halo; never the sole focus cue |
| Header base | `--pn-header` | `#eee4f5` | Under the card texture |
| Positive | `--pn-positive` / `--pn-positive-soft` | `#42775d` / `#e8f3ed` | Live and ready states |
| Warning | `--pn-warning` / `--pn-warning-soft` | `#885b2f` / `#fff4e5` | Attention needed |
| Negative | `--pn-negative` / `--pn-negative-soft` | `#a64050` / `#fff1f2` | Validation or request failure |

Content accents are decorative identifiers. They are not automatically suitable for small text on white or for white text on every hue. In particular, test the actual gradient/background combination before adding labels. Status always includes text or an icon; color alone is insufficient.

### Typography

The product uses **Inter**, loaded by `next/font` in `app/layout.tsx`. Keep the system font fallback. Do not introduce a second decorative typeface; the artwork already supplies the expressive contrast.

| Role | Size / weight | Guidance |
| --- | --- | --- |
| Page title | 28–36px / 700 | Setup uses 27–32px; short, sentence case |
| Section heading | 19–20px / 600 | Working panels and cards |
| Question | 18–19px / 600 | One clear question, comfortable line height |
| Body | 14–16px / 400 | 1.5–1.7 line height |
| Field label | 14px / 600 | Programmatically associated with its control |
| Helper / metadata | 12–13px / 400 | Quiet, still legible; essential information must meet contrast targets |
| Eyebrow | 10–11px / 600–700 | Uppercase, spaced; optional and brief |

Use a readable text width, generally 45–70 characters for explanatory paragraphs. Let layout wrap naturally; avoid manually inserted line breaks that fail on mobile.

### Spacing and geometry

The spacing scale uses a 4px base: `--pn-space-1` (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 7 (28px), 8 (32px), 10 (40px), 12 (48px), 16 (64px).

- Inputs and buttons: `--pn-radius-control` = 10px.
- Nested records: `--pn-radius-record` = 14px.
- Main panels and illustrated headers: `--pn-radius-panel` = 18px.
- Status chips: `--pn-radius-pill`.
- Primary working-panel padding: 24–32px desktop, 18–20px mobile.
- Related fields: 20–26px apart. Separate regions: 24px or more.
- Input/primary-action height: 44–48px. Small icon triggers currently use 40px; prefer at least 44px when introducing touch-focused controls.

Use `--pn-shadow-panel` for subtle depth and `--pn-shadow-header` for the illustration card. A nested record normally needs a border, not another large shadow.

### Motion

Use `--pn-duration-fast` (160ms) for hover/focus changes and `--pn-duration-normal` (240ms) for short transitions, with `--pn-ease`. Animate properties deliberately; avoid broad `transition: all` for new work. Content should not flash or move when ordinary state updates occur. Respect `prefers-reduced-motion`; the shared stylesheet already reduces transitions and animation.

## Components and patterns

### Workspace and illustrated header

Use `AppLayoutBackground` and `PageIntro` together. The backdrop is decorative and out of the document flow. The title/description/art form one compact card. Text owns the left; transparent artwork can extend beyond the top/right. The texture is a small-scale reuse of `scene2.png`, faded toward the text.

```tsx
<AppLayoutBackground>
  <PageIntro
    title="Define your dimensions"
    description="Choose the personality dimensions your quiz will measure."
    eyebrow="Optional context"
    art="science"
  />
  {/* Working content */}
</AppLayoutBackground>
```

Use artwork keys from the brand guide. `alt=""` is correct for the decorative illustration. Keep the next panel clear of its silhouette. On narrow screens the image becomes smaller; text retains its normal reading order.

### Panels and fields

Use the existing `Card`, `Input`, `Textarea`, `Button`, and `ErrorBanner` primitives. Their `data-ui` hooks receive the workspace styling. Use the `.surface` pattern for sections that do not need Card's header/content API. Do not create another near-identical panel system.

A field has a visible label, value/placeholder, and optional concise help. Use `htmlFor`/`id`; use `aria-describedby` for help and errors. A placeholder is an example, not a label. Make “optional” quieter, and do not imply optional fields are required. Keep typed values when errors occur.

Use the primary action once per task region. Outline/ghost controls are secondary. Keep destructive controls separate and explicitly named. Disabled controls must reflect the actual guard, not a decorative state. During a request, prevent duplicate actions and give a meaningful busy label.

### Builder records and actions

Use `.builder-panel` with `.builder-panel-body`, `.builder-record`, and `BuilderFooter`. Add records with `AddItemButton`: a compact icon, action label, and short explanation. Avoid large empty dashed areas once the user is already working with content.

```tsx
<BuilderFooter back={<Button variant="outline">Back</Button>} note="Save, then preview your quiz.">
  <Button className="builder-primary-action">Continue to Preview</Button>
</BuilderFooter>
```

The footer belongs inside a single-panel form. A multi-panel editor can use it as a separate action bar. On mobile, keep back/continue reachable and move the note below them. Notes must describe real behavior: drafts are not automatically saved in every editor.

### Style editors

Wrap the emblem in `StyleEditors`: a small pencil edit button overlays the portrait badge and opens the compact options popover. Icon and color controls are active; the Image selector is a disabled “Soon” placeholder for future support. Each active chooser supports keyboard focus, Escape, and outside click. Nested pickers layer above the parent popover. Keep options out of the page layout.

### Navigation

`StepProgress` keeps all five stages visible: Name → Dimensions → Archetypes → Questions → Preview & publish. Name edits title, description, emoji, and color. Before creation, show the same five stages as a compact overview.

Name, Dimensions, and Archetypes use page-level drafts. **Reset** restores the last saved version; **Save** persists without navigation; **Save & continue** persists then advances. Dimension and archetype records use Edit, Done, and Cancel. Done keeps changes in the page draft; Cancel restores the record from when editing began, or removes a newly added record. Delete is available only while editing. The page Save controls persist the complete draft. Use subtle `(optional)` tags on optional fields; omit required-field asterisks.

Use segmented tabs for peer views such as Review / Try. State must be visible through shape/weight as well as color. Page selectors in the question editor become a horizontal strip on narrower screens; the live preview and inspector remain distinct regions.

### Status, notices, and validation

Use `status-tag` for brief states (Draft, Live, Closed). Use `.notice`, `.notice.error`, `.readiness-ready`, and `.publish-success` for supporting messages. A success label should not replace a persistent action unexpectedly. Associate field errors with fields, and use alert/status live regions where appropriate. Avoid turning every explanatory note into a colored box.

### Quiz-taking and results

Use `QuestionInput` for multiple choice, slider, and scale. Selected choices use a stronger boundary plus `aria-pressed`. A slider's visual midpoint is not an answer until changed or explicitly confirmed. Preserve the shared engine behavior when polishing presentation.

`QuizPlayer` owns progression and validation; `ResultView` owns result presentation and sharing/retaking. Keep the score bars, endpoint labels, and archetype context together. Do not show raw scores as population percentiles. Draft preview must remain visibly distinct from a saved participant result.

## Responsive layout

The working patterns use a maximum of 800px for initial setup, about 896px for single-panel builder steps, 1024–1080px for review/dashboard, and 1280px for the multi-panel editor. These are ceilings, not fixed viewport widths.

The current breakpoints are 640px for compact controls/spacing, 800px for the review columns, and 1280px for the question-editor columns. Let actual content determine wrapping. Check long quiz titles, many dimensions, long scale labels, and translated/expanded text. Horizontal overflow is appropriate for an explicit page selector, not for the whole page.

## Accessibility and quality

Target WCAG 2.2 AA for future work; this guide is not an accessibility-conformance claim. Verify 4.5:1 contrast for ordinary text, 3:1 for large text and meaningful control boundaries, keyboard focus, accessible names, and reduced motion. Some legacy accent combinations and very quiet metadata still need a full audit.

Test complete workflows with Playwright, including keyboard paths, validation, saved values, publication, and results. Review real desktop and mobile pages, not only isolated components. Avoid brittle tests of decorative pixel positions. See [TESTING.md](TESTING.md).

## Extending the system

1. Reuse an existing pattern and explain the real user task.
2. Add a semantic token only when a recurring role needs one.
3. Add the component example and states to `/design-system`.
4. Check mobile, keyboard behavior, empty/error/busy states, and real content.
5. Run lint, typecheck, and the relevant workflow tests.
6. Update this guide when behavior or an approved pattern changes.


### Unsaved changes

`useBuilderDraft` registers changes through `useUnsavedChanges`. Mount `UnsavedChangesGuard` once in the root providers. It handles ordinary links and browser Back/Forward, preserving the editor when leaving is cancelled. Use `confirmLeave(dirty, callback)` for explicit navigation buttons; navigation immediately after a successful save needs no prompt. New editors should use these shared hooks rather than installing their own event listeners.

Reload, tab closing, and full document departures use native `beforeunload` protection. Browsers choose that dialog's text and require prior user interaction. In-page anchors, new-tab links, and changing editor selections do not discard the draft and should not prompt. Create is always a fresh in-memory draft; only Save persists a quiz to Your quizzes.


### Loading

Use `LoadingState` from `components/ui/loading.tsx` for initial data loads: `cards` for lists, `editor` for builder panels, `quiz` for participant content, and `result` for results. Skeletons are decorative, non-interactive, and paired with one labelled status. Show errors separately; never leave a failed request behind an endless skeleton.

Use `<Button loading={pending}>Saving…</Button>` for pending actions. It disables duplicate activation and exposes `aria-busy`. `LoadingIndicator` is the single replaceable graphic for inline loading and button progress; the future illustrated animation belongs there. Skeletons remain layout placeholders. All loading motion respects reduced-motion preferences. Keep already-loaded content visible during background refetches.


### Archetype profiles

Keep character in the portrait, subtle palette-tinted header, and illustrated page context. Use a fine card border, 18px corners, a quiet shadow, and large bold titles. Circular patterned badges and framed portraits carry the archetype identity; dimensions within them retain their own faceted language. Preserve full descriptions and full-width dimension tracks. Show target scores and labelled importance percentages in aligned columns; importance never changes the score bar’s opacity. A zero-importance dimension remains readable. Include dimension endpoint labels and a subtle midpoint reference. On narrow screens, wrap statistics beneath the dimension name rather than truncating information.


## Entity visual language

The shared components in `components/entity-identity.tsx` and `components/quiz-cover-mark.tsx` establish three distinct identities across setup, listings, builder steps, summaries, tooltips, participant views, and results. The interactive reference shows all three side by side.

- `QuizCoverMark`: the quiz is an authored collection. Use a portrait-format cover with a colored spine, paper edge, folded corner, cover symbol, and small “Quiz” label. Default size is 64px wide; compact size is 44px. Pair it with a readable quiz title rather than shrinking the title onto the cover. Use the same emoji and hex color in setup, dashboard, discovery, preview, and participant headings. Public quiz data includes its authored color.
- `DimensionSymbol`: a 52px emblem with a softly rounded diamond face and upright emoji or initials. `DimensionTag`: a compact rectangular name/emoji flag. Use `--pn-dimension-radius` (4px), solid palette fills, and precise read-only scale graphics with diamond value markers. Keep dimension rows neutral, without colored top accent borders. No circular avatars, decorative textures, pill shapes, or individually scaled dimension labels. Use the shared subtle shading gradient rather than flat fills on symbols and tags.
- `ArchetypeBadge`: a circular, framed, patterned portrait. Default hero size is 96px, editor size 80px, and compact summary size 44px. Use `--pn-archetype-radius`, bold type, a centered name ribbon when needed, and each profile’s accent color. Keep small variants legible by suppressing the name ribbon and providing a readable adjacent label.
- `StyleEditors` uses the same circular pencil overlay for every entity. Standard editing controls do not change shape according to the content they edit.
- Read-only dimension scales and target tracks use straight, slim rails with softly rounded diamond endpoints and value markers. Interactive sliders retain the standard rounded track and circular thumbs. Keep target values and importance separately labelled and readable at every importance level.
- Archetype headers may reuse the existing scene texture subtly. Dimension surfaces use restrained shading without decorative patterns. The shared illustrated page background, palette, spacing, and controls tie all three visual languages together.

Colors are persisted as opaque lowercase six-digit hex values. `lib/colors.ts` maps palette hex values to friendly UI names; custom colors display their hex value. APIs normalize short/mixed-case hex, accept null, and reject color names, transparency, and malformed values. Color.js compares absolute APCA perceptual contrast scores for black/white text for dimension symbols/tags, color picker text/checks, and archetype initials (including gradient/texture backgrounds). New archetypes choose an unused palette color when available; explicit choices are never overwritten. Profiles without a selected color receive a deterministic name-based visual fallback, consistent in summaries and results.

**Scope:** entity styling applies to representations of quizzes, dimensions, and archetypes—covers, symbols, tags, portraits, badges, and profile graphics. It does not override shared UI conventions. Buttons, slider thumbs, popovers, inputs, focus rings, and other standard controls keep the same appearance and behavior across all contexts. A control editing a dimension is still a control, not a dimension identity.


## Category icons

Use `EntityIcon` from `components/entity-icon.tsx`, the single mapping for `quiz → BookOpen`, `dimension → SlidersHorizontal`, and `archetype → Drama` (drama masks). Do not introduce competing category symbols such as gauges, badges, or fingerprints without updating the agreed vocabulary.

Default size is 16px with a 1.75px Lucide stroke. Use 12–14px for compact navigation and small labels, 16–20px for headings, and 21px within add-item actions. Pair each category symbol with visible text and leave decorative icons hidden from assistive technology. Icon-only actions need their own accessible label.

`AddItemButton entity="dimension"` and `entity="archetype"` combine the category symbol with the standard plus affordance. The control itself keeps the shared interaction styling. Category icons never replace an item's custom emoji, image, or portrait. The design reference shows the approved symbols beside each visual-language example.


## Dimension display scales (reserved)

`Dimension.displayScale` is a persisted `DimensionDisplayScale` enum: `PERCENT_ASCENDING` (default, 0–100%), `PERCENT_DESCENDING` (100–0%), or `BIPOLAR` (−100–100%). The dimension editor provides a compact three-segment toggle through `DimensionDisplayScaleSelector`, with accessible radio behavior. Ascending and descending use reversed intensity ramps; bipolar uses the same hue at both ends fading toward a visible zero midpoint. Keep each segment to a numeric range and a thin ramp; omit extra headings and visible helper copy. These are illustrative display previews, not selected scores. Selection follows the page's existing Done/Cancel, Reset, and Save lifecycle.

This is presentation metadata only. Formatting is deferred: existing values, labels, bars, targets, scoring, answer weights, and result snapshots do not change. Future formatting would map normalized value x to x%, (100−x)%, or (2x−100)% respectively. Never store transformed scores or invert grading because of this preference.


## Product terminology

Use **Dimension** and **Dimensions** in all user-facing copy for the measured personality spectra. The database, API `/dimensions` routes, query keys, component names, seed catalog, and scoring identifiers use Dimension consistently. The rename preserves existing data and scoring behavior.


## Dimension endpoint icons

Each dimension may store nullable `minEmoji` and `maxEmoji` values. The editor places an endpoint icon with a circular pencil overlay beside each field label. The pencil opens the shared emoji picker; removing an emoji stores null and restores the editor-only down/up arrow. `DimensionEndpointLabel` renders only selected emoji; null icons take no space outside the editor. Use this component in definition scales, archetype profiles and target editors, dimension tooltips, and result score labels. Icons are decorative and labels stay readable. Result snapshots capture endpoint emoji to preserve historical presentation. Question-specific answer icons remain independently authored.


## Editor validation feedback

Disabled completion actions must explain missing required fields at the bottom of the editor. `EditorValidationFeedback` provides a compact live status message, shared by record actions and page save actions. Dimension feedback names the missing name or endpoint labels; archetypes and quiz details explain missing names. Page summaries identify the affected record and explain when an item must be added. Feedback updates as fields are completed and clears once valid. Associate disabled actions with the message using `aria-describedby`. Saving, loading, and unchanged drafts are separate from validation failures.

Perceptual contrast uses Color.js `contrastAPCA(background, text)` with foreground/background order preserved. Compare absolute scores and choose the stronger polarity, including the least-readable sampled background for textured badges. This favors white text on saturated blue/purple/pink while keeping black text on bright teal/green/amber. It is a visual selection rule, not a claim of WCAG 2 contrast-ratio compliance.


Solid identity surfaces use `getColorSurface`: a 135° gradient from a 3.5% white highlight through the authored hex to a 12% black shade. Dimension emblems/tags and color picker swatches share this treatment. Contrast samples every gradient stop. Existing archetype badge gradients/textures and informative scale preview ramps remain intact; do not stack a second shading layer on them. Color.js handles normalization, sRGB mixing, and APCA contrast; Colord is no longer used. Stored hex values never change to represent display shading.
