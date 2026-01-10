# Next Steps for Personame

Development roadmap and implementation priorities.

## Current Status

### ✅ Completed
- Project setup (Next.js 16, TypeScript, Tailwind CSS 4)
- Database schema with Prisma
- Authentication (Google & GitHub OAuth)
- Landing page with hero and features
- Quiz creation starter page
- **Metrics editor** with full CRUD operations

### 🚧 Up Next
See priority features below.

## Priority 1: Complete Quiz Creation Flow

### A. Archetypes Editor
**Path:** `/create/[id]/archetypes`

Build the interface for defining personality types:

**Features:**
- Add/remove/edit archetypes
- Set name, description, emoji, color
- For each metric: define target value (0-100) and relevance weight (0-1)
- Visualization: radar chart showing archetype positions in metric space
- Analysis: diversity score showing how well-spread archetypes are

**API Route:**
```typescript
// app/api/personames/[id]/archetypes/route.ts
GET  - Fetch all archetypes
POST - Save archetypes with metric targets
```

**Component Suggestions:**
- `ArchetypeEditor.tsx` - Form for archetype properties
- `MetricTargetSlider.tsx` - Slider for setting target values
- `ArchetypeRadarChart.tsx` - Recharts radar visualization
- `DiversityAnalysis.tsx` - Shows archetype spread

### B. Questions Builder
**Path:** `/create/[id]/questions`

Create the question and answer system:

**Features:**
- Organize questions into pages
- Question types: multiple choice, slider
- For each answer: assign weights to metrics (-100 to +100)
- Drag-and-drop reordering
- Preview mode
- Coverage analysis: visualize which metric ranges questions cover

**API Routes:**
```typescript
// app/api/personames/[id]/questions/route.ts
GET    - Fetch all questions and pages
POST   - Save questions structure
DELETE - Remove question

// app/api/personames/[id]/publish/route.ts
POST - Publish quiz (set status to PUBLISHED)
```

**Component Suggestions:**
- `QuestionBuilder.tsx` - Question form (text, type, answers)
- `AnswerWeightEditor.tsx` - UI for assigning metric weights
- `CoverageHeatmap.tsx` - Visualize metric coverage
- `QuestionPreview.tsx` - Preview mode

### C. Review & Publish
**Path:** `/create/[id]/review`

Final review before publishing:

**Features:**
- Summary of metrics, archetypes, questions
- Validation checks (enough questions, metrics covered, etc.)
- Preview quiz in taking mode
- Publish button
- Generate shareable slug/URL

## Priority 2: Quiz Taking & Results

### D. Quiz Taking Interface
**Path:** `/quiz/[slug]`

Public interface for taking quizzes:

**Features:**
- Display questions page by page
- Progress indicator
- Answer selection/input
- Validation (required questions)
- Submit and calculate results

**API Routes:**
```typescript
// app/api/quiz/[slug]/route.ts
GET - Fetch published quiz (public endpoint)

// app/api/quiz/[slug]/submit/route.ts
POST - Submit answers, calculate result, return result ID
```

**Scoring Algorithm:**
```typescript
// lib/quiz-calculations.ts
1. Initialize all metrics to 50 (neutral)
2. For each answer:
   - Add answer's weight to corresponding metric
3. Normalize scores to 0-100 range
4. For each archetype:
   - Calculate weighted Euclidean distance
   - Factor in metric relevance weights
5. Return archetype with smallest distance
```

### E. Results Display
**Path:** `/quiz/[slug]/results/[id]`

Show quiz results:

**Features:**
- Matched archetype with full description
- Metric scores visualization (radar chart)
- Percentile comparisons ("You're more extraverted than 67% of people")
- Share buttons (Twitter, Facebook, Copy Link)
- Retake quiz option

**API Route:**
```typescript
// app/api/quiz/[slug]/results/[id]/route.ts
GET - Fetch result with comparisons
```

**Component Suggestions:**
- `ResultsHero.tsx` - Archetype display
- `MetricScoresChart.tsx` - Radar chart
- `PercentileComparisons.tsx` - Show rankings
- `ShareButtons.tsx` - Social sharing

## Priority 3: Analytics & Discovery

### F. Analytics Dashboard
**Path:** `/dashboard/[id]/analytics`

Creator analytics:

**Features:**
- Total views and completions
- Archetype distribution (pie chart)
- Metric score distributions (histograms)
- Time-based trends
- Demographic insights (if collected)

### G. Homepage Enhancement

Improve discovery:

**Features:**
- Load real quizzes from database
- Trending (most taken recently)
- Popular (most completions overall)
- Recent (newly published)
- Search functionality
- Category filtering

### H. User Profile
**Path:** `/profile`

User dashboard:

**Features:**
- Created quizzes (with edit links)
- Taken quizzes (with result links)
- Statistics
- Settings

## Component Library Needs

### Visualization Components
```tsx
// components/charts/
RadarChart.tsx          // Metric scores visualization
ArchetypeMap.tsx        // 2D plot of archetypes
CoverageHeatmap.tsx     // Question coverage analysis
DistributionChart.tsx   // Histograms for analytics
```

### Builder Components
```tsx
// components/builders/
QuestionBuilder.tsx       // Question form
AnswerWeightEditor.tsx   // Metric weight assignment
ArchetypeEditor.tsx      // Archetype form with sliders
PageOrganizer.tsx        // Drag-drop page organization
```

### Quiz Components
```tsx
// components/quiz/
QuestionDisplay.tsx      // Display question
AnswerOption.tsx         // Answer choice
ProgressBar.tsx          // Quiz progress
ResultsCard.tsx          // Result display
```

## Code Quality Improvements

- [ ] Add JSDoc comments to complex functions
- [ ] Write unit tests for scoring algorithms
- [ ] Add E2E tests for quiz creation flow
- [ ] Set up error tracking (Sentry)
- [ ] Add loading skeleton components
- [ ] Optimize database queries with proper indexes
- [ ] Add API rate limiting
- [ ] Implement caching for public quizzes

## Advanced Features (Future)

### Enhanced Question Types
- Image-based questions
- Ranking questions (order items)
- Matrix questions (rate multiple items)
- Open-ended text responses

### Social Features
- Comments on results
- Compare with friends
- Leaderboards
- Badges/achievements

### Creator Tools
- A/B testing different questions
- Question analytics (which answers chosen most)
- Duplicate quiz functionality
- Templates for common quiz types

### Platform Features
- Teams/organizations
- White-label embedding
- Premium features (custom domains, remove branding)
- API for third-party integrations

## Database Optimizations

After basic features work:

- [ ] Add indexes for common queries
- [ ] Implement soft deletes for quizzes
- [ ] Add caching layer (Redis)
- [ ] Archive old results (data retention policy)
- [ ] Optimize slug generation (ensure uniqueness)

## Development Tips

- Use Prisma Studio to inspect data: `npx prisma studio`
- Check API responses in browser DevTools Network tab
- Use React DevTools to debug component state
- Test responsive design in mobile viewport
- Use TypeScript strict mode to catch errors early
- Need to implement remaining creation steps
- Need quiz taking flow
- Need results display

### 📋 To Do
- Archetypes editor
- Questions builder
- Quiz preview
- Publishing workflow
- All remaining API routes
- Results calculation and display
- Analytics and insights
- Social sharing

## Getting Help

- Check DEVELOPMENT.md for detailed architecture
- Review Prisma schema for data model
- Look at existing components for patterns
- NextAuth.js docs for auth questions
- Recharts docs for visualizations
