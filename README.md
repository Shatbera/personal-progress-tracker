# Personal Progress Tracker

A full-stack application for structuring your day, managing personal goals, and building better habits — with AI-powered daily insights.

Built with **NestJS** (backend) and **Next.js** (frontend), backed by PostgreSQL.

## Project Structure

```
personal-progress-tracker/
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/               # JWT authentication & user management
│   │   │   ├── quests/             # Quest CRUD (Simple Goal & Daily Track types)
│   │   │   ├── quest-categories/   # Built-in & custom quest categories
│   │   │   ├── quest-events/       # Event logging for quest progress
│   │   │   ├── daily-track/        # Daily habit tracking with per-day entries
│   │   │   ├── day-plans/          # Day plans with time blocks, mood & reflection
│   │   │   ├── dashboard/          # Aggregated stats & recent activity
│   │   │   ├── ai/                 # OpenAI-powered daily coaching insights
│   │   │   ├── app.module.ts       # Database & module configuration
│   │   │   ├── seed.ts             # Database seeding script
│   │   │   └── main.ts             # App entry point
│   │   └── docker-compose.yml      # PostgreSQL service
│   │
│   └── web/                        # Next.js frontend
│       ├── app/                    # App router
│       │   ├── (auth)/             # Login & signup pages
│       │   └── (workspace)/        # Authenticated area
│       │       ├── (dashboard)/    # Dashboard overview
│       │       ├── (quests)/       # Quest list, detail & creation
│       │       ├── day-plans/      # Day planning interface
│       │       └── daily-track-details/ # Daily habit detail view
│       ├── actions/                # Server actions (API communication)
│       ├── lib/                    # Utilities & API client
│       └── public/                 # Static assets & screenshots
│
└── README.md                       # This file
```

## Features

- **User Authentication** — JWT-based login/signup
- **Quest Management** — Create, update, archive, and complete quests with point tracking
- **Quest Types** — Simple Goal (one-off tasks) and Daily Track (recurring habit tracking)
- **Quest Categories** — Organize quests with built-in or custom categories
- **Progress Events** — Log events (complete, fail, partial, etc.) to update quest points
- **Daily Tracking** — Track daily habit streaks with per-day entry logging
- **Day Plans** — Schedule time blocks, attach quests to each block, and toggle completion
- **Mood & Reflection** — Log mood and a short reflection at the end of each day
- **Dashboard** — Overview of active quests, recent activity, and personal stats
- **AI Insights** — OpenAI-generated daily coaching tip based on your plan and reflection

## Technology Stack

- **Backend:** NestJS 11, TypeORM, PostgreSQL 16
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, TypeScript 5
- **Database:** PostgreSQL 16
- **Authentication:** JWT (Passport)
- **AI:** OpenAI API

## Quick Start

### 1. Start the Database

```bash
cd apps/api
docker-compose up -d
```

### 2. Seed the Database (Optional)

```bash
cd apps/api
yarn run seed
```

Populates the database with realistic demo data. Login: `demo` / `Password123!`

### 3. Run the API

```bash
cd apps/api
yarn run start:dev
```

### 4. Run the Web App

```bash
cd apps/web
yarn run dev
```
