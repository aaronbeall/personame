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

Create a quiz, define dimensions and archetypes, build question pages, preview, and publish. Participants can answer multiple-choice, slider, and scale questions and receive a shareable archetype result. Your quizzes lets you return to drafts and live quizzes.

See [Core workflow and verification](docs/CORE_WORKFLOW.md) for scoring rules, migrations, and tests. [API performance](docs/API_PERFORMANCE.md) documents bounded collections, targeted reads, save batching, and cache behavior.

## Brand and design

- [Brand guide](docs/BRAND_GUIDE.md): voice, identity, illustrations, and experience principles.
- [Design system](docs/DESIGN_SYSTEM.md): tokens, components, layouts, and accessibility guidance.
- Live reference: `/design-system` on the running app, with interactive production components.

## Tests and starter quizzes

- [Run, watch, and replay the tests](docs/TESTING.md)
- [Edit and import the starter quiz catalog (eight public samples and three private drafts)](docs/SEED_QUIZZES.md) — definitions in `content/seed-quizzes.yaml`.

## Deployment

See [Deployment and hosting costs](docs/DEPLOYMENT.md) for the recommended Vercel + Neon setup, launch budget, environment variables, and remaining deployment work.

## Commercial planning

Research and proposed plans, checked October 28, 2026; no commercial features or pricing are implemented by these documents.

- [Competitive analysis](docs/business/COMPETITIVE_ANALYSIS.md): nine adjacent products, observed pricing, differentiation, and evidence gaps.
- [Product thesis](docs/business/PRODUCT_THESIS.md): creative dimension models, diagnostics, collectible illustrated selves, and a core-first roadmap with optional business expansion.
- [Monetization strategy](docs/business/MONETIZATION_STRATEGY.md): free social core, creator subscriptions, permissioned audience insight, pricing experiments, and economics.
- [Implementation plan](docs/business/IMPLEMENTATION_PLAN.md): phased backlog, model/API changes, validation gates, and test coverage.
- [Naming research](docs/business/NAMING_RESEARCH.md): existing uses of Personame, Personome, and Personica; domain screening and creative alternatives.

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
