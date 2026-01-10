# 🚀 Quick Start Guide

Get Personame running on your machine in 5 minutes.

## Prerequisites

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** or **Docker** - ([PostgreSQL install](https://www.postgresql.org/download/) or [Docker](https://www.docker.com/))
- ✅ **Git** ([Download](https://git-scm.com/))

## Option 1: Automated Setup

```bash
git clone https://github.com/aaronbeall/personame.git
cd personame
./setup.sh
```

This script will:
1. Install dependencies
2. Offer interactive `.env` configuration (database, `NEXTAUTH_URL`, generate `NEXTAUTH_SECRET`)
3. Optionally start a Docker PostgreSQL container
4. Generate Prisma client
5. Run database migrations
6. Optionally seed sample data

If the script reports a database connection error, update `.env` with the correct `DATABASE_URL` (see "Initialize Database" configuration below) and rerun `./setup.sh`.

Then start the dev server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:

**Required:**
- `DATABASE_URL` - See "Initialize Database" section below for the connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000`

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID` and `GITHUB_SECRET`

### 3. Initialize Database

Choose one option below:

#### Option A: Local PostgreSQL

Make sure PostgreSQL is running:

**macOS (Homebrew):**
```bash
brew services start postgresql
```

**Linux (systemctl):**
```bash
sudo systemctl start postgresql
```

**Windows:**
- PostgreSQL runs as a service automatically after installation

Verify it's running:
```bash
psql --version
```

Create database and user (recommended):
```bash
# Create a dedicated role with password and a database owned by it
psql -h localhost -d postgres -c "CREATE ROLE personame WITH LOGIN PASSWORD 'personame';"
psql -h localhost -d postgres -c "ALTER ROLE personame CREATEDB;"
psql -h localhost -d postgres -c "CREATE DATABASE personame OWNER personame;"
```

Set your `DATABASE_URL` in `.env`:

If you created the `personame` role above, use:
```
postgresql://personame:personame@localhost:5432/personame
```

If your local Postgres uses trust/peer auth (Homebrew default), you can use your macOS username without a password:
```
postgresql://$(whoami)@localhost:5432/personame
```

#### Option B: Docker PostgreSQL (Simpler)

Run PostgreSQL in Docker:

```bash
docker run -d \
  --name personame-db \
  -e POSTGRES_USER=personame \
  -e POSTGRES_PASSWORD=personame \
  -e POSTGRES_DB=personame \
  -p 5432:5432 \
  postgres:15
```

Set your `DATABASE_URL` in `.env`:
```
postgresql://personame:personame@localhost:5432/personame
```

#### Then: Run Migrations

After choosing your database option and setting `DATABASE_URL`:

```bash
# Generate Prisma client code
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev
```

This will prompt you to name the migration (e.g., "init") and create your database schema.

You can also load sample data (optional):
```bash
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Database Management

View and edit data with Prisma Studio:
```bash
npx prisma studio
```

Opens at [http://localhost:5555](http://localhost:5555) - great for debugging!

## Setting Up OAuth

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → "APIs & Services" → "Credentials"
3. "Create Credentials" → "OAuth client ID" → "Web application"
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. "New OAuth App"
3. Fill in:
   - Application name: `Personame (Dev)`
   - Homepage: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI (port 5555)
npx prisma db push       # Push schema without migration
```

## Troubleshooting

### Cannot connect to database

**Check PostgreSQL is running:**
```bash
# macOS with Homebrew
brew services list

# Docker
docker ps
```

**Verify DATABASE_URL format:**
```
postgresql://user:password@localhost:5432/database_name
```

**Test connection:**
```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Module not found errors

Regenerate Prisma client:
```bash
npx prisma generate
```

### OAuth not working

1. Verify redirect URIs match exactly
2. Check client ID and secret in `.env`
3. Ensure variables are loaded (restart dev server)

### Port already in use

Change the port:
```bash
PORT=3001 npm run dev
```

### Prisma client out of sync

After schema changes:
```bash
npx prisma generate
npx prisma migrate dev
```

## What's Next?
 
 - ✅ You're running! Create your first quiz at [/create](http://localhost:3000/create)
 - 📖 See [NEXT_STEPS.md](NEXT_STEPS.md) for the development roadmap
 - 🔧 See [DEVELOPMENT.md](DEVELOPMENT.md) for local development details
 - 📚 See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical overview
