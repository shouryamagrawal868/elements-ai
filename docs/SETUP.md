# elements.ai — Local Setup Guide

## Requirements
- Node.js v18+
- Git
- Docker Desktop

## Setup Steps

### 1. Clone the repo
git clone https://github.com/YOURNAME/elements-ai.git
cd elements-ai

### 2. Set up environment variables
cp .env.example .env

### 3. Start the database
docker-compose up -d

### 4. Set up the backend
cd server
npm install
npx prisma migrate dev
npm run dev

### 5. Set up the frontend
cd ../client
npm install
npm start

## The app runs at:
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000
- Health check: http://localhost:5000/health
