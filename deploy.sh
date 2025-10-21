#!/bin/bash

# Blue Orb Deployment Helper Script
# This script helps you prepare your project for deployment

echo "🚀 Blue Orb Deployment Preparation"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the Blue-orb root directory"
    exit 1
fi

echo "✅ Found project files"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Blue Orb project"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Test builds
echo "🔨 Testing builds..."

echo "Testing backend..."
node src/server.js &
BACKEND_PID=$!
sleep 2
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Backend test successful"
    kill $BACKEND_PID
else
    echo "❌ Backend test failed"
    kill $BACKEND_PID
    exit 1
fi

echo "Testing frontend build..."
cd frontend
if npm run build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Project is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Follow the DEPLOYMENT_GUIDE.md"
echo "3. Deploy backend to Render"
echo "4. Deploy frontend to Vercel"
echo ""
echo "📖 Read DEPLOYMENT_GUIDE.md for detailed instructions"
