#!/bin/bash

echo "🎭 Personame Setup Script"
echo "========================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your credentials:"
    echo "   - DATABASE_URL (connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - OAuth credentials (Google and/or GitHub)"
    echo ""
fi

# Offer to configure .env interactively
echo "🧩 Configure environment variables (.env)"
read -p "Would you like to configure .env now? [y/N]: " CONFIG_ENV
if [[ "$CONFIG_ENV" =~ ^[Yy]$ ]]; then
    # Choose database setup
    echo ""
    echo "📦 Choose database setup:"
    echo "  1) Local PostgreSQL (host: localhost, port: 5432)"
    echo "  2) Docker PostgreSQL (start a local container)"
    read -p "Select an option [1/2] (default 1): " DB_OPTION
    DB_OPTION=${DB_OPTION:-1}

    # Defaults
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_NAME="personame"
    DB_USER="postgres"
    DB_PASS="postgres"

    if [ "$DB_OPTION" = "2" ]; then
        if command -v docker >/dev/null 2>&1; then
            echo "🐳 Starting Docker PostgreSQL container (personame-db)..."
            docker run -d \
                --name personame-db \
                -e POSTGRES_USER=personame \
                -e POSTGRES_PASSWORD=personame \
                -e POSTGRES_DB=personame \
                -p 5432:5432 \
                postgres:15 >/dev/null 2>&1 || true
            DB_USER="personame"
            DB_PASS="personame"
        else
            echo "❌ Docker not found. Falling back to local PostgreSQL settings."
        fi
    else
        echo ""
        read -p "PostgreSQL host [localhost]: " INPUT_HOST; DB_HOST=${INPUT_HOST:-$DB_HOST}
        read -p "PostgreSQL port [5432]: " INPUT_PORT; DB_PORT=${INPUT_PORT:-$DB_PORT}
        read -p "Database name [personame]: " INPUT_DB; DB_NAME=${INPUT_DB:-$DB_NAME}
        read -p "PostgreSQL user [postgres]: " INPUT_USER; DB_USER=${INPUT_USER:-$DB_USER}
        read -p "PostgreSQL password [postgres]: " INPUT_PASS; DB_PASS=${INPUT_PASS:-$DB_PASS}
    fi

    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

    # NEXTAUTH_URL
    read -p "NEXTAUTH_URL [http://localhost:3000]: " INPUT_NEXTAUTH_URL
    NEXTAUTH_URL=${INPUT_NEXTAUTH_URL:-"http://localhost:3000"}

    # Generate NEXTAUTH_SECRET if possible
    if command -v openssl >/dev/null 2>&1; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    else
        # Fallback simple generator
        NEXTAUTH_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)
    fi

    echo ""
    echo "🔐 Generated NEXTAUTH_SECRET"

    # Backup existing .env if present
    if [ -f .env ]; then
        cp .env .env.backup
        echo "🗃️  Backed up existing .env to .env.backup"
    fi

    # Write .env
    cat > .env <<EOF
DATABASE_URL="${DATABASE_URL}"
NEXTAUTH_URL="${NEXTAUTH_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Optional OAuth (fill as needed)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
EOF
    echo "✅ Wrote environment variables to .env"
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client (needed before we can check database)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🗄️  Checking database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo "✅ Database connection successful"
    
    echo "🔄 Running database migrations..."
    npx prisma migrate dev --name init
    
        # Offer to seed sample data
        echo ""
        read -p "🌱 Seed sample data now? [y/N]: " SEED_NOW
        if [[ "$SEED_NOW" =~ ^[Yy]$ ]]; then
            npm run db:seed || true
        fi
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 Start the development server with:"
    echo "   npm run dev"
    echo ""
    echo "📊 Open Prisma Studio with:"
    echo "   npx prisma studio"
else
    echo ""
    echo "❌ Could not connect to database"
    echo ""
    echo "PostgreSQL is not running or DATABASE_URL in .env is incorrect."
    echo ""
    echo "💡 Start PostgreSQL using one of these methods:"
    echo ""
    echo "   macOS (Homebrew):"
    echo "   brew services start postgresql"
    echo ""
    echo "   Linux (systemctl):"
    echo "   sudo systemctl start postgresql"
    echo ""
    echo "   Docker:"
    echo "   docker run -d --name personame-db -e POSTGRES_USER=personame -e POSTGRES_PASSWORD=personame -e POSTGRES_DB=personame -p 5432:5432 postgres:15"
    echo ""
    echo "📝 Then verify DATABASE_URL in .env matches your setup:"
    echo "   • Local: postgresql://postgres:password@localhost:5432/personame"
    echo "   • Docker: postgresql://personame:personame@localhost:5432/personame"
    echo ""
    echo "Once PostgreSQL is running and .env is correct, run this script again."
    exit 1
fi

