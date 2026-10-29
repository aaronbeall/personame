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

### Collection pagination

Use `CollectionPagination` only below paginated content, separated by quiet rules rather than a boxed action footer. Show the visible item range and total, compact Previous/Next controls, numbered page buttons, and ellipses for long ranges. The first, current, and last pages remain available; phones use a shorter range with 44px targets. Mark the selected page with `aria-current`, stronger text, and a short subtle underline; avoid filled boxes, visible button borders, or shadows on page numbers. Disable controls during requests. Preserve existing content while fetching, announce the range once, and return to the top of the collection when paging from the bottom. Hide pagination when there is only one page.

### Main navigation

`AppHeader` centers Explore, Your quizzes, Your many selves, and Create in a labeled navigation landmark between equal side columns; the logo and account controls flank it. Avoid an enclosing pill or nested raised borders. Each space uses a logo-inspired ink/wash pair: teal for Explore, periwinkle for Your quizzes, orchid for Your many selves, and warm gold for Create. Active state combines a soft wash, stronger count contrast, `aria-current`, and an original vector pen flourish that draws once on route activation. Icon hover motion adds a small spring and tilt without moving link text or changing layout; keyboard focus has a visible outline and reduced-motion mode shows the complete flourish without animation. On phones the navigation occupies its own row with shorter labels, visible counts, and at least 44px targets. Builder routes activate Create; library routes activate Your quizzes.

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
  <Button className="builder-primary-action">Continue to Review</Button>
</BuilderFooter>
```

The footer belongs inside a single-panel form. A multi-panel editor can use it as a separate action bar. On mobile, keep back/continue reachable and move the note below them. Notes must describe real behavior: drafts are not automatically saved in every editor.

### Style editors

Wrap the emblem in `StyleEditors`: a small pencil edit button overlays the portrait badge and opens the compact options popover. Icon and color controls are active; the Image selector is a disabled “Soon” placeholder for future support. Each active chooser supports keyboard focus, Escape, and outside click. Nested pickers layer above the parent popover. Keep options out of the page layout.

### Navigation

`StepProgress` keeps all five stages visible: Name → Dimensions → Archetypes → Questions → Review & publish. Completion comes from saved quiz readiness through `getQuizComposition`, never from route order or having visited a screen. Keep the stepper on one line on every page, scrolling horizontally when needed. Earlier complete stages show a neutral check; earlier incomplete stages retain their number with a subtle error tint and dashed outline and the dimension/archetype/visible-question count. The active stage retains its numbered marker and count. Future stages keep their original numbers and omit counts regardless of saved readiness. Review remains pending until published, and unavailable progress never implies completion. Existing save actions invalidate the small progress query and the full review query. The top-level navigation replaces the old Your quizzes back link. Name edits title, description, emoji, and color. Before creation, show the same five stages as a compact overview.

Name, Dimensions, and Archetypes use page-level drafts. **Reset** restores the last saved version; **Save** persists without navigation; **Save & continue** persists then advances. Dimension and archetype records use Edit, Done, and Cancel. Done keeps changes in the page draft; Cancel restores the record from when editing began, or removes a newly added record. Delete is available only while editing. The page Save controls persist the complete draft. Use subtle `(optional)` tags on optional fields; omit required-field asterisks.

Use segmented tabs for peer views such as Review / Analyze / Publish. State must be visible through shape/weight as well as color. Page selectors in the question editor become a horizontal strip on narrower screens; the live preview and inspector remain distinct regions.

### Status, notices, and validation

Use `status-tag` for brief states (Draft, Live, Closed). Use `.notice`, `.notice.error`, `.readiness-ready`, and `.publish-success` for supporting messages. A success label should not replace a persistent action unexpectedly. Associate field errors with fields, and use alert/status live regions where appropriate. Avoid turning every explanatory note into a colored box.

### Quiz-taking and results

Use `QuestionInput` for multiple choice, slider, and scale. Selected choices use a stronger boundary plus `aria-pressed`. A slider's visual midpoint is not an answer until changed or explicitly confirmed. Preserve the shared engine behavior when polishing presentation.

`QuizPlayer` owns progression and validation; `ResultView` owns result presentation and sharing/retaking. Keep the score bars, endpoint labels, and archetype context together. Do not show raw scores as population percentiles. Draft preview must remain visibly distinct from a saved participant result.

## Responsive layout

The working patterns use a maximum of 800px for initial setup, about 896px for single-panel builder steps, 1024–1080px for review/quiz library, and 1280px for the multi-panel editor. These are ceilings, not fixed viewport widths.

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

Keep character in the portrait, subtle palette-tinted header, and illustrated page context. Use a fine card border, 18px corners, a quiet shadow, and large bold titles. Circular patterned badges and framed portraits carry the archetype identity; dimensions within them retain their own faceted language. Preserve full descriptions and full-width dimension tracks. Show target scores and qualitative descriptions in persistent callouts attached to the value markers, with labelled importance percentages and a compact five-segment weight indicator above the rail (partially fill segments for exact intermediate weights); importance never changes the score bar’s opacity. A zero-importance dimension remains readable. Include dimension endpoint labels and a subtle midpoint reference. On narrow screens, wrap statistics beneath the dimension name rather than truncating information.


## Entity visual language

The shared components in `components/entity-identity.tsx` and `components/quiz-cover-mark.tsx` establish three distinct identities across setup, listings, builder steps, summaries, tooltips, participant views, and results. The interactive reference shows all three side by side.

- `QuizCoverMark`: the quiz is an authored collection. Use a portrait-format cover with a colored spine, paper edge, folded corner, cover symbol, and small “Quiz” label. Default size is 64px wide; compact size is 44px. Pair it with a readable quiz title rather than shrinking the title onto the cover. Use the same emoji and hex color in setup, quiz library, discovery, preview, and participant headings. Public quiz data includes its authored color.
- `DimensionSymbol`: a 52px emblem with a softly rounded diamond face and upright emoji or initials. `DimensionTag`: a compact rectangular name/emoji flag. Use `--pn-dimension-radius` (4px), solid palette fills, and precise read-only scale graphics with diamond value markers. Keep dimension rows neutral, without colored top accent borders. No circular avatars, decorative textures, pill shapes, or individually scaled dimension labels. Use the shared subtle shading gradient rather than flat fills on symbols and tags.
- `ArchetypeBadge`: a circular, framed, patterned portrait. Default hero size is 96px, editor size 80px, and compact summary size 44px. Use `--pn-archetype-radius`, bold type, a centered name ribbon when needed, and each profile’s accent color. Keep small variants legible by suppressing the name ribbon and providing a readable adjacent label.
- `StyleEditors` uses the same circular pencil overlay for every entity. Standard editing controls do not change shape according to the content they edit.
- Read-only dimension scales and target tracks use straight, slim rails with softly rounded diamond endpoints and value markers. Interactive sliders retain the standard rounded track and circular thumbs. Keep target values and importance separately labelled and readable at every importance level.
- Archetype headers may reuse the existing scene texture subtly. Dimension surfaces use restrained shading without decorative patterns. The shared illustrated page background, palette, spacing, and controls tie all three visual languages together.

Colors are persisted as ordered comma-separated lists of opaque lowercase six-digit hex values (a solid has one entry). `lib/colors.ts` maps palette hex values to friendly UI names; custom colors display their hex value. APIs normalize short/mixed-case hex, accept null, and reject color names, transparency, malformed values, and unlisted multi-color combinations. Color.js compares absolute APCA perceptual contrast scores for black/white text for dimension symbols/tags, color picker text/checks, and archetype initials (including gradient/texture backgrounds). New archetypes choose an unused palette color when available; explicit choices are never overwritten. Profiles without a selected color receive a deterministic name-based visual fallback, consistent in summaries and results.

**Scope:** entity styling applies to representations of quizzes, dimensions, and archetypes—covers, symbols, tags, portraits, badges, and profile graphics. It does not override shared UI conventions. Buttons, slider thumbs, popovers, inputs, focus rings, and other standard controls keep the same appearance and behavior across all contexts. A control editing a dimension is still a control, not a dimension identity.


## Category icons

Use `EntityIcon` from `components/entity-icon.tsx`, the single mapping for `quiz → BookOpen`, `dimension → Gem` (faceted gem), and `archetype → Drama` (drama masks). Do not introduce competing category symbols such as gauges, badges, or fingerprints without updating the agreed vocabulary.

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


Single-color identity surfaces use `getColorSurface`: a 135° gradient from a 3.5% white highlight through the authored hex to a 12% black shade. Dimension emblems/tags and color picker swatches share this treatment. Contrast samples every gradient stop. Existing archetype badge gradients/textures and informative scale preview ramps remain intact; do not stack a second shading layer on them. Color.js handles normalization, sRGB mixing, and APCA contrast; Colord is no longer used. Stored hex values never change to represent display shading.


## Color themes

The existing nullable `color` string stores an ordered list: `#2563eb,#7c3aed`. It never stores a theme ID, name, CSS gradient, or JSON. Database constraints accept one or more canonical hex entries; current API schemas allow any single hex or a registered theme from `COLOR_THEMES`. Rendering and normalization preserve all entries, so adding future curated themes with more colors does not require a new storage format. Reversing the order creates a different theme.

`getColorTheme().value` is the complete persisted value; `.hex` is only the primary color for borders and individual markers. Never save `.hex` when updating an existing theme. The UI maps the complete list to its creative name; unrecognized lists use per-color names joined by `/`, falling back to hex for unnamed colors.

The picker has keyboard-accessible Solid colors and Themes tabs, opens on the selected value's tab, and retains custom single-color selection. Multi-color custom creation is deferred. `getBarGradient` blends all theme entries along a bar. Dimension symbols and tags use full gradient fills. Archetype themes use the first color for a shaded fill and the last for frame/ring/texture, with perceptual contrast choosing legible text. Quiz covers carry both colors in their paper tint and folded corner. Result snapshots retain complete dimension and archetype color values. The reference page previews every curated theme.

Validation presentation uses muted lavender/ink rather than orange warning copy. Record footers place feedback in a full-width row above the actions, with a fine left accent. Page footers place feedback above the complete action row instead of squeezing it into the Save button group. Record names are emphasized within summaries. On narrow screens, page actions stack beneath the message and retain room for Back and help text. Avoid nested warning boxes and tinted action trays.


## Quiz review

Use Review & publish for the final builder stage; the existing `/preview` route remains compatible. Lead with a single publishing checklist card driven by shared readiness checks. Always include all four stages, using checked boxes and quiet Done labels for complete stages, unchecked boxes and actionable requirements for unfinished stages. For published quizzes, hide the checklist entirely and show the live status and sharing actions. When all stages pass on a draft, collapse the card to a green Ready to publish bar with a link to the Publish tab and a Show/Hide checklist disclosure. Keep the full completed checklist accessible on expansion; incomplete quizzes always show their tasks. Show a compact ready-stage count in the incomplete card header; keep row separators inside the shared container. Keep missing-content tasks inside the Review tab, link each group directly to its editor, and explain disabled publishing beside the final action.

Keep Dimensions, Archetypes, and Questions in one compact composition panel with internal section dividers, category icons and counts, and direct edit links. Keep the overview high level: dimension tags, archetype portrait/name buttons, and question-type counters. Put descriptions, endpoint scales, targets/importance, and question outlines in click-open Radix popovers with close controls, Escape dismissal, focus return, and viewport collision handling. Use a narrow heading column on desktop and stacked headings on mobile; avoid nesting bordered cards within this panel. The review summary uses the actual quiz cover, diamond dimension identities and endpoint labels, circular archetype portraits, and an expandable question-page outline with question-type counts. Exclude hidden pages from participant question totals. Preserve optional descriptions and authored colors rather than substituting sample content.

Use `DimensionTargetSummary` for compact archetype profiles in popovers and the atlas: an inline qualitative descriptor and score, a dimension-colored target meter with a diamond marker, and quiet matching importance below. Keep the score and /100 on one line.

The archetype atlas offers 2D maps, rotatable 3D projections, parallel coordinates, and an overlaid radar comparison of every archetype. Default to 2D for one/two dimensions, 3D for three, and radar for four or more. Follow the [EU guide to visualising many dimensions](https://data.europa.eu/apps/data-visualisation-guide/visualising-many-dimensions): parallel coordinates offer a common 0–100 scale across every dimension; glyphs need a clear decoding key. Radar polygons and parallel lines use archetype colors. Radar axes include every dimension in authored order, with 0 at the center and 100 at the outer ring; all profiles remain visible, with selection emphasizing one. Radar area is not a statistical score. Incomplete profiles show only existing adjacent edges and points, with no filled polygon or invented values. Parallel lines use smooth cubic curves with horizontal tangents at each axis, passing through exact targets without overshoot and breaking at missing targets. Parallel axes retain authored dimension order; explain that adjacency affects the patterns people see.

Do not offer axis dropdowns. Spatial axes rank dimensions by variance of authored targets, with model order breaking ties and missing targets excluded. If all dimensions fit, render the chart directly. Otherwise show every unordered pair/triple as a data-filled selectable mini chart. Keep large combination lists paginated (eight previews at a time), and compute subsets by index instead of allocating all combinations. Choosing a preview enlarges that exact combination; 3D rotation remains available. Keep selectors compact: short view tabs and a horizontally scrollable strip of small data-filled pair/triple previews. Avoid generous chart padding and repeated instruction blocks; put the exact-value matrix behind an expandable Targets & importance row. Keep archetype selection synchronized with the legend, map, parallel lines, radar, full profile, and matrix. Use keyboard-selectable marks and proper pressed states. Support horizontal scrolling within parallel plots and the matrix without document overflow. Missing targets leave gaps or empty spokes, never an assumed score. Keep the target/importance matrix available as an exact-value alternative. These views show authored targets, not reachable-answer analysis, inferred factors, or matching boundaries; importance and dimensions outside a projection still affect matching.

## Dimension value labels

Use `DimensionValueLabel` for the shared raw-score and qualitative endpoint description. It inherits text color and works in both dark tooltips and light surfaces. `DimensionValueMarker` provides a persistent callout above the diamond, kept within the rail edges. This read-only display needs no hover or focus; the meter exposes the numeric score and description through ARIA.

`describeDimensionValue` leaves stored values/scoring unchanged. Below 50 the low endpoint dominates, above 50 the high endpoint dominates, and exactly 50 is Balanced with both endpoint labels. Distance from 50 determines intensity: up to 10 points Slightly, 20 Somewhat, 30 Moderately, 40 Very, and 50 Extremely. Display raw scores out of 100, retaining decimals. Endpoint emoji appear when supplied; default arrows remain editor-only. This is descriptive UI copy, not a psychometric validation claim.

Archetype displays show the persistent marker callout instead of a separate Target heading. Only the two outer endpoint labels have width constraints; never apply percentage widths to their nested icon/text spans. Long labels wrap naturally.

Archetype target editors align target and importance controls on shared grid rows. Show the live `DimensionValueLabel` between the dimension tag and target rail. Matching importance uses a muted segmented rail with Ignore/Essential endpoints and its own influence descriptor, keeping it distinct from the dimension-colored target slider. On narrow screens the weight section stacks beneath the target.

## Homepage creation walkthrough

`QuizCreationWalkthrough` introduces the five builder stages with one space-themed example. Use the shared quiz cover, diamond dimension, and circular archetype badge identities in read-only miniature scenes, layered over the existing generated artwork. Let the artwork extend above and around the illustration frames at moderate opacity, with a soft fade at its lower edge; foreground miniatures stay crisp. Keep explanatory text outside the illustration. The ordered sequence uses five columns on desktop, three on intermediate widths, and compact illustration/text rows on mobile. Decorative previews are hidden from assistive technology and never impersonate interactive form controls.

## Discovery shelves

The homepage discovery section uses horizontal, scroll-snapping editorial shelves with large illustrated quiz covers. Reuse `QuizCoverMark` to preserve the quiz silhouette and authored colors. Each shelf has a title, brief description, and previous/next controls; native scrolling supports touch and keyboard browsing. Search returns a single unpadded shelf of matching quizzes. Keep loading, retry, and empty states. Until a recommendation service supplies shelf data, lightweight keyword groupings prioritize matching public quizzes and repeat presentation slots to fill eight cards per shelf. Never duplicate database records, invent activity counts, expose private drafts, or describe these shelves as personalized recommendations.

## Closing invitation and site footer

The homepage closing CTA uses a pale illustrated panel, deep ink typography, and a clear create action, with transparent party artwork breaking the frame. On mobile the illustration sits below the copy, with enough space to avoid overlapping the actions. `AppFooter` is the shared site footer: a brand lockup, short brand message, and grouped Create/Discover navigation, followed by a separate credits row. Link only to existing destinations; do not add placeholder policy or support links.

Homepage content bands alternate warm white and pale lavender, including individual discovery shelves. Use fine boundary lines and low-opacity crops of the existing scene artwork as texture, alternating crop scale and fade direction. Backgrounds extend to the viewport edges while content stays on the shared centered width. Keep textures behind content and avoid horizontal document overflow.

## Homepage motion

`HomeMotion` progressively enhances `data-reveal` elements with one-shot scroll entrances. The intro text reveals line by line. Explainer steps use a 900ms elastic pop with a small overshoot and settle, staggered by 180ms on desktop; mobile steps reveal individually without accumulated delays. Quiz strips alternate left/right entrances with 85ms card staggering and a 680ms eased slide. Content already above the viewport is left visible; content within or below it is prepared before paint and revealed by the viewport observer. Server-rendered content remains visible without JavaScript. Reveal keyboard-focused content immediately, and honor reduced-motion preferences including changes while the page is open. The hero has a short initial entrance; desktop explainer illustrations lift gently on hover without making noninteractive steps appear clickable. Keep animation styles isolated in `app/home-motion.css`.

## Illustrated action icons and confetti

Create and Explore actions use generated transparent artwork in `public/images/cta/` rather than generic utility icons. `ArtActionIcon` renders these decorative images at 30–38px without replacing the visible action text. `CreateQuizLink` gives primary Create actions a finite 14-particle burst from the transparent 3×3 sprite sheet on mouse entry or visible keyboard focus. The canvas burst uses a fixed 120Hz physics step with upward launch velocity, gravity, exponential drag, angular velocity, and tumbling, then fades during descent over roughly two seconds. Render the decorative canvas in a fixed body portal so it cannot be clipped by buttons or alter document width. Icons enlarge and tilt on hover or visible keyboard focus. The burst has a cooldown, never intercepts input, and does not fire on touch hover or when reduced motion is requested. Reuse the shared action component in the hero, walkthrough, closing CTA, and signed-in header. Generation directions are recorded in `art/cta/PROMPTS.md`.

## Creator quiz library

Personal navigation has two direct destinations: Your quizzes (`/quizzes`, book icon) and Your many selves (`/selves`, drama masks). Legacy `/dashboard` links temporarily redirect to `/quizzes`; reserve Dashboard for a future overview. Personal APIs live under `/api/me/`, independent of page routes. Keep the account menu focused on account actions; do not duplicate Dashboard there. Both links appear in the header, with active-page treatment and concise Quizzes/Selves labels on mobile. Your quizzes uses the tree-house artwork, creator-focused copy, and counted Drafts/Published tabs with a quiet underline selection indicator and transparent content area. Your many selves uses islands artwork, a collection count, independent search, and a Discover another self action. Its Discovered and Still exploring tabs separate saved archetypes from unfinished attempts. Still exploring shows quiz covers, answered counts, a progress bar, and Resume discovery; never imply an archetype has been discovered before grading. Unfinished attempts currently use account-scoped browser-tab storage and are labeled accordingly; they are removed from this list after successful submission. Its empty states link to Explore quizzes. Tabs support arrow keys and Home/End. A search field filters the active collection by title and description, preserves the query between tabs, and keeps total tab counts stable. Your many selves leads with the historical archetype portrait, name, and description from the signed-in user’s latest result per quiz, with the source quiz secondary, with its completion date and result link when available; anonymous completions are not account history. Draft cards use a warm graph-paper surface, dashed edges, a small folded corner, and a restrained construction mark. Published cards have clean white surfaces and tinted cover headers; live cards carry a slim authored-color accent and Live indicator, while closed cards use a muted cover and Closed indicator. Keep closed releases inside Published rather than grouping them with drafts. Draft cards show three compact counters: Dimensions, Archetypes, and Questions. Each pairs its category icon (dimension faceted gem, archetype drama masks, question checklist), count, and label with a green check for complete or a red X for incomplete. Keep the layout simple, with thin dividers and no miniature illustrations or redundant step sequence. Each counter links to its editor and has an explicit accessible count and completion label. Use `getQuizComposition` with `readinessByStage`, the same checks that publishing uses, so question counts alone never imply scoring is ready. Continue links target the earliest unfinished stage; ready drafts point to Review. Live cards show completion statistics and their public link.


## Public discovery

`/explore` is the dedicated public quiz discovery page. Reuse `DiscoverQuizzes` (page variant), including the same editorial shelves, illustrated quiz cards, search, error/retry and loading states as the homepage. Use the galaxy-expansion page header and the existing alternating textured shelves and reduced-motion-aware reveals. Footer and personal-space Explore links open `/explore`; the homepage hero retains its local smooth-scroll behavior through `ExploreLink`'s section target. The homepage shelf includes an Explore all quizzes link. Only published public quizzes appear in either listing.


The global header is sticky, with a quiet shadow and enough scroll padding to keep anchored content clear. Explore uses a simple compass icon in navigation (the illustrated icon remains for content CTAs) and a public, uncapped count of live public quizzes (excluding drafts, closed, and private quizzes). The count refreshes after publishing or editing. At mobile widths, Explore keeps its icon and count; the Create action uses its artwork with a visually hidden accessible label to preserve room for both personal-space links.


The 3D atlas uses a lazy-loaded Three.js scene with a PerspectiveCamera, depth-tested solid circle billboards, a cube and floor grid, and OrbitControls for orbit/zoom. Keyboard arrows rotate; +/- zoom and Home resets. Provide small reset and zoom controls and accessible point buttons synchronized with the profile. Render on camera/selection/resize changes, not a continuous animation loop; dispose controls, geometry, materials, renderer, observer, and scheduled frames on unmount. On devices without WebGL2, Three.js SVGRenderer renders the same real 3D geometry and camera. Mini previews use the same perspective camera and normalized -1…1 coordinates. Axis assignment is automatic, without dropdowns.


For four or more dimensions, the 3D chart header offers an off-by-default Size: [dimension] switch beside the spatial dimension labels. The remaining dimension controls circle area (linear in the normalized value, with a small visible baseline for zero), preserving solid archetype colors. For five or more dimensions, a compact selector chooses among dimensions outside the three spatial axes. If a new triple includes that dimension, use an eligible remaining dimension. Mini previews reflect size encoding but their labels always name only the spatial axes. Provide a named 0/50/100 size key and accessible exact values; missing size targets are outlined at a neutral size, never silently treated as zero. Toggling size updates geometry without resetting the camera. Ordinary perspective still affects apparent size. Do not show this control on models with fewer than four dimensions. All plotted archetype markers and legend swatches are solid circles without ordinal numbers; selection outlines remain distinct from data encoding.


Atlas axes use authored dimension names and low/high endpoint labels (with selected emoji) rather than coordinate letters or numeric endpoint ticks. In 3D, anchor each name and both endpoints to a distinct cube edge and move them with the perspective camera. In 2D and parallel coordinates, replace terminal ticks with the endpoint labels; radar spokes show their dimension name and low → high pair. Truncate long SVG labels with full text available in titles, and allow HTML 3D labels to wrap. Size legends use the size dimension's endpoints. Numeric raw target values remain available in profiles and the matrix; stored scores and coordinates remain normalized 0–100.


## URL-backed builder workspace

The final stage has three URL-backed views: `?tab=review` for readiness and composition, `?tab=analyze` for the atlas, and `?tab=publish` for publishing. The route without a query defaults to Review. Use the shared `useUrlTab` hook with nuqs' typed literal parser and Next.js adapter ([nuqs options](https://nuqs.dev/docs/options)). The query value is the sole tab state: no mirrored useState, URL synchronization effects, or custom history listeners. Use shallow, non-scrolling history pushes for tab navigation so Back/Forward, reload, deep links, and external Next navigation all select the correct panel. Preserve unrelated query parameters; invalid tab values fall back to the default. `UrlTabs` supplies controlled, keyboard-accessible presentation and panel IDs. `reviewWorkspaceHref` builds explicit links from other routes.

Only the Publish tab performs publish/unpublish mutations. Ready-state CTAs, library Review & publish actions, and publishing links navigate there. Review retains the checklist (hidden for published quizzes), compact composition summary, and a Try the quiz dialog; preview answers are never saved as completions. Analyze contains visualizations. Publish has one prominent publish/unpublish action, current public-sharing actions, readiness guidance linking to Review, and visibly disabled future settings: discoverability, scheduling, closing date, and response limit. Those settings are previews only, are not persisted or enforced, and must not imply publishing behavior has changed.

Spatial atlas axis labels are compact dropdowns. Offer only unassigned dimensions, excluding the active size encoding. Retain the selected name as the label; disable the control when no replacement exists. Manual changes preserve the other axes, and choosing a mini-chart restores that preset’s automatic axis ordering.

The Analyze workspace separates the archetype atlas, Targets & Importance matrix, and question-space diagnostics into individual cards. Question-space relationships use curved links with explicit units, not a conserved Sankey flow. Keep detailed assumptions in an expandable methods area. Distinguish exact answer enumeration from sampled estimates, include Wilson intervals for sampled outcome shares, and never label an unseen sampled outcome impossible. Archetype target-axis coverage and outcome probability are different measures. Background analysis must not block navigation or create participant results. See [question-space research and calculations](QUESTION_SPACE_ANALYSIS.md).

Each Analyze card has a shared `SpaceMetrics` strip: three numeric diagnostics, a subtle segmented range bar with current-value marker, and a keyboard-accessible expandable calculation containing the explicit directional ranges. Use favorable/watch/concern labels alongside color, and unavailable values for insufficient inputs. Keep thresholds visibly described as design heuristics, with integrity checks distinguished. Geometric metrics use all dimensions and remain invariant under chart selections. See [space metric definitions and ranges](SPACE_METRICS.md).

The 2D atlas supports size encoding with three or more dimensions, using the same switch, compact selector and size key as 3D. Select size only from dimensions outside the two spatial axes; expose a selector when more than one is available. Retain solid circles, visible zero values, outlined missing sizes and stable preset labels. Captions count two position axes plus one size dimension. Size changes do not move spatial positions.

Analysis explanations lead with familiar language and a practical next step. Use friendly metric labels, short contextual notes, and no formulas or threshold strings in the tiles. Expanded help links to `/reference/space-metrics#<metric-id>` in a separate tab for technical definitions, formulas, ranges, sampling and sources. Keep the main Analyze workflow focused on interpreting and improving the quiz.

Targets & Importance emphasizes normalized dimension influence, effective archetype focus, and priority variety. Give focus a neutral meter and label because broad and focused designs are both valid. Show aggregate shares in a dimension-colored bar, then a common-hue heatmap with normalized percentages, original importance settings and dimension-colored target rails. Keep each row’s focus visible. Missing settings, inactive archetypes and unused dimensions become conditional setup notes rather than default 100% completeness tiles.

Success, completion, live and ready states use the shared `--pn-positive*` seafoam palette, anchored to the artwork sample `#c0e1da` (`--pn-positive-base`). Derive muted supporting tones from this base rather than saturated turquoise. Pair mint action backgrounds with dark teal action text; reserve the stronger teal ink for status text and icons on pale mint surfaces. Use the semantic border and accent tokens for outlines and live dots instead of hardcoded forest greens.
