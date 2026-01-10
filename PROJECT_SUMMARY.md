# 🎭 Personame - Technical Overview

Comprehensive technical documentation for developers.

## Architecture

Personame is a full-stack Next.js application with:
- **Server-side rendering** for landing pages
- **Client-side interactivity** for quiz creation and taking
- **API Routes** for data management
- **PostgreSQL database** with Prisma ORM
- **NextAuth.js** for authentication

## Technology Stack

### Frontend
- **Next.js 16**: App Router, React Server Components
- **TypeScript**: Strict mode enabled
- **Tailwind CSS 4**: CSS-first configuration with custom color system
- **Lucide React**: Icon library
- **Recharts**: Data visualization (for future charts)

### Backend
- **Node.js**: Runtime environment
- **PostgreSQL 15**: Relational database
- **Prisma 6**: Type-safe ORM
- **NextAuth.js 4**: OAuth authentication (Google, GitHub)

### Development
- **ESLint**: Code quality
- **Prisma Studio**: Database GUI
- **Turbopack**: Fast bundler (Next.js 16 default)

## Project Structure

```
personame/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth.js endpoint
│   │   └── personames/           # Quiz CRUD APIs
│   │       └── [id]/
│   │           └── metrics/      # Metrics API
│   ├── auth/
│   │   └── signin/               # Sign in page
│   ├── create/                   # Quiz creation flow
│   │   ├── page.tsx              # Create new quiz
│   │   └── [id]/
│   │       └── metrics/          # Metrics editor (Step 1)
│   ├── demo/                     # Feature showcase
│   ├── globals.css               # Tailwind config with @theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── slider.tsx
│   ├── app-header.tsx            # Global navigation
│   └── providers.tsx             # React context providers
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Utility functions (cn, etc.)
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── types/
│   └── next-auth.d.ts            # TypeScript declarations
├── public/                       # Static assets
└── tailwind.config.ts            # Minimal Tailwind config
```

## Database Schema

### Overview
14 tables organized into 4 functional groups:

**1. Authentication (NextAuth.js)**
- `User` - User accounts
- `Account` - OAuth providers
- `Session` - Active sessions
- `VerificationToken` - Email verification

**2. Quiz Definition**
- `Personame` - Quiz metadata (title, slug, status, visibility)
- `Metric` - Personality dimensions (name, description, min/max labels)
- `Archetype` - Personality types
- `ArchetypeMetric` - Join table (archetype ↔ metric with target value and relevance)

**3. Quiz Content**
- `QuestionPage` - Groups questions into pages
- `Question` - Question text and type
- `Answer` - Answer options
- `AnswerWeight` - Join table (answer ↔ metric with weight value)

**4. Results**
- `QuizResult` - User responses and calculated archetype match
- `MetricScore` - Individual metric scores for a result

### Key Relationships

```
User
├─→ Personame (1:many, creator)
└─→ QuizResult (1:many, participant)

Personame
├─→ Metric (1:many)
├─→ Archetype (1:many)
├─→ QuestionPage (1:many)
└─→ QuizResult (1:many)

Archetype ←→ Metric (many:many via ArchetypeMetric)
  ArchetypeMetric { targetValue: 0-100, relevance: 0-1 }

QuestionPage
└─→ Question (1:many, ordered)

Question
└─→ Answer (1:many, ordered)

Answer ←→ Metric (many:many via AnswerWeight)
  AnswerWeight { weight: -100 to +100 }

QuizResult
└─→ MetricScore (1:many)
```

### Full Schema

**Personame Model:**
```prisma
model Personame {
  id          String   @id @default(cuid())
  title       String
  description String?
  slug        String   @unique
  status      PersonameStatus @default(DRAFT)
  visibility  PersonameVisibility @default(PRIVATE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(...)
  metrics     Metric[]
  archetypes  Archetype[]
  pages       QuestionPage[]
  results     QuizResult[]
}

enum PersonameStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum PersonameVisibility {
  PUBLIC
  PRIVATE
  UNLISTED
}
```

**Metric Model:**
```prisma
model Metric {
  id           String   @id @default(cuid())
  name         String
  description  String?
  minLabel     String
  maxLabel     String
  order        Int
  personameId  String
  personame    Personame @relation(...)
  archetypeMetrics ArchetypeMetric[]
  answerWeights    AnswerWeight[]
  metricScores     MetricScore[]
}
```

**Archetype Model:**
```prisma
model Archetype {
  id          String   @id @default(cuid())
  name        String
  description String
  emoji       String?
  color       String?
  imageUrl    String?
  personameId String
  personame   Personame @relation(...)
  metrics     ArchetypeMetric[]
  results     QuizResult[]
}

model ArchetypeMetric {
  archetypeId String
  metricId    String
  targetValue Float   // 0-100
  relevance   Float   // 0-1
  archetype   Archetype @relation(...)
  metric      Metric @relation(...)
  @@id([archetypeId, metricId])
}
```

**Question Models:**
```prisma
model QuestionPage {
  id          String   @id @default(cuid())
  order       Int
  title       String?
  personameId String
  personame   Personame @relation(...)
  questions   Question[]
}

model Question {
  id          String   @id @default(cuid())
  text        String
  type        QuestionType @default(MULTIPLE_CHOICE)
  order       Int
  required    Boolean  @default(true)
  pageId      String
  page        QuestionPage @relation(...)
  answers     Answer[]
}

enum QuestionType {
  MULTIPLE_CHOICE
  SLIDER
  SCALE
}

model Answer {
  id         String   @id @default(cuid())
  text       String
  order      Int
  questionId String
  question   Question @relation(...)
  weights    AnswerWeight[]
}

model AnswerWeight {
  answerId String
  metricId String
  weight   Float   // -100 to +100
  answer   Answer @relation(...)
  metric   Metric @relation(...)
  @@id([answerId, metricId])
}
```

**Results Models:**
```prisma
model QuizResult {
  id           String   @id @default(cuid())
  personameId  String
  userId       String?
  archetypeId  String
  createdAt    DateTime @default(now())
  personame    Personame @relation(...)
  user         User? @relation(...)
  archetype    Archetype @relation(...)
  metricScores MetricScore[]
}

model MetricScore {
  id          String   @id @default(cuid())
  resultId    String
  metricId    String
  score       Float    // 0-100
  percentile  Float?   // 0-100
  result      QuizResult @relation(...)
  metric      Metric @relation(...)
}
```

## Algorithms

### Metric Score Calculation

When a user submits quiz answers:

```typescript
// Initialize all metrics to neutral (50)
const metricScores = metrics.map(m => ({ 
  metricId: m.id, 
  value: 50 
}));

// Apply weights from each selected answer
for (const answer of selectedAnswers) {
  for (const weight of answer.weights) {
    const metric = metricScores.find(m => m.metricId === weight.metricId);
    metric.value += weight.weight;
  }
}

// Normalize to 0-100 range
for (const metric of metricScores) {
  metric.value = Math.max(0, Math.min(100, metric.value));
}
```

### Archetype Matching

Find the best-fit archetype using weighted Euclidean distance:

```typescript
function matchArchetype(userScores: MetricScore[], archetypes: Archetype[]) {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const archetype of archetypes) {
    let distance = 0;
    
    for (const metric of archetype.metrics) {
      const userScore = userScores.find(s => s.metricId === metric.metricId);
      const diff = userScore.score - metric.targetValue;
      
      // Weight by relevance
      distance += (diff * diff) * metric.relevance;
    }
    
    distance = Math.sqrt(distance);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = archetype;
    }
  }

  return {
    archetype: bestMatch,
    matchPercentage: (1 - minDistance / 100) * 100
  };
}
```

### Percentile Calculation

Compare user to past participants:

```typescript
async function calculatePercentile(metricId: string, userScore: float) {
  // Get all scores for this metric
  const allScores = await prisma.metricScore.findMany({
    where: { metricId },
    select: { score: true },
    orderBy: { score: 'asc' }
  });

  // Find position
  const lowerCount = allScores.filter(s => s.score < userScore).length;
  const percentile = (lowerCount / allScores.length) * 100;

  return Math.round(percentile);
}
```

## API Routes

### Implemented

**Authentication:**
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

**Personames:**
- `POST /api/personames` - Create new quiz
- `GET /api/personames/[id]` - Fetch quiz details
- `PATCH /api/personames/[id]` - Update quiz metadata
- `DELETE /api/personames/[id]` - Delete quiz

**Metrics:**
- `GET /api/personames/[id]/metrics` - List metrics
- `POST /api/personames/[id]/metrics` - Save all metrics (replaces existing)

### To Implement

**Archetypes:**
- `GET /api/personames/[id]/archetypes`
- `POST /api/personames/[id]/archetypes`

**Questions:**
- `GET /api/personames/[id]/questions`
- `POST /api/personames/[id]/questions`
- `DELETE /api/personames/[id]/questions/[qid]`

**Publishing:**
- `POST /api/personames/[id]/publish`

**Quiz Taking (Public):**
- `GET /api/quiz/[slug]` - Fetch published quiz
- `POST /api/quiz/[slug]/submit` - Submit answers, return result ID

**Results:**
- `GET /api/quiz/[slug]/results/[resultId]`

**Analytics:**
- `GET /api/personames/[id]/analytics`

## Design System

### Color Palette (Tailwind CSS 4)

Defined in [app/globals.css](app/globals.css) using `@theme` directive:

```css
@theme {
  /* Primary: Blue */
  --color-primary-50: #eff2ff;
  --color-primary-600: #5568ff;
  --color-primary-700: #3d4ed9;

  /* Secondary: Purple */
  --color-secondary-50: #faf5ff;
  --color-secondary-600: #a855f7;
  --color-secondary-700: #9333ea;

  /* Accent: Pink */
  --color-accent-50: #fef2f8;
  --color-accent-600: #f91880;
  --color-accent-700: #db2777;

  /* Neutral: Grays */
  --color-muted-50: #f9fafb;
  /* ... full scale 50-900 */
}
```

Usage:
- `bg-primary-600` - Blue backgrounds
- `text-secondary-600` - Purple text
- `border-accent-600` - Pink borders
- Gradients: `bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-600`

### Typography

- **Font**: Inter (system fallback: -apple-system, sans-serif)
- **Headings**: Bold (700), gradient text for hero sections
- **Body**: Regular (400), gray-600 for secondary text
- **Labels**: Medium (500)

### Components

All components follow consistent patterns:
- **Hover states**: Subtle brightness increase
- **Focus states**: Ring with semantic color
- **Transitions**: 150ms ease-in-out
- **Shadows**: Subtle on cards, stronger on hover
- **Borders**: 1px with muted colors

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/personame"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<random-secret>"

# OAuth Providers
GOOGLE_CLIENT_ID="<from-google-cloud>"
GOOGLE_CLIENT_SECRET="<from-google-cloud>"
GITHUB_ID="<from-github>"
GITHUB_SECRET="<from-github>"
```

## Development Workflow

### Initial Setup
```bash
npm install
cp .env.example .env
# Edit .env with credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Common Commands
```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm start                # Start production server

# Database
npx prisma studio        # GUI at localhost:5555
npx prisma migrate dev   # Create/apply migration
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema without migration

# Code Quality
npm run lint             # ESLint
```

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Run `npx prisma generate`
4. Restart dev server if needed

### Debugging Tips

- **Database issues**: Use Prisma Studio to inspect data
- **API errors**: Check browser DevTools Network tab
- **Type errors**: Run `npx tsc --noEmit` to check types
- **Styling issues**: Inspect element to see computed Tailwind classes

## Testing Strategy

(Not yet implemented - recommendations)

### Unit Tests
- Test scoring algorithms in isolation
- Test utility functions
- Test data validation schemas (Zod)

### Integration Tests
- Test API routes with mock database
- Test authentication flows
- Test quiz creation/taking flows

### E2E Tests
- Test complete user journeys (Playwright/Cypress)
- Test cross-browser compatibility
- Test responsive design

## Performance Considerations

### Database
- Add indexes on frequently queried fields (slug, userId, createdAt)
- Use `select` to limit fields returned
- Use `include` judiciously to avoid N+1 queries

### Caching
- Cache published quizzes (Redis or Next.js cache)
- Cache user sessions
- CDN for static assets

### Frontend
- Lazy load charts and heavy components
- Optimize images with Next.js Image
- Code splitting by route (automatic with App Router)

## Security

### Implemented
- OAuth authentication (no password storage)
- Session-based authorization
- Environment variable secrets
- CSRF protection (NextAuth.js)

### Best Practices
- Validate all API inputs with Zod
- Sanitize user content (quiz descriptions, etc.)
- Rate limit API routes
- Use parameterized queries (Prisma handles this)
- Never expose sensitive data in API responses

## Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import repo in Vercel dashboard
3. Add environment variables
4. Connect PostgreSQL (Vercel Postgres or external)
5. Deploy

### Database Migration in Production

```bash
# Apply migrations
npx prisma migrate deploy

# Or push schema directly (not recommended for production)
npx prisma db push
```

### Environment Checklist

- [ ] Set `DATABASE_URL` to production database
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Update OAuth redirect URIs to production domain
- [ ] Enable analytics (Vercel Analytics or similar)
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for assets
- [ ] Set up database backups

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ ] Set up analytics

## Resources

- **Docs**: See DEVELOPMENT.md for architecture details
- **Next Steps**: See NEXT_STEPS.md for implementation guide
- **Schema**: See prisma/schema.prisma for data model
- **Demo**: Visit /demo to see feature preview

## Support & Contributing

This is an open-source project. Contributions welcome!

- Report issues on GitHub
- Submit pull requests
- Suggest features
- Improve documentation

---

Built with ❤️ and modern web technologies
