# Personame Development Guide

## Architecture Overview

Personame is built with Next.js 14 using the App Router, TypeScript, and a PostgreSQL database managed by Prisma ORM.

### Key Concepts

#### 1. Personame (Quiz)
A complete personality assessment consisting of:
- **Metrics**: 3-5 personality dimensions (e.g., Openness, Extraversion)
- **Archetypes**: Personality types with target metric values
- **Questions**: Quiz questions with answers that weight metrics

#### 2. Creation Flow
1. **Step 1: Metrics** - Define personality dimensions
2. **Step 2: Archetypes** - Create personality types with target values
3. **Step 3: Questions** - Build quiz questions with metric weightings

#### 3. Taking Flow
1. User answers all questions
2. System calculates metric scores
3. System matches to closest archetype
4. Results displayed with comparisons

## Database Schema

### Core Models

**Personame**
- Main quiz entity
- Has status (DRAFT, PUBLISHED, CLOSED)
- Has visibility (PRIVATE, PUBLIC)

**Metric**
- Personality dimension (e.g., "Extraversion")
- Has minLabel and maxLabel (e.g., "Introverted" → "Extraverted")
- Order determines display sequence

**Archetype**
- Personality type/result
- Has name, description, emoji, color, imageUrl
- Connected to metrics via ArchetypeMetric

**ArchetypeMetric**
- Junction table between Archetype and Metric
- Contains targetValue (0-100) and relevance (0-1)
- Used for matching user scores to archetypes

**Question & Answer**
- Quiz questions organized into pages
- Answers have AnswerWeight entries
- Each AnswerWeight affects a metric by a value

**QuizResult**
- Stores user's completed quiz
- Links to matched archetype
- Contains UserAnswer and MetricScore records

## API Routes

### `/api/personames`
- GET: List personames (with filters)
- POST: Create new personame

### `/api/personames/[id]/metrics`
- GET: Fetch metrics for a personame
- POST: Save metrics (replaces all)

### Additional Routes to Implement

```
/api/personames/[id]/archetypes
/api/personames/[id]/questions
/api/personames/[id]/publish
/api/quiz/[slug]/take
/api/quiz/[slug]/submit
/api/quiz/[slug]/results/[resultId]
```

## Component Structure

### UI Components (`components/ui/`)
- Reusable, unstyled components
- Built following shadcn/ui patterns
- Examples: Button, Card, Input, Slider

### Feature Components (to build)
```
components/
├── quiz/
│   ├── QuestionBuilder.tsx
│   ├── QuizPreview.tsx
│   └── MetricWeightEditor.tsx
├── archetypes/
│   ├── ArchetypeEditor.tsx
│   ├── ArchetypeCard.tsx
│   └── MetricTargetSlider.tsx
└── results/
    ├── ResultDisplay.tsx
    ├── MetricChart.tsx
    └── ComparisonStats.tsx
```

## Scoring Algorithm

### 1. Calculate Metric Scores
```typescript
// Start at neutral (50)
// Add weights from each answer
// Normalize to 0-100 range
```

### 2. Match to Archetype
```typescript
// For each archetype:
//   Calculate weighted Euclidean distance
//   Consider relevance of each metric
// Return archetype with smallest distance
```

### 3. Generate Comparisons
```typescript
// Query all results for this personame
// Calculate percentiles for each metric
// Count archetype distribution
```

## Styling Guidelines

### Colors
- Primary: Purple gradient (purple-600 to pink-600)
- Accent: Pink
- Background: Gradient from purple-50 via pink-50 to blue-50

### Typography
- Headings: Bold, gradient text for main titles
- Body: Inter font, readable sizes

### Components
- Cards with subtle borders and hover effects
- Rounded corners (rounded-lg, rounded-2xl)
- Smooth transitions

## Authentication

Using NextAuth.js with:
- Google OAuth
- GitHub OAuth
- Session-based authentication
- Prisma adapter for database storage

## Development Workflow

1. **Local Database**
```bash
# Start PostgreSQL (or use Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Development Server**
```bash
npm run dev
```

## Testing Strategy

### Unit Tests (to add)
- Quiz calculation functions
- Utility functions
- Validation schemas

### Integration Tests (to add)
- API routes
- Database operations
- Authentication flow

### E2E Tests (to add)
- Quiz creation flow
- Quiz taking flow
- Results display

## Performance Considerations

1. **Database Queries**
   - Use Prisma's include/select for optimized queries
   - Add indexes on frequently queried fields
   - Consider pagination for large result sets

2. **Caching**
   - Cache public personames list
   - Cache quiz questions for taking flow
   - Use React Query for client-side caching

3. **Images**
   - Use Next.js Image component
   - Consider CDN for archetype images
   - Optimize emoji rendering

## Security Considerations

1. **Authentication**
   - Verify user owns personame before editing
   - Rate limit quiz submissions
   - Sanitize user inputs

2. **Data Privacy**
   - Anonymous results by default
   - User must login to save results
   - No PII in quiz results

3. **Validation**
   - Use Zod schemas for all inputs
   - Validate metric ranges (0-100)
   - Check archetype relevance (0-1)

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Required for production:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GITHUB_ID
- GITHUB_SECRET

### Database
- Use Vercel Postgres, Supabase, or any PostgreSQL provider
- Run migrations: `npx prisma migrate deploy`
- Generate client: `npx prisma generate`

## Roadmap

### Phase 1: Core Creation ✅
- [x] Landing page
- [x] Authentication
- [x] Metrics editor
- [ ] Archetypes editor
- [ ] Question builder

### Phase 2: Taking & Results
- [ ] Quiz taking interface
- [ ] Results calculation
- [ ] Results display
- [ ] Analytics dashboard

### Phase 3: Discovery & Social
- [ ] Public personames listing
- [ ] Search and filters
- [ ] Social sharing
- [ ] User profiles

### Phase 4: Enhancements
- [ ] Archetype diversity analysis
- [ ] Quiz coverage visualization
- [ ] Achievements system
- [ ] Advanced insights

## Contributing

See CONTRIBUTING.md for guidelines (to be created).

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
