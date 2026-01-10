# 🚀 Quick Start Guide

## Welcome to Personame!

This guide will help you get Personame up and running in minutes.

## Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18 or higher ([Download here](https://nodejs.org/))
- ✅ PostgreSQL database ([Install guide](https://www.postgresql.org/download/) or use Docker)
- ✅ Git ([Download here](https://git-scm.com/))

## Option 1: Automated Setup (Recommended)

Run our setup script:

```bash
./setup.sh
```

This will:
1. Create your `.env` file
2. Install dependencies
3. Generate Prisma client
4. Run database migrations

## Option 2: Manual Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID` and `GITHUB_SECRET`

### Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Quick Database Setup with Docker

Don't have PostgreSQL installed? Use Docker:

```bash
# Start PostgreSQL in a container
docker run -d \
  --name personame-db \
  -e POSTGRES_USER=personame \
  -e POSTGRES_PASSWORD=personame \
  -e POSTGRES_DB=personame \
  -p 5432:5432 \
  postgres:15

# Use this DATABASE_URL in your .env:
# postgresql://personame:personame@localhost:5432/personame
```

## Setting Up OAuth (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Personame (Dev)`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env`

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:push          # Push schema without migration

# Linting
npm run lint             # Run ESLint
```

## Exploring the App

### Pages to Check Out

1. **Landing Page** - [http://localhost:3000](http://localhost:3000)
   - Beautiful hero section
   - Feature showcase
   - Trending quizzes

2. **Demo Page** - [http://localhost:3000/demo](http://localhost:3000/demo)
   - Feature preview
   - Example results
   - Visual walkthrough

3. **Sign In** - [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
   - OAuth authentication
   - Google & GitHub login

4. **Create Quiz** - [http://localhost:3000/create](http://localhost:3000/create)
   - Start creating a personality quiz
   - Define metrics

### Database Management

Open Prisma Studio to view/edit your database:

```bash
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Add/edit/delete records
- Test relationships
- Debug data issues

## Troubleshooting

### "Cannot connect to database"

1. Check if PostgreSQL is running:
   ```bash
   # macOS with Homebrew
   brew services list
   
   # Docker
   docker ps
   ```

2. Verify `DATABASE_URL` in `.env`:
   ```
   postgresql://user:password@localhost:5432/database_name
   ```

3. Test connection:
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

### "Module not found" errors

Regenerate Prisma client:
```bash
npx prisma generate
```

### OAuth not working

1. Check redirect URIs match exactly
2. Verify client ID and secret in `.env`
3. Make sure OAuth app is not in development mode (for production)
4. Check browser console for specific errors

### Port already in use

Change the port:
```bash
PORT=3001 npm run dev
```

## What to Build Next?

Check out these guides:

1. **[NEXT_STEPS.md](NEXT_STEPS.md)** - Implementation roadmap
2. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Architecture details
3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete overview

## Getting Help

- 📖 Check the documentation files
- 🐛 Found a bug? Open an issue
- 💡 Have an idea? Start a discussion
- 📧 Need help? Ask in the community

## Key Features to Explore

### Current Features ✅
- Landing page with hero section
- Authentication (Google & GitHub)
- Quiz creation starter
- Metrics editor (Step 1)

### Coming Soon 🚧
- Archetypes editor (Step 2)
- Questions builder (Step 3)
- Quiz taking interface
- Results and analytics

## Tips for Development

1. **Keep Prisma Studio open** - Great for debugging database issues
2. **Check the console** - Both browser and terminal for errors
3. **Use the demo page** - Visual reference for what you're building
4. **Read the schema** - `prisma/schema.prisma` explains the data model
5. **Follow the patterns** - Look at existing components for guidance

## Production Deployment

When ready to deploy:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

See deployment guide in [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Ready to create something amazing! 🎨✨**

Visit [http://localhost:3000](http://localhost:3000) to get started!
