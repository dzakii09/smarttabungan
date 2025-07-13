# Database Setup Script for SmartTabungan
# This script helps you configure the database connection

Write-Host "=== SmartTabungan Database Setup ===" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file from env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Choose your database setup option:" -ForegroundColor Cyan
Write-Host "1. Install PostgreSQL locally" -ForegroundColor White
Write-Host "2. Use Docker PostgreSQL" -ForegroundColor White
Write-Host "3. Use Supabase (online)" -ForegroundColor White
Write-Host "4. Use Railway (online)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "=== Installing PostgreSQL Locally ===" -ForegroundColor Green
        Write-Host "1. Download PostgreSQL from: https://www.postgresql.org/download/windows/"
        Write-Host "2. Install with default settings"
        Write-Host "3. Use password: postgres"
        Write-Host "4. Update DATABASE_URL in .env to:"
        Write-Host "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smarttabungan"
        Write-Host ""
        Write-Host "After installation, run: npx prisma db push"
    }
    "2" {
        Write-Host ""
        Write-Host "=== Using Docker PostgreSQL ===" -ForegroundColor Green
        Write-Host "1. Start Docker Desktop"
        Write-Host "2. Run this command:"
        Write-Host "   docker run --name smarttabungan-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=smarttabungan -p 5432:5432 -d postgres:15"
        Write-Host "3. Update DATABASE_URL in .env to:"
        Write-Host "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smarttabungan"
        Write-Host ""
        Write-Host "After container is running, run: npx prisma db push"
    }
    "3" {
        Write-Host ""
        Write-Host "=== Using Supabase ===" -ForegroundColor Green
        Write-Host "1. Go to https://supabase.com"
        Write-Host "2. Sign up and create a new project"
        Write-Host "3. Go to Settings > Database"
        Write-Host "4. Copy the connection string"
        Write-Host "5. Update DATABASE_URL in .env with the connection string"
        Write-Host ""
        Write-Host "After setup, run: npx prisma db push"
    }
    "4" {
        Write-Host ""
        Write-Host "=== Using Railway ===" -ForegroundColor Green
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Sign up and create a new project"
        Write-Host "3. Add PostgreSQL service"
        Write-Host "4. Copy the connection string"
        Write-Host "5. Update DATABASE_URL in .env with the connection string"
        Write-Host ""
        Write-Host "After setup, run: npx prisma db push"
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Configure your database connection"
Write-Host "2. Run: npx prisma db push"
Write-Host "3. Run: npx ts-node src/utils/seedCategories.ts"
Write-Host "4. Run: npm run dev"
Write-Host "" 