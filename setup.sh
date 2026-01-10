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
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - OAuth credentials (Google and/or GitHub)"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🗄️  Checking database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo "✅ Database connection successful"
    
    echo "🔄 Running database migrations..."
    npx prisma migrate dev --name init
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 Start the development server with:"
    echo "   npm run dev"
    echo ""
    echo "📊 Open Prisma Studio with:"
    echo "   npx prisma studio"
else
    echo "⚠️  Could not connect to database"
    echo "   Please ensure PostgreSQL is running and DATABASE_URL in .env is correct"
    echo ""
    echo "   Quick PostgreSQL setup with Docker:"
    echo "   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres"
    echo ""
    echo "   Then update DATABASE_URL in .env to:"
    echo "   postgresql://postgres:password@localhost:5432/personame"
fi
