# Local Development Guide

How to set up and work on Personame locally.

## Prerequisites

- Node.js 18+
- PostgreSQL 15 (or Docker)
- Git

See [QUICKSTART.md](QUICKSTART.md) for detailed setup.

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

See [QUICKSTART.md](QUICKSTART.md) for how to populate `.env`.

### 3. Database Setup

*First make sure database is running.* 

See [QUICKSTART.md](QUICKSTART.md) for how to run PostgreSQL locally, and ensure your `.env` URL is correct.

First time, or when `schema.prisma` changes:

```bash
# Generate Prisma client code
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev

# (Optional) Populate with sample data
npm run db:seed
```

After initial install, tables will persist and you don't need to run these again unless schema changes.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Common Development Tasks

### Running the Dev Server

```bash
npm run dev
```

Server runs on http://localhost:3000 with hot reload enabled (Turbopack).

### Viewing the Database

```bash
npx prisma studio
```

Opens interactive database GUI at http://localhost:5555. Great for:
- Inspecting data
- Testing relationships
- Debugging schema issues
- Manual data entry

### Making Database Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```
3. Prisma client auto-generates
4. Dev server auto-reloads

### Type Checking

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### Code Linting

```bash
# Run ESLint
npm run lint

# Fix fixable issues
npm run lint -- --fix
```

### Building for Production

```bash
npm run build
npm start
```

## Debugging

### Browser DevTools

1. Open http://localhost:3000 in Chrome/Firefox
2. Press F12 to open DevTools
3. **Network tab**: View API requests/responses
4. **Console tab**: Check for errors
5. **React DevTools** (extension): Inspect component tree

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Prisma Studio Debugging

Inspect database state while development server is running:

```bash
npx prisma studio
```

Check what data actually got saved vs. what you expected.

### API Debugging

Test API routes with curl or Postman:

```bash
# Create personame
curl -X POST http://localhost:3000/api/personames \
  -H "Content-Type: application/json" \
  -d '{"title":"My Quiz","description":"Test"}'

# List personames
curl http://localhost:3000/api/personames
```

## File Organization

### App Structure
- `app/` - Pages and API routes
- `components/` - React components
- `lib/` - Utilities (auth, database, helpers)
- `prisma/` - Database schema and migrations
- `types/` - TypeScript type definitions
- `public/` - Static assets (logos, images)

### Adding a New Page

1. Create file: `app/new-feature/page.tsx`
2. Add navigation link in `components/app-header.tsx`
3. Use `useRouter` from `next/navigation` for links
4. Style with Tailwind CSS

### Adding an API Route

1. Create file: `app/api/new-feature/route.ts`
2. Export handlers: `export async function GET(req) { ... }`
3. Return JSON: `return NextResponse.json({ data })`
4. Use Zod for input validation (see existing routes)

### Adding a Component

1. Create file: `components/MyComponent.tsx`
2. Use TypeScript for props
3. Export as default
4. Style with Tailwind classes from `globals.css`

## Testing

### Manual Testing

Test features directly in browser:

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Test user flows end-to-end
4. Check console for errors
5. Use DevTools to inspect network

### Unit Tests (to implement)

```bash
# Run tests
npm run test

# Watch mode
npm run test -- --watch
```

### Component Testing

Test components in isolation using React Testing Library (to add).

### E2E Testing

Test complete user flows with Playwright or Cypress (to add).

## Database Management

### Seeding with Sample Data

Load test data into your database:

```bash
npm run db:seed
```

This populates the database with:
- **Test user**: `test@personame.dev` (no password, use OAuth or Prisma Studio)
- **Sample quiz**: Complete personality assessment with all components
- **Metrics**: 4 personality dimensions (Extraversion, Intuition, Thinking, Structure)
- **Archetypes**: 4 personality types (Advocate, Logistician, Entertainer, Architect)
- **Questions**: 4 questions with multiple choice answers and metric weights
- **Results**: 2 sample results for testing analytics and comparisons

Great for:
- Testing quiz taking flow with real data
- Developing analytics features
- Understanding data relationships
- Demo/screenshot purposes

**Note:** Seeding is safe to run multiple times (uses `upsert` to avoid duplicates).

### Inspecting Tables

```bash
npx prisma studio
```

Then navigate to any table to view/edit records.

### Querying Data

```bash
# Execute raw SQL
npx prisma db execute --stdin <<< "SELECT * FROM Personame LIMIT 10;"
```

### Resetting Database

⚠️ **Warning: Deletes all data**

```bash
npx prisma migrate reset
```

Use only in development.

## Performance Tips

### Development Server Speed

- Turbopack is enabled (faster than Webpack)
- Hot reload should be near-instant
- If slow, try: `rm -rf .next && npm run dev`

### Database Queries

- Use Prisma `select` to fetch only needed fields
- Use `include` to load relations
- Avoid N+1 queries (check dev console)
- Example:
  ```typescript
  const personame = await prisma.personame.findUnique({
    where: { id },
    include: { metrics: true, archetypes: true }
  });
  ```

### Client-Side Performance

- Use React DevTools Profiler to find slow components
- Lazy load heavy components: `const Chart = dynamic(() => import('./Chart'))`
- Memoize expensive computations: `useMemo`, `useCallback`

## Environment Variables

See `.env.example` for all variables.

## Troubleshooting

### "Cannot find module" errors

```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Database connection errors

1. Check PostgreSQL is running: `brew services list` (macOS) or `docker ps`
2. Verify `DATABASE_URL` in `.env`
3. Test connection: `npx prisma db execute --stdin <<< "SELECT 1;"`

### NextAuth not recognizing user

1. Check cookies in browser DevTools
2. Verify session exists: `npx prisma studio` → Session table
3. Try signing out and back in

### Styling not updating

1. Check Tailwind classes are in `globals.css` `@theme` block
2. Verify class names are correct (typos break styling)
3. Restart dev server: `npm run dev`

## Architecture & Technical Details

For complete technical documentation, see:
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Architecture, schema, algorithms
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Development roadmap

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
