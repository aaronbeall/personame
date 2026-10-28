# Personame 🎭

A platform for creating and sharing custom personality quizzes.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

### For Creators

- **Custom Dimensions**: Define 3-5 personality dimensions (Openness, Extraversion, etc.)
- **Rich Archetypes**: Create personality types with colors, emojis, and target values
- **Flexible Questions**: Multiple choice and slider questions with dimension weightings
- **Analytics**: Visualize quiz coverage and participant results

### For Participants

- **Take Quizzes**: Answer questions to discover your personality type
- **See Results**: Get matched to archetypes with dimension visualizations
- **Share**: Share results on social media

## Core workflow

Create a quiz, define dimensions and archetypes, build question pages, preview, and publish. Participants can answer multiple-choice, slider, and scale questions and receive a shareable archetype result. The creator dashboard lets you return to drafts and live quizzes.

See [Core workflow and verification](docs/CORE_WORKFLOW.md) for scoring rules, migrations, and tests.

## Brand and design

- [Brand guide](docs/BRAND_GUIDE.md): voice, identity, illustrations, and experience principles.
- [Design system](docs/DESIGN_SYSTEM.md): tokens, components, layouts, and accessibility guidance.
- Live reference: `/design-system` on the running app, with interactive production components.

## Tests and starter quizzes

- [Run, watch, and replay the tests](docs/TESTING.md)
- [Edit and import the starter quiz catalog](docs/SEED_QUIZZES.md) — definitions in `content/seed-quizzes.yaml`.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js (Google & GitHub OAuth)

## 📖 Documentation

- **Get Started:** See [QUICKSTART.md](QUICKSTART.md)
- **Architecture**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Roadmap**: See [NEXT_STEPS.md](NEXT_STEPS.md)
- **Overview**: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

Built with ❤️ and 🍌
