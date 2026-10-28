# Personame brand guide

Personame turns curiosity into personality quizzes people enjoy creating, taking, and sharing. The brand promise is **a delightful moment of recognition, made by you**.

This guide records the approved direction: expressive, whimsical artwork paired with modern, composed UI. The interactive reference is available at `/design-system`; implementation rules live in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Personality

**Curious.** Ask inviting questions. Make exploration feel approachable.

**Warm.** Speak to a person, not an audience segment. Let creators feel capable and participants feel welcome.

**Playful.** Use a little surprise in illustrations and headlines. Keep controls and important messages direct.

**Thoughtful.** Explain what scores mean. A result is a reflection of answers, not a diagnosis or a permanent identity.

**Confident.** Use clear hierarchy, consistent interactions, and restrained decoration. Avoid inflated claims about scientific validity or insight.

## Audience and value

Creators want to turn a distinctive idea into a quiz without building a scoring system themselves. Participants want a fun discovery and a result that feels worth sharing. Meet both needs: expressive content on top of dependable mechanics.

Describe the product as a **personality quiz creator**. “Dimensions,” “archetypes,” and weighted scoring belong in the builder, where they need brief, concrete explanations. Lead marketing copy with the experience rather than engine terminology.

## Voice and writing

Use contractions, sentence case, familiar words, and active verbs. Be lightly witty in headlines; be precise in field labels, errors, and confirmations. Avoid sarcasm that dismisses the creator's idea. Leave room for creator-authored quizzes to have their own voice.

| Context | Direction | Example |
| --- | --- | --- |
| Invitation | Spark curiosity and explain the payoff | “A little curiosity. A lot of personality.” |
| Setup | One approachable step | “What’s your quiz about?” |
| Supporting copy | Short, useful, human | “Give your quiz a name. Turn that spark into personality types, thoughtful questions, and delightful discoveries.” |
| Action | Verb + destination or object | “Continue to Dimensions,” “Add Archetype,” “Publish quiz” |
| Field help | Answer the immediate question | “The first thing people see when they discover your quiz.” |
| Validation | Say what is missing and how to fix it | “Add at least two archetypes before publishing.” |
| Save failure | Preserve confidence; offer a next step | “We couldn’t save your changes. Please try again.” |
| Preview | Explain the boundary | “Preview answers are not saved.” |
| Results | Invite reflection | “Every dimension tells a different part of your story.” |

Do not use internal state language such as “entity invalid” or jokes in errors involving lost work. Avoid fabricated participation counts, claims of clinical accuracy, and population percentiles without real population data. Use complete sentences; use arrows only as directional icons, not a substitute for explanatory text.

The landing-page copy suggestions remain options: changing the hero headline requires a separate editorial choice. This guide does not silently select or replace that copy.

## Logo and name

Write **Personame** as one word with a capital P. Use the existing illustrated profile/question-mark logo at `public/logo.png`, accompanied by the wordmark when space permits. The wordmark uses the established indigo-to-purple treatment.

Keep approximately half the symbol's height as clear space around the combined lockup. Recommended interface symbol sizes are 32–36px; use the symbol alone in a compact mobile header. Preserve aspect ratio, colors, and transparency. Do not stretch, rotate, place it inside another decorative badge, or substitute an emoji for the brand mark.

The source illustrations and logo explorations in `art/` are working assets. The shipped files in `public/` are the production references.

## Color character

The foundation is soft lavender, warm white, deep indigo text, and restrained blue-indigo actions. Purple and pink add personality. Colorful dimension/archetype accents represent authored content, not different meanings for primary actions.

- Use the main action color for the next meaningful step.
- Use the lavender canvas to frame crisp, white working surfaces.
- Use deep ink for headlines and essential information.
- Use positive, warning, and negative colors only with meaningful labels or icons.
- Avoid gradients on every button, neon outlines around every card, or low-contrast pastel text for important content.

Semantic values live in `app/design-tokens.css`, built on the existing Tailwind brand palette. See the design-system guide for roles and usage.

## Three distinct visual languages

Quizzes are **authored collections**: a cover/booklet, colored spine, paper edge, and small editorial label. Dimensions are **instruments**: soft diamonds, facets, sleek tags, vibrant fills with subtle shading, crisp scales, and restrained typography. Archetypes are **characters**: large circular portraits, bold names, decorative frames, tactile textures, and individual accent colors. Preserve these distinct silhouettes wherever they appear together. Color alone must never be the only distinction.

| Element | Quizzes | Dimensions | Archetypes |
| --- | --- | --- | --- |
| Identity | Portrait-format booklet/cover | Rectangular symbol or tag | Circular portrait badge with a centered name ribbon |
| Surface | Paper-like cover, colored spine, layered page edge | Solid, flat, minimal | Framed, lightly textured or patterned |
| Typography | Small editorial “Quiz” label with the actual title beside it | Compact, precise, medium or semibold | Larger and bold |
| Color | Chosen quiz color carried across setup, listing, and participant views | Vibrant solid accents, clearly labelled | A chosen identity color carried through portrait and header |
| Supporting graphics | Folded corner, cover rule, page edges | Precise read-only scales, ticks, and markers | Rings, frames, subtle patterns from the shared illustration world |

This distinction applies to **content identity**, not standard controls. Sliders keep circular thumbs; edit buttons, fields, popovers, and focus states remain consistent throughout the app. Do not square off a familiar control just because it edits a dimension, or add badge decoration to a control just because it edits an archetype.

Do not represent a quiz as an archetype portrait or a dimension tag. Keep its cover identity recognizable at compact and larger sizes. Do not turn dimension identities into circular avatars, medallions, or pill chips. Do not reduce archetypes to generic rectangular tags. Keep dimension data inside an archetype profile sleek and faceted; the enclosing profile remains expressive. New archetypes receive an unused palette color when available; authored color selections remain respected. Decoration must preserve readable names, descriptions, target values, and importance percentages.

## Category iconography

Use this fixed Lucide vocabulary:

| Category | Icon | Meaning |
| --- | --- | --- |
| Quiz | `BookOpen` | An authored experience containing questions |
| Dimension | `SlidersHorizontal` | A dimension to measure and adjust |
| Archetype | `Drama` (drama masks) | Personality, character, and the different roles we embody |

Use category icons in navigation, labelled section headings, add actions, and relevant empty states. Keep them paired with readable labels; they supplement meaning rather than replace it. Individual quizzes, dimensions, and archetypes retain their selected emoji or future image. A category icon is not a replacement for authored artwork. Keep standard action symbols such as pencil, plus, check, and back arrow consistent across categories.

## Illustration direction

The distinctive assets are hand-drawn, densely imaginative little worlds: expressive characters, floating objects, organic paths, and pastel colors with dark, delicate outlines. Use them as the emotional layer; the interface provides order.

| Asset | Role |
| --- | --- |
| `public/images/scene1.png` | Landing-page hero scene |
| `public/images/scene2.png` | Shared atmospheric canvas and fine header texture |
| `public/images/decor/creation.webp` | New quiz and question building |
| `public/images/decor/science.webp` | Dimensions and quiz-taking |
| `public/images/decor/tree-house.webp` | Your quizzes |
| `public/images/decor/galaxy-expansion.webp` | Review and publishing |
| `public/images/decor/party.webp` | Results and celebration |
| `public/images/decor/islands.webp` | Archetypes, welcome, sign-in, and quiz covers |

Use the optimized transparent WebPs for illustration overlays. A header illustration can break above and slightly beyond the right edge of its card; retain the transparent silhouette. Keep its bottom clear of the next interactive panel. The smaller background pattern sits inside the card and fades left, leaving a quieter zone for the title.

The page canvas pattern is much fainter and larger in scale than the card texture. Avoid repeating the same full-strength illustration both inside the header and behind the form. Do not bake headings, controls, or readable interface text into artwork. Informative images need useful alt text; decorative images use empty alt text and never carry essential instructions.

New artwork should match the existing outlines, palette, character expressions, and density. Prefer an existing asset when it already fits the page. Do not replace these illustrations with unrelated stock photography, glossy 3D renders, or generic floating blobs.

## Experience principles

1. **One clear next action.** Make the primary destination obvious; keep destructive and secondary actions distinct.
2. **Explain once, where needed.** A header introduces the step. Fields explain individual choices. Footers explain saving or the next step. Avoid repeated introductory cards and large tip boxes.
3. **Personality in the art; clarity in the controls.** Let the UI recede while preserving a recognizably Personame world.
4. **Protect creative work.** Preserve drafts, warn about unsaved changes, show actionable errors, and distinguish preview from publishing.
5. **Design for a small screen first.** Preserve reading order and usable controls. Reduce decorative density rather than removing necessary information.

## Brand review checklist

- Does the page feel like part of the same illustrated world?
- Is the title readable before the artwork attracts attention?
- Is the promise specific and free of unsupported claims?
- Can a new visitor tell what to do next?
- Are playful flourishes concentrated in the art and invitation?
- Is the interface calm enough for sustained creation?

Dimension identity uses rounded diamond emblems and diamond markers on read-only value bars. Emoji and initials remain upright inside the diamond. Keep facets subtle and precise; avoid gemstone illustrations or heavy textures. Labels stay readable in compact tags. Dimension rows use a quiet neutral outline without a colored top stripe. Standard slider thumbs and edit buttons remain circular.


Color themes are authored palettes with a recognizable color story. The picker offers Aurora, Wildflower, Ember, Lagoon, Moonstone, Rosewater, Orchard, Desert Bloom, Midnight Swim, Peach Fizz, Supernova, and Mint Condition. Dimension shapes stay faceted with blended fills; archetypes use layered circular framing, texture, and accent colors; quizzes retain their cover silhouette. Theme names belong to the UI and stored values contain only ordered hex colors.
