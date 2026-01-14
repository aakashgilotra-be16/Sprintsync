#!/bin/bash

# SprintSync Environment Switcher
# Quickly switch between production and development Firebase databases
# Usage: ./switch-env.sh [prod|dev]

set -e

PROD_ENV=".env.local"
DEV_ENV=".env.local.dev"
BACKUP_SUFFIX=".backup.$(date +%s)"

case "$1" in
  prod|production)
    echo "🔄 Switching to PRODUCTION environment..."
    
    if [ ! -f "$PROD_ENV" ]; then
      echo "❌ Error: $PROD_ENV not found!"
      echo "Please ensure production .env.local exists with VITE_ENV=production"
      exit 1
    fi
    
    # Backup current .env.local if it's a dev one
    if grep -q "VITE_ENV=development" .env.local 2>/dev/null; then
      echo "💾 Backing up current dev environment..."
      cp .env.local ".env.local.dev${BACKUP_SUFFIX}"
    fi
    
    # .env.local is already production, ensure VITE_ENV=production is set
    if ! grep -q "VITE_ENV=production" .env.local; then
      echo "⚠️  Warning: VITE_ENV not set to production in .env.local"
      echo "   Please update .env.local to include: VITE_ENV=production"
    fi
    
    echo "✅ Production environment ready!"
    echo "   Project ID: sprintsync-69a4c"
    echo "   📝 To build: npm run build"
    echo "   🚀 To deploy: git push origin main"
    ;;
    
  dev|development)
    echo "🔄 Switching to DEVELOPMENT environment..."
    
    if [ ! -f "$DEV_ENV" ]; then
      echo "❌ Error: $DEV_ENV not found!"
      echo "Please copy .env.local.dev template and add your dev Firebase credentials."
      echo "Read FIREBASE_SETUP.md for detailed instructions."
      exit 1
    fi
    
    if grep -q "YOUR_DEV_" .env.local.dev; then
      echo "❌ Error: $DEV_ENV still has placeholder values!"
      echo "Please update .env.local.dev with your development Firebase credentials."
      echo "Read FIREBASE_SETUP.md for detailed instructions."
      exit 1
    fi
    
    # Backup production environment
    echo "💾 Backing up current production environment..."
    cp .env.local ".env.local.prod${BACKUP_SUFFIX}"
    
    # Switch to dev
    cp .env.local.dev .env.local
    echo "✅ Development environment ready!"
    echo "   📝 To run: npm run dev"
    echo "   🌐 Visit: http://localhost:5173"
    echo "   💾 Backup saved as: .env.local.prod${BACKUP_SUFFIX}"
    ;;
    
  status)
    if [ ! -f ".env.local" ]; then
      echo "❌ .env.local not found!"
      exit 1
    fi
    
    if grep -q "VITE_ENV=development" .env.local; then
      echo "🔧 Current Environment: DEVELOPMENT"
      PROJECT=$(grep "VITE_FIREBASE_PROJECT_ID" .env.local | cut -d'=' -f2)
      echo "   Project ID: $PROJECT"
      echo "   📝 To switch to production: ./switch-env.sh prod"
    elif grep -q "VITE_ENV=production" .env.local; then
      echo "🚀 Current Environment: PRODUCTION"
      PROJECT=$(grep "VITE_FIREBASE_PROJECT_ID" .env.local | cut -d'=' -f2)
      echo "   Project ID: $PROJECT"
      echo "   📝 To switch to development: ./switch-env.sh dev"
    else
      echo "⚠️  Unknown environment. Check .env.local for VITE_ENV setting."
    fi
    ;;
    
  list)
    echo "📋 Environment Files:"
    echo ""
    echo "Production (in use for builds):"
    ls -lah .env.local 2>/dev/null || echo "  ❌ .env.local not found"
    echo ""
    echo "Development (for local testing):"
    ls -lah .env.local.dev 2>/dev/null || echo "  ❌ .env.local.dev not found"
    echo ""
    echo "Backups:"
    ls -lah .env.local.*.backup.* 2>/dev/null || echo "  (none)"
    ;;
    
  *)
    echo "SprintSync Environment Switcher"
    echo ""
    echo "Usage: ./switch-env.sh [command]"
    echo ""
    echo "Commands:"
    echo "  prod, production  - Switch to production Firebase database"
    echo "  dev, development  - Switch to development Firebase database"
    echo "  status            - Show current environment"
    echo "  list              - List all environment files"
    echo ""
    echo "Examples:"
    echo "  ./switch-env.sh dev      # Switch to development"
    echo "  ./switch-env.sh prod     # Switch to production"
    echo "  ./switch-env.sh status   # Check current environment"
    echo ""
    echo "Setup Instructions:"
    echo "  1. Make script executable: chmod +x switch-env.sh"
    echo "  2. Read FIREBASE_SETUP.md for detailed Firebase project setup"
    echo "  3. Configure .env.local.dev with your development credentials"
    echo ""
    exit 1
    ;;
esac
