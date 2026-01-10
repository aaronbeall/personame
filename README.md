# Personame 🎭

A modern, slick platform for creating custom personality quizzes with powerful metrics, archetypes, and analytics.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)

## ✨ Features

### 🎨 For Creators
- **Custom Metrics**: Define 3-5 personality dimensions (e.g., Openness, Extraversion)
- **Rich Archetypes**: Create personality types with names, descriptions, colors, emojis, and images
- **Flexible Questions**: Multiple choice and slider questions with metric weightings
- **Analytics**: Visualize quiz coverage and see how well questions map to archetypes
- **Insights**: Track anonymous metrics about quiz takers

### 🎯 For Participants
- **Take Quizzes**: Answer engaging questions to discover your personality type
- **See Results**: Get matched to your closest archetype with detailed explanations
- **Compare**: See how you stack up against other participants
- **Share**: Share your results on social media

### 🏠 Discovery
- **Homepage**: Browse trending and popular Personames
- **Public/Private**: Make quizzes public or keep them private (URL-only access)
- **Social Login**: Sign in with Google or GitHub

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/personame.git
cd personame

# Run setup script
./setup.sh

# Or manually:
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

**📖 Detailed guide:** See [QUICKSTART.md](QUICKSTART.md)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in minutes
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Architecture and development guide
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Implementation roadmap
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google & GitHub OAuth)
- **Analytics**: Visualize quiz coverage and see how well questions map to archetypes
- **Insights**: Track anonymous metrics about quiz takers

### 🎯 For Participants
- **Take Quizzes**: Answer engaging questions to discover your personality type
- **See Results**: Get matched to your closest archetype with detailed explanations
- **Compare**: See how you stack up against other participants
- **Share**: Share your results on social media

### 🏠 Discovery
- **Homepage**: Browse trending and popular Personames
- **Public/Private**: Make quizzes public or keep them private (URL-only access)
- **Social Login**: Sign in with Google or GitHub

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Custom components with shadcn/ui patterns
- **Charts**: Recharts for visualizations
- **Icons**: Lucide React

## 📊 Project Status

### ✅ Completed
- [x] Project setup with Next.js 14 + TypeScript
- [x] Database schema with Prisma
- [x] Authentication (Google & GitHub OAuth)
- [x] Landing page with features showcase
- [x] Quiz creation flow - Step 1: Metrics editor
- [x] API infrastructure
- [x] UI component library

### 🚧 In Progress
See [NEXT_STEPS.md](NEXT_STEPS.md) for detailed roadmap:
- [ ] Archetypes editor (Step 2)
- [ ] Questions builder (Step 3)
- [ ] Quiz taking interface
- [ ] Results calculation and display
- [ ] Analytics dashboard

## 🎯 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OAuth credentials (optional, for authentication)

### Installation

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OAuth credentials
   ```

3. **Initialize database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## 📁 Project Structure

```
personame/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── create/            # Quiz creation flow
│   ├── demo/              # Feature preview
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
└── types/                 # TypeScript types
```

## 🗄️ Database Schema

The app uses a comprehensive schema including:
- **Users & Auth**: NextAuth tables for authentication
- **Personames**: Quiz definitions with status and visibility
- **Metrics**: Personality dimensions (e.g., "Extraversion")
- **Archetypes**: Personality types with target metric values
- **Questions & Answers**: Quiz content with metric weightings
- **Results**: User responses and calculated outcomes

See the [Prisma schema](prisma/schema.prisma) for full details.

## 🛠 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate
```

## 🎨 Design System

- **Colors**: Purple-to-pink gradient primary, subtle background gradients
- **Typography**: Inter font, bold gradient headings
- **Components**: Cards with hover effects, smooth transitions
- **Responsive**: Mobile-first design

Visit [/demo](http://localhost:3000/demo) to see the design system in action!

## 📖 Documentation

- **Architecture**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Roadmap**: See [NEXT_STEPS.md](NEXT_STEPS.md)
- **Overview**: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

Built with ❤️ using Next.js
