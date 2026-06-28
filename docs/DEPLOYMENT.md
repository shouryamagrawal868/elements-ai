# elements.ai — Deployment Guide

## Frontend to Vercel
1. Connect GitHub repo to vercel.com
2. Set root directory to: client
3. Add environment variables from .env
4. Deploy

## Backend to Railway
1. Connect GitHub repo to railway.app
2. Set root directory to: server
3. Add PostgreSQL plugin
4. Add environment variables from .env
5. Deploy

## Run database migrations on production
npx prisma migrate deploy
